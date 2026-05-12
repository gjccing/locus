"use client"

import { create } from "zustand"
import { getSession } from "next-auth/react"
import { decryptData, encryptData } from "@/lib/crypto-client"

export type ConfigStatus = "passed" | "error" | "idle"

export type AIProvider = "OpenAI" | "Anthropic" | "Gemini" | "Groq"

export interface APIKeyInfo {
  id: string
  provider?: AIProvider
  token?: string
  status: ConfigStatus
}

export interface AssistantInfo {
  id: string
  name: string
  apiKeyId?: string
  /** Model id from the provider catalog (see `lib/mention-models.ts`). */
  modelId?: string
  instructions: string
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

type AssistantsSlice = {
  assistants: AssistantInfo[]
  assistantsIsLoaded: boolean
  assistantsLoadFromSession: () => Promise<void>
  assistantsSaveToSession: () => Promise<void>
  assistantsAdd: (assistant: AssistantInfo) => Promise<void>
  assistantsUpdate: (id: string, updates: Partial<AssistantInfo>) => Promise<void>
  assistantsDelete: (id: string) => Promise<void>
}

export type AppState = ApiKeysSlice & AssistantsSlice

async function getEncryptedUserStorage(storagePrefix: string) {
  const session = await getSession()
  if (!session?.user?.login || !session?.user?.id) return null

  return {
    storageKey: `${storagePrefix}-${session.user.login}`,
    secret: session.user.id,
  }
}

async function getAssistantsStorageKey() {
  const session = await getSession()
  if (!session?.user?.login) return null
  return `assistants-${session.user.login}`
}

export const useAppStore = create<AppState>((set, get) => ({
  apiKeys: [],
  apiKeysIsLoaded: false,

  apiKeysLoadFromSession: async () => {
    const ctx = await getEncryptedUserStorage("api-keys")
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
    const ctx = await getEncryptedUserStorage("api-keys")
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

  assistants: [],
  assistantsIsLoaded: false,

  assistantsLoadFromSession: async () => {
    const storageKey = await getAssistantsStorageKey()
    if (!storageKey) {
      set({ assistantsIsLoaded: true })
      return
    }

    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      set({ assistantsIsLoaded: true })
      return
    }

    try {
      type StoredAssistantRow = Partial<AssistantInfo> & {
        id?: string
      }
      const parsed = JSON.parse(stored) as StoredAssistantRow[]
      const assistants: AssistantInfo[] = parsed
        .filter((row): row is StoredAssistantRow & { id: string } =>
          typeof row?.id === "string"
        )
        .map((row) => ({
          id: row.id,
          name: typeof row.name === "string" ? row.name : "",
          apiKeyId: row.apiKeyId,
          modelId: typeof row.modelId === "string" ? row.modelId : undefined,
          instructions:
            typeof row.instructions === "string" ? row.instructions : "",
        }))
      set({ assistants, assistantsIsLoaded: true })
    } catch {
      set({ assistantsIsLoaded: true })
    }
  },

  assistantsSaveToSession: async () => {
    if (!get().assistantsIsLoaded) return
    const storageKey = await getAssistantsStorageKey()
    if (!storageKey) return

    localStorage.setItem(storageKey, JSON.stringify(get().assistants))
  },

  assistantsAdd: async (assistant) => {
    set((prev) => ({ assistants: [...prev.assistants, assistant] }))
    await get().assistantsSaveToSession()
  },

  assistantsUpdate: async (id, updates) => {
    set((prev) => ({
      assistants: prev.assistants.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }))
    await get().assistantsSaveToSession()
  },

  assistantsDelete: async (id) => {
    set((prev) => ({
      assistants: prev.assistants.filter((item) => item.id !== id),
    }))
    await get().assistantsSaveToSession()
  },
}))
