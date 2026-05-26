import { AIChatPlugin } from "@platejs/ai/react"
import { serializeMd } from "@platejs/markdown"
import { PathApi, NodeApi, ElementApi, KEYS, type Path } from "platejs"
import type { PlateEditor } from "platejs/react"

import {
  filterValueByBlockIds,
  // getValueAboveMentionBlock,
  selectContextBlockIds,
} from "@/lib/apply-context-selector"
import {
  type ContextSelectorMethod,
  type ContextSelectorResult,
} from "@/lib/context-selector-types"
import {
  findLastMentionInBlock,
  type MentionAIContext,
} from "@/lib/mention-ai-context"
import { aiChatPlugin } from "@/components/editor/plugins/ai-chat-plugin"
import {
  clearSelectingContext,
  isSelectingContext,
  setAnalyzingMentionKeywords,
  setSelectingContext,
  stopInsertOrSelectingContext,
} from "@/lib/ai-selecting-context"
import {
  clearContextHighlightBlockIds,
  hasContextHighlight,
  setContextFixedHighlightBlockIds,
  setContextKeywordHighlightBlockIds,
} from "@/lib/ai-context-block-highlight"

export type MentionAnswerContext = {
  question: string
  contextMarkdown: string
}

/** True while a mention answer is selecting context or streaming a response. */
export function isMentionAnswerBusy(editor: PlateEditor) {
  if (editor.getOption(AIChatPlugin, "mode") !== "insert") return false
  if (isSelectingContext(editor)) return true

  const chat = editor.getOption(AIChatPlugin, "chat") as
    | { status?: string }
    | undefined
  const status = chat?.status
  if (status === "streaming" || status === "submitted") return true

  return hasContextHighlight(editor)
}

export function stopMentionAnswer(editor: PlateEditor) {
  stopInsertOrSelectingContext(editor, () => {
    editor.getApi(AIChatPlugin).aiChat.stop()
  })
}

function blockMentionAnswerUserInput(
  editor: PlateEditor,
  event: { key?: string; preventDefault: () => void }
) {
  if (!isMentionAnswerBusy(editor)) return

  if (event.key === "Escape") {
    stopMentionAnswer(editor)
    event.preventDefault()
    return true
  }

  event.preventDefault()
  return true
}

/** Ignore typing and pointer input in the editor while a mention answer is active. */
export function blockMentionAnswerInputIfBusy({
  editor,
  event,
}: {
  editor: PlateEditor
  event: { key?: string; preventDefault: () => void }
}) {
  return blockMentionAnswerUserInput(editor, event)
}

const MENTION_FIXED_SELECTOR_METHODS = [
  "getOlderSiblings",
  "getAncestors",
] as const satisfies readonly ContextSelectorMethod[]

function buildFixedMentionSelectorResult(): ContextSelectorResult {
  return { methods: [...MENTION_FIXED_SELECTOR_METHODS] }
}

function buildMentionSelectorResult(keywords: string[]): ContextSelectorResult {
  const methods: ContextSelectorMethod[] = [...MENTION_FIXED_SELECTOR_METHODS]
  if (keywords.length > 0) {
    methods.unshift("getAboveValueWithKeywords")
  }
  return keywords.length > 0 ? { methods, keywords } : { methods }
}

async function fetchContextSelectorResult(
  mentionBlockMarkdown: string,
  mentionContext: MentionAIContext,
  signal?: AbortSignal
): Promise<ContextSelectorResult> {
  try {
    const res = await fetch("/api/ai/select-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "keywords",
        mentionBlockMarkdown,
        apiKey: mentionContext.apikey,
        model: mentionContext["model-name"],
        provider: mentionContext.provider,
      }),
      signal,
    })

    if (!res.ok) return buildMentionSelectorResult([])

    const data = (await res.json()) as { keywords?: unknown }
    const keywords = Array.isArray(data.keywords)
      ? data.keywords.filter(
          (keyword): keyword is string =>
            typeof keyword === "string" && keyword.trim().length > 0
        )
      : []

    return buildMentionSelectorResult(keywords)
  } catch (error) {
    if (signal?.aborted) throw error
    return buildMentionSelectorResult([])
  }
}

function getMentionBlockMarkdown(editor: PlateEditor, mentionPath: Path) {
  const mentionEntry = editor.api.node(mentionPath)
  if (!mentionEntry) return ""

  return serializeMd(editor, {
    value: [mentionEntry[0]],
  })
}

export function extractQuestionFromMentionBlock(
  editor: PlateEditor,
  mentionPath: Path
): string {
  const mentionEntry = editor.api.node(mentionPath)
  if (!mentionEntry) return ""

  const block = mentionEntry[0]
  if (!ElementApi.isElement(block) || !block.children) return ""

  const mentionType = editor.getType(KEYS.mention)
  const parts: string[] = []

  for (const child of block.children) {
    if (ElementApi.isElement(child) && child.type === mentionType) continue
    const text = NodeApi.string(child).trim()
    if (text) parts.push(text)
  }

  return parts.join(" ").trim()
}

export async function triggerMentionAnswer(
  editor: PlateEditor,
  mentionContext: MentionAIContext
) {
  const { apikey, "model-name": modelName } = mentionContext
  if (!apikey?.trim() || !modelName.trim()) return

  const block = editor.api.block()
  if (!block) return

  const [, newPath] = block
  const mentionPath = PathApi.previous(newPath)
  if (!mentionPath) return

  if (!findLastMentionInBlock(editor, mentionPath)) return

  // open must be true before submit so withAIChat does not strip ai marks on normalize.
  editor.setOption(AIChatPlugin, "mode", "insert")
  editor.setOption(AIChatPlugin, "open", true)

  const abortController = new AbortController()
  editor.setOption(
    aiChatPlugin,
    "mentionAnswerAbortController",
    abortController
  )
  if (editor.selection) {
    editor.setOption(aiChatPlugin, "mentionAnswerSelection", editor.selection)
  }
  setSelectingContext(editor, true)

  try {
    const mentionBlockMarkdown = getMentionBlockMarkdown(editor, mentionPath)
    const question = extractQuestionFromMentionBlock(editor, mentionPath)
    // const valueAboveMention = getValueAboveMentionBlock(editor, mentionPath)

    const fixedBlockIds = selectContextBlockIds(
      editor,
      newPath,
      buildFixedMentionSelectorResult()
    )
    setContextFixedHighlightBlockIds(editor, fixedBlockIds)
    setContextKeywordHighlightBlockIds(editor, [])

    setAnalyzingMentionKeywords(editor, true)
    let selectorResult: ContextSelectorResult
    try {
      selectorResult = await fetchContextSelectorResult(
        mentionBlockMarkdown,
        mentionContext,
        abortController.signal
      )
    } finally {
      setAnalyzingMentionKeywords(editor, false)
    }

    if (abortController.signal.aborted) return

    const hasDocumentContext = selectorResult.methods.length > 0
    const selectedBlockIds = hasDocumentContext
      ? selectContextBlockIds(editor, newPath, selectorResult)
      : []

    const selectedValue = filterValueByBlockIds(
      editor.children,
      fixedBlockIds.concat(selectedBlockIds)
    )

    const selectedBlockText = hasDocumentContext
      ? serializeMd(editor, { value: selectedValue })
      : ""

    const keywordBlockIds = selectedBlockIds.filter(
      (id) => !fixedBlockIds.includes(id)
    )
    setContextFixedHighlightBlockIds(editor, fixedBlockIds)
    setContextKeywordHighlightBlockIds(editor, keywordBlockIds)

    const contextMarkdown = selectedBlockText
    clearSelectingContext(editor)

    void editor.getApi(AIChatPlugin).aiChat.submit(question, {
      mode: "insert",
      toolName: "generate",
      options: {
        body: {
          apiKey: apikey,
          model: modelName,
          provider: mentionContext.provider,
          ctx: {
            children: editor.children,
            selection: editor.selection,
            toolName: "generate",
            mentionAnswer: {
              question,
              contextMarkdown,
            },
          },
        },
      },
    })
  } catch {
    if (abortController.signal.aborted) return

    clearSelectingContext(editor)
    clearContextHighlightBlockIds(editor)
    editor.setOption(AIChatPlugin, "open", false)
  } finally {
    if (
      editor.getOption(aiChatPlugin, "mentionAnswerAbortController") ===
      abortController
    ) {
      editor.setOption(aiChatPlugin, "mentionAnswerAbortController", null)
    }
    editor.setOption(aiChatPlugin, "mentionAnswerSelection", null)
  }
}
