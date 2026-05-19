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

function clearLocusLocalStorage() {
  localStorage.removeItem(DEVICE_ID_KEY)
  localStorage.removeItem(API_KEYS_KEY)

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

export type AppState = ApiKeysSlice

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
    set({ apiKeys: [], apiKeysIsLoaded: true })
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
}))
