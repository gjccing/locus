"use client"

import { APIKeyInputGroup } from "@/components/api-key/api-key-input-group"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@primer/octicons-react"
import { useEffect, useRef } from "react"
import { useAppStore } from "@/stores/app-store"

import { Small, Muted } from "@/components/ui/typography"

export function ApiKeyList() {
  const apiKeys = useAppStore((s) => s.apiKeys)
  const addAPIKey = useAppStore((s) => s.apiKeysAdd)
  const updateAPIKey = useAppStore((s) => s.apiKeysUpdate)
  const deleteAPIKey = useAppStore((s) => s.apiKeysDelete)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevKeysLength = useRef(apiKeys.length)

  useEffect(() => {
    if (apiKeys.length > prevKeysLength.current) {
      // Use a small timeout to ensure the DOM has updated and rendered the new item
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
    prevKeysLength.current = apiKeys.length
  }, [apiKeys.length])

  return (
    <div ref={scrollRef} className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
      <Small className="tracking-widest text-muted-foreground uppercase text-xs">
        API Keys
      </Small>
      {apiKeys.map((keyInfo) => (
        <APIKeyInputGroup
          key={keyInfo.id}
          className="shrink-0"
          {...keyInfo}
          onDelete={() => void deleteAPIKey(keyInfo.id)}
          onUpdate={(updates) => void updateAPIKey(keyInfo.id, updates)}
        />
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          void addAPIKey({ id: crypto.randomUUID(), status: "idle" })
        }
      >
        <PlusIcon />
        Add New Key
      </Button>
      <Muted>
        Your key is stored locally and only sent per-request; we don&apos;t persist it on the server.
      </Muted>
    </div>
  )
}
