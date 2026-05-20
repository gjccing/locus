import dedent from 'dedent';

import { buildStructuredPrompt } from '@/app/api/ai/command/utils';

export function getSelectContextPrompt(mentionBlockMarkdown: string) {
  return buildStructuredPrompt({
    task: dedent`
      You are a context-selection classifier for a document editor.
      Given a single block that contains an @model mention and the user's question,
      decide which selector methods to use to gather the MINIMUM document context needed
      for the AI to answer the question in the block below.
    `,

    context: mentionBlockMarkdown,

    rules: dedent`
      - Your goal is to TRIM context: return the smallest set of methods that still gives enough material to answer the question.
      - methods is an array; you MAY combine multiple methods, OR return an empty array [].
      - Return methods: [] when the question needs NO document context (jokes, general knowledge, off-topic asks unrelated to the document). The question alone is sufficient.
      - If the block has NO meaningful question beyond the @mention alone, return methods: [].
      - Prefer tree-based methods over getAboveValue. Use getAboveValue ONLY when the user clearly needs ALL content above the cursor (e.g. "summarize everything above", "rewrite all above").
      - Include getAboveValueWithKeywords when the question refers to specific topics, names, phrases, or sections that should be found in blocks above — extract those as keywords. You judge what to extract; do not rely on fixed phrases.
      - When using getAboveValueWithKeywords, keywords must be a non-empty array of strings to search for (substring match in block text). Prefer concise, distinctive terms.
      - Include getOlderSiblings when the question refers to content "above", "before", "in this section", or preceding bullets/paragraphs at the same level.
      - Include getAncestors when parent section/outline context helps answer the question.
      - Include getHeadingAncestors when the user refers to headings, sections, chapters, or document structure by title.
      - Do NOT include methods that add no value for answering the question.
      - Ignore the @model token itself when interpreting intent — it only names which model to call.
      - CRITICAL: Examples show output shape only. NEVER copy methods/keywords from examples verbatim.

      Method reference:
      - getAncestors: parent chain blocks in the outline tree
      - getOlderSiblings: all blocks at the same outline level before the insertion point
      - getHeadingAncestors: heading-only ancestors in the outline tree
      - getAboveValueWithKeywords: blocks above that contain any listed keyword
      - getAboveValue: every block above the insertion point (last resort)
    `,

    examples: [
      dedent`
        <mentionBlock>@google/gemini-3.1-flash-lite</mentionBlock>
        <output>{"methods":[]}</output>
      `,
      dedent`
        <mentionBlock>@openai/gpt-4o-mini summarize the content above including machine learning</mentionBlock>
        <output>{"methods":["getAboveValueWithKeywords"],"keywords":["machine learning"]}</output>
      `,
      dedent`
        <mentionBlock>@google/gemini-3.1-flash-lite tell me a joke</mentionBlock>
        <output>{"methods":[]}</output>
      `,
      dedent`
        <mentionBlock>@openai/gpt-4o what are the key metrics in the section above?</mentionBlock>
        <output>{"methods":["getOlderSiblings","getAncestors"]}</output>
      `,
      dedent`
        <mentionBlock>@openai/gpt-4o rewrite everything above</mentionBlock>
        <output>{"methods":["getAboveValue"]}</output>
      `,
    ],

    instruction: dedent`
      Analyze <context> (the mention block containing the question) and return methods (and keywords if needed).
      Judge intent from the full block text — examples are illustrative, not exhaustive patterns.
    `,
  });
}
