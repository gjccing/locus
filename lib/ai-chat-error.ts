import { toast } from "sonner"

export function showAIChatError(message: string) {
  toast.error(message, {
    position: "bottom-right",
    closeButton: true,
  })
}

export async function parseApiErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const text = await res.text()
    if (!text) return fallback

    try {
      const json = JSON.parse(text) as { error?: string; message?: string }
      if (json.error) return json.error
      if (json.message) return json.message
    } catch {
      return text.length > 280 ? `${text.slice(0, 280)}…` : text
    }
  } catch {
    return fallback
  }

  return fallback
}
