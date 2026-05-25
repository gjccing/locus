"use client"

import { useEffect } from "react"
import { flushEditorContent } from "@/lib/editor-persistence"
import { useAppStore } from "@/stores/app-store"

// Bootstraps store slices that need async initialization and persistence hooks.
export function useBootstrapStore() {
  const loadApiKeys = useAppStore((s) => s.apiKeysLoad)
  const saveApiKeys = useAppStore((s) => s.apiKeysSave)
  const loadRecentMentionModels = useAppStore((s) => s.recentMentionModelsLoad)

  useEffect(() => {
    void loadApiKeys()
    loadRecentMentionModels()
  }, [loadApiKeys, loadRecentMentionModels])

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushEditorContent()
      void saveApiKeys()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveApiKeys])
}

// Back-compat name (if you meant "useBoostStore").
export const useBoostStore = useBootstrapStore
