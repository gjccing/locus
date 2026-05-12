import type { AIProvider } from "@/stores/app-store"

const VERCEL_GATEWAY_MODELS = "https://ai-gateway.vercel.sh/v1/models"
const GROQ_MODELS = "https://api.groq.com/openai/v1/models"

export const MENTION_MODELS_PER_PROVIDER = Infinity

type GatewayModel = {
  id: string
  name?: string
  owned_by?: string
  type?: string
  released?: number
}

type GatewayListResponse = {
  data: GatewayModel[]
}

type GroqListResponse = {
  data?: { id: string; created?: number }[]
}

let gatewayCatalogCache: { at: number; data: GatewayModel[] } | null = null
const GATEWAY_CACHE_MS = 5 * 60 * 1000

export function gatewayOwnedBy(provider: AIProvider): string | null {
  switch (provider) {
    case "OpenAI":
      return "openai"
    case "Anthropic":
      return "anthropic"
    case "Gemini":
      return "google"
    default:
      return null
  }
}

export async function fetchGatewayCatalog(
  signal?: AbortSignal
): Promise<GatewayModel[]> {
  if (
    gatewayCatalogCache &&
    Date.now() - gatewayCatalogCache.at < GATEWAY_CACHE_MS
  ) {
    return gatewayCatalogCache.data
  }

  const res = await fetch(VERCEL_GATEWAY_MODELS, { signal })
  if (!res.ok) {
    throw new Error(`Model catalog request failed (${res.status})`)
  }

  const json = (await res.json()) as GatewayListResponse
  const data = Array.isArray(json.data) ? json.data : []
  gatewayCatalogCache = { at: Date.now(), data }
  return data
}

export function pickLatestGatewayModels(
  catalog: GatewayModel[],
  ownedBy: string,
  limit: number
): { id: string; label: string }[] {
  const filtered = catalog.filter(
    (m) =>
      m.owned_by === ownedBy &&
      m.type === "language" &&
      typeof m.id === "string"
  )

  filtered.sort((a, b) => (b.released ?? 0) - (a.released ?? 0))

  const seen = new Set<string>()
  const out: { id: string; label: string }[] = []

  for (const m of filtered) {
    if (seen.has(m.id)) continue
    seen.add(m.id)
    out.push({
      id: m.id,
      label: m.name ? `${m.name} · ${m.id}` : m.id,
    })
    if (out.length >= limit) break
  }

  return out
}

export async function fetchGroqLatestModels(
  apiKey: string,
  limit: number,
  signal?: AbortSignal
): Promise<{ id: string; label: string }[]> {
  const res = await fetch(GROQ_MODELS, {
    signal,
    headers: { Authorization: `Bearer ${apiKey.trim()}` },
  })

  if (!res.ok) {
    throw new Error(`Groq models request failed (${res.status})`)
  }

  const json = (await res.json()) as GroqListResponse
  const rows = json.data ?? []

  rows.sort((a, b) => (b.created ?? 0) - (a.created ?? 0))

  return rows.slice(0, limit).map((r) => ({
    id: r.id,
    label: r.id,
  }))
}
