"use client"

import { create } from "zustand"
import { decryptData, encryptData } from "@/lib/crypto-client"

export type ConfigStatus = "passed" | "error" | "idle"

export type AIProvider = "OpenAI" | "Anthropic" | "Gemini" | "Groq"

export interface APIKeyInfo {
  id: string
  provider?: AIProvider
  token?: string
  status: ConfigStatus
}

const DEVICE_ID_KEY = "locus-device-id"
const API_KEYS_KEY = "locus-api-keys"
const RECENT_MENTION_MODELS_KEY = "locus-recent-mention-models"
export const MAX_RECENT_MENTION_MODELS = 8

export type RecentMentionModel = {
  provider: AIProvider
  modelId: string
  apiKeyId: string
}

const AI_PROVIDERS: readonly AIProvider[] = [
  "OpenAI",
  "Anthropic",
  "Gemini",
  "Groq",
]

function clearLocusLocalStorage() {
  localStorage.removeItem(DEVICE_ID_KEY)
  localStorage.removeItem(API_KEYS_KEY)
  localStorage.removeItem(RECENT_MENTION_MODELS_KEY)

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith("api-keys-")) {
      localStorage.removeItem(key)
    }
  }
}

type ApiKeysSlice = {
  apiKeys: APIKeyInfo[]
  apiKeysIsLoaded: boolean
  apiKeysLoad: () => Promise<void>
  apiKeysSave: () => Promise<void>
  apiKeysClearAll: () => Promise<void>
  apiKeysAdd: (apiKey: APIKeyInfo) => Promise<void>
  apiKeysUpdate: (id: string, updates: Partial<APIKeyInfo>) => Promise<void>
  apiKeysDelete: (id: string) => Promise<void>
}

type RecentMentionModelsSlice = {
  recentMentionModels: RecentMentionModel[]
  recentMentionModelsIsLoaded: boolean
  recentMentionModelsLoad: () => void
  recentMentionModelsAdd: (entry: RecentMentionModel) => void
}

export type AppState = ApiKeysSlice & RecentMentionModelsSlice

function parseRecentMentionModels(raw: string): RecentMentionModel[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const out: RecentMentionModel[] = []
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as RecentMentionModel).modelId === "string" &&
        typeof (item as RecentMentionModel).apiKeyId === "string" &&
        AI_PROVIDERS.includes((item as RecentMentionModel).provider)
      ) {
        out.push({
          provider: (item as RecentMentionModel).provider,
          modelId: (item as RecentMentionModel).modelId,
          apiKeyId: (item as RecentMentionModel).apiKeyId,
        })
      }
    }
    return out.slice(0, MAX_RECENT_MENTION_MODELS)
  } catch {
    return []
  }
}

function saveRecentMentionModels(models: RecentMentionModel[]) {
  localStorage.setItem(RECENT_MENTION_MODELS_KEY, JSON.stringify(models))
}

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export const useAppStore = create<AppState>((set, get) => ({
  apiKeys: [],
  apiKeysIsLoaded: false,

  apiKeysLoad: async () => {
    const secret = getOrCreateDeviceId()
    const stored = localStorage.getItem(API_KEYS_KEY)
    if (!stored) {
      set({ apiKeysIsLoaded: true })
      return
    }

    const decrypted = await decryptData(stored, secret)
    if (!decrypted) {
      set({ apiKeysIsLoaded: true })
      return
    }

    try {
      const parsed = JSON.parse(decrypted) as APIKeyInfo[]
      set({ apiKeys: parsed, apiKeysIsLoaded: true })
    } catch {
      set({ apiKeysIsLoaded: true })
    }
  },

  apiKeysSave: async () => {
    if (!get().apiKeysIsLoaded) return

    const secret = getOrCreateDeviceId()
    const data = JSON.stringify(get().apiKeys)
    const encrypted = await encryptData(data, secret)
    localStorage.setItem(API_KEYS_KEY, encrypted)
  },

  apiKeysClearAll: async () => {
    clearLocusLocalStorage()
    set({
      apiKeys: [],
      apiKeysIsLoaded: true,
      recentMentionModels: [],
      recentMentionModelsIsLoaded: true,
    })
  },

  apiKeysAdd: async (apiKey) => {
    set((prev) => ({ apiKeys: [...prev.apiKeys, apiKey] }))
    await get().apiKeysSave()
  },

  apiKeysUpdate: async (id, updates) => {
    set((prev) => ({
      apiKeys: prev.apiKeys.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
    await get().apiKeysSave()
  },

  apiKeysDelete: async (id) => {
    set((prev) => ({ apiKeys: prev.apiKeys.filter((item) => item.id !== id) }))
    await get().apiKeysSave()
  },

  recentMentionModels: [],
  recentMentionModelsIsLoaded: false,

  recentMentionModelsLoad: () => {
    const stored = localStorage.getItem(RECENT_MENTION_MODELS_KEY)
    if (!stored) {
      set({ recentMentionModelsIsLoaded: true })
      return
    }

    set({
      recentMentionModels: parseRecentMentionModels(stored),
      recentMentionModelsIsLoaded: true,
    })
  },

  recentMentionModelsAdd: (entry) => {
    set((prev) => {
      const filtered = prev.recentMentionModels.filter(
        (m) => !(m.apiKeyId === entry.apiKeyId && m.modelId === entry.modelId)
      )
      const next = [entry, ...filtered].slice(0, MAX_RECENT_MENTION_MODELS)
      saveRecentMentionModels(next)
      return { recentMentionModels: next }
    })
  },
}))
