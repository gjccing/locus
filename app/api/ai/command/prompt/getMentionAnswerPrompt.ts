import dedent from "dedent"

import { buildStructuredPrompt } from "../utils"
import { commonGenerateRules } from "./common"

export type MentionAnswerPromptInput = {
  question: string
  contextMarkdown: string
}

export function getMentionAnswerPrompt({
  question,
  contextMarkdown,
}: MentionAnswerPromptInput) {
  const trimmedInstruction = question.trim()
  const instruction = trimmedInstruction || "Respond helpfully to the user."
  const context = contextMarkdown.trim() || undefined

  return buildStructuredPrompt({
    task: dedent`
      You are an assistant embedded in a document editor.
      Follow the user's instruction in <instruction> directly.
      Use <context> as reference material when it is provided.
      Do NOT continue or extend the document prose unless the user explicitly asks you to write or continue content.
      Your reply is inserted as body text in the document.
    `,
    instruction,
    context,
    examples: [
      dedent`
        <instruction>
        What are the three key metrics mentioned above?
        </instruction>

        <context>
        Key metrics: latency under 2s, and context size reduced by 50%.
        </context>

        <output>
        The three key metrics are latency under 2 seconds, and reducing context size by at least 50% compared to sending the full document.
        </output>
      `,
      dedent`
        <instruction>
        Summarize the key points above in two sentences.
        </instruction>

        <context>
        Key metrics: latency under 2s, and context size reduced by 50%.
        Deployment uses a blue-green strategy with automated rollback.
        </context>

        <output>
        The document highlights latency under 2 seconds and at least 50% context-size reduction. It also describes blue-green deployment with automated rollback.
        </output>
      `,
      dedent`
        <instruction>
        Tell me a joke
        </instruction>

        <output>
        Why did the developer go broke? Because they used up all their cache.
        </output>
      `,
    ],
    rules: dedent`
      ${commonGenerateRules}
      - Follow <instruction>; do not repeat it verbatim unless asked.
      - Write in clear prose or lists as appropriate; stay concise unless the user asks for detail.
      - When <context> is empty or omitted, respond from general knowledge or the instruction alone.
      - Do NOT continue writing the document as if you are the author; respond as an assistant to the user's instruction.
    `,
  })
}
