"use client"

import { useEffect } from "react"
import { useAppStore } from "@/stores/app-store"

// Bootstraps store slices that need async initialization and persistence hooks.
export function useBootstrapStore() {
  const loadApiKeys = useAppStore((s) => s.apiKeysLoadFromSession)
  const saveApiKeys = useAppStore((s) => s.apiKeysSaveToSession)
  const loadAssistants = useAppStore((s) => s.assistantsLoadFromSession)
  const saveAssistants = useAppStore((s) => s.assistantsSaveToSession)

  useEffect(() => {
    void loadApiKeys()
  }, [loadApiKeys])

  useEffect(() => {
    void loadAssistants()
  }, [loadAssistants])

  useEffect(() => {
    const handleBeforeUnload = () => {
      void saveApiKeys()
      void saveAssistants()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveApiKeys, saveAssistants])
}

// Back-compat name (if you meant "useBoostStore").
export const useBoostStore = useBootstrapStore

