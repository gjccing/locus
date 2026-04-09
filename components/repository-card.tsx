import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  MarkGithubIcon,
  GitBranchIcon,
  HistoryIcon,
} from "@primer/octicons-react"
import { ContributorsStack } from "@/components/contributors-stack"
import { P } from "@/components/ui/typography"

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
    <Link href={`/repository/${repo.full_name}`} className="block outline-none">
      <Card className="flex h-full flex-col gap-0 overflow-hidden border border-zinc-200/60 bg-white p-0 shadow-sm transition-all duration-300 hover:border-zinc-400">
        <CardHeader className="flex flex-row items-center gap-3 px-6 pt-6 pb-4">
          <MarkGithubIcon size={20} className="text-zinc-900" />
          <CardTitle className="text-[17px] font-bold tracking-tight text-zinc-800">
            {repo.full_name}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 px-6 pb-6">
          <P className="mt-0 line-clamp-2 text-[17px] font-medium text-zinc-500">
            {repo.description || "No description provided."}
          </P>
        </CardContent>

        <CardFooter className="border-surface-container mx-6 flex items-center justify-between border-t px-0 py-5">
          <div className="flex items-center gap-6 text-[15px] font-medium text-zinc-400">
            <div className="flex items-center gap-2">
              <GitBranchIcon size={16} />
              <span>{repo.default_branch || "main"}</span>
            </div>
            <div className="flex items-center gap-2">
              <HistoryIcon size={16} />
              <span>{timeAgo(repo.updated_at)}</span>
            </div>
          </div>

          <ContributorsStack
            repoOwner={repo.owner.login}
            repoName={repo.name}
          />
        </CardFooter>
      </Card>
    </Link>
  )
}
