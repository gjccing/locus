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
        text: "Talk to AI on the same page as your notes. No side chat—write, ask, and handle multiple topics in one place.",
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
        text: "Or use the free shared Gemini key—everyone shares it, so it may run out",
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
      { text: " to pick a model, then ask your question on the same line" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [
      { text: "Press " },
      { text: "Enter", code: true },
      { text: " — the answer appears on the next line" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [
      { text: "Press " },
      { text: "Esc", code: true },
      { text: " to stop" },
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
      { text: "" },
      {
        children: [{ text: "" }],
        apiKey: "default",
        key: "google/gemma-4-31b-it",
        provider: "Gemini",
        type: "mention",
        value: "google/gemma-4-31b-it",
      },
      { text: " What is Locus in one sentence?" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Another example:" }],
    type: "p",
  },
  {
    children: [
      { text: "" },
      {
        children: [{ text: "" }],
        apiKey: "default",
        key: "google/gemma-4-31b-it",
        provider: "Gemini",
        type: "mention",
        value: "google/gemma-4-31b-it",
      },
      { text: " What key stops the answer?" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "How It Works" }],
    type: "h2",
  },
  {
    children: [
      {
        text: "Before answering, Locus finds related notes on the page and highlights them.",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "Nearby notes in the same section" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Topics you mention in your question" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Tips" }],
    type: "h2",
  },
  {
    children: [
      { text: "Indent to group notes; " },
      { text: "@model", code: true },
      { text: " questions in one group won't mix with another" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Headings split the page into sections" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [{ text: "Use the outline on the right to jump around" }],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
]

/** @deprecated Use `contextEditorFixture`. */
export const contextEditorZhFixture = contextEditorFixture
