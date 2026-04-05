"use client"

import {
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TreeView, type TreeDataItem } from "@/components/tree-view"
import { GitBranch, History } from "lucide-react"
import { useRepo } from "@/components/repo-context"
import { useMemo } from "react"
import { BranchTreeNode } from "@/lib/git-service"

export function AppSidebar({ className }: { className?: string }) {
  const { branchTree, loading, repo } = useRepo()

  const treeData = useMemo((): TreeDataItem[] => {
    const convert = (nodes: BranchTreeNode[]): TreeDataItem[] => {
      return nodes.map(node => ({
        id: node.id,
        name: node.type === 'commit' ? `Split: ${node.name}` : node.name,
        icon: node.type === 'commit' ? History : GitBranch,
        children: node.children ? convert(node.children) : undefined
      }));
    };
    return convert(branchTree);
  }, [branchTree])

  return (
    <Sidebar className={className}>
      <SidebarHeader className="border-b px-4 py-2 font-semibold">
        Branch Explorer
      </SidebarHeader>
      <div className="overflow-auto scrollbar-none flex-1">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground animate-pulse">
            Loading branches...
          </div>
        ) : (
          <TreeView 
            className="w-full select-none" 
            data={treeData} 
            onSelectChange={(item) => {
              if (item) {
                console.log('Selected:', item.id)
              }
            }}
          />
        )}
      </div>
    </Sidebar>
  )
}