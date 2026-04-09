"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useParams } from "next/navigation"
import { getSession } from "next-auth/react"
import {
  hasCloned,
  cloneRepository,
  fetchRepository,
  pushRepository,
  fetchAllBranches,
  fetchAllTags,
  checkoutBranch,
} from "@/lib/git-service"

interface RepoContextType {
  loading: boolean
  branches: string[]
  tags: string[]
  error: string | null
  addBranch: (name: string, object?: string) => Promise<void>
  switchBranch: (name: string) => Promise<void>
  fetchRepo: () => Promise<void>
  pushRepo: () => Promise<void>
}

const RepoContext = createContext<RepoContextType | undefined>(undefined)

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const owner = params.owner as string
  const name = params.name as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [branches, setBranches] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const session = await getSession()
      setToken(session?.accessToken as string)
      if (!session?.accessToken) {
        setError("Not authenticated or missing access token")
        setLoading(false)
        return
      }
    })()
  }, [])

  const addBranch = useCallback(async () => {
    if (!owner || !name || !token) return

    try {
      setLoading(true)
      // add Orphan Branch
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to add branch")
    } finally {
      setLoading(false)
    }
  }, [owner, name, token])

  const switchBranch = useCallback(
    async (branch: string) => {
      if (!owner || !name) return

      try {
        setLoading(true)
        await checkoutBranch(owner, name, branch)
      } catch (err: unknown) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to switch branch")
      } finally {
        setLoading(false)
      }
    },
    [owner, name]
  )

  const fetchRepo = useCallback(async () => {
    if (!owner || !name || !token) return

    try {
      setLoading(true)
      await fetchRepository(owner, name, token)
    } catch (err: unknown) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : "Failed to fetch repository"
      )
    } finally {
      setLoading(false)
    }
  }, [owner, name, token])

  const pushRepo = useCallback(async () => {
    if (!owner || !name || !token) return

    try {
      setLoading(true)
      await pushRepository(owner, name, token)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to push repository")
    } finally {
      setLoading(false)
    }
  }, [owner, name, token])

  const cloneRepo = useCallback(async () => {
    if (!owner || !name || !token) return

    try {
      setLoading(true)
      await cloneRepository(owner, name, token)
    } catch (err: unknown) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : "Failed to clone repository"
      )
    } finally {
      setLoading(false)
    }
  }, [owner, name, token])

  const initRepo = useCallback(async () => {
    if (!owner || !name) return

    try {
      setLoading(true)
      if (await hasCloned(owner, name)) {
        await fetchRepo()
      } else {
        await cloneRepo()
      }

      setBranches(await fetchAllBranches(owner, name))
      setTags(await fetchAllTags(owner, name))
    } catch (err: unknown) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : "Failed to initialize repository"
      )
    } finally {
      setLoading(false)
    }
  }, [owner, name, cloneRepo, fetchRepo])

  useEffect(() => {
    initRepo()
  }, [initRepo])

  return (
    <RepoContext.Provider
      value={{
        loading,
        branches,
        tags,
        error,
        addBranch,
        switchBranch,
        fetchRepo,
        pushRepo,
      }}
    >
      {children}
    </RepoContext.Provider>
  )
}

export function useRepo() {
  const context = useContext(RepoContext)
  if (context === undefined) {
    throw new Error("useRepo must be used within a RepoProvider")
  }
  return context
}
