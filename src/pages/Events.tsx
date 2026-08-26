import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Expand,
  Images,
  MapPin,
  Maximize2,
  Music,
  PartyPopper,
  Presentation,
  Sparkles,
  Trophy,
  Wrench,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Header } from '../components/Header'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PageLoader } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { apiFetch, formatDateLabel, parseDateParts, useApi, type ApiEvent, type EventsPayload } from '../lib/api'
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
  posterUrl?: string | null
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
    posterUrl: event.posterUrl ?? null,
  }
}

function FeaturedBanner({ event, onViewDetails }: { event: ApiEvent; onViewDetails: () => void }) {
  const startDate = formatDateLabel(event.startDate)
  const endDate = event.endDate ? formatDateLabel(event.endDate) : startDate
  return (
    <div className="relative overflow-hidden rounded-[20px] shadow-card">
      {event.posterUrl ? (
        <>
          <img src={event.posterUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,167,242,0.5),transparent_55%),radial-gradient(circle_at_80%_75%,rgba(239,68,68,0.45),transparent_50%),linear-gradient(135deg,#111A33_0%,#1B2A52_55%,#0D142B_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:22px_22px]"
          />
        </>
      )}
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
        <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl drop-shadow">
          {event.title}
        </h2>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
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

        <Button className="mt-6" onClick={onViewDetails}>
          View Details
        </Button>
      </div>
    </div>
  )
}

function UpcomingRow({ event, onViewDetails }: { event: UpcomingEventView; onViewDetails: () => void }) {
  return (
    <li className="border-b border-line first:pt-0 last:border-0">
      <button
        type="button"
        onClick={onViewDetails}
        className="flex w-full gap-4 py-4 text-left transition-colors duration-200 hover:bg-primary-lighter/40"
      >
        {/* Thumbnail — poster if available */}
        {event.posterUrl ? (
          <img src={event.posterUrl} alt="" aria-hidden="true" className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-[72px] sm:w-[72px]" />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white sm:h-[72px] sm:w-[72px]"
            style={{ background: `linear-gradient(135deg, ${event.accent}, ${event.accent}B3)` }}
            aria-hidden="true"
          >
            <CalendarDays size={26} />
          </div>
        )}

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
      </button>
    </li>
  )
}

/** Sun-first calendar grid, marking live + upcoming events. Month is browsable. */
function EventCalendarWidget({ events }: { events: ApiEvent[] }) {
  const now = new Date()
  const [cursor, setCursor] = useState(() => ({ year: now.getFullYear(), month: now.getMonth() }))
  const year = cursor.year
  const month = cursor.month
  const firstWeekday = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const shiftMonth = (delta: number) =>
    setCursor((c) => {
      const m = c.month + delta
      if (m < 0) return { year: c.year - 1, month: 11 }
      if (m > 11) return { year: c.year + 1, month: 0 }
      return { ...c, month: m }
    })

  const liveDays = new Set<number>()
  const upcomingDays = new Set<number>()
  for (const event of events) {
    const start = new Date(event.startDate.slice(0, 10) + 'T00:00:00')
    const end = event.endDate ? new Date(event.endDate.slice(0, 10) + 'T00:00:00') : start
    for (const day = new Date(start); day <= end && day <= new Date(year, month + 1, 0); day.setDate(day.getDate() + 1)) {
      if (day.getFullYear() === year && day.getMonth() === month) {
        ;(event.isLive ? liveDays : upcomingDays).add(day.getDate())
      }
    }
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const calendarDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  // "Today" only highlights when actually viewing the current month.
  const currentDay =
    year === now.getFullYear() && month === now.getMonth() ? now.getDate() : -1

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
            onClick={() => shiftMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary lg:h-7 lg:w-7"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
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
  const [detailsEvent, setDetailsEvent] = useState<ApiEvent | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<Array<{ id: string; url: string | null }>>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (idx: number) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryImages.length : null))
  const goPrev = () => setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null))

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, galleryImages.length])

  useEffect(() => {
    if (!detailsEvent) {
      setGalleryImages([])
      setLightboxIndex(null)
      return
    }
    let cancelled = false
    setGalleryLoading(true)
    apiFetch<{ images: Array<{ id: string; url: string | null }> }>(`/events/${detailsEvent.id}/images`)
      .then((res) => {
        if (!cancelled) setGalleryImages(res.images ?? [])
      })
      .catch(() => {
        if (!cancelled) setGalleryImages([])
      })
      .finally(() => {
        if (!cancelled) setGalleryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [detailsEvent?.id])

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
  const upcomingEvents = useMemo(
    () =>
      (data?.upcoming ?? [])
        .filter((e) => !featured || e.id !== featured.id)
        .filter((e) => !activeCategory || e.category === activeCategory),
    [data, featured, activeCategory],
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
            aria-label="Enable event notifications"
            title={notifState === 'on' ? 'Notifications enabled' : 'Get notified about new events'}
            onClick={() => void handleEnableNotifications()}
            disabled={notifState === 'busy' || notifState === 'on'}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-60"
          >
            <Bell size={18} aria-hidden="true" />
            {notifState !== 'on' && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
          </button>
        }
      />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <PageLoader label="Fetching events" />
      ) : (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
        {/* Main column */}
        <div className="space-y-6 xl:col-span-7">
          <section aria-label="Current event">
            {featured && <FeaturedBanner event={featured} onViewDetails={() => setDetailsEvent(featured)} />}
          </section>

          <Card>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-ink">Upcoming Events</h3>
              {activeCategory && (
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary hover:text-white"
                >
                  {(categoryMeta[activeCategory] ?? defaultCategoryMeta).name}
                  <X size={12} aria-hidden="true" />
                  <span className="sr-only">Clear category filter</span>
                </button>
              )}
            </div>
            <ul>
              {upcomingEvents.map((event) => (
                <UpcomingRow
                  key={event.id}
                  event={toUpcomingView(event)}
                  onViewDetails={() => setDetailsEvent(event)}
                />
              ))}
            </ul>
            {activeCategory && upcomingEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-soft">
                No upcoming {(categoryMeta[activeCategory] ?? defaultCategoryMeta).name} events.
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6 xl:col-span-3">
          <EventCalendarWidget events={data?.upcoming ?? []} />

          {/* Categories */}
          <Card>
            <h3 className="mb-3 text-base font-semibold text-ink">Event Categories</h3>
            <ul className="divide-y divide-line">
              {eventCategories.map((category) => {
                const Icon = categoryIcons[category.icon]
                const selected = activeCategory === category.id
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setActiveCategory(selected ? null : category.id)}
                      className="group flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span
                        className={cx(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                          selected
                            ? 'bg-primary text-white'
                            : 'bg-primary-light text-primary-dark group-hover:bg-primary group-hover:text-white',
                        )}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-ink">{category.name}</span>
                      <span className="text-sm font-semibold text-ink-soft">{category.count}</span>
                      <ChevronRight
                        size={15}
                        className={cx(
                          'transition-colors duration-200',
                          selected ? 'text-primary' : 'text-ink-soft/40 group-hover:text-primary',
                        )}
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

      <Modal
        open={!!detailsEvent}
        onClose={() => setDetailsEvent(null)}
        title={detailsEvent?.title ?? ''}
        subtitle={detailsEvent ? `${(categoryMeta[detailsEvent.category] ?? defaultCategoryMeta).name} Event` : undefined}
        footer={
          <Button variant="secondary" onClick={() => setDetailsEvent(null)}>
            Close
          </Button>
        }
      >
        {detailsEvent && (
          <div className="space-y-4">
            {detailsEvent.posterUrl && (
              <img src={detailsEvent.posterUrl} alt={`${detailsEvent.title} poster`} className="w-full rounded-xl object-cover" />
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="text-primary" aria-hidden="true" />
                {formatDateLabel(detailsEvent.startDate)}
                {detailsEvent.endDate &&
                  ` — ${formatDateLabel(detailsEvent.endDate)}`}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={15} className="text-primary" aria-hidden="true" />
                {detailsEvent.time}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-primary" aria-hidden="true" />
                {detailsEvent.location}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">About this event</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {detailsEvent.description?.trim() || 'No description provided yet — check back later.'}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Images size={14} className="text-primary" /> Gallery
                </h3>
                {galleryImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-primary/40 hover:text-primary"
                  >
                    <Maximize2 size={12} /> Fullscreen
                  </button>
                )}
              </div>
              {galleryLoading ? (
                <p className="mt-2 text-sm text-ink-soft">Loading images…</p>
              ) : galleryImages.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">No gallery images yet. Check back after the event.</p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((img, idx) =>
                    img.url ? (
                      <button key={img.id} type="button" onClick={() => openLightbox(idx)} className="group relative overflow-hidden rounded-xl">
                        <img src={img.url} alt="Event" className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                          <Expand size={18} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                      </button>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {lightboxIndex !== null && galleryImages[lightboxIndex]?.url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery fullscreen"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close fullscreen"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur hover:bg-white/20"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 sm:right-4"
          >
            <ChevronRight size={22} />
          </button>
          <img
            src={galleryImages[lightboxIndex].url!}
            alt="Gallery fullscreen"
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </div>
  )
}
