import { put, list } from '@vercel/blob'
import type { Page, Release } from '@/types'
import { hashPageSync } from '@/lib/utils/hash'
import { bumpVersion, INITIAL_VERSION } from './version'
import { comparePages } from './diff'

const PREFIX = 'releases'
const BLOB_TOKEN_NAME = 'BLOB_READ_WRITE_TOKEN'

export class PublishStorageConfigError extends Error {
  constructor() {
    super(`Publishing storage is not configured. Add ${BLOB_TOKEN_NAME} in Vercel.`)
    this.name = 'PublishStorageConfigError'
  }
}

function assertBlobStorageConfigured() {
  if (!process.env[BLOB_TOKEN_NAME]) {
    throw new PublishStorageConfigError()
  }
}

async function readRelease(downloadUrl: string): Promise<Release | null> {
  try {
    const res = await fetch(downloadUrl)
    if (!res.ok) return null
    return (await res.json()) as Release
  } catch {
    return null
  }
}

async function getLatestRelease(slug: string): Promise<Release | null> {
  assertBlobStorageConfigured()

  const { blobs } = await list({ prefix: `${PREFIX}/${slug}/` })

  const sorted = blobs
    .map((b) => ({
      blob: b,
      version: b.pathname.replace(`${PREFIX}/${slug}/`, '').replace('.json', ''),
    }))
    .filter(({ version }) => /^\d+\.\d+\.\d+$/.test(version))
    .sort((a, b) => {
      const [aMaj = 0, aMin = 0, aPat = 0] = a.version.split('.').map(Number)
      const [bMaj = 0, bMin = 0, bPat = 0] = b.version.split('.').map(Number)
      if (aMaj !== bMaj) return bMaj - aMaj
      if (aMin !== bMin) return bMin - aMin
      return bPat - aPat
    })

  if (sorted.length === 0) return null
  return readRelease(sorted[0].blob.downloadUrl)
}

export async function publishSnapshot(draft: Page): Promise<Release> {
  assertBlobStorageConfigured()

  const checksum = hashPageSync(draft)
  const latest = await getLatestRelease(draft.slug)

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

  await put(`${PREFIX}/${draft.slug}/${version}.json`, JSON.stringify(release), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
  })

  return release
}

export async function getRelease(slug: string, version: string): Promise<Release | null> {
  assertBlobStorageConfigured()

  const { blobs } = await list({ prefix: `${PREFIX}/${slug}/${version}.json` })
  if (blobs.length === 0) return null
  return readRelease(blobs[0].downloadUrl)
}

export { getLatestRelease }
