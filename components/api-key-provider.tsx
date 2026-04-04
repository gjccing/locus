"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type ConfigStatus = "active" | "error" | "idle"

export type AIProvider = "OpenAI" | "Anthropic" | "Gemini" | "Google Vertex AI" | "Mistral" | "Amazon Bedrock" | "Cohere" | "Groq"

export interface APIKeyInfo {
  id: string
  name?: string
  provider?: AIProvider
  token?: string
  status: ConfigStatus
}

export type APIKeyContextType = {
  apiKeys: APIKeyInfo[]
  addAPIKey: (apiKey: APIKeyInfo) => void
  updateAPIKey: (id: string, updates: Partial<APIKeyInfo>) => void
  deleteAPIKey: (id: string) => void
}

const APIKeyContext = createContext<APIKeyContextType | undefined>(undefined)

// Crypto helpers using Web Crypto API
async function deriveKey(secret: string, salt: Uint8Array) {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(secret), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ])
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    } as Pbkdf2Params,
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
}

async function encryptData(data: string, secret: string) {
  const enc = new TextEncoder()
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(secret, salt)

  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(data))

  const combinedBytes = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combinedBytes.set(salt, 0)
  combinedBytes.set(iv, salt.length)
  combinedBytes.set(new Uint8Array(encrypted), salt.length + iv.length)

  // Use a compatible base64 encoding (btoa might not handle all bytes well if not treated as binary)
  return btoa(String.fromCharCode(...combinedBytes))
}

async function decryptData(encodedData: string, secret: string) {
  try {
    const combinedBytes = new Uint8Array(
      atob(encodedData)
        .split("")
        .map((c) => c.charCodeAt(0))
    )
    const salt = combinedBytes.slice(0, 16)
    const iv = combinedBytes.slice(16, 28)
    const data = combinedBytes.slice(28)

    const key = await deriveKey(secret, salt)
    const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data)

    return new TextDecoder().decode(decrypted)
  } catch (e) {
    console.error("Failed to decrypt:", e)
    return null
  }
}

export function useAPIKeys() {
  const context = useContext(APIKeyContext)
  if (!context) {
    throw new Error("useAPIKeys must be used within an APIKeyProvider")
  }
  return context
}

export function APIKeyProvider({ secret, children }: { secret: string, children: React.ReactNode }) {
  const [apiKeys, setApiKeys] = useState<APIKeyInfo[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load "api-keys" raw from local storage and decrypt with secret
  useEffect(() => {
    const loadKeys = async () => {
      if (!secret) {
        setIsLoaded(true)
        return
      }
      const stored = localStorage.getItem("api-keys")
      if (stored) {
        const decrypted = await decryptData(stored, secret)
        if (decrypted) {
          try {
            setApiKeys(JSON.parse(decrypted))
          } catch (e) {
            console.error("Failed to parse decrypted keys:", e)
          }
        }
      }
      setIsLoaded(true)
    }
    loadKeys()
  }, [secret])

  // When unmount or close the tab, encrypt apiKeys with secret and save to local storage
  useEffect(() => {
    if (!isLoaded || !secret) return

    const saveKeys = async () => {
      const data = JSON.stringify(apiKeys)
      const encrypted = await encryptData(data, secret)
      localStorage.setItem("api-keys", encrypted)
    }

    // Save on every change
    saveKeys()

    const handleBeforeUnload = () => {
      saveKeys()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      saveKeys() // Save on unmount
    }
  }, [apiKeys, secret, isLoaded])

  const addAPIKey = useCallback((apiKey: APIKeyInfo) => {
    setApiKeys((prev) => [...prev, apiKey])
  }, [])

  const updateAPIKey = useCallback((id: string, updates: Partial<APIKeyInfo>) => {
    setApiKeys((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const deleteAPIKey = useCallback((id: string) => {
    setApiKeys((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return (
    <APIKeyContext.Provider value={{ apiKeys, addAPIKey, updateAPIKey, deleteAPIKey }}>
      {children}
    </APIKeyContext.Provider>
  )
}
