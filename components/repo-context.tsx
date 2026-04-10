"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react"
import { useParams } from "next/navigation"
import type { Session } from "next-auth"
import { getSession } from "next-auth/react"
import {
  hasCloned,
  clone,
  fetch,
  listBranches,
  listTags,
  isExistInRef,
  syncWithOrigin,
  checkoutOrphanBranch,
  cleanWorkspace,
  writeFile,
  commit,
  push,
} from "@/lib/git-service"
import { toast } from "sonner"

const CHAT_METADATA_PATH = ".agents/chats/meta.json"

interface RepoContextType {
  loading: boolean
  branches: { name: string; hasChatted: boolean; hasSynced: boolean }[]
  tags: string[]
  initialize: () => Promise<void>
  addOrphanBranch: (name: string) => Promise<void>
}

const RepoContext = createContext<RepoContextType | undefined>(undefined)

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const repo = useParams() as { owner: string; repo: string }
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<RepoContextType["branches"]>([])
  const [tags, setTags] = useState<string[]>([])
  const sessionRef = useRef<(Session & { accessToken: string }) | null>(null)

  const value = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function decorator<T extends (...args: any[]) => any>(
      needSession: boolean,
      toastErrorMessage: string,
      fn: T
    ) {
      return async (
        ...args: Parameters<T>
      ): Promise<Awaited<ReturnType<T>> | undefined> => {
        try {
          if (needSession && !sessionRef.current) {
            if (loading) {
              toast.loading("Loading session...", { position: "bottom-right" })
            } else {
              toast.error("Not authenticated or missing access token", {
                position: "bottom-right",
              })
            }
            return
          }
          setLoading(true)
          return await fn(...args)
        } catch (err: unknown) {
          console.error(err)
          toast.error(toastErrorMessage, { position: "bottom-right" })
        } finally {
          setLoading(false)
        }
      }
    }

    async function buildBranches() {
      return await Promise.all(
        (await listBranches(repo)).map(async (name) => ({
          name,
          hasChatted: await isExistInRef({
            ...repo,
            ref: `refs/heads/${name}`,
            target: CHAT_METADATA_PATH,
          }),
          hasSynced: true,
        }))
      )
    }

    const value = {
      loading,
      branches,
      tags,
      initialize: decorator(
        false,
        "Failed to initialize repository",
        async () => {
          const session = await getSession()
          if (session?.accessToken) {
            sessionRef.current = {
              ...session,
              accessToken: session.accessToken,
            }
          } else {
            throw new Error("Not authenticated or missing access token")
          }

          if (await hasCloned(repo)) {
            await fetch({
              ...repo,
              accessToken: sessionRef.current!.accessToken,
            })
          } else {
            await clone({
              ...repo,
              accessToken: sessionRef.current!.accessToken,
            })
          }

          await syncWithOrigin(repo)
          const [branches, tags] = await Promise.all([
            buildBranches(),
            listTags(repo),
          ])
          setBranches(branches)
          setTags(tags)
        }
      ),
      addOrphanBranch: decorator(
        true,
        "Failed to add an orphan branch",
        async (name: string) => {
          await checkoutOrphanBranch({ ...repo, branch: name })
          await cleanWorkspace(repo)
          await writeFile({
            ...repo,
            filepath: CHAT_METADATA_PATH,
            content: JSON.stringify({
              name,
              description: "",
              createTime: Date.now(),
              updateTime: Date.now(),
            }),
          })
          await commit({
            ...repo,
            message: "Initial chat",
            author: {
              name: sessionRef.current!.user.name!,
              email: sessionRef.current!.user.email!,
            },
            filepath: CHAT_METADATA_PATH,
          })
          await push({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
          })
          setBranches(await buildBranches())
        }
      ),
    }
    return value
  }, [repo, loading, branches, tags])

  useEffect(() => {
    value.initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <RepoContext.Provider value={value}>{children}</RepoContext.Provider>
}

export function useRepo() {
  const context = useContext(RepoContext)
  if (context === undefined) {
    throw new Error("useRepo must be used within a RepoProvider")
  }
  return context
}
