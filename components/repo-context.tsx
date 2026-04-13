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
  overrideByOriginBranches,
  checkoutOrphanBranch,
  cleanWorkspace,
  writeFile,
  commit,
  push,
  deleteBranch,
  deleteRemoteRef,
  renameBranch,
  deleteTag,
  renameTag,
} from "@/lib/git-service"
import { toast } from "sonner"

const CHAT_METADATA_PATH = "./locus/chat.json"

interface RepoContextType {
  loading: boolean
  branches: { name: string; hasChatted: boolean; hasSynced: boolean }[]
  tags: string[]
  initialize: () => Promise<void>
  addOrphanBranch: (name: string) => Promise<void>
  fetch: () => Promise<void>
  renameBranch: (oldName: string, newName: string) => Promise<void>
  deleteBranch: (name: string) => Promise<void>
  renameTag: (oldName: string, newName: string) => Promise<void>
  deleteTag: (name: string) => Promise<void>
}

const RepoContext = createContext<RepoContextType | undefined>(undefined)

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const repo = useParams() as { owner: string; repo: string }
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<RepoContextType["branches"]>([])
  const [tags, setTags] = useState<string[]>([])
  const sessionRef = useRef<(Session & { accessToken: string }) | null>(null)
  const promiseChainRef = useRef<Promise<unknown>>(Promise.resolve())
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
        const result = promiseChainRef.current.then(() => {
          if (needSession && !sessionRef.current) {
            if (loading) {
              toast.loading("Loading session...", {
                position: "bottom-right",
              })
            } else {
              toast.error("Not authenticated or missing access token", {
                position: "bottom-right",
              })
            }
            return
          }
          setLoading(true)
          return fn(...args)
        })
        promiseChainRef.current = result
          .catch((err: unknown) => {
            console.error(err)
            if (typeof err === "string") {
              toast.error(err, { position: "bottom-right" })
            } else {
              toast.error(toastErrorMessage, { position: "bottom-right" })
            }
          })
          .finally(() => setLoading(false))
        return result
      }
    }

    async function setBranchesAndTags() {
      const [branches, tags] = await Promise.all([
        listBranches(repo).then((branches) =>
          Promise.all(
            branches.map(async (name) => ({
              name,
              hasChatted: await isExistInRef({
                ...repo,
                ref: `refs/heads/${name}`,
                target: CHAT_METADATA_PATH,
              }),
              hasSynced: true,
            }))
          )
        ),
        listTags(repo),
      ])
      setBranches(branches)
      setTags(tags)
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
            throw "Not authenticated or missing access token"
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

          await overrideByOriginBranches(repo)
          await setBranchesAndTags()
        }
      ),
      addOrphanBranch: decorator(
        true,
        "Failed to add an orphan branch",
        async (name: string) => {
          if (branches.some((b) => b.name === name)) {
            throw "Branch already exists"
          }

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
            ref: name,
          })
          await setBranchesAndTags()
        }
      ),
      fetch: decorator(true, "Failed to fetch", async () => {
        await fetch({
          ...repo,
          accessToken: sessionRef.current!.accessToken,
        })
        await overrideByOriginBranches(repo)
        await setBranchesAndTags()
      }),
      renameBranch: decorator(
        true,
        "Failed to rename branch",
        async (oldName: string, newName: string) => {
          if (branches.some((b) => b.name === newName) || oldName === newName) {
            throw "Branch already exists"
          }
          await deleteRemoteRef({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
            ref: `refs/heads/${oldName}`,
          })
          await renameBranch({ ...repo, oldName, newName })
          await push({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
            ref: newName,
          })
          await setBranchesAndTags()
        }
      ),
      deleteBranch: decorator(
        true,
        "Failed to delete branch",
        async (name: string) => {
          await deleteRemoteRef({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
            ref: `refs/heads/${name}`,
          })
          await deleteBranch({ ...repo, branch: name })
          await setBranchesAndTags()
        }
      ),
      renameTag: decorator(
        true,
        "Failed to rename tag",
        async (oldName: string, newName: string) => {
          if (tags.some((t) => t === newName) || oldName === newName) {
            throw "Tag already exists"
          }
          await deleteRemoteRef({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
            ref: `refs/tags/${oldName}`,
          })
          await renameTag({ ...repo, oldName, newName })
          await push({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
            ref: `refs/tags/${newName}`,
          })
          await setBranchesAndTags()
        }
      ),
      deleteTag: decorator(
        true,
        "Failed to delete tag",
        async (tag: string) => {
          await deleteRemoteRef({
            ...repo,
            accessToken: sessionRef.current!.accessToken,
            ref: `refs/tags/${tag}`,
          })
          await deleteTag({ ...repo, tag })
          await setBranchesAndTags()
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
