'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, pipe this to your error tracking service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      this.props.fallback ?? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center"
        >
          <p className="font-semibold text-red-800">Something went wrong rendering this section.</p>
          {process.env.NODE_ENV !== 'production' && (
            <p className="mt-2 text-sm text-red-600">{this.state.message}</p>
          )}
        </div>
      )
    )
  }
}
