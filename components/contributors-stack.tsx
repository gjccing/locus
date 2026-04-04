"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { Octokit } from "octokit"
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Contributor {
  id: number
  login: string
  avatar_url: string
}

interface ContributorsStackProps {
  repoOwner: string
  repoName: string
  className?: string
  limit?: number
}

import { Small } from "@/components/ui/typography"

export function ContributorsStack({ repoOwner, repoName, className, limit = 3 }: ContributorsStackProps) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContributors() {
      try {
        const session = await getSession() as { accessToken?: string } | null
        if (session?.accessToken) {
          const octokit = new Octokit({ auth: session.accessToken })
          const { data } = await octokit.rest.repos.listContributors({
            owner: repoOwner,
            repo: repoName,
            per_page: limit + 5, // Fetch a few more for the "+" count
          })
          setContributors(data as Contributor[])
        }
      } catch (error) {
        console.error("Error fetching contributors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContributors()
  }, [repoOwner, repoName, limit])

  if (loading) {
    return (
      <div className={cn("flex -space-x-2 isolate", className)}>
        <Skeleton className="size-8 rounded-full ring-2 ring-white z-20" />
        <Skeleton className="size-8 rounded-full ring-2 ring-white z-10" />
        <Skeleton className="size-8 rounded-full ring-2 ring-white z-0" />
      </div>
    )
  }

  if (contributors.length === 0) return null

  const displayed = contributors.slice(0, limit)
  const remaining = contributors.length - limit

  return (
    <AvatarGroup className={cn("group/stack transition-all duration-300 hover:-space-x-1", className)}>
      {displayed.map((c, i) => (
        <Avatar
          key={c.id}
          className=" ring-offset-0 transition-all duration-300 group-hover/stack:scale-105"
          style={{ zIndex: limit + 1 - i }}
        >
          <AvatarImage src={c.avatar_url} alt={c.login} />
          <AvatarFallback>{c.login[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <AvatarGroupCount className="z-0 -translate-x-2 group-hover/stack:translate-x-0 transition-all duration-300">
          <Small className="font-bold text-zinc-500">+{remaining}</Small>
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
