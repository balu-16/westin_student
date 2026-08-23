import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Megaphone,
  Music,
  PartyPopper,
  Presentation,
  Sparkles,
  Trophy,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { formatDateLabel, parseDateParts, useApi, type ApiEvent, type EventsPayload } from '../lib/api'
import { getOneSignalState, subscribeOneSignal } from '../lib/onesignal'
import { cx } from '../utils'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

const categoryIcons: Record<string, LucideIcon> = {
  music: Music,
  presentation: Presentation,
  trophy: Trophy,
  wrench: Wrench,
  sparkles: Sparkles,
}

const categoryMeta: Record<string, { name: string; icon: string; accent: string }> = {
  CULTURAL: { name: 'Cultural', icon: 'music', accent: '#EF4444' },
  'TECH TALK': { name: 'Tech Talk', icon: 'presentation', accent: '#3BA7F2' },
  SPORTS: { name: 'Sports', icon: 'trophy', accent: '#16A34A' },
  WORKSHOP: { name: 'Workshop', icon: 'wrench', accent: '#F59E0B' },
  SEMINAR: { name: 'Seminar', icon: 'sparkles', accent: '#8B5CF6' },
}

const defaultCategoryMeta = { name: 'Other', icon: 'sparkles', accent: '#3BA7F2' }

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface UpcomingEventView {
  id: string
  category: string
  title: string
  description?: string
  day: number
  month: string
  year: number
  weekday: string
  accent: string
}

function toUpcomingView(event: ApiEvent): UpcomingEventView {
  const meta = categoryMeta[event.category] ?? defaultCategoryMeta
  const parts = parseDateParts(event.startDate)
  return {
    id: event.id,
    category: event.category,
    title: event.title,
    day: parts.day,
    month: parts.month,
    year: parts.year,
    weekday: parts.weekday,
    accent: meta.accent,
  }
}

function FeaturedBanner({ event }: { event: ApiEvent }) {
  const startDate = formatDateLabel(event.startDate)
  const endDate = event.endDate ? formatDateLabel(event.endDate) : startDate
  return (
    <div className="relative overflow-hidden rounded-[20px] shadow-card">
      {/* Dark concert-style backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,167,242,0.5),transparent_55%),radial-gradient(circle_at_80%_75%,rgba(239,68,68,0.45),transparent_50%),linear-gradient(135deg,#111A33_0%,#1B2A52_55%,#0D142B_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF3B6B] px-3 py-1 text-xs font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(255,59,107,0.45)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            LIVE NOW
          </span>
          <PartyPopper size={22} className="text-white/60" aria-hidden="true" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#7EC3F3]">
          {event.category}
        </p>
        <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {event.title}
        </h2>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="flex items-center gap-2">
            <CalendarDays size={15} className="text-[#7EC3F3]" aria-hidden="true" />
            {startDate} - {endDate}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} className="text-[#7EC3F3]" aria-hidden="true" />
            {event.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-[#7EC3F3]" aria-hidden="true" />
            {event.location}
          </span>
        </div>

        <Button className="mt-6">View Details</Button>
      </div>
    </div>
  )
}

function UpcomingRow({ event }: { event: UpcomingEventView }) {
  return (
    <li className="flex gap-4 border-b border-line py-4 first:pt-0 last:border-0 last:pb-0">
      {/* Thumbnail */}
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white sm:h-[72px] sm:w-[72px]"
        style={{ background: `linear-gradient(135deg, ${event.accent}, ${event.accent}B3)` }}
        aria-hidden="true"
      >
        <CalendarDays size={26} />
      </div>

      <div className="min-w-0 flex-1">
        <span
          className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide"
          style={{ backgroundColor: `${event.accent}1A`, color: event.accent }}
        >
          {event.category}
        </span>
        <h4 className="mt-1.5 truncate font-semibold text-ink">{event.title}</h4>
      </div>

      {/* Date box */}
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-primary-lighter py-2">
        <span className="text-xl font-bold leading-none text-ink">{event.day}</span>
        <span className="mt-1 text-[11px] font-semibold leading-none text-primary-dark">
          {event.month} '{String(event.year).slice(2)}
        </span>
        <span className="mt-1 text-[10px] leading-none text-ink-soft">{event.weekday}</span>
      </div>
    </li>
  )
}

/** Sun-first calendar grid for the current month, marking live + upcoming events. */
function EventCalendarWidget({ events }: { events: ApiEvent[] }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const liveDays = new Set<number>()
  const upcomingDays = new Set<number>()
  for (const event of events) {
    const start = new Date(event.startDate.slice(0, 10) + 'T00:00:00')
    const end = event.endDate ? new Date(event.endDate.slice(0, 10) + 'T00:00:00') : start
    for (const cursor = new Date(start); cursor <= end && cursor <= new Date(year, month + 1, 0); cursor.setDate(cursor.getDate() + 1)) {
      if (cursor.getFullYear() === year && cursor.getMonth() === month) {
        ;(event.isLive ? liveDays : upcomingDays).add(cursor.getDate())
      }
    }
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const calendarDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const currentDay = now.getDate()

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">
          {MONTHS_SHORT[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary lg:h-7 lg:w-7"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary lg:h-7 lg:w-7"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {calendarDays.map((d, i) => (
          <span key={`h-${i}`} className="py-1 text-[11px] font-semibold text-ink-soft">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />
          const isCurrent = day === currentDay
          const isLive = liveDays.has(day)
          const isUpcoming = upcomingDays.has(day)
          return (
            <span key={day} className="flex items-center justify-center py-0.5">
              <span
                className={cx(
                  'relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200',
                  isCurrent
                    ? 'bg-primary text-white'
                    : isLive || isUpcoming
                      ? 'bg-primary-light text-primary-dark'
                      : 'text-ink-soft hover:bg-primary-lighter',
                )}
              >
                {day}
                {(isLive || isUpcoming) && !isCurrent && (
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute bottom-0.5 h-1 w-1 rounded-full',
                      isLive ? 'bg-danger' : 'bg-primary',
                    )}
                  />
                )}
              </span>
            </span>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-5 border-t border-line pt-3 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
          Current Event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-white" aria-hidden="true" />
          Upcoming Event
        </span>
      </div>
    </Card>
  )
}

export function Events() {
  const { openMenu } = useOutletContext<DashboardLayoutContext>()
  const { data, error, loading, reload } = useApi<EventsPayload>('/events')
  // Real push opt-in state for the reminder card button (click handler → prompt allowed)
  const [notifState, setNotifState] = useState<'idle' | 'busy' | 'on' | 'blocked'>('idle')

  const handleEnableNotifications = async () => {
    setNotifState('busy')
    const ok = await subscribeOneSignal()
    if (ok) {
      setNotifState('on')
      return
    }
    const state = await getOneSignalState()
    setNotifState(state.permissionNative === 'denied' ? 'blocked' : 'idle')
  }

  const pending = loading && !data
  const failed = error && !data

  const featured = data?.featured ?? null
  const upcomingEvents = useMemo<UpcomingEventView[]>(
    () =>
      (data?.upcoming ?? [])
        .filter((e) => !featured || e.id !== featured.id)
        .map(toUpcomingView),
    [data, featured],
  )
  const eventCategories = useMemo(
    () =>
      (data?.categories ?? []).map((c) => {
        const meta = categoryMeta[c.category] ?? defaultCategoryMeta
        return { id: c.category, name: meta.name, count: c.count, icon: meta.icon as 'music' | 'presentation' | 'trophy' | 'wrench' | 'sparkles' }
      }),
    [data],
  )

  return (
    <div className="space-y-6">
      <Header
        title="Events"
        subtitle="Stay updated with all college events and activities"
        onMenuClick={openMenu}
        actions={
          <button
            type="button"
            aria-label="Event notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary"
          >
            <Bell size={18} aria-hidden="true" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          </button>
        }
      />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
          {/* Main column */}
          <div className="space-y-6 xl:col-span-7">
            <section aria-label="Current event">
              <div
                role="status"
                className="h-[260px] animate-pulse rounded-[20px] bg-primary-lighter"
              />
            </section>

            <Card>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">Upcoming Events</h3>
              </div>
              <SkeletonRows rows={4} />
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="space-y-6 xl:col-span-3">
            <EventCalendarWidget events={[]} />

            {/* Promo card */}
            <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#4FB0F4] via-[#3BA7F2] to-[#168BE5] p-5 shadow-card">
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10"
              />
              <div className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                  <Megaphone size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-3.5 text-base font-bold text-white">Have an event idea?</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/85">
                  Let the college community know about your event.
                </p>
                <Button variant="white" size="sm" className="mt-4 w-full">
                  Submit Event Proposal
                </Button>
              </div>
            </div>

            {/* Categories */}
            <Card>
              <h3 className="mb-3 text-base font-semibold text-ink">Event Categories</h3>
              <SkeletonRows rows={3} />
            </Card>

            {/* Reminder card */}
            <Card className="bg-primary-lighter">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-dark shadow-card">
                  <Bell size={18} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">Don&apos;t miss out!</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Turn on notifications to get updates about new events.
                  </p>
                  <Button size="sm" className="mt-3.5">
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
        {/* Main column */}
        <div className="space-y-6 xl:col-span-7">
          <section aria-label="Current event">
            {featured && <FeaturedBanner event={featured} />}
          </section>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Upcoming Events</h3>
              <a
                href="#all-events"
                onClick={(e) => e.preventDefault()}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary-light hover:text-primary lg:px-2 lg:py-1"
              >
                View All Events
              </a>
            </div>
            <ul>
              {upcomingEvents.map((event) => (
                <UpcomingRow key={event.id} event={event} />
              ))}
            </ul>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6 xl:col-span-3">
          <EventCalendarWidget events={data?.upcoming ?? []} />

          {/* Promo card */}
          <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#4FB0F4] via-[#3BA7F2] to-[#168BE5] p-5 shadow-card">
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10"
            />
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                <Megaphone size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-3.5 text-base font-bold text-white">Have an event idea?</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/85">
                Let the college community know about your event.
              </p>
              <Button variant="white" size="sm" className="mt-4 w-full">
                Submit Event Proposal
              </Button>
            </div>
          </div>

          {/* Categories */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-ink">Event Categories</h3>
            <ul className="divide-y divide-line">
              {eventCategories.map((category) => {
                const Icon = categoryIcons[category.icon]
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      className="group flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-ink">{category.name}</span>
                      <span className="text-sm font-semibold text-ink-soft">{category.count}</span>
                      <ChevronRight
                        size={15}
                        className="text-ink-soft/40 transition-colors duration-200 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Reminder card */}
          <Card className="bg-primary-lighter">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-dark shadow-card">
                <Bell size={18} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-bold text-ink">Don&apos;t miss out!</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Turn on notifications to get updates about new events.
                </p>
                <Button
                  size="sm"
                  className="mt-3.5"
                  onClick={() => void handleEnableNotifications()}
                  disabled={notifState === 'busy' || notifState === 'on'}
                >
                  {notifState === 'busy' ? 'Enabling…' : notifState === 'on' ? 'Enabled ✓' : 'Enable Notifications'}
                </Button>
                {notifState === 'blocked' && (
                  <p role="alert" className="mt-2 text-xs font-medium text-danger">
                    Blocked in browser — click the lock icon in the address bar → Notifications → Allow → Reload.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  )
}
