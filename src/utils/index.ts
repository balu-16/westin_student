import type { ClassStatus } from '../types'

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

/** Compact relative time for notification lists ("5m ago", "3d ago", "12 Aug"). */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export const statusLabels: Record<ClassStatus, string> = {
  completed: 'Completed ✓',
  'in-progress': 'In Progress •',
  upcoming: 'Upcoming',
}

/** Health bucket for attendance percentages, used across attendance UI. */
export function attendanceHealth(percentage: number): 'good' | 'warning' | 'low' {
  if (percentage >= 85) return 'good'
  if (percentage >= 75) return 'warning'
  return 'low'
}

export function healthClasses(health: 'good' | 'warning' | 'low') {
  switch (health) {
    case 'good':
      return {
        bar: 'bg-success',
        text: 'text-success',
        label: 'Good',
      }
    case 'warning':
      return {
        bar: 'bg-warning',
        text: 'text-warning',
        label: 'Warning',
      }
    case 'low':
      return {
        bar: 'bg-danger',
        text: 'text-danger',
        label: 'Low',
      }
  }
}
