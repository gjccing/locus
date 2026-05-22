import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';

import { createResolvedMentionLanguageModel } from '@/lib/mention-ai-model';
import { isAllowedMentionModel } from '@/lib/mention-allowed-models';
import {
  getDefaultMentionGeminiApiKey,
  isDefaultMentionApiKey,
  resolveMentionApiKey,
} from '@/lib/mention-trial';
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

  const modelId = model?.trim() ?? '';
  if (!modelId || !isAllowedMentionModel(modelId)) {
    return NextResponse.json(
      { error: 'Model is not available in the mention picker.' },
      { status: 400 }
    );
  }

  if (isDefaultMentionApiKey(apiKey) && provider && provider !== 'Gemini') {
    return NextResponse.json(
      { error: 'Default mention API key only supports Gemini trial models.' },
      { status: 400 }
    );
  }

  const mentionApiKey = resolveMentionApiKey(apiKey);
  const defaultGeminiKey = getDefaultMentionGeminiApiKey();

  if (!mentionApiKey && !defaultGeminiKey) {
    return NextResponse.json(
      {
        error:
          'Missing API key. Add one in settings or set GOOGLE_GEMINI_KEY.',
      },
      { status: 401 }
    );
  }

  const resolvedModel = createResolvedMentionLanguageModel({
    apiKey,
    provider,
    modelId,
  });

  try {
    if (mode === 'keywords') {
      const { object } = await generateObject({
        model: resolvedModel,
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
      model: resolvedModel,
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
