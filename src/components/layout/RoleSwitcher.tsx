'use client'

import { useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import type { AuthUser, Role } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const ROLES: Role[] = ['viewer', 'editor', 'publisher']
const ROLE_COLOURS: Record<Role, string> = {
  viewer: 'bg-slate-100 text-slate-700',
  editor: 'bg-blue-100 text-blue-700',
  publisher: 'bg-green-100 text-green-700',
}

type Props = { currentUser: AuthUser }

export function RoleSwitcher({ currentUser }: Props) {
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  async function switchRole(role: Role) {
    setSwitching(true)
    setOpen(false)
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    window.location.reload()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/auth'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={switching}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Signed in as ${currentUser.name}, role: ${currentUser.role}. Click to switch role.`}
      >
        <span className="hidden sm:block text-muted-foreground">{currentUser.name}</span>
        <Badge
          className={`${ROLE_COLOURS[currentUser.role]} border-0 font-medium`}
        >
          {currentUser.role}
        </Badge>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Switch role"
          className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border bg-popover p-1 shadow-md"
        >
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Switch role
          </p>
          {ROLES.map((role) => (
            <button
              key={role}
              role="option"
              aria-selected={role === currentUser.role}
              onClick={() => switchRole(role)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm capitalize hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Badge className={`${ROLE_COLOURS[role]} border-0 text-xs`}>{role}</Badge>
            </button>
          ))}
          <hr className="my-1 border-border" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      )}
    </div>
  )
}
