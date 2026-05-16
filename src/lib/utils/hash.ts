import type { Page } from '@/types'

// Deterministic SHA-256 hash of a page's canonical JSON representation.
// Used to detect whether a draft is identical to the last published release,
// making publish idempotent.
export async function hashPage(page: Page): Promise<string> {
  const canonical = JSON.stringify(page, Object.keys(page).sort())
  const encoded = new TextEncoder().encode(canonical)
  const buffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Sync version for server-side use where Web Crypto isn't available as async
export function hashPageSync(page: Page): string {
  const canonical = JSON.stringify(page, Object.keys(page).sort())
  // Simple djb2 hash — good enough for idempotency checks in this context
  let hash = 5381
  for (let i = 0; i < canonical.length; i++) {
    hash = (hash * 33) ^ canonical.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}
