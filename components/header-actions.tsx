"use client"

import { usePathname } from "next/navigation"
import { SearchIcon, CommentDiscussionIcon } from "@primer/octicons-react"
import { Button } from "./ui/button"

export function HeaderActions() {
  const pathname = usePathname()
  const isRepositoryPage = pathname.startsWith("/repository/")

  if (!isRepositoryPage) return null

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
        <SearchIcon size={16} />
        <span className="sr-only">Search</span>
      </Button>
      <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
        <CommentDiscussionIcon size={16} />
        <span className="sr-only">Discussion</span>
      </Button>
    </div>
  )
}
