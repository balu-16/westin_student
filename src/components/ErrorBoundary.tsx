import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * App-level error boundary: a render crash anywhere below it shows a friendly
 * fallback card instead of a white screen. Reloading or returning to the
 * dashboard remounts the tree cleanly.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo.componentStack)
  }

  render(): React.ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
        <div className="w-full max-w-md rounded-[20px] border border-line bg-white p-6 text-center shadow-card sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Sorry about that — an unexpected error occurred while displaying this page. Try
            reloading, or head back to the dashboard.
          </p>
          <p className="mt-4 break-all rounded-xl bg-danger/10 px-3 py-2 text-left font-mono text-xs text-danger">
            {error.message || String(error)}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
            <Button variant="secondary" onClick={() => window.location.assign('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

/** HOC: wrap a component in an ErrorBoundary. */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
  WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName ?? Component.name ?? 'Component'})`
  return WithErrorBoundary
}
