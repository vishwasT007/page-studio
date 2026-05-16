'use client'

import { useEffect, useRef } from 'react'
import type { Page } from '@/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { hydrateDraft, selectDraftPage } from '@/store/slices/draftPageSlice'

// Persists the draft page to localStorage and restores it on mount.
// This replaces redux-persist to avoid SSR hydration complexity.
export function useDraftPersistence(slug: string) {
  const dispatch = useAppDispatch()
  const draft = useAppSelector(selectDraftPage)
  const storageKey = `page-studio:draft:${slug}`
  const isHydrated = useRef(false)

  // Restore on first mount
  useEffect(() => {
    if (isHydrated.current) return
    isHydrated.current = true

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const stored = JSON.parse(raw) as Page
        dispatch(hydrateDraft(stored))
      }
    } catch {
      // Ignore — malformed storage data is not fatal
    }
  }, [slug, dispatch, storageKey])

  // Persist on each change
  useEffect(() => {
    if (!draft || !isHydrated.current) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft))
    } catch {
      // Storage quota exceeded or private browsing — not fatal
    }
  }, [draft, storageKey])
}
