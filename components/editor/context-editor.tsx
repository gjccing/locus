"use client"

import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { ContextEditorKit } from "@/components/editor/context-editor-kit"
import { CONTEXT_EDITOR_PLACEHOLDER } from "@/components/editor/plugins/block-placeholder-kit"
import { BlockSelectionShadowKeyboardFix } from "@/components/editor/plugins/block-selection-shadow-keyboard-fix"
import { Editor, EditorContainer } from "@/components/ui/editor"

const initialValue: Value = [
  {
    "children": [
      {
        "text": "Product Roadmap 2026"
      }
    ],
    "type": "h1",
  },
  {
    "children": [
      {
        "text": "Company-wide priorities for the year. All teams should align quarterly goals with these themes."
      }
    ],
    "type": "p",
  },
  {
    "children": [
      {
        "text": "AI Assistant"
      }
    ],
    "type": "h2",
  },
  {
    "children": [
      {
        "text": "The assistant should help users write in context, not dump the whole document into every prompt."
      }
    ],
    "type": "p",
  },
  {
    "children": [
      {
        "text": "We use "
      },
      {
        "children": [
          {
            "text": ""
          }
        ],
        "type": "mention",
        "value": "mention",
      },
      {
        "text": " blocks to pick a model and give instructions inline. Context selection trims what gets sent upstream."
      }
    ],
    "type": "p",
  },
  {
    "children": [
      {
        "text": "Key metrics: latency under 2s for classify + generate, and context size reduced by at least 50% vs full-document prefix."
      }
    ],
    "type": "p",
  },
  {
    "children": [
      {
        "text": "Planned work"
      }
    ],
    "type": "h3",
  },
  {
    "children": [
      {
        "text": "Smart context selectors (ancestors, siblings, keywords)"
      }
    ],
    "type": "p",
    "indent": 1,
    "listStyleType": "disc",
  },
  {
    "children": [
      {
        "text": "Mention-triggered continue writing"
      }
    ],
    "type": "p",
    "indent": 1,
    "listStyleType": "disc",
  },
  {
    "children": [
      {
        "text": "Section-scoped inspiration"
      }
    ],
    "type": "p",
    "indent": 1,
    "listStyleType": "disc",
  },
  {
    "children": [
      {
        "text": ""
      },
      {
        "apiKey": "AIzaSyAqvkeemIYaELarIiWsvb7DifHLiwWfibw",
        "children": [
          {
            "text": ""
          }
        ],
        "key": "google/gemini-3.1-flash-lite",
        "provider": "Gemini",
        "type": "mention",
        "value": "google/gemini-3.1-flash-lite",
      },
      {
        "text": " continue this section focusing on latency and context trimming — do not repeat the intro above"
      }
    ],
    "type": "p",
    "indent": 1,
    "listStyleType": "disc"
  },
  {
    "children": [
      {
        "text": "Collaboration"
      }
    ],
    "type": "h2",
  },
  {
    "children": [
      {
        "text": "Real-time editing and comments remain the core loop. AI features must not break sync or selection."
      }
    ],
    "type": "p",
  },
  {
    "children": [
      {
        "text": "Offline mode is deferred. Conflict resolution stays last-write-wins for v1."
      }
    ],
    "type": "p",
  },
  {
    "children": [
      {
        "text": "Teams asked for better "
      },
      {
        "children": [
          {
            "text": ""
          }
        ],
        "type": "mention",
        "value": "mention",
      },
      {
        "text": " discoverability in long documents."
      }
    ],
    "type": "p",
  }
]

export default function ContextEditor() {
  const editor = usePlateEditor({
    plugins: ContextEditorKit,
    value: initialValue,
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
