"use client"

import { Sidebar, SidebarHeader } from "@/components/ui/sidebar"
import {
  CommentAiIcon,
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { PencilIcon, TrashIcon } from "@primer/octicons-react"

export function Explorer({ className }: { className?: string }) {
  const {
    branches,
    tags,
    loading,
    addOrphanBranch,
    fetch,
    renameBranch,
    deleteBranch,
    renameTag,
    deleteTag,
  } = useRepo()
  const { addTab } = useTabs()
  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState("")
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const handleAddBranch = useCallback(async () => {
    const name = newBranchName.trim()
    if (name) {
      await addOrphanBranch(name)
      setNewBranchName("")
      setIsAddingBranch(false)
    }
  }, [newBranchName, addOrphanBranch])

  const handleRename = useCallback(async () => {
    const name = renameValue.trim()
    if (!name || !renamingId) return

    if (renamingId.startsWith("branch/")) {
      const oldName = renamingId.replace("branch/", "")
      await renameBranch(oldName, name)
    } else if (renamingId.startsWith("tag/")) {
      const oldName = renamingId.replace("tag/", "")
      await renameTag(oldName, name)
    }
    setRenamingId(null)
    setRenameValue("")
  }, [renameValue, renamingId, renameBranch, renameTag])

  const handleDelete = useCallback(
    async (item: TreeDataItem) => {
      if (item.id.startsWith("branch/")) {
        const name = item.id.replace("branch/", "")
        await deleteBranch(name)
      } else if (item.id.startsWith("tag/")) {
        const name = item.id.replace("tag/", "")
        await deleteTag(name)
      }
    },
    [deleteBranch, deleteTag]
  )

  const renderItem = useCallback(
    ({ item, isSelected, isOpen }: TreeRenderItemParams) => {
      if (item.id === "adding-branch" || renamingId === item.id) {
        const isRenaming = renamingId === item.id
        const value = isRenaming ? renameValue : newBranchName
        const setValue = isRenaming ? setRenameValue : setNewBranchName
        const onCancel = () => {
          if (isRenaming) {
            setRenamingId(null)
            setRenameValue("")
          } else {
            setIsAddingBranch(false)
            setNewBranchName("")
          }
        }
        const onConfirm = isRenaming ? handleRename : handleAddBranch
        const trimmedValue = value.trim()
        const isExisted = isRenaming
          ? item.id.startsWith("branch/")
            ? branches.some(
                (b) => b.name === trimmedValue && b.name !== item.name
              )
            : tags.some((t) => t === trimmedValue && t !== item.name)
          : branches.some((b) => b.name === trimmedValue)

        return (
          <form
            className="flex w-full items-center"
            onSubmit={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            <TreeIcon item={item} isSelected={isSelected} isOpen={isOpen} />
            <input
              autoFocus
              required
              disabled={loading}
              pattern="^(?![\/.])(?!.*[\/.]{2,})(?!.*@\{)(?!.*[\/.]$)(?!.*\.lock$)[^ ~^:?*\[\x00-\x1F\x7F]+$"
              className={cn(
                "w-full bg-transparent p-0 text-sm outline-none disabled:opacity-50",
                "[&:not(:placeholder-shown):invalid]:text-red-500",
                value && isExisted && "text-red-500"
              )}
              placeholder={isRenaming ? "New name..." : "Branch name..."}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onCancel()
              }}
              onBlur={() => onCancel()}
            />
          </form>
        )
      }

      return (
        <ContextMenu>
          <ContextMenuTrigger asChild disabled={!!item.children}>
            <div className="flex w-full items-center">
              <TreeIcon item={item} isSelected={isSelected} isOpen={isOpen} />
              <span className="truncate text-sm">{item.name as string}</span>
              <TreeActions isSelected={isSelected}>{item.actions}</TreeActions>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setRenamingId(item.id)
                setRenameValue(item.name as string)
              }}
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(item)
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )
    },
    [
      newBranchName,
      handleAddBranch,
      loading,
      branches,
      renamingId,
      renameValue,
      handleRename,
      handleDelete,
      tags,
    ]
  )

  const treeData = useMemo<TreeDataItem[]>(() => {
    return [
      {
        id: "branches",
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
            const data = {
              id: `branch/${branch.name}`,
              name: branch.name,
            }
            return {
              ...data,
              onClick: () => addTab(data),
            }
          }),
        ],
      },
      {
        id: "tags",
        name: "Bookmarks",
        icon: TagIcon,
        children: tags.map((tag) => {
          const data = {
            id: `tag/${tag}`,
            name: tag,
          }
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
                <CommentAiIcon />
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
                onClick={fetch}
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
