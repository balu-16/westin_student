import { Loader2 } from 'lucide-react'
import { cx } from '../utils'
import { StudentWalkingLoader } from './StudentWalkingLoader'

interface SpinnerProps {
  size?: number
  className?: string
}

/** Spinning loader circle — matches the Button's Loader2 spinner. */
export function Spinner({ size = 18, className }: SpinnerProps) {
  return (
    <Loader2 size={size} className={cx('animate-spin text-primary', className)} aria-hidden="true" />
  )
}

/**
 * Single pulsing placeholder block. Note: avoid overriding the radius or
 * background via `className` — Tailwind emits `.rounded-xl` after the other
 * radius utilities, so conflicting classes resolve unpredictably.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx('animate-pulse rounded-xl bg-primary-lighter', className)} />
}

/** Stat-card-sized placeholders laid out like the Dashboard stat grid. */
export function SkeletonCards({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div role="status" className={cx('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 animate-pulse rounded-full bg-primary-lighter" />
            <span className="h-4 w-24 animate-pulse rounded-xl bg-primary-lighter" />
          </div>
          <span className="mt-4 block h-9 w-20 animate-pulse rounded-xl bg-primary-lighter" />
          <span className="mt-2 block h-3.5 w-28 animate-pulse rounded-xl bg-primary-lighter" />
        </div>
      ))}
    </div>
  )
}

/** Stacked list-row placeholders (h-16 rows). */
export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

/** Small centered spinner + soft label for inline waits. */
export function InlineSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 text-sm font-medium text-ink-soft"
    >
      <Spinner size={16} />
      <span>{label}</span>
    </div>
  )
}

/** Full-section loading state — the Westin Walker mid-stride with a dedicated
 *  label below it. The walker component carries its own status semantics
 *  (role="status" + aria-label), so this wrapper is layout only. */
export function PageLoader({
  label,
  size = 120,
  className,
}: {
  label: string
  /** Rendered walker width in px (height follows the 220:200 viewBox). */
  size?: number
  className?: string
}) {
  return (
    <div className={cx('flex min-h-[300px] w-full items-center justify-center py-10', className)}>
      <StudentWalkingLoader size={size} label={label} />
    </div>
  )
}
