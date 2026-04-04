"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeftIcon } from "@primer/octicons-react"
import { Button } from "./ui/button"

export function HeaderNav() {
  const pathname = usePathname()
  const route = useRouter()
  const isRepositoryPage = pathname.startsWith("/repository/")
  if (!isRepositoryPage) return null
  return (
    <>
      <span className="text-slate-200 dark:text-slate-700">|</span>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Button variant="ghost" asChild onClick={() => route.back()}>
          <a href="#" title="back to the repository list">
            <ArrowLeftIcon size={16} />
          </a>
        </Button>

      </div>
    </>
  )
}
