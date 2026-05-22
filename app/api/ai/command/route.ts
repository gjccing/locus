import type { ChatMessage } from "@/components/editor/use-chat"
import type { NextRequest } from "next/server"

import { createGateway } from "@ai-sdk/gateway"
import type { AIProvider } from "@/stores/app-store"
import { createMentionLanguageModel } from "@/lib/mention-ai-model"
import { resolveMentionApiKey } from "@/lib/mention-trial"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai"
import { NextResponse } from "next/server"
import { createSlateEditor } from "platejs"

import { BaseEditorKit } from "@/components/editor/editor-base-kit"
import { markdownJoinerTransform } from "@/lib/markdown-joiner-transform"

import { getGeneratePrompt, getMentionAnswerPrompt } from "./prompt"
import type { MentionAnswerContext } from "@/lib/mention-answer"

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const requestBody = payload.body ?? {}
  const key = payload.apiKey ?? requestBody.apiKey
  const model = payload.model ?? requestBody.model
  const provider = payload.provider ?? requestBody.provider
  const messagesRaw = payload.messages
  const ctx = payload.ctx ?? requestBody.ctx

  if (!ctx?.children) {
    return NextResponse.json(
      { error: "Missing editor context (ctx)." },
      { status: 400 }
    )
  }

  const { children, selection } = ctx

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  })

  const mentionApiKey = resolveMentionApiKey(key)
  const gatewayApiKey =
    mentionApiKey ?? process.env.AI_GATEWAY_API_KEY?.trim() ?? undefined

  if (!gatewayApiKey) {
    return NextResponse.json(
      {
        error:
          "Missing API key. Add one in settings or set AI_GATEWAY_API_KEY.",
      },
      { status: 401 }
    )
  }

  const isSelecting = editor.api.isExpanded()

  const gatewayProvider = createGateway({
    apiKey: gatewayApiKey!,
  })

  const resolveModel = (modelId?: string) => {
    if (modelId && mentionApiKey && provider) {
      return createMentionLanguageModel(
        provider as AIProvider,
        modelId,
        mentionApiKey
      )
    }

    return gatewayProvider(modelId || "openai/gpt-4o-mini")
  }

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        const mentionAnswer = ctx.mentionAnswer as
          | MentionAnswerContext
          | undefined

        const generatePrompt = mentionAnswer
          ? getMentionAnswerPrompt(mentionAnswer)
          : getGeneratePrompt(editor, {
              isSelecting,
              messages: messagesRaw,
            })

        const textStream = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: resolveModel(model),
          prompt: "",
          prepareStep: async (step) => ({
            ...step,
            activeTools: [],
            messages: [
              {
                content: generatePrompt,
                role: "user",
              },
            ],
            model: resolveModel(model),
          }),
        })

        writer.merge(textStream.toUIMessageStream({ sendFinish: false }))
      },
    })

    return createUIMessageStreamResponse({ stream })
  } catch {
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    )
  }
}
