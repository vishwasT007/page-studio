import { createClient } from 'contentful'

type ClientMode = 'published' | 'preview'

// Factory — keeps client configuration out of component and query files.
// Switching environments (preview vs published) is entirely handled here.
export function getContentfulClient(
  mode: ClientMode = 'published'
) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  const environment = process.env.CONTENTFUL_ENVIRONMENT ?? 'master'

  if (!spaceId) throw new Error('CONTENTFUL_SPACE_ID is not set')

  if (mode === 'preview') {
    const previewToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    if (!previewToken) throw new Error('CONTENTFUL_PREVIEW_ACCESS_TOKEN is not set')

    return createClient({
      space: spaceId,
      environment,
      accessToken: previewToken,
      host: 'preview.contentful.com',
    })
  }

  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN
  if (!accessToken) throw new Error('CONTENTFUL_ACCESS_TOKEN is not set')

  return createClient({ space: spaceId, environment, accessToken })
}
