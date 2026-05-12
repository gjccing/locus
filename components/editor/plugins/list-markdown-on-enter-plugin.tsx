"use client"

import { toggleList } from "@platejs/list"
import {
  createSlatePlugin,
  defineInputRule,
  KEYS,
  type Path,
  type SlateEditor,
  type TElement,
} from "platejs"

const RULE_PRIORITY = 100

function listMarkdownTargetBlockTypes(editor: SlateEditor): Set<string> {
  return new Set([
    editor.getType(KEYS.p),
    ...KEYS.heading.map((k) => editor.getType(k)),
    editor.getType(KEYS.blockquote),
    editor.getType(KEYS.toggle),
    editor.getType(KEYS.img),
  ])
}

function isListMarkdownOnEnterBlocked(editor: SlateEditor) {
  return editor.api.some({
    match: { type: [editor.getType(KEYS.codeBlock)] },
  })
}

type ListMarkdownEnterMatch =
  | { path: Path; prefixLen: number; listKind: "ul" }
  | { path: Path; prefixLen: number; listKind: "ol"; listStart: number }

/**
 * Built-in list markdown rules only fire on Space after the marker (`*␠`, `1.␠`).
 * This adds Enter-to-convert when the line already looks like `* item` / `1. item`.
 */
export const ListMarkdownOnEnterPlugin = createSlatePlugin({
  key: "listMarkdownOnEnter",
  inputRules: [
    defineInputRule({
      priority: RULE_PRIORITY,
      target: "insertBreak",
      enabled: (ctx) => ctx.isCollapsed && !isListMarkdownOnEnterBlocked(ctx.editor),
      resolve: (ctx) => {
        const { editor, isCollapsed, getBlockEntry, getBlockStartText } = ctx
        if (!isCollapsed || !editor.selection) return
        if (isListMarkdownOnEnterBlocked(editor)) return

        const blockEntry = getBlockEntry()
        if (!blockEntry) return
        const [block, path] = blockEntry as [TElement, Path]
        if (!listMarkdownTargetBlockTypes(editor).has(block.type)) return
        if (!editor.api.isEnd(editor.selection.focus, path)) return

        const text = getBlockStartText()
        if (!text) return

        const ulStar = text.match(/^\*\s+(.+)$/)
        const ulDash = text.match(/^-\s+(.+)$/)
        const olDot = text.match(/^(\d+)\.\s+(.+)$/)
        const olParen = text.match(/^(\d+)\)\s+(.+)$/)

        if (ulStar) {
          return {
            path,
            prefixLen: text.length - ulStar[1].length,
            listKind: "ul" as const,
          }
        }
        if (ulDash) {
          return {
            path,
            prefixLen: text.length - ulDash[1].length,
            listKind: "ul" as const,
          }
        }
        if (olDot) {
          return {
            path,
            prefixLen: text.length - olDot[2].length,
            listKind: "ol" as const,
            listStart: Number(olDot[1]),
          }
        }
        if (olParen) {
          return {
            path,
            prefixLen: text.length - olParen[2].length,
            listKind: "ol" as const,
            listStart: Number(olParen[1]),
          }
        }
        return
      },
      apply: (ctx, match) => {
        if (!match || typeof match !== "object" || !("prefixLen" in match)) return false
        const { editor } = ctx
        const m = match as ListMarkdownEnterMatch
        const start = editor.api.start(m.path)
        if (!start) return false
        const prefixEnd = editor.api.after(start, {
          distance: m.prefixLen,
          unit: "character",
        })
        if (!prefixEnd) return false

        editor.tf.withoutNormalizing(() => {
          editor.tf.delete({ at: { anchor: start, focus: prefixEnd } })
          if (m.listKind === "ul") {
            toggleList(editor, { listStyleType: KEYS.ul })
          } else {
            toggleList(editor, {
              listStyleType: KEYS.ol,
              listRestartPolite: m.listStart,
            })
          }
        })
        return true
      },
    }),
  ],
})
