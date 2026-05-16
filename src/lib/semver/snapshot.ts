import { promises as fs } from 'fs'
import path from 'path'
import type { Page, Release } from '@/types'
import { hashPageSync } from '@/lib/utils/hash'
import { bumpVersion, INITIAL_VERSION } from './version'
import { comparePages } from './diff'

// NOTE: Uses the local filesystem for snapshot storage.
// In a production deployment (e.g. Vercel), replace with object storage (S3, Vercel Blob, etc.)
// or a database. The interface (publishSnapshot / getRelease) stays the same.
const RELEASES_DIR = path.join(process.cwd(), 'releases')

async function readRelease(filePath: string): Promise<Release | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as Release
  } catch {
    return null
  }
}

async function getLatestRelease(slug: string): Promise<Release | null> {
  const slugDir = path.join(RELEASES_DIR, slug)

  try {
    const files = await fs.readdir(slugDir)
    const versions = files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .sort((a, b) => {
        const [aMaj = 0, aMin = 0, aPat = 0] = a.split('.').map(Number)
        const [bMaj = 0, bMin = 0, bPat = 0] = b.split('.').map(Number)
        if (aMaj !== bMaj) return bMaj - aMaj
        if (aMin !== bMin) return bMin - aMin
        return bPat - aPat
      })

    if (versions.length === 0) return null
    return readRelease(path.join(slugDir, `${versions[0]}.json`))
  } catch {
    return null
  }
}

export async function publishSnapshot(draft: Page): Promise<Release> {
  const checksum = hashPageSync(draft)
  const latest = await getLatestRelease(draft.slug)

  // Idempotent: same content as latest release → return it unchanged
  if (latest?.checksum === checksum) return latest

  let version: string
  let changes: string[]

  if (!latest) {
    version = INITIAL_VERSION
    changes = ['Initial release']
  } else {
    const diff = comparePages(latest.snapshot, draft)
    if (diff.changeType === 'none') return latest
    version = bumpVersion(latest.version, diff.changeType)
    changes = diff.changes
  }

  const release: Release = {
    version,
    slug: draft.slug,
    pageId: draft.pageId,
    publishedAt: new Date().toISOString(),
    changelog: changes,
    checksum,
    snapshot: draft,
  }

  const slugDir = path.join(RELEASES_DIR, draft.slug)
  await fs.mkdir(slugDir, { recursive: true })
  await fs.writeFile(
    path.join(slugDir, `${version}.json`),
    JSON.stringify(release, null, 2),
    'utf-8'
  )

  return release
}

export async function getRelease(slug: string, version: string): Promise<Release | null> {
  return readRelease(path.join(RELEASES_DIR, slug, `${version}.json`))
}

export { getLatestRelease }
