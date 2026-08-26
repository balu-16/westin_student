import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  FileText,
  Megaphone,
  PieChart,
  BookOpen,
} from 'lucide-react'
import { Header } from '../components/Header'
import { PushPermissionBanner } from '../components/PushPermissionBanner'
import { InstallPwaBanner } from '../components/InstallPwaBanner'
import { StatCard } from '../components/StatCard'
import { TimetableCard } from '../components/TimetableCard'
import { AttendanceChart, AttendanceLegend } from '../components/AttendanceChart'
import { AnnouncementCard } from '../components/AnnouncementCard'
import { QuickLink } from '../components/QuickLink'
import { SectionCard } from '../components/Card'
import { PageLoader } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import {
  attendanceBreakdownFrom,
  formatDateLabel,
  mapClassSession,
  toMonthString,
  useApi,
  type AttendancePayload,
  type DashboardPayload,
} from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Announcement, AttendanceBreakdown, QuickLinkItem } from '../types'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

const quickLinks: QuickLinkItem[] = [
  { id: 'ql-1', label: 'Study Materials', to: '/materials', icon: 'book' },
  { id: 'ql-2', label: 'Timetable', to: '/timetable', icon: 'calendar' },
  { id: 'ql-3', label: 'Attendance', to: '/attendance', icon: 'clipboard' },
  { id: 'ql-4', label: 'Events', to: '/events', icon: 'bell' },
]

export function Dashboard() {
  const { user } = useAuth()
  const { openMenu } = useOutletContext<DashboardLayoutContext>()
  const { data: dashboard, error, loading, reload } = useApi<DashboardPayload>('/students/me/dashboard')
  const {
    data: attendance,
    error: attendanceError,
    loading: attendanceLoading,
    reload: attendanceReload,
  } = useApi<AttendancePayload>(`/attendance/my?month=${toMonthString(new Date())}`)

  const dashPending = loading && !dashboard
  const dashFailed = error && !dashboard
  const attPending = attendanceLoading && !attendance
  const attFailed = attendanceError && !attendance

  const stats = dashboard?.stats
  const todaySessions = useMemo(
    () => (dashboard?.todaySessions ?? []).map(mapClassSession),
    [dashboard],
  )
  const announcements = useMemo<Announcement[]>(
    () =>
      (dashboard?.announcements ?? []).map((a) => ({
        ...a,
        date: formatDateLabel(a.date),
        category: a.category as Announcement['category'],
      })),
    [dashboard],
  )
  const breakdown = useMemo<AttendanceBreakdown[]>(
    () => attendanceBreakdownFrom(attendance),
    [attendance],
  )

  return (
    <div className="space-y-6">
      <Header
        title="Dashboard"
        subtitle="Here's what's happening today."
        onMenuClick={openMenu}
        showGreeting
      />

      <PushPermissionBanner />
      <InstallPwaBanner />

      {dashFailed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : dashPending ? (
        <PageLoader label="Loading your dashboard" size={130} className="min-h-[440px]" />
      ) : (
        <>
          {/* Statistics */}
          <section aria-label="Statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={CalendarDays} title="Classes Today" value={String(stats?.classesToday ?? 0)} footnote={`${stats?.classesCompleted ?? 0} Completed`} />
            <StatCard
              icon={PieChart}
              title="Overall Attendance"
              value={`${stats?.overallAttendance ?? 0}%`}
              footnote="Good Job!"
              footnoteClassName="text-success"
            />
            <StatCard icon={BookOpen} title="Subjects" value={String(stats?.subjects ?? 0)} footnote="This Semester" />
            <StatCard icon={FileText} title="Pending Assignments" value={String(stats?.pendingAssignments ?? 0)} footnote="Due Soon" footnoteClassName="text-warning" />
          </section>

          {/* Timetable + Attendance */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <SectionCard
              title="Today's Timetable"
              icon={<CalendarDays size={18} className="text-primary" aria-hidden="true" />}
              actionLabel="View Full Timetable"
              actionTo="/timetable"
              className="lg:col-span-3"
            >
              <ol className="relative">
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-[100px] top-2 w-px bg-line sm:left-[138px] lg:left-[148px]"
                />
                {todaySessions.map((session) => (
                  <TimetableCard key={session.id} session={session} />
                ))}
              </ol>
            </SectionCard>

            <SectionCard
              title="Attendance Overview"
              icon={<ChartNoAxesColumnIncreasing size={18} className="text-primary" aria-hidden="true" />}
              actionLabel="View Details"
              actionTo="/attendance"
              className="items-center lg:col-span-2"
            >
              {attPending ? (
                <PageLoader label="Fetching attendance" size={96} className="min-h-[220px] py-4" />
              ) : attFailed ? (
                <ErrorState
                  message={attendanceError ?? undefined}
                  onRetry={attendanceReload}
                  compact
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-8">
                  <AttendanceChart
                    percentage={user?.overallAttendance}
                    segments={breakdown.length ? breakdown : undefined}
                  />
                  <AttendanceLegend
                    className="w-full max-w-[260px]"
                    segments={breakdown.length ? breakdown : undefined}
                  />
                </div>
              )}
            </SectionCard>
          </div>

          {/* Announcements + Quick links */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <SectionCard
              title="Announcements"
              icon={<Megaphone size={18} className="text-primary" aria-hidden="true" />}
              className="lg:col-span-3"
            >
              <ul className="relative">
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-[5px] top-3 w-px bg-line"
                />
                {announcements.map((a, i) => (
                  <AnnouncementCard key={a.id} announcement={a} isLast={i === announcements.length - 1} />
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Quick Links" className="lg:col-span-2">
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {quickLinks.map((link) => (
                  <QuickLink key={link.id} item={link} />
                ))}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
