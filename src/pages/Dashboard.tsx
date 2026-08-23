import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  FileText,
  Megaphone,
  PieChart,
  BookOpen,
} from 'lucide-react'
import { Header } from '../components/Header'
import { PushPermissionBanner } from '../components/PushPermissionBanner'
import { StatCard } from '../components/StatCard'
import { TimetableCard } from '../components/TimetableCard'
import { AttendanceChart, AttendanceLegend } from '../components/AttendanceChart'
import { AnnouncementCard } from '../components/AnnouncementCard'
import { QuickLink } from '../components/QuickLink'
import { SectionCard } from '../components/Card'
import { Skeleton, SkeletonCards, SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import {
  apiFetch,
  attendanceBreakdownFrom,
  formatDateLabel,
  mapClassSession,
  toMonthString,
  useApi,
  type AttendancePayload,
  type DashboardPayload,
  type MyNotificationsPayload,
} from '../lib/api'
import { cx, timeAgo } from '../utils'
import { useAuth } from '../contexts/AuthContext'
import type { Announcement, AttendanceBreakdown, QuickLinkItem } from '../types'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

const quickLinks: QuickLinkItem[] = [
  { id: 'ql-1', label: 'Study Materials', to: '/materials', icon: 'book' },
  { id: 'ql-2', label: 'Assignments', to: '/timetable', icon: 'clipboard' },
  { id: 'ql-3', label: 'Exam Schedule', to: '/timetable', icon: 'calendar' },
  { id: 'ql-4', label: 'Notice Board', to: '/events', icon: 'bell' },
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

  // Admin-sent notifications addressed to this student (in-app inbox; the bell
  // in the header shows the same data with read/unread interactions).
  const {
    data: notifications,
    reload: reloadNotifications,
  } = useApi<MyNotificationsPayload>('/notifications/my?limit=4')

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

      {dashFailed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : (
        <>
          {/* Statistics */}
          {dashPending ? (
            <SkeletonCards />
          ) : (
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
          )}

          {/* Timetable + Attendance */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {dashPending ? (
              <SectionCard
                title="Today's Timetable"
                icon={<CalendarDays size={18} className="text-primary" aria-hidden="true" />}
                actionLabel="View Full Timetable"
                actionTo="/timetable"
                className="lg:col-span-3"
              >
                <SkeletonRows rows={4} />
              </SectionCard>
            ) : (
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
            )}

            <SectionCard
              title="Attendance Overview"
              icon={<ChartNoAxesColumnIncreasing size={18} className="text-primary" aria-hidden="true" />}
              actionLabel="View Details"
              actionTo="/attendance"
              className="items-center lg:col-span-2"
            >
              {attPending ? (
                <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-8">
                  <span
                    aria-hidden="true"
                    className="h-[200px] w-[200px] animate-pulse rounded-full bg-primary-lighter"
                  />
                  <div className="w-full max-w-[260px] space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </div>
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

          {/* Admin notifications */}
          {(notifications?.items?.length ?? 0) > 0 && (
            <SectionCard
              title="Notifications"
              icon={<Bell size={18} className="text-primary" aria-hidden="true" />}
            >
              <ul className="divide-y divide-line/60">
                {notifications!.items.map((n) => {
                  const isUnread = !n.readAt
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          void apiFetch(`/notifications/my/${n.id}/read`, { method: 'PUT' }).finally(() => void reloadNotifications())
                        }}
                        className={cx(
                          'flex w-full items-baseline justify-between gap-3 px-1 py-2.5 text-left transition-colors',
                          isUnread ? 'hover:bg-primary-lighter/40' : 'opacity-80 hover:opacity-100',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                            <span className={cx('truncate text-sm', isUnread ? 'font-semibold text-ink' : 'font-medium text-ink')}>{n.title}</span>
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-soft">{n.body}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-soft">{timeAgo(n.createdAt)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </SectionCard>
          )}

          {/* Announcements + Quick links */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {dashPending ? (
              <SectionCard
                title="Announcements"
                icon={<Megaphone size={18} className="text-primary" aria-hidden="true" />}
                actionLabel="View All"
                actionTo="/timetable"
                className="lg:col-span-3"
              >
                <SkeletonRows rows={3} />
              </SectionCard>
            ) : (
              <SectionCard
                title="Announcements"
                icon={<Megaphone size={18} className="text-primary" aria-hidden="true" />}
                actionLabel="View All"
                actionTo="/timetable"
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
            )}

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
