import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function textFromEnvFile(filePath) {
  const buffer = fs.readFileSync(filePath)
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.subarray(2).toString("utf16le")
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3).toString("utf8")
  }
  const asUtf8 = buffer.toString("utf8")
  if (asUtf8.includes("\u0000")) return buffer.toString("utf16le").replace(/^\uFEFF/, "")
  return asUtf8
}

function sitePasswordFromEnvFile() {
  const filePath = path.join(projectRoot, ".env")
  if (!fs.existsSync(filePath)) return ""

  for (const line of textFromEnvFile(filePath).split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator === -1) continue
    if (trimmed.slice(0, separator).trim() !== "SITE_PASSWORD") continue

    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    return value
  }

  return ""
}

const sitePassword = sitePasswordFromEnvFile()
if (sitePassword) process.env.SITE_PASSWORD = sitePassword

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
}

export default nextConfig
