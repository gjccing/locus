"use client"

import { Sidebar, SidebarHeader } from "@/components/ui/sidebar"
import {
  ComposeIcon,
  DownloadIcon,
  SyncIcon,
  GitBranchIcon,
  TagIcon,
} from "@primer/octicons-react"
import { useRepo } from "@/components/repo-context"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { TreeView, TreeDataItem } from "@/components/tree-view"
import { useMemo } from "react"
import { useTabs } from "./tab-context"

export function Explorer({ className }: { className?: string }) {
  const { branches, tags, loading, fetchRepo } = useRepo()
  const { addTab } = useTabs()

  const treeData = useMemo<TreeDataItem[]>(() => {
    return [
      {
        id: "branches",
        name: "Branches",
        icon: GitBranchIcon,
        children: branches.map((branch) => {
          const data = { id: branch, name: branch }
          return {
            ...data,
            onClick: () => addTab(data),
          }
        }),
      },
      {
        id: "tags",
        name: "Tags",
        icon: TagIcon,
        children: tags.map((tag) => {
          const data = { id: tag, name: tag }
          return {
            ...data,
            onClick: () => addTab(data),
          }
        }),
      },
    ]
  }, [branches, tags, addTab])

  return (
    <Sidebar className={className}>
      <SidebarHeader className="flex-row items-center justify-between border-b">
        <Small>Explorer</Small>
        <ButtonGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" disabled={loading}>
                <ComposeIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">New Chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                disabled={loading}
                onClick={fetchRepo}
              >
                <DownloadIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Fetch</TooltipContent>
          </Tooltip>
          <div
            className={cn(
              "flex items-center justify-center px-2",
              loading && "animate-spin direction-[reverse]",
              !loading && "opacity-50"
            )}
          >
            <SyncIcon size={12} />
          </div>
        </ButtonGroup>
      </SidebarHeader>
      <TreeView data={treeData} expandAll />
    </Sidebar>
  )
}
