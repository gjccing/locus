"use client"

import {
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { TreeView, type TreeDataItem } from "@/components/tree-view"
import { Folder, File } from "lucide-react"
import { useTabs } from "@/components/tab-context"

const data: TreeDataItem[] = [
  {
    id: "1",
    name: "public",
    icon: Folder,
    children: [
      { id: "2", name: "favicon.ico", icon: File },
      { id: "3", name: "vercel.svg", icon: File },
      {
        id: "1-1",
        name: "public",
        icon: Folder,
        children: [
            { id: "1-2", name: "favicon.ico", icon: File },
            { id: "1-3", name: "vercel.svg", icon: File },
            {
                id: "1-1-1",
                name: "public",
                icon: Folder,
                children: [
                { id: "1-1-2", name: "favicon.ico", icon: File },
                { id: "1-1-3", name: "vercel.svg", icon: File },
                {
                    id: "1-1-1-1",
                    name: "public",
                    icon: Folder,
                    children: [
                        { id: "1-1-1-2", name: "favicon.ico", icon: File },
                        { id: "1-1-1-3", name: "vercel.svg", icon: File },
                        {
                            id: "1-1-1-1-1",
                            name: "public",
                            icon: Folder,
                            children: [
                                { id: "1-1-1-1-2", name: "favicon.ico", icon: File },
                                { id: "1-1-1-1-3", name: "vercel.svg", icon: File },
                                {
                                    id: "1-1-1-1-1",
                                    name: "public",
                                    icon: Folder,
                                    children: [
                                        { id: "1-1-1-1-2", name: "favicon.ico", icon: File },
                                        { id: "1-1-1-1-3", name: "vercel.svg", icon: File },
                                        {
                                            id: "1-1-1-1-1",
                                            name: "public",
                                            icon: Folder,
                                            children: [
                                                { id: "1-1-1-1-2", name: "favicon.ico", icon: File },
                                                { id: "1-1-1-1-3", name: "vercel.svg", icon: File },
                                            ],
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
                }
                ],
            }
        ],
    }
    ],
  },
  {
    id: "4",
    name: "src",
    icon: Folder,
    children: [
      {
        id: "5",
        name: "components",
        icon: Folder,
        children: [
          { id: "6", name: "button.tsx", icon: File },
          { id: "7", name: "card.tsx", icon: File },
        ],
      },
      { id: "8", name: "App.tsx", icon: File },
      { id: "9", name: "index.css", icon: File },
    ],
  },
]

export function AppSidebar({ className }: { className?: string }) {
  const { addTab, activeTabId } = useTabs()

  return (
    <Sidebar className={className}>
      <SidebarHeader className="border-b px-4 py-2 font-semibold">
        Branch Explorer
      </SidebarHeader>
      <div className="overflow-auto scrollbar-none">
        <TreeView 
          className="w-full select-none" 
          data={data} 
          initialSelectedItemId={activeTabId ?? undefined}
          onSelectChange={(item) => {
            if (item && !item.children) {
              addTab({ id: item.id, name: item.name })
            }
          }}
        />
      </div>
    </Sidebar>
  )
}