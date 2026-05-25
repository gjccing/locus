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
        text: "Organize notes and AI answers on one editable page.",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "Why Locus" }],
    type: "h2",
  },
  {
    children: [
      { text: "Edit AI replies", bold: true },
      {
        text: " — rewrite, trim, or restructure any answer directly on the page",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "Topics stay isolated", bold: true },
      {
        text: " — context is pulled from your page structure, so different topics don't bleed into each other",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "Conclusions live on the page", bold: true },
      {
        text: " — reorganize replies into your own notes anytime",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
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
        text: "Or use the built-in free Gemini key—rate-limited and shared",
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
      { text: " to pick a model, then write your question on the same line" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "decimal",
  },
  {
    children: [
      { text: "Press " },
      { text: "Enter", code: true },
      { text: " to send — the answer appears on the next line" },
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
      { text: " Which key stops the answer?" },
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
        text: "Before answering, Locus finds relevant notes and highlights them. Context comes from two places:",
      },
    ],
    type: "p",
  },
  {
    children: [
      { text: "Page structure: ", bold: true },
      {
        text: "notes above your question at the same level, plus any parent blocks they're nested under",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "Keyword matching: ", bold: true },
      {
        text: "terms from your question are searched upward through the page",
      },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "This ensures each " },
      { text: "@", code: true },
      {
        text: " question stays tied to the notes around it.",
      },
    ],
    type: "p",
  },
  {
    children: [{ text: "Tips" }],
    type: "h2",
  },
  {
    children: [
      { text: "Use headings and indent to structure your page—the more you nest, the tighter the context for each " },
      { text: "@", code: true },
      { text: " question" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
  {
    children: [
      { text: "Use the outline on the right to navigate between sections" },
    ],
    type: "p",
    indent: 1,
    listStyleType: "disc",
  },
]

/** @deprecated Use `contextEditorFixture`. */
export const contextEditorZhFixture = contextEditorFixture
