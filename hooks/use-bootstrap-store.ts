"use client"

import { useEffect } from "react"
import { useAppStore } from "@/stores/app-store"

// Bootstraps store slices that need async initialization and persistence hooks.
export function useBootstrapStore() {
  const loadApiKeys = useAppStore((s) => s.apiKeysLoad)
  const saveApiKeys = useAppStore((s) => s.apiKeysSave)

  useEffect(() => {
    void loadApiKeys()
  }, [loadApiKeys])

  useEffect(() => {
    const handleBeforeUnload = () => {
      void saveApiKeys()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveApiKeys])
}

// Back-compat name (if you meant "useBoostStore").
export const useBoostStore = useBootstrapStore
