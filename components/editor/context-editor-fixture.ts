import type { Value } from "platejs"

/** Built-in onboarding content for the context canvas. */
export const contextEditorFixture: Value = [
  {
    children: [{ text: "Locus Guide" }],
    type: "h1",
  },
  {
    children: [
      {
        text: "Locus lets you talk to AI right on the page. Most AI tools keep everything in a chat box—it's hard to control what the AI reads, and hard to work on more than one topic at a time. Locus turns your notes into editable blocks so you can explore many topics on one screen.",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "Getting Started" }],
    type: "h2",
  },
  {
    children: [
      {
        text: "Add an API key in Settings (OpenAI, Anthropic, Gemini, or Groq)",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [
      {
        text: "A free shared Gemini key is available to try things out. Everyone uses the same key, so it may run out",
      },
    ],
    type: "p",
    indent: 2,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "Type " },
      { text: "@", code: true },
      { text: " to choose a model, then write your question in the same line" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [
      { text: "Press " },
      { text: "Enter", code: true },
      { text: " key for a new line—the answer appears below" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [
      { text: "Press " },
      { text: "Esc", code: true },
      { text: " key to stop" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [{ text: "Example" }],
    type: "h2",
  },
  {
    children: [
      {
        text: "Try these—press Enter at the end of a line to get an answer:",
      },
    ],
    type: "p",
  },
  {
    children: [
      { text: "" },
      {
        children: [{ text: "" }],
        key: "google/gemini-3.1-flash-lite",
        provider: "Gemini",
        type: "mention",
        value: "google/gemini-3.1-flash-lite",
      },
      { text: " What is Locus in one sentence?" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "" },
      {
        children: [{ text: "" }],
        key: "google/gemini-3.1-flash-lite",
        provider: "Gemini",
        type: "mention",
        value: "google/gemini-3.1-flash-lite",
      },
      { text: " What key stops the answer?" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Context" }],
    type: "h2",
  },
  {
    children: [
      {
        text: "When you ask a question, Locus reads your headings and indentation, picks the notes that matter, and highlights them.",
      },
    ],
    type: "p",
  },
  {
    children: [
      {
        text: "Usually includes nearby text at the same level and parent sections",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      {
        text: "If your question names a specific topic, it also searches above for matching content",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Controlling Context" }],
    type: "h2",
  },
  {
    children: [{ text: "Just change the layout:" }],
    type: "p",
  },
  {
    children: [
      { text: "Indent → start a new thread; " },
      { text: "@model", code: true },
      { text: " questions in one thread won't affect another" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Headings → split the page into sections" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Multiple Topics" }],
    type: "h2",
  },
  {
    children: [
      { text: "Add " },
      { text: "@model", code: true },
      {
        text: " anywhere on the page—each question only pulls from its own area",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "Use the outline on the right to jump to headings and " },
      { text: "@model", code: true },
      { text: " spots" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
]

/** @deprecated Use `contextEditorFixture`. */
export const contextEditorZhFixture = contextEditorFixture
