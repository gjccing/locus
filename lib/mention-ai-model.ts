import { createAnthropic } from '@ai-sdk/anthropic';
import { createGateway } from '@ai-sdk/gateway';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

import type { AIProvider } from '@/stores/app-store';
import {
  assertDefaultMentionProvider,
  getDefaultMentionGeminiApiKey,
  resolveMentionApiKey,
} from '@/lib/mention-trial';

/** Strip Vercel AI Gateway-style prefixes for direct provider SDKs. */
export function toDirectProviderModelId(
  provider: AIProvider,
  modelId: string
): string {
  const prefixByProvider: Partial<Record<AIProvider, string>> = {
    OpenAI: 'openai/',
    Anthropic: 'anthropic/',
    Gemini: 'google/',
  };

  const prefix = prefixByProvider[provider];
  if (prefix && modelId.startsWith(prefix)) {
    return modelId.slice(prefix.length);
  }

  return modelId;
}

export function createMentionLanguageModel(
  provider: AIProvider | undefined,
  modelId: string,
  apiKey: string
): LanguageModel {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('Missing API key for mention model.');
  }

  if (!provider) {
    return createGateway({ apiKey: key })(modelId);
  }

  const directModelId = toDirectProviderModelId(provider, modelId);

  switch (provider) {
    case 'OpenAI':
      return createOpenAI({ apiKey: key })(directModelId);
    case 'Anthropic':
      return createAnthropic({ apiKey: key })(directModelId);
    case 'Gemini':
      return createGoogleGenerativeAI({ apiKey: key })(directModelId);
    case 'Groq':
      return createGroq({ apiKey: key })(directModelId);
    default:
      return createGateway({ apiKey: key })(modelId);
  }
}

/** Resolves user mention key or GOOGLE_GEMINI_KEY for trial/default mentions. */
export function createResolvedMentionLanguageModel({
  apiKey,
  provider,
  modelId,
}: {
  apiKey?: string;
  provider?: AIProvider;
  modelId: string;
}): LanguageModel {
  const userKey = resolveMentionApiKey(apiKey);

  if (userKey) {
    if (!provider) {
      throw new Error('Missing provider for mention model.');
    }
    return createMentionLanguageModel(provider, modelId, userKey);
  }

  assertDefaultMentionProvider(provider);

  const geminiKey = getDefaultMentionGeminiApiKey();
  if (!geminiKey) {
    throw new Error('Missing GOOGLE_GEMINI_KEY.');
  }

  return createMentionLanguageModel('Gemini', modelId, geminiKey);
}
