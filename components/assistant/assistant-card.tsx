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
  fetchGatewayCatalog,
  fetchGroqLatestModels,
  gatewayOwnedBy,
  MENTION_MODELS_PER_PROVIDER,
  pickLatestGatewayModels,
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
  loading: boolean
  error: string | null
  empty: boolean
}) {
  if (args.noApiKey) return "Select an API key first"
  if (args.noProvider) return "This API key has no provider"
  if (args.loading) return "Loading models…"
  if (args.error) return args.error
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

  const [models, setModels] = useState<{ id: string; label: string }[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  useEffect(() => {
    const provider = selectedKey?.provider
    const token = selectedKey?.token?.trim()
    if (!provider || !token) {
      setModels([])
      setModelsLoading(false)
      setModelsError(null)
      return
    }

    const ac = new AbortController()

    ;(async () => {
      setModelsLoading(true)
      setModelsError(null)

      try {
        let list: { id: string; label: string }[]

        if (provider === "Groq") {
          list = await fetchGroqLatestModels(
            token,
            MENTION_MODELS_PER_PROVIDER,
            ac.signal
          )
        } else {
          const ownedBy = gatewayOwnedBy(provider)
          if (!ownedBy) {
            list = []
          } else {
            const catalog = await fetchGatewayCatalog(ac.signal)
            list = pickLatestGatewayModels(
              catalog,
              ownedBy,
              MENTION_MODELS_PER_PROVIDER
            )
          }
        }

        if (!ac.signal.aborted) {
          setModels(list)
        }
      } catch (e) {
        if (!ac.signal.aborted) {
          setModels([])
          setModelsError(
            e instanceof Error ? e.message : "Could not load models"
          )
        }
      } finally {
        if (!ac.signal.aborted) {
          setModelsLoading(false)
        }
      }
    })()

    return () => ac.abort()
  }, [selectedKey?.id, selectedKey?.provider, selectedKey?.token])

  useEffect(() => {
    if (modelsLoading || models.length === 0) return
    if (modelId && !models.some((m) => m.id === modelId)) {
      onUpdate?.({ modelId: undefined })
    }
  }, [modelId, models, modelsLoading, onUpdate])

  const selectModelId =
    modelId && models.some((m) => m.id === modelId) ? modelId : undefined

  const noApiKey = !selectKeyId
  const noProvider = Boolean(selectKeyId && !selectedKey?.provider)
  const modelSelectDisabled =
    noApiKey ||
    noProvider ||
    modelsLoading ||
    Boolean(modelsError) ||
    models.length === 0

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
                  loading: modelsLoading,
                  error: modelsError,
                  empty: !modelsLoading && !modelsError && models.length === 0,
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
          <Label htmlFor={`${baseId}-instructions`}>Assistant instructions</Label>
          <Textarea
            id={`${baseId}-instructions`}
            value={localInstructions}
            onChange={(e) => setLocalInstructions(e.target.value)}
            onBlur={() => {
              if (localInstructions !== instructions) {
                onUpdate?.({ instructions: localInstructions })
              }
            }}
            placeholder="System-style instructions for this custom GPT…"
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
