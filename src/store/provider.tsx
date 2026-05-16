'use client'

import { useRef, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from './index'

type Props = { children: ReactNode }

// Store is created once per browser session using a ref.
// This is the recommended pattern for Next.js App Router + Redux Toolkit.
export function ReduxProvider({ children }: Props) {
  const storeRef = useRef<AppStore | null>(null)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
