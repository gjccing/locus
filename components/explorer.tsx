"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { TreeView, type TreeNodeNested, type TreeNodeRenderProps } from "@/components/tree-view"
import { RepoForkedIcon, LogIcon, ChevronRightIcon, ChevronDownIcon } from "@primer/octicons-react"
import { useRepo } from "@/components/repo-context"
import { useTabs } from "@/components/tab-context"
import { useMemo } from "react"
import { BranchTreeNode } from "@/lib/git-service"
import { cn } from "@/lib/utils"

interface ExplorerNodeData {
  name: string
  type: 'commit' | 'branch'
}

export function Explorer({ className }: { className?: string }) {
  const { branchTree, loading } = useRepo()
  const { addTab, activeTabId } = useTabs()

  const treeData = useMemo((): TreeNodeNested<ExplorerNodeData>[] => {
    const convert = (nodes: BranchTreeNode[]): TreeNodeNested<ExplorerNodeData>[] => {
      return nodes.map(node => ({
        id: node.id,
        data: {
          name: node.type === 'commit' ? `Commit: ${node.name}` : node.name,
          type: node.type
        },
        isGroup: node.children && node.children.length > 0,
        children: node.children ? convert(node.children) : undefined
      }));
    };
    return convert(branchTree);
  }, [branchTree])

  const selectedIds = useMemo(() => activeTabId ? [activeTabId] : [], [activeTabId])

  const renderNode = ({ node, isExpanded, isSelected, toggle, select, hasChildren }: TreeNodeRenderProps<ExplorerNodeData>) => {
    const Icon = node.data.type === 'commit' ? RepoForkedIcon : LogIcon
    
    return (
      <div 
        className={cn(
          "flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-zinc-100 rounded-sm text-sm group",
          isSelected && "bg-zinc-100 text-blue-600 font-medium"
        )}
        onClick={(e) => {
          if (hasChildren) {
            toggle()
          } else {
            select(e)
            addTab({ id: node.id, name: node.data.name })
          }
        }}
      >
        <span className="w-4 flex items-center justify-center shrink-0">
          {hasChildren && (
            isExpanded ? <ChevronDownIcon size={12} className="text-zinc-400" /> : <ChevronRightIcon size={12} className="text-zinc-400" />
          )}
        </span>
        <Icon size={14} className={cn("shrink-0", node.data.type === 'commit' ? "text-amber-500" : "text-zinc-500")} />
        <span className="truncate">{node.data.name}</span>
      </div>
    )
  }
  // add SidebarHeader with repo name and tools including: add branch, fetch, collapse all, expand all
  // right clicking opens the TreeItem's menu including: rename, add branch, remove branch
  return (
    <Sidebar className={className}>
      <div className="overflow-auto scrollbar-none flex-1 p-2">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground animate-pulse">
            Loading branches...
          </div>
        ) : (
          <TreeView<ExplorerNodeData>
            items={treeData}
            renderNode={renderNode}
            selectionMode="multiple"
            selectedIds={selectedIds}
            defaultExpandAll={true}
          />
        )}
      </div>
    </Sidebar>
  )
}