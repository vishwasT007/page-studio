import type { Page } from '@/types'
import { getContentfulClient } from './contentfulClient'
import { adaptPage } from './adapters'

type FetchPageOptions = {
  slug: string
  preview?: boolean
}

export async function fetchPageBySlug({
  slug,
  preview = false,
}: FetchPageOptions): Promise<Page | null> {
  const client = getContentfulClient(preview ? 'preview' : 'published')

  const response = await client.getEntries({
    content_type: 'landingPage',
    'fields.slug': slug,
    include: 3, // depth to resolve nested section references
    limit: 1,
  })

  if (response.items.length === 0) return null

  return adaptPage(response.items[0])
}

export async function fetchAllPageSlugs(): Promise<string[]> {
  const client = getContentfulClient()

  const response = await client.getEntries({
    content_type: 'landingPage',
    select: ['fields.slug'],
  })

  return response.items.map((item) => {
    const fields = item.fields as Record<string, unknown>
    return fields.slug as string
  })
}
