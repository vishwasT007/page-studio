import { SignJWT, jwtVerify } from 'jose'
import type { AuthUser } from '@/types'

const SESSION_COOKIE = 'ps_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({ sub: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (!payload.sub || !payload.role) return null
    return {
      id: payload.sub,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as AuthUser['role'],
    }
  } catch {
    return null
  }
}

export { SESSION_COOKIE, SESSION_DURATION }
