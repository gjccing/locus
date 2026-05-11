"use client"

import { useId, useState } from "react"
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
import { cn } from "@/lib/utils"
import type {
  AIProvider,
  AssistantInfo,
  AssistantRule,
} from "@/stores/app-store"
import { useAppStore } from "@/stores/app-store"

const RULE_OPTIONS: { value: AssistantRule; label: string }[] = [
  { value: "balanced", label: "Balanced" },
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "ai", label: "AI selection" },
]

interface AssistantCardProps extends AssistantInfo {
  className?: string
  onDelete?: () => void
  onUpdate?: (updates: Partial<AssistantInfo>) => void
}

function apiKeyLabel(provider: AIProvider | undefined, id: string) {
  const short = id.slice(0, 8)
  return provider ? `${provider} (${short})` : `Key ${short}`
}

export function AssistantCard({
  className,
  name,
  apiKeyId,
  rule,
  rulePrompt,
  instructions,
  onDelete,
  onUpdate,
}: AssistantCardProps) {
  const baseId = useId()
  const apiKeys = useAppStore((s) => s.apiKeys)
  const [localName, setLocalName] = useState(name)
  const [localRulePrompt, setLocalRulePrompt] = useState(rulePrompt)
  const [localInstructions, setLocalInstructions] = useState(instructions)

  const validKeyIds = new Set(apiKeys.map((k) => k.id))
  const selectKeyId =
    apiKeyId && validKeyIds.has(apiKeyId) ? apiKeyId : undefined

  const rulePromptEditable = rule === "ai"

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
          <Label htmlFor={`${baseId}-api-key`}>Model API key</Label>
          <Select
            value={selectKeyId}
            onValueChange={(value) => {
              onUpdate?.({ apiKeyId: value })
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
                  apiKeys.length === 0
                    ? "Add a model API key first"
                    : "Select API key"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {apiKeys.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {apiKeyLabel(k.provider, k.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-rule`}>Rule</Label>
          <Select
            value={rule}
            onValueChange={(value) => {
              onUpdate?.({ rule: value as AssistantRule })
            }}
          >
            <SelectTrigger
              id={`${baseId}-rule`}
              size="sm"
              className="w-full min-w-0"
            >
              <SelectValue placeholder="Select rule" />
            </SelectTrigger>
            <SelectContent>
              {RULE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${baseId}-rule-prompt`}>
            How the model should choose behavior
          </Label>
          <Textarea
            id={`${baseId}-rule-prompt`}
            readOnly={!rulePromptEditable}
            value={localRulePrompt}
            onChange={(e) => setLocalRulePrompt(e.target.value)}
            onBlur={() => {
              if (!rulePromptEditable) return
              if (localRulePrompt !== rulePrompt) {
                onUpdate?.({ rulePrompt: localRulePrompt })
              }
            }}
            placeholder={
              rulePromptEditable
                ? "Describe how the assistant should adapt its rules for each task…"
                : "Switch to “AI selection” to edit this prompt."
            }
            className={cn(
              "min-h-20",
              !rulePromptEditable && "cursor-default bg-muted/40 text-muted-foreground"
            )}
          />
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
