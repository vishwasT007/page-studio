import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchPageBySlug } from '@/lib/contentful/queries'
import { PageSchema } from '@/lib/schemas/page.schema'
import { PageRenderer } from '@/components/ui/PageRenderer'
import { DEMO_PAGE } from '@/lib/contentful/demoData'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Preview — ${slug}` }
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams
  const isPreview = preview === 'true'

  const page = await loadPage(slug, isPreview)

  if (!page) notFound()

  // Validate the page structure. Invalid data from Contentful must not crash the app.
  const parsed = PageSchema.safeParse(page)

  if (!parsed.success) {
    return (
      <div
        role="alert"
        className="container py-20 text-center"
        aria-label="Page validation error"
      >
        <h1 className="text-xl font-semibold text-destructive">Invalid page data</h1>
        <p className="mt-2 text-muted-foreground">
          The page schema from Contentful failed validation and cannot be displayed.
        </p>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="mx-auto mt-4 max-w-xl rounded-md bg-muted p-4 text-left text-xs">
            {JSON.stringify(parsed.error.format(), null, 2)}
          </pre>
        )}
      </div>
    )
  }

  return (
    <>
      {isPreview && (
        <div
          role="banner"
          aria-label="Preview mode active"
          className="bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-900"
        >
          Preview mode — showing draft content
        </div>
      )}
      <PageRenderer page={parsed.data} />
    </>
  )
}

async function loadPage(slug: string, preview: boolean) {
  // Try Contentful first when credentials are present
  if (process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN) {
    try {
      const page = await fetchPageBySlug({ slug, preview })
      if (page) return page
    } catch (err) {
      console.error('[preview] Contentful fetch failed:', err)
    }
  }

  // Always serve the built-in demo page for the 'demo' slug so the app
  // works out of the box even when the Contentful space has no matching entry.
  if (slug === 'demo') return DEMO_PAGE

  return null
}
