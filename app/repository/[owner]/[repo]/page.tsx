"use client"

import { useTabs } from "@/components/tab-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { XIcon, SyncIcon } from "@primer/octicons-react"
import { useRepo } from "@/components/repo-context"

export default function RepositoryDetailPage() {
  const { tabs, activeTab, removeTabById, setActiveTabById } = useTabs()
  const { loading } = useRepo()

  if (loading && tabs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SyncIcon
            size={24}
            className="-scale-x-100 animate-spin direction-[reverse]"
          />
          <p className="font-medium text-zinc-500">Cloning repository...</p>
        </div>
      </div>
    )
  }

  return (
    <Tabs
      className="flex h-full flex-col gap-0"
      value={activeTab?.id ?? ""}
      onValueChange={setActiveTabById}
    >
      <div
        className="h-[41px] w-full overflow-x-auto overflow-y-hidden border-b bg-white pb-1 pl-10"
        style={{ scrollbarWidth: "thin" }}
      >
        <TabsList
          variant="line"
          className="justify-start gap-2 bg-transparent px-2"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <span className="max-w-37.5 truncate">{tab.name}</span>
              <span
                className="flex items-center justify-center rounded-sm p-0.5 transition-colors hover:bg-zinc-200"
                onClick={(e) => {
                  e.preventDefault()
                  removeTabById(tab.id)
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <XIcon size={12} />
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        {tabs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-400">
            Select a file from the explorer to view its content
          </div>
        ) : (
          tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="m-0 h-full data-[state=inactive]:hidden"
            >
              {/* TODO: Just show the branch name */}
            </TabsContent>
          ))
        )}
      </div>
    </Tabs>
  )
}
