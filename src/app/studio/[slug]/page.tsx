import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { fetchPageBySlug } from '@/lib/contentful/queries'
import { DEMO_PAGE } from '@/lib/contentful/demoData'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session'
import { StudioClient } from './StudioClient'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Studio — ${slug}` }
}

// Studio is a Server Component for the initial data fetch.
// State management and interactivity live in StudioClient.
export default async function StudioPage({ params }: Props) {
  const { slug } = await params

  // Re-verify session server-side (middleware already guarded the route,
  // but we need the user object here too).
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const user = token ? await verifySessionToken(token) : null

  if (!user) redirect(`/auth?callbackUrl=/studio/${slug}`)

  const page = await loadPage(slug)
  if (!page) notFound()

  return <StudioClient initialPage={page} user={user} />
}

async function loadPage(slug: string) {
  if (process.env.CONTENTFUL_SPACE_ID && process.env.CONTENTFUL_ACCESS_TOKEN) {
    try {
      // Studio always loads draft content so editors see the latest state
      const page = await fetchPageBySlug({ slug, preview: true })
      if (page) return page
    } catch (err) {
      console.error('[studio] Contentful fetch failed:', err)
    }
  }

  if (slug === 'demo') return DEMO_PAGE
  return null
}
