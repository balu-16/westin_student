import type { ClassStatus } from '../types'

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
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
