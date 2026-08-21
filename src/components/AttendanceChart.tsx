import { useEffect, useRef, useState } from 'react'
import type { AttendanceBreakdown } from '../types'
import { cx } from '../utils'

const SIZE = 200
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface AttendanceChartProps {
  percentage?: number
  size?: number
  /** Donut segments; defaults to a present/absent split of `percentage` */
  segments?: AttendanceBreakdown[]
}

/** Two-segment present/absent breakdown derived from an overall percentage. */
function breakdownFromPercentage(percentage: number): AttendanceBreakdown[] {
  const present = Math.max(0, Math.min(100, Math.round(percentage)))
  return [
    { label: 'Present', value: present, color: '#3BA7F2' },
    { label: 'Absent', value: 100 - present, color: '#D8ECFD' },
  ]
}

/** Animated SVG donut chart with a centred percentage. */
export function AttendanceChart({
  percentage = 87,
  size = SIZE,
  segments,
}: AttendanceChartProps) {
  const [mounted, setMounted] = useState(false)
  const segmentsRef = useRef<Array<SVGCircleElement | null>>([])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const chartSegments = segments ?? breakdownFromPercentage(percentage)

  let offset = 0
  const arcs = chartSegments.map((s, i) => {
    const length = (s.value / 100) * CIRCUMFERENCE
    const dash = mounted ? `${length - 6} ${CIRCUMFERENCE - length + 6}` : `0 ${CIRCUMFERENCE}`
    const seg = { ...s, length, dash, offset: (offset / 100) * CIRCUMFERENCE, i }
    offset += s.value
    return seg
  })

  return (
    <div
      className="relative inline-flex w-full items-center justify-center"
      style={{ maxWidth: size }}
      role="img"
      aria-label={`Overall attendance ${percentage} percent`}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#F0F7FE"
          strokeWidth={STROKE}
        />
        {arcs.map((s) => (
          <circle
            key={s.label}
            ref={(el) => {
              segmentsRef.current[s.i] = el
            }}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={s.dash}
            strokeDashoffset={-s.offset}
            style={{ transition: 'stroke-dasharray 900ms ease-out' }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-ink">{percentage}%</span>
        <span className="text-sm text-ink-soft">Overall</span>
      </div>
    </div>
  )
}

/** Legend rows that pair with the donut chart. */
export function AttendanceLegend({
  segments,
  className,
}: {
  segments?: AttendanceBreakdown[]
  className?: string
}) {
  const items = segments ?? breakdownFromPercentage(87)
  return (
    <ul className={cx('space-y-3', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2.5 text-ink-soft">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
          <span className="font-semibold text-ink">{item.value}%</span>
        </li>
      ))}
    </ul>
  )
}
