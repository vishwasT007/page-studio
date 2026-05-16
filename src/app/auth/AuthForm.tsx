'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Role } from '@/types'
import { Button } from '@/components/ui/button'

type DemoUser = { name: string; email: string; role: Role; description: string }

const DEMO_USERS: DemoUser[] = [
  {
    name: 'Alice Viewer',
    email: 'viewer@demo.com',
    role: 'viewer',
    description: 'Can view preview pages only.',
  },
  {
    name: 'Bob Editor',
    email: 'editor@demo.com',
    role: 'editor',
    description: 'Can view and edit pages in the studio.',
  },
  {
    name: 'Carol Publisher',
    email: 'publisher@demo.com',
    role: 'publisher',
    description: 'Full access — can edit and publish releases.',
  },
]

export function AuthForm() {
  const searchParams = useSearchParams()
  // Default to preview/demo so users immediately see a working page after sign-in
  const callbackUrl = searchParams.get('callbackUrl') ?? '/preview/demo'
  const [loading, setLoading] = useState<Role | null>(null)

  async function signIn(user: DemoUser) {
    setLoading(user.role)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: user.role }),
    })
    if (res.ok) {
      // Hard navigate so the server re-reads the new session cookie immediately
      window.location.href = callbackUrl
    } else {
      setLoading(null)
    }
  }

  return (
    <div className="container py-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a demo account to explore role-based access.
        </p>

        <ul className="mt-8 space-y-4" role="list" aria-label="Demo accounts">
          {DEMO_USERS.map((user) => (
            <li key={user.role}>
              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{user.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => signIn(user)}
                    disabled={loading !== null}
                    aria-label={`Sign in as ${user.name} (${user.role})`}
                    aria-busy={loading === user.role}
                  >
                    {loading === user.role ? 'Signing in…' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          This is a demo application. No real authentication is happening.
        </p>
      </div>
    </div>
  )
}
