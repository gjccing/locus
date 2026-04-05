"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface Tab {
  id: string
  name: string
}

interface TabContextType {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTabId: (id: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const addTab = (tab: Tab) => {
    if (!tabs.find((t) => t.id === tab.id)) {
      setTabs([...tabs, tab])
    }
    setActiveTabId(tab.id)
  }

  const removeTab = (id: string) => {
    const newTabs = tabs.filter((t) => t.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
    }
  }

  return (
    <TabContext.Provider value={{ tabs, activeTabId, addTab, removeTab, setActiveTabId }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabContext)
  if (!context) throw new Error("useTabs must be used within a TabProvider")
  return context
}
