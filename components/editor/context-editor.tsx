"use client"

import { useEffect, useState } from "react"

import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { EditorTocSidebar } from "@/components/ui/editor-toc-sidebar"

function ContextEditorLoaded({ value }: { value: Value }) {
  const editor = usePlateEditor({
    plugins: ContextEditorKit,
    value,
  })

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => {
        // console.log("value", JSON.stringify(value, null, 2))
      }}
    >
      <BlockSelectionShadowKeyboardFix />
      <div className="relative h-full w-full">
        <EditorContainer variant="default">
          <Editor
            className="pt-[calc(100vh-13rem)] pb-20"
            variant="default"
            placeholder={CONTEXT_EDITOR_PLACEHOLDER}
          />
        </EditorContainer>
        <EditorTocSidebar className="right-10" />
      </div>
    </Plate>
  )
}

export default function ContextEditor() {
  const [initialValue, setInitialValue] = useState<Value | null>(null)

  useEffect(() => {
    void import("@/components/editor/context-editor-fixture").then(
      ({ contextEditorZhFixture }) => {
        setInitialValue(contextEditorZhFixture)
      }
    )
  }, [])

  if (!initialValue) {
    return null
  }

  return <ContextEditorLoaded value={initialValue} />
}
