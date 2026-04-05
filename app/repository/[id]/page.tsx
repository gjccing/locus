"use client"

import { useTabs } from "@/components/tab-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { XIcon, SyncIcon } from '@primer/octicons-react'
import { useRepo } from "@/components/repo-context"
import { useState, useEffect } from "react"
import { readFile } from "@/lib/git-service"

function FileContent({ filepath }: { filepath: string }) {
  const { repo } = useRepo()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      if (!repo || !filepath) return
      try {
        setLoading(true)
        const text = await readFile(repo.owner.login, repo.name, filepath)
        setContent(text)
      } catch (err) {
        console.error("Error reading file:", err)
        setContent("Error loading file content")
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [repo, filepath])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
        <SyncIcon className="animate-spin mr-2" />
        Loading {filepath}...
      </div>
    )
  }

  return (
    <pre className="p-4 overflow-auto h-full text-sm font-mono whitespace-pre bg-zinc-50 rounded-md border text-zinc-800">
      {content}
    </pre>
  )
}

export default function RepositoryDetailPage() {
  const { tabs, activeTabId, removeTab, setActiveTabId } = useTabs()
  const { loading, error } = useRepo()

  if (loading && tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <SyncIcon size={24} className="animate-spin text-primary" />
          <p className="text-zinc-500 font-medium">Cloning repository...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-8">
        {error}
      </div>
    )
  }

  return (
    <Tabs
      className="h-full flex flex-col gap-0"
      value={activeTabId ?? ""}
      onValueChange={setActiveTabId}
    >
      <div className="w-full overflow-x-auto overflow-y-hidden pb-1 border-b bg-white" style={{ scrollbarWidth: 'thin' }}>
        <TabsList variant="line" className="justify-start h-12 px-2 gap-2 bg-transparent">
          <SidebarTrigger />
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <span className="truncate max-w-37.5">{tab.name}</span>
              <span
                className="flex justify-center items-center p-0.5 rounded-sm hover:bg-zinc-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(tab.id)
                }}
              >
                <XIcon size={12} />
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        {tabs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-400">
            Select a file from the explorer to view its content
          </div>
        ) : (
          tabs.map((tab) => (
            <TabsContent 
              key={tab.id} 
              value={tab.id} 
              className="h-full m-0 data-[state=inactive]:hidden"
            >
              <FileContent filepath={tab.id} />
            </TabsContent>
          ))
        )}
      </div>
    </Tabs>
  )
}
