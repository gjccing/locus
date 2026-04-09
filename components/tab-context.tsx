"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface Tab {
  id: string
  name: string
}

interface TabContextType {
  tabs: Tab[]
  activeTab: Tab | undefined
  addTab: (tab: Tab) => void
  removeTabById: (id: string) => void
  setActiveTabById: (id: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<Tab | undefined>()

  const addTab = (tab: Tab) => {
    if (!tabs.find((t) => t.id === tab.id)) {
      setTabs([...tabs, tab])
    }
    setActiveTab(tab)
  }

  const removeTabById = (id: string) => {
    const newTabs = tabs.filter((t) => t.id !== id)
    setTabs(newTabs)
    if (activeTab?.id === id) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : undefined)
    }
  }

  const setActiveTabById = (id: string) => {
    const tab = tabs.find((t) => t.id === id)
    if (tab) {
      setActiveTab(tab)
    }
  }

  return (
    <TabContext.Provider
      value={{ tabs, activeTab, addTab, removeTabById, setActiveTabById }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabContext)
  if (!context) throw new Error("useTabs must be used within a TabProvider")
  return context
}
