"use client"

import { Sidebar, SidebarHeader } from "@/components/ui/sidebar"
import {
  ComposeIcon,
  DownloadIcon,
  SyncIcon,
  CommentDiscussionIcon,
  TagIcon,
} from "@primer/octicons-react"
import { useRepo } from "@/components/repo-context"
import { useState, useCallback, useMemo } from "react"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import {
  TreeView,
  TreeDataItem,
  TreeRenderItemParams,
  TreeIcon,
  TreeActions,
} from "@/components/tree-view"
import { useTabs } from "./tab-context"

export function Explorer({ className }: { className?: string }) {
  const { branches, tags, loading, addOrphanBranch } = useRepo()
  const { addTab } = useTabs()
  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState("")

  const handleAddBranch = useCallback(async () => {
    if (newBranchName.trim()) {
      await addOrphanBranch(newBranchName.trim())
      setNewBranchName("")
      setIsAddingBranch(false)
    }
  }, [newBranchName, addOrphanBranch])

  const renderItem = useCallback(
    ({ item, isSelected, isOpen }: TreeRenderItemParams) => {
      if (item.id === "adding-branch") {
        return (
          <div className="flex w-full items-center">
            <TreeIcon item={item} isSelected={isSelected} isOpen={isOpen} />
            <input
              autoFocus
              disabled={loading}
              className={cn(
                "w-full bg-transparent p-0 text-sm outline-none disabled:opacity-50",
                newBranchName &&
                  !/^(?![\/.])(?!.*[\/.]{2,})(?!.*@\{)(?!.*[\/.]$)(?!.*\.lock$)[^ ~^:?*\[\x00-\x1F\x7F]+$/.test(
                    newBranchName
                  ) &&
                  "text-red-500"
              )}
              placeholder="Branch name..."
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (
                    /^(?![\/.])(?!.*[\/.]{2,})(?!.*@\{)(?!.*[\/.]$)(?!.*\.lock$)[^ ~^:?*\[\x00-\x1F\x7F]+$/.test(
                      newBranchName
                    )
                  ) {
                    handleAddBranch()
                  }
                }
                if (e.key === "Escape") {
                  setIsAddingBranch(false)
                  setNewBranchName("")
                }
              }}
              onBlur={() => {
                if (!newBranchName.trim()) {
                  setIsAddingBranch(false)
                }
              }}
            />
          </div>
        )
      }

      return (
        <>
          <TreeIcon item={item} isSelected={isSelected} isOpen={isOpen} />
          <span className="truncate text-sm">{item.name as string}</span>
          <TreeActions isSelected={isSelected}>{item.actions}</TreeActions>
        </>
      )
    },
    [newBranchName, handleAddBranch, loading]
  )

  const treeData = useMemo<TreeDataItem[]>(() => {
    return [
      {
        id: "chats",
        name: "Chats",
        icon: CommentDiscussionIcon,
        children: [
          ...(isAddingBranch
            ? [
                {
                  id: "adding-branch",
                  name: "",
                },
              ]
            : []),
          ...branches.map((branch) => {
            const data = { id: branch.name, name: branch.name }
            return {
              ...data,
              onClick: () => addTab(data),
            }
          }),
        ],
      },
      {
        id: "bookmarks",
        name: "Bookmarks",
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
  }, [branches, tags, addTab, isAddingBranch])

  return (
    <Sidebar className={className}>
      <SidebarHeader className="flex-row items-center justify-between border-b">
        <Small>Explorer</Small>
        <ButtonGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                disabled={loading}
                onClick={() => {
                  setIsAddingBranch(true)
                }}
              >
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
                // onClick={fetchRepo}
              >
                <DownloadIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Fetch</TooltipContent>
          </Tooltip>
          <div
            className={cn(
              "flex items-center justify-center px-2",
              loading && "animate-spin",
              !loading && "opacity-50"
            )}
          >
            <SyncIcon className="-scale-x-100" size={12} />
          </div>
        </ButtonGroup>
      </SidebarHeader>
      <TreeView
        className="overflow-auto"
        key={isAddingBranch ? "adding" : "normal"}
        initialSelectedItemId="chats"
        data={treeData}
        expandAll
        renderItem={renderItem}
      />
    </Sidebar>
  )
}
