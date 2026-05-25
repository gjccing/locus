"use client"

import { useEffect, useRef, useState } from "react"

import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { contextEditorFixture } from "@/components/editor/context-editor-fixture"
import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { EditorTocSidebar } from "@/components/ui/editor-toc-sidebar"
import {
  loadEditorContent,
  registerEditorContentFlush,
  SAVE_DEBOUNCE_MS,
  saveEditorContent,
  unregisterEditorContentFlush,
} from "@/lib/editor-persistence"
import { useAppStore } from "@/stores/app-store"

function ContextEditorLoaded({ value }: { value: Value }) {
  const editor = usePlateEditor({
    plugins: ContextEditorKit,
    value,
  })

  const isDirtyRef = useRef(false)
  const latestValueRef = useRef(value)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    latestValueRef.current = value
    isDirtyRef.current = false
  }, [value])

  useEffect(() => {
    registerEditorContentFlush(() => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }

      if (!isDirtyRef.current) return

      void saveEditorContent(latestValueRef.current)
    })

    return () => {
      unregisterEditorContentFlush()
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  const scheduleSave = (nextValue: Value) => {
    latestValueRef.current = nextValue
    isDirtyRef.current = true

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null
      void saveEditorContent(nextValue)
    }, SAVE_DEBOUNCE_MS)
  }

  return (
    <Plate editor={editor} onChange={({ value: nextValue }) => scheduleSave(nextValue)}>
      <BlockSelectionShadowKeyboardFix />
      <div className="relative h-full w-full">
        <EditorContainer variant="default">
          <Editor
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
  const editorSessionKey = useAppStore((s) => s.editorSessionKey)
  const [initialValue, setInitialValue] = useState<Value | null>(null)
  const [editorKey, setEditorKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    void loadEditorContent().then((saved) => {
      if (cancelled) return
      setInitialValue(saved ?? contextEditorFixture)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (editorSessionKey === 0) return

    setInitialValue(contextEditorFixture)
    setEditorKey((key) => key + 1)
  }, [editorSessionKey])

  if (!initialValue) {
    return null
  }

  return <ContextEditorLoaded key={editorKey} value={initialValue} />
}
