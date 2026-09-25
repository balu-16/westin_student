import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ChartColumnBig,
  ChartNoAxesColumnIncreasing,
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
import { PageLoader } from '../components/Loading'
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

type CalendarStatus = 'present' | 'absent' | 'mixed' | 'leave' | 'none'

interface CalendarCell {
  day: number | null
  dateISO: string | null
  status: CalendarStatus
  classes: number
}

interface CalendarWeek {
  days: CalendarCell[]
}

const weekdayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** h1..h6 codes → Hour label + fixed time (same slots as timetable P1..P6). */
const PERIOD_LABELS: Record<string, string> = {
  h1: 'Hour 1 • 09:00 AM–10:00 AM',
  h2: 'Hour 2 • 10:00 AM–11:00 AM',
  h3: 'Hour 3 • 11:15 AM–12:30 PM',
  h4: 'Hour 4 • 01:30 PM–02:30 PM',
  h5: 'Hour 5 • 02:30 PM–03:30 PM',
  h6: 'Hour 6 • 03:40 PM–05:00 PM',
}
const periodLabel = (p: string) => PERIOD_LABELS[p.toLowerCase()] ?? p.toUpperCase()

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
  const percentage = row.held ? Math.round((row.attended / row.held) * 100) : 0
  const pill = grade(percentage)
  return (
    <tr className="border-b border-line/70 transition-colors duration-150 last:border-0 hover:bg-primary-lighter/60">
      <td className="py-3.5 pr-4">
        <span className="px-1 text-sm font-bold text-primary-dark">{row.code}</span>
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
  const percentage = row.held ? Math.round((row.attended / row.held) * 100) : 0
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

function CalendarDayCell({
  cell,
  onSelect,
  selected,
}: {
  cell: CalendarCell
  onSelect: (_dateISO: string) => void
  selected: boolean
}) {
  if (cell.day === null) {
    return <div className="rounded-xl bg-page/70 p-2.5" aria-hidden="true" />
  }
  const clickable = cell.status !== 'none' && cell.dateISO
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => cell.dateISO && onSelect(cell.dateISO)}
      aria-pressed={selected}
      aria-label={cell.dateISO ? `${cell.dateISO}: ${cell.status}, ${cell.classes} classes` : undefined}
      className={cx(
        'flex min-h-[86px] flex-col items-center rounded-xl border p-2.5 text-center',
        selected
          ? 'border-primary-dark bg-primary text-white'
          : cell.status === 'none'
            ? 'border-line bg-page/70'
            : 'border-line bg-white transition-colors duration-200 hover:border-primary/30',
      )}
    >
      <span className={cx('text-sm font-bold', selected ? 'text-white' : 'text-ink')}>{cell.day}</span>
      <span className="mt-1.5 flex h-5 items-center">
        {cell.status === 'present' && (
          <CircleCheck size={18} className="text-success" aria-label="Present" />
        )}
        {cell.status === 'absent' && <CircleX size={18} className="text-danger" aria-label="Absent" />}
        {cell.status === 'leave' && (
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-warning">Leave</span>
        )}
        {cell.status === 'mixed' && (
          <span className="flex items-center gap-1" aria-label="Mixed attendance">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="h-2 w-2 rounded-full bg-danger" />
            <span className="h-2 w-2 rounded-full bg-warning" />
          </span>
        )}
      </span>
      {cell.classes > 0 && (
        <span className={cx('mt-auto text-[11px] font-medium', selected ? 'text-white/85' : 'text-ink-soft')}>
          {cell.classes} {cell.classes === 1 ? 'Class' : 'Classes'}
        </span>
      )}
    </button>
  )
}

/** Build the Mon–Sat calendar grid (Sundays shown as muted — college may schedule them). */
function buildCalendar(
  month: string,
  calendar: AttendancePayload['calendar'] | undefined,
): { month: string; year: number; weeks: CalendarWeek[] } {
  const [year, monthNo] = month.split('-').map(Number)
  const byDay = new Map<number, { status: CalendarStatus; classes: number; dateISO: string }>()
  for (const entry of calendar ?? []) {
    byDay.set(Number(entry.date.slice(8, 10)), {
      status: entry.status as CalendarStatus,
      classes: entry.classes ?? (entry.status === 'none' ? 0 : 1),
      dateISO: entry.date,
    })
  }

  const emptyCell = (): CalendarCell => ({ day: null, dateISO: null, status: 'none', classes: 0 })
  const firstWeekday = (new Date(year, monthNo - 1, 1).getDay() + 6) % 7 // Monday = 0
  const lastDay = new Date(year, monthNo, 0).getDate()

  const weeks: CalendarWeek[] = []
  let week: CalendarCell[] = Array.from({ length: firstWeekday }, emptyCell)
  for (let day = 1; day <= lastDay; day++) {
    const info = byDay.get(day)
    const dateISO = `${month}-${String(day).padStart(2, '0')}`
    week.push({ day, dateISO: info?.dateISO ?? dateISO, status: info?.status ?? 'none', classes: info?.classes ?? 0 })
    if (week.length === 7) {
      weeks.push({ days: week })
      week = []
    }
  }
  if (week.length) {
    weeks.push({ days: [...week, ...Array.from({ length: 7 - week.length }, emptyCell)] })
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [dayDetail, setDayDetail] = useState<Array<{ period: string; status: string; code: string | null; subject: string | null }> | null>(null)
  const [dayLoading, setDayLoading] = useState(false)

  const { data, error, loading, reload } = useApi<AttendancePayload>(`/attendance/my?month=${month}`)

  const pending = loading && !data
  const failed = error && !data

  const handleSelectDay = async (dateISO: string) => {
    if (selectedDay === dateISO) {
      setSelectedDay(null)
      setDayDetail(null)
      return
    }
    setSelectedDay(dateISO)
    setDayLoading(true)
    try {
      const res = await (await import('../lib/api')).apiFetch<{ periods: Array<{ period: string; status: string; code: string | null; subject: string | null }> }>(
        `/attendance/day?date=${dateISO}`,
      )
      setDayDetail(res.periods ?? [])
    } catch {
      setDayDetail([])
    } finally {
      setDayLoading(false)
    }
  }

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

  // Labels fixed: viewed month (not "current") + previous viewed month + all-time average.
  const isCurrentMonth = month === currentMonth
  const quickStats = [
    { id: 'qs-month', label: isCurrentMonth ? 'This Month' : `${attendanceCalendar.month} (viewing)`, value: `${data?.quickStats?.viewedMonth ?? monthPercentage(data)}%` },
    { id: 'qs-last', label: 'Previous Month', value: `${data?.quickStats?.prevMonth ?? 0}%` },
    { id: 'qs-avg', label: 'Overall Average (all time)', value: `${data?.quickStats?.overallAvg ?? data?.quickStats?.semesterAvg ?? 0}%` },
    { id: 'qs-required', label: 'Required Attendance', value: `${data?.quickStats?.required ?? 75}%` },
  ]

  /** Client-side CSV export of the all-time subject-wise report. */
  const downloadReport = () => {
    const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
    const rows = [
      ['Subject', 'Code', 'Classes Held', 'Attended', 'Absent', 'Percentage'],
      ...subjectAttendanceRows.map((r) => [
        r.subject,
        r.code,
        r.held,
        r.attended,
        r.held - r.attended,
        `${r.held ? Math.round((r.attended / r.held) * 100) : 0}%`,
      ]),
      [],
      ['Overall', '', summary?.total ?? 0, summary?.present ?? 0, summary?.absent ?? 0, `${summary?.overall ?? 0}%`],
    ]
    const csv = rows.map((r) => r.map(cell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance-report-all-time.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Month picker replaces the broken 2-option semester dropdown (which could
  // only reach 2 months and desynced when the calendar was browsed further).
  const monthInputValue = month
  void currentMonth

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
            <span className="sr-only">Select month</span>
            <input
              type="month"
              value={monthInputValue}
              onChange={(e) => {
                if (e.target.value) {
                  setMonth(e.target.value)
                  setSelectedDay(null)
                  setDayDetail(null)
                }
              }}
              aria-label="Select month"
              className="h-10 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink focus:border-primary focus:outline-none"
            />
          </label>
        }
      />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <PageLoader label="Fetching attendance" />
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
                  onClick={downloadReport}
                  disabled={subjectAttendanceRows.length === 0}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary-light hover:text-primary disabled:pointer-events-none disabled:opacity-50 lg:px-2 lg:py-1"
                >
                  <Download size={15} aria-hidden="true" />
                  Download Report
                </button>
              </div>

              {subjectAttendanceRows.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-ink-soft sm:px-6">
                  No subject-wise attendance yet — it appears once faculty mark attendance with a subject.
                </p>
              ) : (
                <>
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
                </>
              )}
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
                  {grade(summary?.overall ?? 0) === 'Excellent' || grade(summary?.overall ?? 0) === 'Good'
                    ? 'Great going! You have maintained good attendance.'
                    : grade(summary?.overall ?? 0) === 'Average'
                      ? 'You are close — attend a few more classes to reach Good.'
                      : 'Warning: attendance below 75%. Attend upcoming classes regularly.'}
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary lg:h-8 lg:w-8"
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary lg:h-8 lg:w-8"
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
                  <div className="grid grid-cols-7 gap-2 pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    {weekdayHeaders.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {attendanceCalendar.weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7 gap-2">
                        {week.days.map((cell, di) => (
                          <CalendarDayCell
                            key={di}
                            cell={cell}
                            selected={!!cell.dateISO && selectedDay === cell.dateISO}
                            onSelect={handleSelectDay}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-ink-soft">Click a marked day to see period-wise details.</p>
              {selectedDay && (
                <div className="mt-3 rounded-xl border border-line bg-white p-4">
                  <h4 className="text-sm font-semibold text-ink">{selectedDay} — day details</h4>
                  {dayLoading ? (
                    <p className="mt-2 text-xs text-ink-soft">Loading…</p>
                  ) : dayDetail && dayDetail.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {dayDetail.map((p, i) => (
                        <li key={i} className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-ink">
                            {periodLabel(p.period)} • {p.code ?? '—'} {p.subject ?? ''}
                          </span>
                          <span
                            className={cx(
                              'rounded-full px-2 py-0.5 text-[11px] font-bold capitalize',
                              p.status === 'present' && 'bg-[#DCFCE7] text-[#15803D]',
                              p.status === 'absent' && 'bg-[#FEE2E2] text-[#B91C1C]',
                              p.status === 'leave' && 'bg-[#FEF3C7] text-[#B45309]',
                            )}
                          >
                            {p.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-ink-soft">No periods recorded for this day.</p>
                  )}
                </div>
              )}
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
                    <span className="text-sm font-bold text-primary-dark">{stat.value}</span>
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
