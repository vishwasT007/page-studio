import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { PageSchema } from '@/lib/schemas/page.schema'
import { publishSnapshot } from '@/lib/semver/snapshot'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session'
import { hasRole } from '@/lib/auth/roles'

// Server-side schema for the publish request — more permissive input is validated
// by PageSchema internally, so we keep this wrapper tight.
const PublishRequestSchema = z.object({
  slug: z.string().min(1),
  page: z.unknown(),
})

export async function POST(request: NextRequest) {
  // Auth check — middleware protects this route, but we re-verify here as defence-in-depth
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = token ? await verifySessionToken(token) : null

  if (!user || !hasRole(user.role, 'publisher')) {
    return NextResponse.json(
      { error: 'Forbidden', message: "Publishing requires the 'publisher' role." },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => null)
  const requestParsed = PublishRequestSchema.safeParse(body)

  if (!requestParsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const pageParsed = PageSchema.safeParse(requestParsed.data.page)

  if (!pageParsed.success) {
    return NextResponse.json(
      { error: 'Invalid page schema', details: pageParsed.error.format() },
      { status: 422 }
    )
  }

  try {
    const release = await publishSnapshot(pageParsed.data)
    return NextResponse.json(release, { status: 200 })
  } catch (err) {
    console.error('[publish] Snapshot failed:', err)
    return NextResponse.json({ error: 'Publish failed' }, { status: 500 })
  }
}
