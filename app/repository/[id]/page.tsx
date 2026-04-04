"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { Octokit } from "octokit"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeftIcon, RepoIcon, StarIcon, RepoForkedIcon, EyeIcon, GlobeIcon, LockIcon } from "@primer/octicons-react"
import { ContributorsStack } from "@/components/contributors-stack"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { H1, Lead } from "@/components/ui/typography"

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  subscribers_count: number // watch count
  language: string
  private: boolean
  updated_at: string
  created_at: string
  owner: {
    login: string
    avatar_url: string
  }
  homepage?: string
  topics?: string[]
}

export default function RepositoryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [repo, setRepo] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRepo() {
      try {
        const session = await getSession() as { accessToken?: string } | null
        if (!session?.accessToken) {
          setError("No authentication session found.")
          setLoading(false)
          return
        }

        const octokit = new Octokit({ auth: session.accessToken })
        const { data } = await octokit.request("GET /repositories/{id}", {
          id: id as string,
        })
        
        setRepo(data as Repository)
      } catch (err) {
        console.error("Error fetching repository:", err)
        setError("Failed to load repository information.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRepo()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-24 mb-4" />
        <Card>
          <CardHeader className="gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="gap-8">
            <div className="flex gap-4">
               <Skeleton className="h-10 w-24" />
               <Skeleton className="h-10 w-24" />
               <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !repo) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <p className="text-zinc-500">{error || "Repository not found."}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeftIcon className="mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900" onClick={() => router.back()}>
          <ArrowLeftIcon className="mr-2" />
          Back to List
        </Button>
        <a href={repo.html_url} target="_blank" rel="noreferrer">
          <Button variant="outline">
            View on GitHub
          </Button>
        </a>
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <RepoIcon size={24} className="text-zinc-400" />
            <H1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {repo.full_name}
            </H1>
            <Badge variant="outline" className="rounded-full">
              {repo.private ? <LockIcon size={12} className="mr-1" /> : <GlobeIcon size={12} className="mr-1" />}
              {repo.private ? "Private" : "Public"}
            </Badge>
          </div>
          <Lead className="text-xl text-zinc-500 max-w-3xl leading-relaxed font-medium">
            {repo.description || "No description provided."}
          </Lead>
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
              {repo.homepage}
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-6 text-zinc-500">
          <div className="flex items-center gap-2">
            <StarIcon />
            <span className="font-bold text-zinc-900">{repo.stargazers_count}</span> stars
          </div>
          <div className="flex items-center gap-2">
            <RepoForkedIcon />
            <span className="font-bold text-zinc-900">{repo.forks_count}</span> forks
          </div>
          <div className="flex items-center gap-2">
            <EyeIcon />
            <span className="font-bold text-zinc-900">{repo.subscribers_count}</span> watchers
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-zinc-900 uppercase tracking-widest text-[13px]">Contributors</h2>
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/30">
                <ContributorsStack repoOwner={repo.owner.login} repoName={repo.name} limit={5} className="scale-125 origin-left py-2" />
              </div>
            </section>

            {repo.topics && repo.topics.length > 0 && (
              <section className="flex flex-col gap-4">
                 <h2 className="text-lg font-semibold text-zinc-900 uppercase tracking-widest text-[13px]">Topics</h2>
                 <div className="flex flex-wrap gap-2">
                    {repo.topics.map(topic => (
                      <Badge key={topic} variant="secondary" className="rounded-md px-3 py-1">
                        {topic}
                      </Badge>
                    ))}
                 </div>
              </section>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <Card className="border-zinc-200/60 shadow-none bg-zinc-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>Language</span>
                  <span className="font-bold text-zinc-900">{repo.language || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span className="font-bold text-zinc-900">{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created At</span>
                  <span className="font-bold text-zinc-900">{new Date(repo.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
