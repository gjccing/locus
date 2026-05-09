"use client"

import { TrailingBlockPlugin } from "platejs"

import { AlignKit } from "@/components/editor/plugins/align-kit"
import { AutoformatKit } from "@/components/editor/plugins/autoformat-kit"
import { BasicBlocksKit } from "@/components/editor/plugins/basic-blocks-kit"
import { BasicMarksKit } from "@/components/editor/plugins/basic-marks-kit"
import { BlockMenuKit } from "@/components/editor/plugins/block-menu-kit"
import { BlockPlaceholderKit } from "@/components/editor/plugins/block-placeholder-kit"
import { CodeBlockKit } from "@/components/editor/plugins/code-block-kit"
import { DndKit } from "@/components/editor/plugins/dnd-kit"
import { EmojiKit } from "@/components/editor/plugins/emoji-kit"
import { ExitBreakKit } from "@/components/editor/plugins/exit-break-kit"
import { FontKit } from "@/components/editor/plugins/font-kit"
import { LineHeightKit } from "@/components/editor/plugins/line-height-kit"
import { LinkKit } from "@/components/editor/plugins/link-kit"
import { ListKit } from "@/components/editor/plugins/list-kit"
import { MarkdownKit } from "@/components/editor/plugins/markdown-kit"
import { MathKit } from "@/components/editor/plugins/math-kit"
import { MediaKit } from "@/components/editor/plugins/media-kit"
import { MentionKit } from "@/components/editor/plugins/mention-kit"
import { SlashKit } from "@/components/editor/plugins/slash-kit"
import { TableKit } from "@/components/editor/plugins/table-kit"
import { ToggleKit } from "@/components/editor/plugins/toggle-kit"

/** Notion-style: block menu, `/` (basic blocks), `@` mention, Markdown, DnD — no fixed/floating toolbars. */
export const ContextEditorKit = [
  ...BlockMenuKit,
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...MediaKit,
  ...MathKit,
  ...LinkKit,
  ...MentionKit,
  ...BasicMarksKit,
  ...FontKit,
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,
  ...SlashKit,
  ...AutoformatKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,
  ...MarkdownKit,
  ...BlockPlaceholderKit,
]
