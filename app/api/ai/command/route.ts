import type { ChatMessage } from "@/components/editor/use-chat"
import type { NextRequest } from "next/server"

import { createResolvedMentionLanguageModel } from "@/lib/mention-ai-model"
import { isAllowedMentionModel } from "@/lib/mention-allowed-models"
import {
  getDefaultMentionGeminiApiKey,
  isDefaultMentionApiKey,
  resolveMentionApiKey,
} from "@/lib/mention-trial"
import type { AIProvider } from "@/stores/app-store"
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

  const modelId = typeof model === "string" ? model.trim() : ""
  if (modelId && !isAllowedMentionModel(modelId)) {
    return NextResponse.json(
      { error: "Model is not available in the mention picker." },
      { status: 400 }
    )
  }

  if (isDefaultMentionApiKey(key) && provider && provider !== "Gemini") {
    return NextResponse.json(
      { error: "Default mention API key only supports Gemini trial models." },
      { status: 400 }
    )
  }

  const mentionApiKey = resolveMentionApiKey(key)
  const defaultGeminiKey = getDefaultMentionGeminiApiKey()

  if (!mentionApiKey && !defaultGeminiKey) {
    return NextResponse.json(
      {
        error: "Missing API key. Add one in settings or set GOOGLE_GEMINI_KEY.",
      },
      { status: 401 }
    )
  }

  const isSelecting = editor.api.isExpanded()

  const resolveModel = (resolvedModelId?: string) => {
    const id = resolvedModelId?.trim() || modelId || "gemini-2.5-flash-lite"

    return createResolvedMentionLanguageModel({
      apiKey: key,
      provider: provider as AIProvider | undefined,
      modelId: id,
    })
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
