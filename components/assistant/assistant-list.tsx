"use client"

import { AssistantCard } from "@/components/assistant/assistant-card"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import { useAppStore } from "@/stores/app-store"
import { PlusIcon } from "@primer/octicons-react"
import { useEffect, useRef } from "react"

export function AssistantList() {
  const assistants = useAppStore((s) => s.assistants)
  const addAssistant = useAppStore((s) => s.assistantsAdd)
  const updateAssistant = useAppStore((s) => s.assistantsUpdate)
  const deleteAssistant = useAppStore((s) => s.assistantsDelete)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevLength = useRef(assistants.length)

  useEffect(() => {
    if (assistants.length > prevLength.current) {
      const timeoutId = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          })
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }
    prevLength.current = assistants.length
  }, [assistants.length])

  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
    >
      <Small className="text-xs tracking-widest text-muted-foreground uppercase">
        Custom GPTs
      </Small>
      {assistants.map((assistant) => (
        <AssistantCard
          key={assistant.id}
          className="shrink-0"
          {...assistant}
          onDelete={() => void deleteAssistant(assistant.id)}
          onUpdate={(updates) => void updateAssistant(assistant.id, updates)}
        />
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          void addAssistant({
            id: crypto.randomUUID(),
            rule: "balanced",
            rulePrompt: "",
            instructions: "",
          })
        }
      >
        <PlusIcon />
        Add assistant
      </Button>
    </div>
  )
}
