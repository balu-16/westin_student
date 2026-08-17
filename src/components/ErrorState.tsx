import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { cx } from '../utils'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  /** Row layout for small areas (inside cards, sidebars). */
  compact?: boolean
}

/** Danger-tinted error card with an optional retry action. */
export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cx(
        'rounded-2xl border border-danger/20 bg-danger/10 text-danger',
        compact ? 'flex flex-wrap items-center gap-3 px-4 py-3' : 'px-6 py-7 sm:px-8',
      )}
    >
      <div className={cx('flex min-w-0 gap-3', compact ? 'flex-1 items-center' : 'items-start')}>
        <AlertCircle size={compact ? 18 : 22} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm leading-relaxed text-danger/80">
            {message ?? "We couldn't load this right now. Please try again."}
          </p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className={compact ? '' : 'mt-5'}>
          <RefreshCw size={15} aria-hidden="true" />
          Try Again
        </Button>
      )}
    </div>
  )
}
