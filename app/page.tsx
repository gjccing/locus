"use client"

import ContextEditor from "@/components/editor/context-editor"
import { SettingsSheet } from "@/components/settings-sheet"

export default function Page() {
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-secondary">
      <ContextEditor />
      <SettingsSheet classNameOfTrigger="absolute top-4 right-4 sm:top-6 sm:right-6" />
    </main>
  )
}
