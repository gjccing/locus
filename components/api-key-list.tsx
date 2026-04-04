"use client"

import { APIKeyCard } from "@/components/api-key-card"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "@primer/octicons-react"
import { useAPIKeys } from "@/components/api-key-provider"
import { useEffect, useRef } from "react"

export function ApiKeyList() {
  const { apiKeys, addAPIKey, updateAPIKey, deleteAPIKey } = useAPIKeys()
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
      <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Model API Keys
      </h3>
      {apiKeys.map((keyInfo) => (
        <APIKeyCard
          key={keyInfo.id}
          className="shrink-0"
          {...keyInfo}
          onDelete={() => deleteAPIKey(keyInfo.id)}
          onUpdate={(updates) => updateAPIKey(keyInfo.id, updates)}
        />
      ))}
      <Button
        variant="secondary"
        onClick={() => addAPIKey({ id: crypto.randomUUID(), status: "idle" })}
      >
        <PlusIcon />
        Add New Key
      </Button>
    </div>
  )
}
