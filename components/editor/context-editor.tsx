"use client"

import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"

const initialValue: Value = [
  {
    type: "p",
    children: [{ text: "" }],
  },
]

export default function ContextEditor() {
  const editor = usePlateEditor({
    plugins: ContextEditorKit,
    value: initialValue,
  })

  return (
    <Plate editor={editor}>
      <BlockSelectionShadowKeyboardFix />
      <EditorContainer variant="default">
        <Editor
          className="pt-[calc(100vh-13rem)] pb-20"
          variant="default"
          placeholder={CONTEXT_EDITOR_PLACEHOLDER}
        />
      </EditorContainer>
    </Plate>
  )
}
