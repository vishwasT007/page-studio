import type { Role } from '@/types'

// Ordered from least to most privileged. Used for >= comparisons.
const ROLE_RANK: Record<Role, number> = {
  viewer: 0,
  editor: 1,
  publisher: 2,
}

export function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required]
}

// Hardcoded demo users — in production these come from your identity provider
export const DEMO_USERS = [
  { id: '1', name: 'Alice Viewer', email: 'viewer@demo.com', role: 'viewer' as Role },
  { id: '2', name: 'Bob Editor', email: 'editor@demo.com', role: 'editor' as Role },
  { id: '3', name: 'Carol Publisher', email: 'publisher@demo.com', role: 'publisher' as Role },
]

export const PROTECTED_ROUTES: Record<string, Role> = {
  '/studio': 'editor',
}
