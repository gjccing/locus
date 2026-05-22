import type { NextRequest } from 'next/server';

import { createGateway } from '@ai-sdk/gateway';
import { z } from 'zod';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';

import { createMentionLanguageModel } from '@/lib/mention-ai-model';
import { resolveMentionApiKey } from '@/lib/mention-trial';
import {
  contextSelectorResultSchema,
  parseContextSelectorResult,
} from '@/lib/context-selector-types';
import type { AIProvider } from '@/stores/app-store';

import { getSelectContextKeywordsPrompt } from './prompt/getSelectContextKeywordsPrompt';
import { getSelectContextPrompt } from './prompt/getSelectContextPrompt';

const contextSelectorKeywordsSchema = z.object({
  keywords: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mode = body.mode as string | undefined;
  const mentionBlockMarkdown = body.mentionBlockMarkdown as string | undefined;
  const apiKey = body.apiKey as string | undefined;
  const model = body.model as string | undefined;
  const provider = body.provider as AIProvider | undefined;

  if (!mentionBlockMarkdown?.trim()) {
    return NextResponse.json(
      { error: 'Missing mentionBlockMarkdown.' },
      { status: 400 }
    );
  }

  const mentionApiKey = resolveMentionApiKey(apiKey);
  const gatewayApiKey =
    mentionApiKey ?? process.env.AI_GATEWAY_API_KEY?.trim() ?? undefined;

  if (!gatewayApiKey) {
    return NextResponse.json(
      {
        error:
          'Missing API key. Add one in settings or set AI_GATEWAY_API_KEY.',
      },
      { status: 401 }
    );
  }

  const gatewayProvider = createGateway({
    apiKey: gatewayApiKey!,
  });

  const resolveModel = (modelId?: string) => {
    if (modelId && mentionApiKey && provider) {
      return createMentionLanguageModel(provider, modelId, mentionApiKey);
    }

    return gatewayProvider(modelId || 'openai/gpt-4o-mini');
  };

  try {
    if (mode === 'keywords') {
      const { object } = await generateObject({
        model: resolveModel(model),
        schema: contextSelectorKeywordsSchema,
        schemaName: 'ContextSelectorKeywords',
        schemaDescription:
          'Search keywords to find relevant document blocks above the mention',
        prompt: getSelectContextKeywordsPrompt(mentionBlockMarkdown),
        temperature: 0,
      });

      return NextResponse.json(
        contextSelectorKeywordsSchema.parse(object)
      );
    }

    const { object } = await generateObject({
      model: resolveModel(model),
      schema: contextSelectorResultSchema,
      schemaName: 'ContextSelectorResult',
      schemaDescription:
        'Selector methods to gather minimal document context for answering the user question',
      prompt: getSelectContextPrompt(mentionBlockMarkdown),
      temperature: 0,
    });

    return NextResponse.json(parseContextSelectorResult(object));
  } catch {
    return NextResponse.json(
      { error: 'Failed to classify context selection' },
      { status: 500 }
    );
  }
}
