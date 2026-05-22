import {
  getMentionModelsForProvider,
  MENTION_MODELS_PER_PROVIDER,
} from '@/lib/mention-models';
import { TRIAL_MENTION_MODELS } from '@/lib/mention-trial';
import type { AIProvider } from '@/stores/app-store';

const MENTION_PROVIDERS: readonly AIProvider[] = [
  'OpenAI',
  'Anthropic',
  'Gemini',
  'Groq',
];

function buildAllowedMentionModelIds(): ReadonlySet<string> {
  const ids = new Set<string>();

  for (const trial of TRIAL_MENTION_MODELS) {
    ids.add(trial.id);
  }

  for (const provider of MENTION_PROVIDERS) {
    for (const option of getMentionModelsForProvider(
      provider,
      MENTION_MODELS_PER_PROVIDER
    )) {
      ids.add(option.id);
    }
  }

  return ids;
}

const allowedMentionModelIds = buildAllowedMentionModelIds();

/** Model ids exposed in the mention picker (trial + catalog). */
export function getAllowedMentionModelIds(): readonly string[] {
  return [...allowedMentionModelIds];
}

export function isAllowedMentionModel(modelId: string | undefined): boolean {
  const id = modelId?.trim();
  if (!id) return false;
  return allowedMentionModelIds.has(id);
}
