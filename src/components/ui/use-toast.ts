'use client'

import * as React from 'react'
import type { ToastProps } from './toast'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
}

type State = { toasts: ToasterToast[] }

let count = 0
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(toasts: ToasterToast[]) {
  memoryState = { toasts }
  listeners.forEach((listener) => listener(memoryState))
}

export function toast({ title, description, variant }: Omit<ToasterToast, 'id'>) {
  const id = `toast-${++count}`
  const newToast: ToasterToast = { id, title, description, variant, open: true }

  const next = [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT)
  dispatch(next)

  setTimeout(() => {
    dispatch(memoryState.toasts.filter((t) => t.id !== id))
  }, TOAST_REMOVE_DELAY)
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts: state.toasts }
}
