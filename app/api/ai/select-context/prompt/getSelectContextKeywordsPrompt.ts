import dedent from "dedent"

import { buildStructuredPrompt } from "@/app/api/ai/command/utils"

export function getSelectContextKeywordsPrompt(mentionBlockMarkdown: string) {
  return buildStructuredPrompt({
    task: dedent`
      From an @model mention block, return keywords for substring-search in notes above it.
      Notes may use different wording than the question—expand into terms likely to appear in the text.
    `,

    context: mentionBlockMarkdown,

    rules: dedent`
      - Include question terms when specific, plus alternate phrasing, synonyms, abbreviations, and related words for the same idea.
      - When the question is abstract ("the key", "that step", "this section"), also add concrete forms notes may use instead.
    `,

    examples: [
      dedent`
        <mentionBlock>@openai/gpt-4o-mini what does the core metrics section say about latency?</mentionBlock>
        <output>{"keywords":["core metrics","metrics","latency","P95","performance"]}</output>
      `,
      dedent`
        <mentionBlock>@google/gemma-4-31b-it what does Getting Started say about API keys?</mentionBlock>
        <output>{"keywords":["Getting Started","API key","Setting","OpenAI","Anthropic","Gemini","Groq"]}</output>
      `,
    ],

    instruction:
      "Analyze <context>. Return keywords only—terms likely to match note text above, not paraphrases alone.",
  })
}
