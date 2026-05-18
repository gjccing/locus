"use client"

import { serializeMd } from "@platejs/markdown"
import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { cn } from "@/lib/utils"
import { buildTreeFromValue } from "@/lib/editor-value-tree"

const initialValue: Value = [
  {
    type: "p",
    children: [{ text: "" }],
  },
]

export default function ContextEditor({ className, contextId }: { className?: string, contextId: string }) {
  const editor = usePlateEditor({
    plugins: ContextEditorKit,
    value: initialValue,
  })

  return (
    <Plate
      editor={editor}
      onValueChange={({ value }) => {
        if (process.env.NODE_ENV !== "development") return
        // console.log(
        //   `[dev-log][ContextEditor:${contextId}] plate value\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`
        // )
        // const md = serializeMd(editor)
        // console.log(`[dev-log][ContextEditor:${contextId}] markdown\n\n${md}\n`)
        // const tree = buildTreeFromValue(value)
        // console.log(`[dev-log][ContextEditor:${contextId}] tree`, tree)
      }}
    >
      <BlockSelectionShadowKeyboardFix />
      <EditorContainer variant="default">
        <Editor className="pt-[calc(100vh-13rem)] pb-20" variant="default" placeholder={CONTEXT_EDITOR_PLACEHOLDER} />
      </EditorContainer>
    </Plate>
  )
}
