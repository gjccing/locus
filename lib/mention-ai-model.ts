import { createGateway } from '@ai-sdk/gateway';
import { createGroq } from '@ai-sdk/groq';
import type { LanguageModel } from 'ai';

import type { AIProvider } from '@/stores/app-store';

export function createMentionLanguageModel(
  provider: AIProvider | undefined,
  modelId: string,
  apiKey: string
): LanguageModel {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('Missing API key for mention model.');
  }

  if (provider === 'Groq') {
    return createGroq({ apiKey: key })(modelId);
  }

  return createGateway({ apiKey: key })(modelId);
}
