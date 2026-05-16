import { type NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session'
import { hasRole, PROTECTED_ROUTES } from '@/lib/auth/roles'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Find the most specific matching protected route prefix
  const requiredRole = Object.entries(PROTECTED_ROUTES).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1]

  if (!requiredRole) return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    return redirectToLogin(request)
  }

  const user = await verifySessionToken(token)

  if (!user) {
    return redirectToLogin(request)
  }

  if (!hasRole(user.role, requiredRole)) {
    // API routes get a JSON 403; page navigations get redirected so the browser
    // doesn't show raw JSON.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Forbidden', message: `This action requires the '${requiredRole}' role.` },
        { status: 403 }
      )
    }
    return redirectToLogin(request)
  }

  // Forward the user's role in a header so server components can read it without
  // re-verifying the JWT.
  const response = NextResponse.next()
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-role', user.role)
  return response
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/auth', request.url)
  loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/studio/:path*', '/api/publish'],
}
