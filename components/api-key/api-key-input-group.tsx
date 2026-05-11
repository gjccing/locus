import { useId, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import {
  EyeClosedIcon,
  EyeIcon,
  PlayIcon,
  QuestionIcon,
  SyncIcon,
  TrashIcon,
} from "@primer/octicons-react"
import { testApiKey } from "@/app/actions/api-test"
import type { APIKeyInfo, AIProvider } from "@/stores/app-store"
import { InlineCode } from "@/components/ui/typography"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface APIKeyInputGroupProps extends APIKeyInfo {
  className?: string
  onDelete?: () => void
  onUpdate?: (updates: Partial<APIKeyInfo>) => void
}

const tokenPlaceholders: Record<AIProvider, string> = {
  OpenAI: "sk-...",
  Anthropic: "sk-ant-...",
  Gemini: "AIzaSy...",
  Groq: "gsk_...",
}

const providerMeta: Record<AIProvider, { label: string; iconSrc: string }> = {
  OpenAI: { label: "OpenAI", iconSrc: "/openai.svg" },
  Anthropic: { label: "Anthropic", iconSrc: "/anthropic.svg" },
  Gemini: { label: "Gemini", iconSrc: "/gemini-color.svg" },
  Groq: { label: "Groq", iconSrc: "/groq.svg" },
}

export function APIKeyInputGroup({
  className,
  provider,
  token,
  status,
  onDelete,
  onUpdate,
}: APIKeyInputGroupProps) {
  const id = useId()
  const [currentProvider, setCurrentProvider] = useState(provider)
  const [currentToken, setCurrentToken] = useState(token)
  const [isProviderManuallySet, setIsProviderManuallySet] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isTokenVisible, setIsTokenVisible] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const isTokenInvalid = isDirty && !currentToken
  const isProviderInvalid = isDirty && !currentProvider
  const isError = status === "error"

  const detectProviderFromToken = (rawToken: string): AIProvider | null => {
    const t = rawToken.trim()
    if (!t) return null

    // Order matters: some providers share prefixes.
    if (/^sk-ant-/.test(t)) return "Anthropic"
    if (/^sk-(?!ant-)/.test(t)) return "OpenAI"
    if (/^AIzaSy/.test(t)) return "Gemini"
    if (/^gsk_/.test(t)) return "Groq"

    return null
  }

  const currentProviderMeta = useMemo(
    () => (currentProvider ? providerMeta[currentProvider] : null),
    [currentProvider]
  )

  const handleBlur = () => {
    setIsDirty(true)
    onUpdate?.({
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
      onUpdate?.({ status: "passed" })
    } else {
      setTestResult({ success: false, message: result.error || "Failed." })
      onUpdate?.({ status: "error" })
    }
  }

  const handleProviderChange = (val: AIProvider) => {
    setIsProviderManuallySet(true)
    setCurrentProvider(val)
    setIsDirty(true)
    onUpdate?.({ provider: val, token: currentToken })
  }

  const autoSetProvider = (token: string) => {
    if (isProviderManuallySet) return
    const detected = detectProviderFromToken(token)
    if (!detected) return
    if (currentProvider === detected) return
    setCurrentProvider(detected)
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <InputGroup className="flex-1">
        <InputGroupAddon align="inline-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton
                size="icon-xs"
                aria-label="Select provider"
                className={cn(
                  isProviderInvalid && "text-destructive",
                  "cursor-pointer"
                )}
              >
                {currentProviderMeta ? (
                  <Image
                    src={currentProviderMeta.iconSrc}
                    alt={currentProviderMeta.label}
                    width={16}
                    height={16}
                  />
                ) : (
                  <QuestionIcon />
                )}
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuRadioGroup
                  value={currentProvider}
                  onValueChange={(val) =>
                    handleProviderChange(val as AIProvider)
                  }
                >
                  {(["OpenAI", "Anthropic", "Gemini", "Groq"] as const).map(
                    (p) => (
                      <DropdownMenuRadioItem key={p} value={p}>
                        <Image
                          src={providerMeta[p].iconSrc}
                          alt={providerMeta[p].label}
                          width={16}
                          height={16}
                        />
                        {providerMeta[p].label}
                      </DropdownMenuRadioItem>
                    )
                  )}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>

        <InputGroupInput
          id={`key-${id}-token`}
          type={isTokenVisible ? "text" : "password"}
          value={currentToken ?? ""}
          onChange={(e) => {
            const next = e.target.value
            setCurrentToken(next)
            autoSetProvider(next)
          }}
          onBlur={(e) => {
            autoSetProvider(e.target.value)
            handleBlur()
          }}
          placeholder={
            currentProvider ? tokenPlaceholders[currentProvider] : "API Token"
          }
          className="font-mono"
          aria-invalid={isError || isTokenInvalid}
          required
        />

        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={isTokenVisible ? "Hide API token" : "Show API token"}
            onClick={() => setIsTokenVisible((v) => !v)}
          >
            {isTokenVisible ? <EyeClosedIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={!currentProvider || !currentToken}
            aria-label="Test API key"
            className={cn(
              status === "passed" &&
              "text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            )}
          >
            <PlayIcon />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Test API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a <InlineCode>Hello, world!</InlineCode> prompt to
              the provider to verify your configuration.
            </AlertDialogDescription>
            <AlertDialogDescription className="italic">
              Please note that this operation will consume tokens from your
              account.
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
            <AlertDialogAction onClick={handleTest} disabled={isTesting}>
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

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete API key"
          >
            <TrashIcon />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot
              be undone.
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
    </div>
  )
}

