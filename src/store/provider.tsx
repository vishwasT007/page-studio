'use client'

import { useMemo, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './index'

type Props = { children: ReactNode }

export function ReduxProvider({ children }: Props) {
  const store = useMemo(() => makeStore(), [])

  return <Provider store={store}>{children}</Provider>
}
