import { NodeApi, type Value } from "platejs"

import { decryptData, encryptData } from "@/lib/crypto-client"
import { getOrCreateDeviceId } from "@/lib/device-id"

export const EDITOR_CONTENT_KEY = "locus-editor-content"
const EDITOR_CONTENT_VERSION = 1
const SAVE_DEBOUNCE_MS = 800

type StoredEditorContent = {
  version: typeof EDITOR_CONTENT_VERSION
  savedAt: number
  value: Value
}

let flushHandler: (() => void) | null = null

export function registerEditorContentFlush(handler: () => void) {
  flushHandler = handler
}

export function unregisterEditorContentFlush() {
  flushHandler = null
}

export function flushEditorContent() {
  flushHandler?.()
}

export function getEditorPlainText(value: Value): string {
  return value.map((node) => NodeApi.string(node)).join("\n")
}

export function isValidEditorValue(value: unknown): value is Value {
  if (!Array.isArray(value) || value.length === 0) return false

  return value.every(
    (node) =>
      node &&
      typeof node === "object" &&
      typeof (node as { type?: unknown }).type === "string"
  )
}

export function isSemanticallyEmptyValue(value: Value): boolean {
  return getEditorPlainText(value).trim().length === 0
}

function parseStoredEditorContent(raw: unknown): Value | null {
  if (isValidEditorValue(raw)) return raw

  if (
    raw &&
    typeof raw === "object" &&
    "value" in raw &&
    isValidEditorValue((raw as StoredEditorContent).value)
  ) {
    return (raw as StoredEditorContent).value
  }

  return null
}

export async function loadEditorContent(): Promise<Value | null> {
  const secret = getOrCreateDeviceId()
  const stored = localStorage.getItem(EDITOR_CONTENT_KEY)
  if (!stored) return null

  const decrypted = await decryptData(stored, secret)
  if (!decrypted) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(decrypted)
  } catch {
    return null
  }

  const value = parseStoredEditorContent(parsed)
  if (!value) return null

  if (isSemanticallyEmptyValue(value)) {
    localStorage.removeItem(EDITOR_CONTENT_KEY)
    return null
  }

  return value
}

export async function saveEditorContent(value: Value): Promise<void> {
  if (!isValidEditorValue(value)) return

  if (isSemanticallyEmptyValue(value)) {
    clearEditorContent()
    return
  }

  const secret = getOrCreateDeviceId()
  const payload: StoredEditorContent = {
    version: EDITOR_CONTENT_VERSION,
    savedAt: Date.now(),
    value,
  }

  try {
    const encrypted = await encryptData(JSON.stringify(payload), secret)
    localStorage.setItem(EDITOR_CONTENT_KEY, encrypted)
  } catch {
    // QuotaExceededError or other storage failures — fail silently for MVP.
  }
}

export function clearEditorContent() {
  localStorage.removeItem(EDITOR_CONTENT_KEY)
}

export { SAVE_DEBOUNCE_MS }
