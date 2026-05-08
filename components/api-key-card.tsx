import { useId, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { PlayIcon, SyncIcon } from "@primer/octicons-react"
import { testApiKey } from "@/app/actions/api-test"
import type { APIKeyInfo, AIProvider } from "@/stores/app-store"
import { InlineCode } from "@/components/ui/typography"

interface APIKeyCardProps extends APIKeyInfo {
  className?: string
  onDelete?: () => void
  onUpdate?: (updates: Partial<APIKeyInfo>) => void
}

const statusStyles = {
  active: "bg-emerald-500 shadow-sm shadow-emerald-500",
  error: "bg-destructive shadow-sm shadow-destructive",
  idle: "bg-muted-foreground",
}

const statusTitles = {
  active: "Active",
  error: "Error",
  idle: "Idle",
}

const tokenPlaceholders: Record<AIProvider, string> = {
  OpenAI: "sk-...",
  Anthropic: "sk-ant-...",
  Gemini: "AIzaSy...",
  "Google Vertex AI": "ya29...",
  Mistral: "mistral-...",
  "Amazon Bedrock": "AKIA...",
  Cohere: "co-...",
  Groq: "gsk_...",
}

export function APIKeyCard({
  className,
  name,
  provider,
  token,
  status,
  onDelete,
  onUpdate,
}: APIKeyCardProps) {
  const id = useId()
  const [currentName, setCurrentName] = useState(name)
  const [currentProvider, setCurrentProvider] = useState(provider)
  const [currentToken, setCurrentToken] = useState(token)
  const [isDirty, setIsDirty] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const isProviderInvalid = isDirty && !currentProvider
  const isTokenInvalid = isDirty && !currentToken

  const handleBlur = () => {
    setIsDirty(true)
    onUpdate?.({
      name: currentName,
      provider: currentProvider,
      token: currentToken,
    })
  }

  const handleTest = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!currentProvider || !currentToken) return
    setIsTesting(true)
    setTestResult(null)
    const result = await testApiKey(currentProvider, currentToken)
    setIsTesting(false)
    if (result.success) {
      setTestResult({ success: true, message: result.text || "Success!" })
      onUpdate?.({ status: "active" })
    } else {
      setTestResult({ success: false, message: result.error || "Failed." })
      onUpdate?.({ status: "error" })
    }
  }

  const handleProviderChange = (val: AIProvider) => {
    setCurrentProvider(val)
    setIsDirty(true)
    onUpdate?.({ name: currentName, provider: val, token: currentToken })
  }

  const autoSetProvider = (token: string) => {
    if (currentProvider) return

    if (token.startsWith("sk-")) {
      setCurrentProvider("OpenAI")
    } else if (token.startsWith("AIzaSy")) {
      setCurrentProvider("Gemini")
    } else if (token.startsWith("sk-ant-")) {
      setCurrentProvider("Anthropic")
    } else if (token.startsWith("mistral-")) {
      setCurrentProvider("Mistral")
    } else if (token.startsWith("AKIA")) {
      setCurrentProvider("Amazon Bedrock")
    } else if (token.startsWith("co-")) {
      setCurrentProvider("Cohere")
    } else if (token.startsWith("gsk_")) {
      setCurrentProvider("Groq")
    }
  }

  return (
    <Card
      className={cn(
        "group relative transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-4 right-4 size-2.5 rounded-full",
          statusStyles[status]
        )}
        title={statusTitles[status]}
      />
      <CardContent>
        <FieldGroup className="gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel
                htmlFor={`key-${id}-name`}
                className="flex items-center font-bold tracking-wider text-muted-foreground uppercase"
              >
                Name{" "}
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/50 normal-case">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id={`key-${id}-name`}
                type="text"
                defaultValue={name}
                onChange={(e) => setCurrentName(e.target.value)}
                onBlur={handleBlur}
                placeholder="Name"
              />
            </Field>
            <Field>
              <FieldLabel
                htmlFor={`key-${id}-provider`}
                className="font-bold tracking-wider text-muted-foreground uppercase"
              >
                Provider <span className="ml-0.5 text-destructive">*</span>
              </FieldLabel>
              <Select
                value={currentProvider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger
                  id={`key-${id}-provider`}
                  className={cn(
                    isProviderInvalid &&
                      "border-destructive shadow-sm shadow-destructive"
                  )}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Anthropic">Anthropic</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                  <SelectItem value="Google Vertex AI">
                    Google Vertex AI
                  </SelectItem>
                  <SelectItem value="Mistral">Mistral</SelectItem>
                  <SelectItem value="Amazon Bedrock">Amazon Bedrock</SelectItem>
                  <SelectItem value="Cohere">Cohere</SelectItem>
                  <SelectItem value="Groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel
              htmlFor={`key-${id}-token`}
              className="font-bold tracking-wider text-muted-foreground uppercase"
            >
              API Token <span className="ml-0.5 text-destructive">*</span>
            </FieldLabel>
            <Input
              id={`key-${id}-token`}
              type="text"
              defaultValue={token}
              onChange={(e) => setCurrentToken(e.target.value)}
              onBlur={(e) => {
                autoSetProvider(e.target.value)
                handleBlur()
              }}
              placeholder={
                currentProvider
                  ? tokenPlaceholders[currentProvider]
                  : "API Token"
              }
              className={cn(
                "font-mono",
                isTokenInvalid &&
                  "border-destructive shadow-sm shadow-destructive"
              )}
              required
            />
          </Field>
          <div className="flex items-center justify-between pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this API key? This action
                    cannot be undone.
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
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!currentProvider || !currentToken}
                  >
                    Test
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="gap-2">
                    <AlertDialogTitle>Test API Key</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send a <InlineCode>Hello, world!</InlineCode>{" "}
                      prompt to the provider to verify your configuration.
                    </AlertDialogDescription>
                    <AlertDialogDescription className="italic">
                      Please note that this operation will consume tokens from
                      your account.
                    </AlertDialogDescription>
                    {testResult && (
                      <AlertDialogDescription
                        className={cn(
                          "w-full rounded-md p-4",
                          testResult.success
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {testResult.success ? "Response: " : "Error: "}{" "}
                        {testResult.message}
                      </AlertDialogDescription>
                    )}
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleTest}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <SyncIcon className="-scale-x-100 animate-spin direction-[reverse]" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <PlayIcon />
                          Run Test
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
