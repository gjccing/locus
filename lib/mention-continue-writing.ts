import { AIChatPlugin } from "@platejs/ai/react"
import { serializeMd } from "@platejs/markdown"
import { PathApi, NodeApi, type Path } from "platejs"
import type { PlateEditor } from "platejs/react"

import {
  filterValueByBlockIds,
  getValueAboveMentionBlock,
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
import {
  clearSelectingContext,
  setSelectingContext,
} from "@/lib/ai-selecting-context"
import {
  clearContextHighlightBlockIds,
  setContextHighlightBlockIds,
} from "@/lib/ai-context-block-highlight"

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

function buildContinueWritingPrompt(
  mentionBlockMarkdown: string,
  contextMarkdown: string,
  hasDocumentContext: boolean
) {
  if (!hasDocumentContext) {
    const instruction = mentionBlockMarkdown.trim()

    if (instruction) {
      return `${instruction}

<Document>
</Document>`
    }

    return `Start writing a new paragraph. Write only the next part.

<Document>
</Document>`
  }

  if (contextMarkdown.trim()) {
    return `Continue writing after the content below. Write only the next part. Do not repeat existing text.

<Document>
${contextMarkdown}
</Document>`
  }

  return `Start writing a new paragraph. Write only the next part.

<Document>
</Document>`
}

function logMentionContinueWritingDebug({
  mentionBlock,
  mentionBlockMarkdown,
  mentionContext,
  valueAboveMention,
  selectorResult,
  selectedBlockIds,
  selectedBlockText,
  selectedBlocks,
}: {
  mentionBlock: unknown
  mentionBlockMarkdown: string
  mentionContext: MentionAIContext
  valueAboveMention: unknown
  selectorResult: ContextSelectorResult
  selectedBlockIds: string[]
  selectedBlockText: string
  selectedBlocks: { id: string; text: string }[]
}) {
  console.log("[mention continue writing]", {
    mentionBlock,
    mentionBlockMarkdown,
    mention: {
      model: mentionContext["model-name"],
      provider: mentionContext.provider,
    },
    valueAboveMention,
    selectorResult,
    selectedBlockIds,
    selectedBlocks,
    selectedBlockText,
  })
}

export async function triggerMentionContinueWriting(
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
  editor.setOption(AIChatPlugin, 'mode', 'insert')
  editor.setOption(AIChatPlugin, 'open', true)
  setSelectingContext(editor, true)

  try {
    const mentionEntry = editor.api.node(mentionPath)
    const mentionBlock = mentionEntry?.[0] ?? null
    const mentionBlockMarkdown = getMentionBlockMarkdown(editor, mentionPath)
    const valueAboveMention = getValueAboveMentionBlock(editor, mentionPath)

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
      : ''

    const selectedBlocks = selectedValue.map((block) => ({
      id: String(block.id ?? ''),
      text: NodeApi.string(block).trim(),
    }))

    logMentionContinueWritingDebug({
      mentionBlock,
      mentionBlockMarkdown,
      mentionContext,
      valueAboveMention,
      selectorResult,
      selectedBlockIds,
      selectedBlockText,
      selectedBlocks,
    })

    setContextHighlightBlockIds(editor, selectedBlockIds)

    const contextMarkdown = selectedBlockText

    const prompt = buildContinueWritingPrompt(
      mentionBlockMarkdown,
      contextMarkdown,
      hasDocumentContext
    )

    clearSelectingContext(editor)

    void editor.getApi(AIChatPlugin).aiChat.submit('', {
      mode: 'insert',
      toolName: 'generate',
      prompt,
      options: {
        body: {
          apiKey: apikey,
          model: modelName,
          provider: mentionContext.provider,
          ctx: {
            children: editor.children,
            selection: editor.selection,
            toolName: 'generate',
          },
        },
      },
    })
  } catch {
    clearSelectingContext(editor)
    clearContextHighlightBlockIds(editor)
    editor.setOption(AIChatPlugin, 'open', false)
  }
}
