"use client"

import { serializeMd } from "@platejs/markdown"
import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { cn } from "@/lib/utils"
import { buildTreeFromValue } from "@/lib/editor-value-converters"

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
        <Plate
          editor={editor}
          onValueChange={({ value }) => {
            if (process.env.NODE_ENV !== "development") return
            console.log(
              `[dev-log][ContextEditor:${contextId}] plate value\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`
            )
            const md = serializeMd(editor)
            console.log(`[dev-log][ContextEditor:${contextId}] markdown\n\n${md}\n`)
            const tree = buildTreeFromValue(value)
            console.log(`[dev-log][ContextEditor:${contextId}] tree`, tree)
          }}
        >
          <BlockSelectionShadowKeyboardFix />
          <EditorContainer variant="default">
            <Editor className="pb-20" variant="default" placeholder={CONTEXT_EDITOR_PLACEHOLDER} />
          </EditorContainer>
        </Plate>
      </div>
    </div>
  )
}
