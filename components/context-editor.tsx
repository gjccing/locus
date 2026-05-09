"use client"

import { Plate, usePlateEditor } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContextEditor({ contextId }: { contextId: string }) {
  const editor = usePlateEditor();

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Editor for development</CardTitle>
        <CardDescription>
          Context ID: {contextId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='border rounded-md'>
          <Plate editor={editor}>
            <EditorContainer>
              <Editor placeholder="Type your amazing content here..." />
            </EditorContainer>
          </Plate>
        </div>
      </CardContent>
    </Card>
  )
}
