import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ChartColumnBig,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Download,
  PieChart,
  Star,
  Target,
} from 'lucide-react'
import { Header } from '../components/Header'
import { StatCard } from '../components/StatCard'
import { AttendanceChart } from '../components/AttendanceChart'
import { Card, SectionCard } from '../components/Card'
import { Skeleton, SkeletonCards, SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import {
  monthLabel,
  shiftMonth,
  toMonthString,
  useApi,
  type AttendancePayload,
} from '../lib/api'
import { cx } from '../utils'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

interface SubjectAttendanceRow {
  id: string
  code: string
  subject: string
  held: number
  attended: number
}

type AttendanceGrade = 'Excellent' | 'Good' | 'Average' | 'Warning'

interface OverviewSegment {
  label: string
  value: number
  count: number
  color: string
}

type CalendarStatus = 'present' | 'absent' | 'mixed' | 'none'

interface CalendarCell {
  day: number | null
  status: CalendarStatus
  classes: number
}

interface CalendarWeek {
  days: CalendarCell[]
}

const weekdayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const overviewColors: Record<string, string> = {
  Present: '#3BA7F2',
  Absent: '#F4718B',
  Leave: '#F5A623',
}

function grade(percentage: number): AttendanceGrade {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 80) return 'Good'
  if (percentage >= 75) return 'Average'
  return 'Warning'
}

const gradeClasses: Record<AttendanceGrade, string> = {
  Excellent: 'bg-[#DCFCE7] text-[#15803D]',
  Good: 'bg-primary-light text-primary-dark',
  Average: 'bg-[#FEF3C7] text-[#B45309]',
  Warning: 'bg-[#FEE2E2] text-[#B91C1C]',
}

function SubjectRow({ row }: { row: SubjectAttendanceRow }) {
  const absent = row.held - row.attended
  const percentage = Math.round((row.attended / row.held) * 100)
  const pill = grade(percentage)
  return (
    <tr className="border-b border-line/70 transition-colors duration-150 last:border-0 hover:bg-primary-lighter/60">
      <td className="py-3.5 pr-4">
        <button
          type="button"
          className="rounded-md px-1 text-sm font-bold text-primary-dark transition-colors duration-200 hover:text-primary"
        >
          {row.code}
        </button>
      </td>
      <td className="py-3.5 pr-4 font-semibold text-ink">{row.subject}</td>
      <td className="py-3.5 pr-4 text-ink-soft">{row.held}</td>
      <td className="py-3.5 pr-4 text-ink-soft">{row.attended}</td>
      <td className="py-3.5 pr-4 text-ink-soft">{absent}</td>
      <td className="py-3.5">
        <div className="flex items-center justify-end gap-2.5">
          <span className="text-sm font-bold text-ink">{percentage}%</span>
          <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-bold', gradeClasses[pill])}>
            {pill}
          </span>
        </div>
      </td>
    </tr>
  )
}

function SubjectCard({ row }: { row: SubjectAttendanceRow }) {
  const absent = row.held - row.attended
  const percentage = Math.round((row.attended / row.held) * 100)
  const pill = grade(percentage)
  return (
    <li className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary-dark">{row.code}</p>
          <p className="truncate text-sm font-semibold text-ink">{row.subject}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-bold text-ink">{percentage}%</span>
          <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-bold', gradeClasses[pill])}>
            {pill}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Held {row.held} • Attended {row.attended} • Absent {absent}
      </p>
    </li>
  )
}

function CalendarDayCell({ cell }: { cell: CalendarCell }) {
  if (cell.day === null) {
    return <div className="rounded-xl bg-page/70 p-2.5" aria-hidden="true" />
  }
  return (
    <div
      className={cx(
        'flex min-h-[86px] flex-col items-center rounded-xl border p-2.5',
        cell.status === 'none'
          ? 'border-line bg-page/70'
          : 'border-line bg-white transition-colors duration-200 hover:border-primary/30',
      )}
    >
      <span className="text-sm font-bold text-ink">{cell.day}</span>
      <span className="mt-1.5 flex h-5 items-center">
        {cell.status === 'present' && (
          <CircleCheck size={18} className="text-success" aria-label="Present" />
        )}
        {cell.status === 'absent' && <CircleX size={18} className="text-danger" aria-label="Absent" />}
        {cell.status === 'mixed' && (
          <span className="flex items-center gap-1" aria-label="Mixed attendance">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="h-2 w-2 rounded-full bg-warning" />
          </span>
        )}
      </span>
      {cell.classes > 0 && (
        <span className="mt-auto text-[11px] font-medium text-ink-soft">{cell.classes} Classes</span>
      )}
    </div>
  )
}

/** Build the Mon–Sat (Sundays skipped) calendar grid for a month. */
function buildCalendar(
  month: string,
  calendar: AttendancePayload['calendar'] | undefined,
): { month: string; year: number; weeks: CalendarWeek[] } {
  const [year, monthNo] = month.split('-').map(Number)
  const statusByDay = new Map<number, CalendarStatus>()
  for (const entry of calendar ?? []) {
    statusByDay.set(Number(entry.date.slice(8, 10)), entry.status)
  }

  const emptyCell = (): CalendarCell => ({ day: null, status: 'none', classes: 0 })
  const firstWeekday = (new Date(year, monthNo - 1, 1).getDay() + 6) % 7 // Monday = 0
  const lastDay = new Date(year, monthNo, 0).getDate()

  const weeks: CalendarWeek[] = []
  let week: CalendarCell[] = Array.from({ length: firstWeekday }, emptyCell)
  for (let day = 1; day <= lastDay; day++) {
    if (new Date(year, monthNo - 1, day).getDay() === 0) continue // skip Sundays
    const status = statusByDay.get(day) ?? 'none'
    week.push({ day, status, classes: 0 })
    if (week.length === 6) {
      weeks.push({ days: week })
      week = []
    }
  }
  if (week.length) {
    weeks.push({ days: [...week, ...Array.from({ length: 6 - week.length }, emptyCell)] })
  }
  return { month: monthLabel(month), year, weeks }
}

/** Percentage of marked days that were fully present. */
function monthPercentage(payload: AttendancePayload | null): number {
  const marked = (payload?.calendar ?? []).filter((d) => d.status !== 'none')
  if (!marked.length) return 0
  const present = marked.filter((d) => d.status === 'present').length
  return Math.round((present / marked.length) * 100)
}

export function Attendance() {
  const { openMenu } = useOutletContext<DashboardLayoutContext>()
  const currentMonth = useMemo(() => toMonthString(new Date()), [])
  const [month, setMonth] = useState(currentMonth)

  const { data, error, loading, reload } = useApi<AttendancePayload>(`/attendance/my?month=${month}`)
  const { data: previousMonth, loading: prevLoading } = useApi<AttendancePayload>(
    `/attendance/my?month=${shiftMonth(month, -1)}`,
  )

  const pending = loading && !data
  const failed = error && !data
  const prevPending = prevLoading && !previousMonth

  const summary = data?.summary
  const subjectAttendanceRows = useMemo<SubjectAttendanceRow[]>(
    () =>
      (data?.subjects ?? [])
        .filter((s) => s.subject && s.code)
        .map((s) => ({ id: s.id, code: s.code ?? '', subject: s.subject ?? '', held: s.held, attended: s.attended })),
    [data],
  )

  const overviewSegments = useMemo<OverviewSegment[]>(() => {
    const total = data?.summary?.total ?? 0
    if (!total) return []
    return (data?.overview ?? []).map((segment) => ({
      label: segment.label,
      value: Math.round((segment.value / total) * 100),
      count: segment.value,
      color: overviewColors[segment.label] ?? '#3BA7F2',
    }))
  }, [data])

  const attendanceCalendar = useMemo(() => buildCalendar(month, data?.calendar), [month, data])

  const attended = summary?.present ?? 0
  const total = summary?.total ?? 0

  const quickStats = [
    { id: 'qs-month', label: 'This Month', value: `${monthPercentage(data)}%` },
    { id: 'qs-last', label: 'Last Month', value: `${monthPercentage(previousMonth)}%` },
    { id: 'qs-avg', label: 'Semester Average', value: `${data?.quickStats?.semesterAvg ?? 0}%` },
    { id: 'qs-required', label: 'Required Attendance', value: `${data?.quickStats?.required ?? 75}%` },
  ]

  const semesterOptions = useMemo(() => {
    const y = new Date().getFullYear()
    const yy = (n: number) => String(n % 100).padStart(2, '0')
    return [`Odd Semester ${y}-${yy(y + 1)}`, `Even Semester ${y - 1}-${yy(y)}`]
  }, [])
  const semesterValue = month === currentMonth ? semesterOptions[0] : semesterOptions[1]

  const handleSemesterChange = (label: string) => {
    setMonth(label === semesterOptions[0] ? currentMonth : shiftMonth(currentMonth, -1))
  }

  return (
    <div className="space-y-6">
      <Header
        title={
          <span className="flex items-center gap-2.5">
            <ChartNoAxesColumnIncreasing size={26} className="text-primary" aria-hidden="true" />
            Attendance
          </span>
        }
        subtitle="Track your attendance for all subjects"
        onMenuClick={openMenu}
        actions={
          <label className="relative">
            <span className="sr-only">Select semester</span>
            <select
              value={semesterValue}
              onChange={(e) => handleSemesterChange(e.target.value)}
              aria-label="Select semester"
              className="h-10 appearance-none rounded-xl border border-line bg-white pl-4 pr-9 text-sm font-semibold text-ink transition-colors duration-200 focus:border-primary focus:outline-none"
            >
              {semesterOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              aria-hidden="true"
            />
          </label>
        }
      />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <>
          {/* Summary stat cards */}
          <SkeletonCards />

          {/* Subject-wise table + overview donut */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[13fr_7fr]">
            <Card className="p-0 sm:p-0">
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                <h3 className="flex items-center gap-2.5 text-base font-semibold text-ink">
                  <BookOpen size={18} className="text-primary" aria-hidden="true" />
                  Subject-wise Attendance
                </h3>
              </div>
              <div className="p-5 sm:p-6">
                <SkeletonRows rows={5} />
              </div>
            </Card>

            <SectionCard
              title="Attendance Overview"
              icon={<ChartColumnBig size={18} className="text-primary" aria-hidden="true" />}
            >
              <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-7 sm:flex-row sm:gap-6">
                <span
                  aria-hidden="true"
                  className="h-[200px] w-[200px] animate-pulse rounded-full bg-primary-lighter"
                />
                <div className="w-full max-w-[220px] space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Calendar + quick stats */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[13fr_7fr]">
            <SectionCard
              title="Attendance Calendar"
              icon={<CalendarDays size={18} className="text-primary" aria-hidden="true" />}
            >
              <div className="mb-4">
                <Skeleton className="h-8 w-[220px]" />
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <div className="min-w-[540px]">
                  <div className="grid grid-cols-6 gap-2 pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    {weekdayHeaders.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }, (_, w) => (
                      <div key={w} className="grid grid-cols-6 gap-2">
                        {Array.from({ length: 6 }, (_, d) => (
                          <Skeleton key={d} className="h-[86px]" />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Quick Stats"
              icon={<ChartColumnBig size={18} className="text-primary" aria-hidden="true" />}
            >
              <SkeletonRows rows={4} />
            </SectionCard>
          </div>
        </>
      ) : (
        <>
          {/* Summary stat cards */}
          <section aria-label="Attendance summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={PieChart}
              title="Overall Attendance"
              value={`${summary?.overall ?? 0}%`}
              footnote="Good"
              footnoteClassName="text-success"
            />
            <StatCard
              icon={CircleCheck}
              title="Classes Attended"
              value={String(attended)}
              footnote={`out of ${total}`}
            />
            <StatCard
              icon={CircleX}
              title="Classes Missed"
              value={String(Math.max(total - attended, 0))}
              footnote={`out of ${total}`}
            />
            <StatCard
              icon={CalendarDays}
              title="Total Classes"
              value={String(total)}
              footnote="Scheduled"
            />
          </section>

          {/* Subject-wise table + overview donut */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[13fr_7fr]">
            <Card className="p-0 sm:p-0">
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                <h3 className="flex items-center gap-2.5 text-base font-semibold text-ink">
                  <BookOpen size={18} className="text-primary" aria-hidden="true" />
                  Subject-wise Attendance
                </h3>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                >
                  <Download size={15} aria-hidden="true" />
                  Download Report
                </button>
              </div>

              {/* Table (md+) */}
              <div className="hidden overflow-x-auto md:block scrollbar-thin">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                      <th scope="col" className="px-6 py-3.5 font-semibold">Code</th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">Subject Name</th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">Classes Held</th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">Attended</th>
                      <th scope="col" className="px-4 py-3.5 font-semibold">Absent</th>
                      <th scope="col" className="px-6 py-3.5 text-right font-semibold">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectAttendanceRows.map((row) => (
                      <SubjectRow key={row.id} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card list (mobile) */}
              <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:hidden">
                {subjectAttendanceRows.map((row) => (
                  <SubjectCard key={row.id} row={row} />
                ))}
              </ul>
            </Card>

            <SectionCard
              title="Attendance Overview"
              icon={<ChartColumnBig size={18} className="text-primary" aria-hidden="true" />}
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-7 sm:flex-row sm:gap-6">
                <AttendanceChart percentage={summary?.overall ?? 0} segments={overviewSegments} />
                <ul className="w-full max-w-[220px] space-y-4">
                  {overviewSegments.map((segment) => (
                    <li key={segment.label}>
                      <p className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                        <span
                          aria-hidden="true"
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        {segment.label}
                      </p>
                      <p className="ml-[22px] mt-0.5 text-sm">
                        <span className="font-bold text-ink">{segment.value}%</span>{' '}
                        <span className="text-ink-soft">— {segment.count} Classes</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-primary-lighter px-4 py-3.5">
                <Star size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-ink">
                  Great going! You have maintained good attendance.
                </p>
              </div>
            </SectionCard>
          </div>

          {/* Calendar + quick stats */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[13fr_7fr]">
            <SectionCard
              title="Attendance Calendar"
              icon={<CalendarDays size={18} className="text-primary" aria-hidden="true" />}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setMonth(shiftMonth(month, -1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                  >
                    <ChevronLeft size={15} aria-hidden="true" />
                  </button>
                  <span className="min-w-[110px] text-center text-sm font-bold text-ink">
                    {attendanceCalendar.month} {attendanceCalendar.year}
                  </span>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setMonth(shiftMonth(month, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                  >
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-medium text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" /> Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-danger" aria-hidden="true" /> Absent
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden="true" /> Leave
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <div className="min-w-[540px]">
                  <div className="grid grid-cols-6 gap-2 pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    {weekdayHeaders.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {attendanceCalendar.weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-6 gap-2">
                        {week.days.map((cell, di) => (
                          <CalendarDayCell key={di} cell={cell} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Quick Stats"
              icon={<ChartColumnBig size={18} className="text-primary" aria-hidden="true" />}
            >
              <ul className="flex-1 divide-y divide-line">
                {quickStats.map((stat) => (
                  <li key={stat.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="flex items-center gap-2.5 text-sm font-medium text-ink-soft">
                      <Target size={15} className="text-primary" aria-hidden="true" />
                      {stat.label}
                    </span>
                    {stat.id === 'qs-last' && prevPending ? (
                      <Skeleton className="h-4 w-10" />
                    ) : (
                      <span className="text-sm font-bold text-primary-dark">{stat.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
