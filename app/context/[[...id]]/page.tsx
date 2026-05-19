"use client"

import { useParams } from "next/navigation"

import { SettingsSheet } from "@/components/settings-sheet"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ContextEditor from "@/components/editor/context-editor"

export default function ContextPage() {
  const params = useParams()
  const rawId = params.id
  const contextId = (Array.isArray(rawId) ? rawId[0] : rawId) ?? "home"

  return (
    <main className="relative h-full w-full overflow-hidden bg-secondary">
      <ContextEditor contextId={contextId} />
      <SidebarTrigger className="absolute top-4 left-4 sm:top-6 sm:left-6" />
      <SettingsSheet classNameOfTrigger="absolute top-4 right-4 sm:top-6 sm:right-6" />
    </main>
  )
}

