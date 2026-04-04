import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { MarkGithubIcon, GitBranchIcon, HistoryIcon } from "@primer/octicons-react"
import { ContributorsStack } from "@/components/contributors-stack"

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  private: boolean
  language: string
  stargazers_count: number
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
  default_branch?: string
}

interface RepositoryCardProps {
  repo: Repository
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return interval + "y ago"
  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return interval + "mo ago"
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return interval + "d ago"
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return interval + "h ago"
  interval = Math.floor(seconds / 60)
  if (interval >= 1) return interval + "m ago"
  return Math.floor(seconds) + "s ago"
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  return (
    <Link
      href={`/repository/${repo.id}`}
      className="block outline-none"
    >
      <Card className="h-full border border-zinc-200/60 bg-white hover:border-zinc-400 transition-all duration-300 shadow-sm flex flex-col gap-0 overflow-hidden p-0">
        <CardHeader className="flex flex-row items-center gap-3 pb-4 pt-6 px-6">
          <MarkGithubIcon size={20} className="text-zinc-900" />
          <CardTitle className="font-bold text-[17px] text-zinc-800 tracking-tight">
            {repo.full_name}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 pb-6 px-6">
          <p className="text-[17px] leading-[1.6] text-zinc-500 font-medium line-clamp-2">
            {repo.description || "No description provided."}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between py-5 px-0 mx-6 border-t border-surface-container">
          <div className="flex items-center gap-6 text-[15px] text-zinc-400 font-medium">
            <div className="flex items-center gap-2">
              <GitBranchIcon size={16} />
              <span>{repo.default_branch || "main"}</span>
            </div>
            <div className="flex items-center gap-2">
              <HistoryIcon size={16} />
              <span>{timeAgo(repo.updated_at)}</span>
            </div>
          </div>

          <ContributorsStack repoOwner={repo.owner.login} repoName={repo.name} />
        </CardFooter>
      </Card>
    </Link>
  )
}
