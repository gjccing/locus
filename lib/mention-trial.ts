import type { AIProvider } from '@/stores/app-store';

/** Stored on mention nodes; resolved server-side to GOOGLE_GEMINI_KEY. */
export const MENTION_DEFAULT_API_KEY = 'default';

export function getDefaultMentionGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GEMINI_KEY?.trim() || undefined;
}

export const TRIAL_MODELS_GROUP = 'Trial models';

export type TrialMentionModel = {
  id: string;
  label: string;
  provider: AIProvider;
  apiKey: typeof MENTION_DEFAULT_API_KEY;
};

export const TRIAL_MENTION_MODELS: readonly TrialMentionModel[] = [
  {
    id: 'google/gemini-2.5-flash-lite',
    label: 'google/gemini-2.5-flash-lite',
    provider: 'Gemini',
    apiKey: MENTION_DEFAULT_API_KEY,
  },
] as const;

export const TRIAL_RECENT_API_KEY_ID = MENTION_DEFAULT_API_KEY;

export function isDefaultMentionApiKey(apiKey: string | undefined): boolean {
  const trimmed = apiKey?.trim();
  return !trimmed || trimmed === MENTION_DEFAULT_API_KEY;
}

/** User-provided mention key, or undefined to use GOOGLE_GEMINI_KEY. */
export function resolveMentionApiKey(apiKey: string | undefined): string | undefined {
  if (isDefaultMentionApiKey(apiKey)) return undefined;
  return apiKey!.trim();
}

export function assertDefaultMentionProvider(provider: AIProvider | undefined) {
  if (provider && provider !== 'Gemini') {
    throw new Error('Default mention API key only supports Gemini trial models.');
  }
}
