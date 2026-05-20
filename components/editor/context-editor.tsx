"use client"

import { Plate, usePlateEditor } from "platejs/react"

import { contextEditorZhFixture } from "@/components/editor/context-editor-fixture"
import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"

export default function ContextEditor() {
  const editor = usePlateEditor({
    plugins: ContextEditorKit,
    value: contextEditorZhFixture,
  })

  return (
    <Plate editor={editor}
      onChange={({ value }) => {
        // console.log("value", JSON.stringify(value, null, 2))
      }}
    >
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
