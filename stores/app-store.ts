"use client"

import { create } from "zustand"
import { getSession } from "next-auth/react"
import { decryptData, encryptData } from "@/lib/crypto-client"

export type ConfigStatus = "passed" | "error" | "idle"

export type AIProvider =
  | "OpenAI"
  | "Anthropic"
  | "Gemini"
  | "Groq"

export interface APIKeyInfo {
  id: string
  provider?: AIProvider
  token?: string
  status: ConfigStatus
}

type ApiKeysSlice = {
  apiKeys: APIKeyInfo[]
  apiKeysIsLoaded: boolean
  apiKeysLoadFromSession: () => Promise<void>
  apiKeysSaveToSession: () => Promise<void>
  apiKeysAdd: (apiKey: APIKeyInfo) => Promise<void>
  apiKeysUpdate: (id: string, updates: Partial<APIKeyInfo>) => Promise<void>
  apiKeysDelete: (id: string) => Promise<void>
}

export type AppState = ApiKeysSlice

async function getApiKeysStorageContext() {
  const session = await getSession()
  if (!session?.user?.login || !session?.user?.id) return null

  return {
    storageKey: `api-keys-${session.user.login}`,
    secret: session.user.id,
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  apiKeys: [],
  apiKeysIsLoaded: false,

  apiKeysLoadFromSession: async () => {
    const ctx = await getApiKeysStorageContext()
    if (!ctx) {
      set({ apiKeysIsLoaded: true })
      return
    }

    const stored = localStorage.getItem(ctx.storageKey)
    if (!stored) {
      set({ apiKeysIsLoaded: true })
      return
    }

    const decrypted = await decryptData(stored, ctx.secret)
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

  apiKeysSaveToSession: async () => {
    if (!get().apiKeysIsLoaded) return
    const ctx = await getApiKeysStorageContext()
    if (!ctx) return

    const data = JSON.stringify(get().apiKeys)
    const encrypted = await encryptData(data, ctx.secret)
    localStorage.setItem(ctx.storageKey, encrypted)
  },

  apiKeysAdd: async (apiKey) => {
    set((prev) => ({ apiKeys: [...prev.apiKeys, apiKey] }))
    await get().apiKeysSaveToSession()
  },

  apiKeysUpdate: async (id, updates) => {
    set((prev) => ({
      apiKeys: prev.apiKeys.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
    await get().apiKeysSaveToSession()
  },

  apiKeysDelete: async (id) => {
    set((prev) => ({ apiKeys: prev.apiKeys.filter((item) => item.id !== id) }))
    await get().apiKeysSaveToSession()
  },
}))

