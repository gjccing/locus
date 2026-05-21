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
  DEFAULT_CONTEXT_SELECTOR_RESULT,
  parseContextSelectorResult,
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
  setSelectingContext,
} from "@/lib/ai-selecting-context"
import {
  clearContextHighlightBlockIds,
  setContextHighlightBlockIds,
} from "@/lib/ai-context-block-highlight"

export type MentionAnswerContext = {
  question: string
  contextMarkdown: string
}

export function isMentionAnswerBusy(editor: PlateEditor): boolean {
  const mode = editor.getOption(AIChatPlugin, "mode")
  if (mode !== "insert") return false

  if (isSelectingContext(editor)) return true

  const status = editor.getOption(AIChatPlugin, "chat")?.status
  if (status === "streaming" || status === "submitted") return true

  const contextHighlightBlockIds = editor.getOption(
    aiChatPlugin,
    "contextHighlightBlockIds"
  )
  if (contextHighlightBlockIds.length > 0) return true

  return false
}

async function fetchContextSelectorResult(
  mentionBlockMarkdown: string,
  mentionContext: MentionAIContext
): Promise<ContextSelectorResult> {
  try {
    const res = await fetch("/api/ai/select-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentionBlockMarkdown,
        apiKey: mentionContext.apikey,
        model: mentionContext["model-name"],
        provider: mentionContext.provider,
      }),
    })

    if (!res.ok) return DEFAULT_CONTEXT_SELECTOR_RESULT

    return parseContextSelectorResult(await res.json())
  } catch {
    return DEFAULT_CONTEXT_SELECTOR_RESULT
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

// function logMentionAnswerDebug({
//   mentionBlock,
//   mentionBlockMarkdown,
//   question,
//   mentionContext,
//   valueAboveMention,
//   selectorResult,
//   selectedBlockIds,
//   selectedBlockText,
//   selectedBlocks,
// }: {
//   mentionBlock: unknown
//   mentionBlockMarkdown: string
//   question: string
//   mentionContext: MentionAIContext
//   valueAboveMention: unknown
//   selectorResult: ContextSelectorResult
//   selectedBlockIds: string[]
//   selectedBlockText: string
//   selectedBlocks: { id: string; text: string }[]
// }) {
//   console.log("[mention answer]", {
//     mentionBlock,
//     mentionBlockMarkdown,
//     question,
//     mention: {
//       model: mentionContext["model-name"],
//       provider: mentionContext.provider,
//     },
//     valueAboveMention,
//     selectorResult,
//     selectedBlockIds,
//     selectedBlocks,
//     selectedBlockText,
//   })
// }

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
  setSelectingContext(editor, true)

  try {
    const mentionEntry = editor.api.node(mentionPath)
    const mentionBlock = mentionEntry?.[0] ?? null
    if (mentionBlock?.id)
      setContextHighlightBlockIds(editor, [mentionBlock.id as string])
    const mentionBlockMarkdown = getMentionBlockMarkdown(editor, mentionPath)
    const question = extractQuestionFromMentionBlock(editor, mentionPath)
    // const valueAboveMention = getValueAboveMentionBlock(editor, mentionPath)

    const selectorResult = await fetchContextSelectorResult(
      mentionBlockMarkdown,
      mentionContext
    )

    const hasDocumentContext = selectorResult.methods.length > 0
    const selectedBlockIds = hasDocumentContext
      ? selectContextBlockIds(editor, newPath, selectorResult)
      : []

    const selectedValue = hasDocumentContext
      ? filterValueByBlockIds(editor.children, selectedBlockIds)
      : []

    const selectedBlockText = hasDocumentContext
      ? serializeMd(editor, { value: selectedValue })
      : ""

    // const selectedBlocks = selectedValue.map((block) => ({
    //   id: String(block.id ?? ""),
    //   text: NodeApi.string(block).trim(),
    // }))

    // logMentionAnswerDebug({
    //   mentionBlock,
    //   mentionBlockMarkdown,
    //   question,
    //   mentionContext,
    //   valueAboveMention,
    //   selectorResult,
    //   selectedBlockIds,
    //   selectedBlockText,
    //   selectedBlocks,
    // })

    setContextHighlightBlockIds(editor, selectedBlockIds)

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
    clearSelectingContext(editor)
    clearContextHighlightBlockIds(editor)
    editor.setOption(AIChatPlugin, "open", false)
  }
}
