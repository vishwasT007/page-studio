import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import type { Role } from '@/types'
import { DEMO_USERS } from '@/lib/auth/roles'
import { createSessionToken, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth/session'

const LoginSchema = z.object({
  role: z.enum(['viewer', 'editor', 'publisher']),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = LoginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { role } = parsed.data
  const user = DEMO_USERS.find((u) => u.role === role)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const token = await createSessionToken(user)

  const response = NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return response
}
