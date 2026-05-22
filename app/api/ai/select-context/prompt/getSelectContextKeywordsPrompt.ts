import dedent from 'dedent';

import { buildStructuredPrompt } from '@/app/api/ai/command/utils';

export function getSelectContextKeywordsPrompt(mentionBlockMarkdown: string) {
  return buildStructuredPrompt({
    task: dedent`
      You extract search keywords from a document-editor mention block.
      The block contains an @model mention and the user's question.
      Return keywords to find relevant blocks above the mention in the document.
    `,

    context: mentionBlockMarkdown,

    rules: dedent`
      - keywords is an array of strings used for substring match in block text above the mention.
      - Return keywords: [] when the question needs no document lookup (jokes, general knowledge, or no meaningful question beyond the @mention).
      - Prefer concise, distinctive terms: names, topics, phrases, section titles, or entities the user refers to.
      - Do not include generic words ("above", "section", "content") unless they are the actual subject.
      - Ignore the @model token when interpreting intent.
      - NEVER copy keywords from examples verbatim.
    `,

    examples: [
      dedent`
        <mentionBlock>@google/gemini-3.1-flash-lite</mentionBlock>
        <output>{"keywords":[]}</output>
      `,
      dedent`
        <mentionBlock>@openai/gpt-4o-mini summarize machine learning content above</mentionBlock>
        <output>{"keywords":["machine learning"]}</output>
      `,
      dedent`
        <mentionBlock>@google/gemini-3.1-flash-lite tell me a joke</mentionBlock>
        <output>{"keywords":[]}</output>
      `,
    ],

    instruction: dedent`
      Analyze <context> and return keywords only.
      Judge intent from the full block text — examples are illustrative, not exhaustive.
    `,
  });
}
