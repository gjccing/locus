"use client"

import * as React from "react"

import { BlockSelectionPlugin } from "@platejs/selection/react"
import { RangeApi, type Value } from "platejs"
import { createTPlatePlugin, type PlateEditor } from "platejs/react"

import {
  serializeEditorMarkdown,
  writeMarkdownToClipboard,
} from "@/lib/editor-markdown-copy"

function isBlockSelectionActive(editor: PlateEditor) {
  return (editor.getOptions(BlockSelectionPlugin).selectedIds?.size ?? 0) > 0
}

function copyMarkdownFragment(
  editor: PlateEditor,
  getValue: () => Value
) {
  const markdown = serializeEditorMarkdown(editor, getValue()).trimEnd()
  if (!markdown) return false
  writeMarkdownToClipboard(markdown)
  return true
}

export const MarkdownCopyPlugin = createTPlatePlugin({
  key: "markdownCopy",
  editOnly: true,
}).extend(() => ({
  handlers: {
    onCopy: ({ editor, event }) => {
      if (isBlockSelectionActive(editor)) return

      const { selection } = editor
      if (!selection || RangeApi.isCollapsed(selection)) return

      const fragment = editor.api.fragment() as Value
      if (!fragment.length) return

      if (!copyMarkdownFragment(editor, () => fragment)) return

      event.preventDefault()
    },
  },
  useHooks: ({ editor }) => {
    React.useEffect(() => {
      const onCopyCapture = (event: ClipboardEvent) => {
        if (!isBlockSelectionActive(editor)) return

        const entries = editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.getNodes({ collapseTableRows: true })
        const nodes = entries.map(([node]) => node) as Value
        if (!nodes.length) return

        if (!copyMarkdownFragment(editor, () => nodes)) return

        event.preventDefault()
        event.stopImmediatePropagation()
      }

      document.addEventListener("copy", onCopyCapture, true)
      return () => document.removeEventListener("copy", onCopyCapture, true)
    }, [editor])
  },
}))
