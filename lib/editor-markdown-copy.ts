import { serializeMd } from "@platejs/markdown"
import cloneDeep from "lodash/cloneDeep.js"
import { KEYS, type SlateEditor, type TElement, type Value } from "platejs"

/** Block types whose visual indent should survive markdown copy. */
function isIndentNormalizableBlock(
  editor: SlateEditor,
  node: TElement
): boolean {
  const type = node.type

  if (type === editor.getType(KEYS.codeBlock)) return false
  if (type === editor.getType(KEYS.table)) return false
  if (type === editor.getType(KEYS.hr)) return false

  return [
    editor.getType(KEYS.p),
    ...KEYS.heading.map((key) => editor.getType(key)),
    editor.getType(KEYS.blockquote),
    editor.getType(KEYS.toggle),
  ].includes(type)
}

/**
 * Plate list items use flat nodes with `indent` + `listStyleType`.
 * serializeMd turns those into nested GFM lists.
 *
 * Blocks with only `indent` (e.g. AI answers) would otherwise copy as top-level
 * paragraphs. Treat them as bullet items so hierarchy is preserved.
 */
export function normalizeIndentForMarkdownCopy(
  editor: SlateEditor,
  value: Value
): Value {
  return value.map((node) => {
    if (!isIndentNormalizableBlock(editor, node as TElement)) {
      return node
    }

    const block = node as TElement & {
      indent?: number
      listStyleType?: string
    }

    const indent = typeof block.indent === "number" ? block.indent : 0
    if (indent <= 0 || block.listStyleType) return node

    return {
      ...cloneDeep(block),
      listStyleType: "disc",
    }
  })
}

export function serializeEditorMarkdown(
  editor: SlateEditor,
  value: Value
): string {
  return serializeMd(editor, {
    value: normalizeIndentForMarkdownCopy(editor, value),
  })
}

export function writeMarkdownToClipboard(markdown: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(markdown)
    return
  }

  if (typeof document === "undefined") return

  const textarea = document.createElement("textarea")
  textarea.value = markdown
  textarea.setAttribute("readonly", "true")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)
}
