// Client-only crypto helpers using Web Crypto API.

async function deriveKey(secret: string, salt: Uint8Array) {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  )

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    } as Pbkdf2Params,
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
}

export async function encryptData(data: string, secret: string) {
  const enc = new TextEncoder()
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(secret, salt)

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(data)
  )

  const combinedBytes = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength
  )
  combinedBytes.set(salt, 0)
  combinedBytes.set(iv, salt.length)
  combinedBytes.set(new Uint8Array(encrypted), salt.length + iv.length)

  // Use a compatible base64 encoding (btoa expects a binary string).
  return btoa(String.fromCharCode(...combinedBytes))
}

export async function decryptData(encodedData: string, secret: string) {
  try {
    const combinedBytes = new Uint8Array(
      atob(encodedData)
        .split("")
        .map((c) => c.charCodeAt(0))
    )
    const salt = combinedBytes.slice(0, 16)
    const iv = combinedBytes.slice(16, 28)
    const data = combinedBytes.slice(28)

    const key = await deriveKey(secret, salt)
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

