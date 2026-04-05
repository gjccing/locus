"use client"

import { useParams } from "next/navigation"
import { useTabs } from "@/components/tab-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {XIcon} from '@primer/octicons-react'

export default function RepositoryDetailPage() {
  const { id } = useParams()
  const { tabs, activeTabId, removeTab, setActiveTabId } = useTabs()

  return (
    <Tabs
      className="h-full gap-0"
      value={activeTabId ?? ""}
      onValueChange={setActiveTabId}
    >
      <div className="w-full overflow-x-auto overflow-y-hidden pb-3">
        <TabsList variant="line" className="justify-start">
          <SidebarTrigger />
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.name}
              <button
                className="flex justify-center items-center border-0 bg-none"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(tab.id)
                }}
              >
                <XIcon />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="flex-1 shrink-0">
          123
        </TabsContent>
      ))}
    </Tabs>
  )
}
