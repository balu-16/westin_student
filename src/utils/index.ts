import type { ClassStatus } from '../types'

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const statusLabels: Record<ClassStatus, string> = {
  completed: 'Completed ✓',
  'in-progress': 'In Progress •',
  upcoming: 'Upcoming',
}

/** IST weekday index matching the timetable API (Mon 0..Sat 5). Sunday → 0 (Monday) with no classes. */
export function kolkataTodayIndex(date = new Date()): number {
  try {
    const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(date)
    const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 0 }
    return map[weekday] ?? 0
  } catch {
    const d = (date.getDay() + 6) % 7
    return d > 5 ? 0 : d
  }
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
