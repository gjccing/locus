"use client"

import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { cn } from "@/lib/utils"

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
    <div className={cn("flex w-full max-w-3xl flex-col gap-3 px-4 pb-20 pt-6 md:px-8", className)}>
      <p className="text-center text-xs text-muted-foreground">
        Context <span className="font-mono text-foreground">{contextId}</span>
        <span className="mx-2 text-muted-foreground/50">·</span>
        <span>Type / for blocks, @ to mention, paste Markdown</span>
      </p>

      <div className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm">
        <Plate editor={editor}>
          <EditorContainer variant="default">
            <Editor className="pb-20" variant="default" placeholder={CONTEXT_EDITOR_PLACEHOLDER} />
          </EditorContainer>
        </Plate>
      </div>
    </div>
  )
}
