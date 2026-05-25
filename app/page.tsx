"use client"

import ContextEditor from "@/components/editor/context-editor"
import { FeedbackButton } from "@/components/feedback-button"
import { SettingsSheet } from "@/components/settings-sheet"

export default function Page() {
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-secondary">
      <ContextEditor />
      <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
        <FeedbackButton />
        <SettingsSheet />
      </div>
    </main>
  )
}
