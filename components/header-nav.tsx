"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeftIcon, RepoIcon } from "@primer/octicons-react"
import { Button } from "./ui/button"
import { InlineCode } from "./ui/typography"
import { useState, useEffect } from "react"
import { getSession } from "next-auth/react"
import { Octokit } from "octokit"

export function HeaderNav() {
  const pathname = usePathname()
  const route = useRouter()
  const [repoFullName, setRepoFullName] = useState<string | null>(null)

  const isRepositoryPage = pathname.startsWith("/repository/")
  const [, , owner, name] = isRepositoryPage ? pathname.split("/") : []

  useEffect(() => {
    async function fetchRepoName() {
      if (!owner || !name) return
      try {
        const session = (await getSession()) as { accessToken?: string } | null
        if (session?.accessToken) {
          const octokit = new Octokit({ auth: session.accessToken })
          const { data } = await octokit.rest.repos.get({ owner, repo: name })
          setRepoFullName(data.full_name)
        }
      } catch (error) {
        console.error("Error fetching repository name:", error)
      }
    }
    fetchRepoName()
  }, [owner, name])

  if (!isRepositoryPage) return null

  return (
    <>
      <span className="text-slate-200 dark:text-slate-700">|</span>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Button variant="ghost" asChild onClick={() => route.back()}>
          <a href="#" title="back to list">
            <ArrowLeftIcon size={16} />
          </a>
        </Button>
        <RepoIcon />
        <InlineCode>{repoFullName}</InlineCode>
      </div>
    </>
  )
}
