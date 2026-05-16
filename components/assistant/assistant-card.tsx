"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { TrashIcon } from "@primer/octicons-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  getMentionModelsForProvider,
  MENTION_MODELS_PER_PROVIDER,
} from "@/lib/mention-models"
import { cn } from "@/lib/utils"
import type { AIProvider, AssistantInfo } from "@/stores/app-store"
import { useAppStore } from "@/stores/app-store"

interface AssistantCardProps extends AssistantInfo {
  className?: string
  onDelete?: () => void
  onUpdate?: (updates: Partial<AssistantInfo>) => void
}

const TOKEN_PREVIEW_HEAD = 4
const TOKEN_PREVIEW_TAIL = 4

function tokenPreview(token: string | undefined) {
  const t = token?.trim() ?? ""
  if (!t) return "Not set"
  if (t.length <= TOKEN_PREVIEW_HEAD + TOKEN_PREVIEW_TAIL + 1) {
    return t
  }
  return `${t.slice(0, TOKEN_PREVIEW_HEAD)}…${t.slice(-TOKEN_PREVIEW_TAIL)}`
}

function apiKeyLabel(
  provider: AIProvider | undefined,
  token: string | undefined
) {
  const preview = tokenPreview(token)
  return provider ? `${provider} · ${preview}` : `Key · ${preview}`
}

function modelSelectPlaceholder(args: {
  noApiKey: boolean
  noProvider: boolean
  empty: boolean
}) {
  if (args.noApiKey) return "Select an API key first"
  if (args.noProvider) return "This API key has no provider"
  if (args.empty) return "No models for this provider"
  return "Select model"
}

export function AssistantCard({
  className,
  name,
  apiKeyId,
  modelId,
  instructions,
  onDelete,
  onUpdate,
}: AssistantCardProps) {
  const baseId = useId()
  const allApiKeys = useAppStore((s) => s.apiKeys)
  const apiKeys = useMemo(
    () => allApiKeys.filter((k) => k.status === "passed"),
    [allApiKeys]
  )
  const [localName, setLocalName] = useState(name)
  const [localInstructions, setLocalInstructions] = useState(instructions)

  const validKeyIds = new Set(apiKeys.map((k) => k.id))
  const selectKeyId =
    apiKeyId && validKeyIds.has(apiKeyId) ? apiKeyId : undefined

  const selectedKey = useMemo(
    () => apiKeys.find((k) => k.id === selectKeyId),
    [apiKeys, selectKeyId]
  )

  const models = useMemo(() => {
    const provider = selectedKey?.provider
    if (!provider) return []
    return getMentionModelsForProvider(provider, MENTION_MODELS_PER_PROVIDER)
  }, [selectedKey?.provider])

  useEffect(() => {
    if (models.length === 0) return
    if (modelId && !models.some((m) => m.id === modelId)) {
      onUpdate?.({ modelId: undefined })
    }
  }, [modelId, models, onUpdate])

  const selectModelId =
    modelId && models.some((m) => m.id === modelId) ? modelId : undefined

  const noApiKey = !selectKeyId
  const noProvider = Boolean(selectKeyId && !selectedKey?.provider)
  const modelSelectDisabled = noApiKey || noProvider || models.length === 0

  return (
    <Card size="sm" className={cn("shrink-0 bg-transparent", className)}>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-name`}>Name</Label>
          <Input
            id={`${baseId}-name`}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={() => {
              if (localName !== name) {
                onUpdate?.({ name: localName })
              }
            }}
            placeholder="Assistant name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-api-key`}>API key</Label>
          <Select
            value={selectKeyId}
            onValueChange={(value) => {
              onUpdate?.({ apiKeyId: value, modelId: undefined })
            }}
            disabled={apiKeys.length === 0}
          >
            <SelectTrigger
              id={`${baseId}-api-key`}
              size="sm"
              className="w-full min-w-0"
            >
              <SelectValue
                placeholder={
                  allApiKeys.length === 0
                    ? "Add a model API key first"
                    : apiKeys.length === 0
                      ? "Test an API key first (none passed yet)"
                      : "Select API key"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {apiKeys.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {apiKeyLabel(k.provider, k.token)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-model`}>Model</Label>
          <Select
            value={selectModelId}
            onValueChange={(value) => {
              onUpdate?.({ modelId: value })
            }}
            disabled={modelSelectDisabled}
          >
            <SelectTrigger
              id={`${baseId}-model`}
              size="sm"
              className="w-full min-w-0"
            >
              <SelectValue
                placeholder={modelSelectPlaceholder({
                  noApiKey,
                  noProvider,
                  empty: models.length === 0,
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-instructions`}>Instructions</Label>
          <Textarea
            id={`${baseId}-instructions`}
            value={localInstructions}
            onChange={(e) => setLocalInstructions(e.target.value)}
            onBlur={() => {
              if (localInstructions !== instructions) {
                onUpdate?.({ instructions: localInstructions })
              }
            }}
            placeholder="Optional. Describe how this assistant should answer—tone, topics, format, or rules to always follow."
            className="min-h-28"
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete assistant"
            >
              <TrashIcon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete assistant</AlertDialogTitle>
              <AlertDialogDescription>
                Remove this custom GPT configuration? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
