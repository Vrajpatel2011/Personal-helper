export const SESSION_COOKIE = "site_session"

const SESSION_PAYLOAD = "personal-helper-session-v1"
const MAX_PASSWORD_LENGTH = 1024

export function sitePassword() {
  const value = process.env.SITE_PASSWORD
  return typeof value === "string" ? value : ""
}

function toBase64Url(bytes) {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "")
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return new Uint8Array(digest)
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let i = 0; i < left.length; i++) mismatch |= left[i] ^ right[i]
  return mismatch === 0
}

export async function passwordMatches(input) {
  const expected = sitePassword()
  if (!expected || typeof input !== "string") return false
  if (input.length === 0 || input.length > MAX_PASSWORD_LENGTH) return false

  const [left, right] = await Promise.all([sha256(input), sha256(expected)])
  return safeEqual(left, right)
}

export async function createSessionToken() {
  const secret = sitePassword()
  if (!secret) return ""

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(SESSION_PAYLOAD),
  )
  return toBase64Url(new Uint8Array(signature))
}

export async function isValidSession(token) {
  if (!token || !sitePassword()) return false
  const expected = await createSessionToken()
  if (!expected) return false

  const [left, right] = await Promise.all([sha256(token), sha256(expected)])
  return safeEqual(left, right)
}
