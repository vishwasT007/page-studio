import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session'
import { RoleSwitcher } from './RoleSwitcher'

export async function Header() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const user = token ? await verifySessionToken(token) : null

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Page Studio — home"
        >
          <span aria-hidden="true">📄</span>
          Page Studio
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-4">
          {user ? (
            <RoleSwitcher currentUser={user} />
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
