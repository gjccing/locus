import type { AIProvider } from '@/stores/app-store';

import gatewayCatalogFile from '@/lib/data/gateway-catalog.json';
import groqCatalogFile from '@/lib/data/groq-catalog.json';

export const MENTION_MODELS_PER_PROVIDER = Infinity;

export type GatewayModel = {
  id: string;
  name?: string;
  owned_by?: string;
  type?: string;
  released?: number;
};

export type MentionModelOption = {
  id: string;
  label: string;
};

type LocalCatalogFile<T> = {
  fetchedAt: string;
  data: T[];
};

type GroqCatalogRow = {
  id: string;
  created?: number;
};

const gatewayCatalog = gatewayCatalogFile as LocalCatalogFile<GatewayModel>;
const groqCatalog = groqCatalogFile as LocalCatalogFile<GroqCatalogRow>;

export function getMentionCatalogFetchedAt() {
  return {
    gateway: gatewayCatalog.fetchedAt,
    groq: groqCatalog.fetchedAt,
  };
}

export function gatewayOwnedBy(provider: AIProvider): string | null {
  switch (provider) {
    case 'OpenAI':
      return 'openai';
    case 'Anthropic':
      return 'anthropic';
    case 'Gemini':
      return 'google';
    default:
      return null;
  }
}

/** Local Vercel AI Gateway catalog (see `npm run mention-models:download`). */
export function getGatewayCatalog(): GatewayModel[] {
  return gatewayCatalog.data;
}

/** @deprecated Use `getGatewayCatalog`. Kept for existing call sites. */
export async function fetchGatewayCatalog(
  signal?: AbortSignal
): Promise<GatewayModel[]> {
  signal?.throwIfAborted();
  return getGatewayCatalog();
}

export function pickLatestGatewayModels(
  catalog: GatewayModel[],
  ownedBy: string,
  limit: number
): GatewayModel[] {
  const filtered = catalog.filter(
    (m) =>
      m.owned_by === ownedBy &&
      m.type === 'language' &&
      typeof m.id === 'string'
  );

  filtered.sort((a, b) => (b.released ?? 0) - (a.released ?? 0));

  const seen = new Set<string>();
  const out: GatewayModel[] = [];

  for (const m of filtered) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
    if (out.length >= limit) break;
  }

  return out;
}

/** Local Groq catalog (see `npm run mention-models:download` with GROQ_API_KEY). */
export function getGroqModels(limit: number): MentionModelOption[] {
  const rows = [...groqCatalog.data];
  rows.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));

  return rows.slice(0, limit).map((r) => ({
    id: r.id,
    label: r.id,
  }));
}

/** @deprecated Use `getGroqModels`. `apiKey` is unused (catalog is local). */
export async function fetchGroqLatestModels(
  _apiKey: string,
  limit: number,
  signal?: AbortSignal
): Promise<MentionModelOption[]> {
  signal?.throwIfAborted();
  return getGroqModels(limit);
}

export function getMentionModelsForProvider(
  provider: AIProvider,
  limit: number = MENTION_MODELS_PER_PROVIDER
): MentionModelOption[] {
  if (provider === 'Groq') {
    return getGroqModels(limit);
  }

  const ownedBy = gatewayOwnedBy(provider);
  if (!ownedBy) return [];

  return pickLatestGatewayModels(getGatewayCatalog(), ownedBy, limit).map(
    (m) => ({
      id: m.id,
      label: m.id,
    })
  );
}
