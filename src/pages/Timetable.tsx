import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarDays, Users } from 'lucide-react'
import { Header } from '../components/Header'
import { TimetableCard } from '../components/TimetableCard'
import { SectionCard } from '../components/Card'
import { PageLoader } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { mapClassSession, useApi, type TimetableDay } from '../lib/api'
import { cx, kolkataTodayIndex } from '../utils'
import type { DaySchedule } from '../types'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

export function Timetable() {
  const { openMenu } = useOutletContext<DashboardLayoutContext>()
  const { data, error, loading, reload } = useApi<TimetableDay[]>('/timetable')
  // Default to today's IST column so ongoing/upcoming is visible immediately.
  const [activeIndex, setActiveIndex] = useState(() => kolkataTodayIndex())
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollTimer = useRef<number | undefined>(undefined)

  // Refresh on tab focus/visibility so upcoming → ongoing flips without reload.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload()
    }
    const onFocus = () => reload()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onFocus)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onFocus)
    }
  }, [reload])

  const pending = loading && !data
  const failed = error && !data

  const weeklyTimetable = useMemo<DaySchedule[]>(
    () =>
      (data ?? []).map(({ dayName, sessions }) => ({
        day: dayName,
        classes: sessions.map(mapClassSession),
      })),
    [data],
  )

  const schedule = weeklyTimetable[activeIndex] ?? { day: '', classes: [] }

  const goToDay = (index: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
  }

  /** Sync the active tab with the swipe/scroll position once it settles. */
  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => {
      const index = Math.round(track.scrollLeft / track.clientWidth)
      setActiveIndex((prev) => (prev === index ? prev : index))
    }, 120)
  }

  return (
    <div className="space-y-6">
      <Header title="Timetable" subtitle="Your weekly class schedule." onMenuClick={openMenu} />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <PageLoader label="Fetching timetable" />
      ) : (
        <>
          {/* Day tabs */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                const today = kolkataTodayIndex()
                setActiveIndex(today)
                goToDay(today)
                reload()
              }}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-bold text-primary-dark shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
            >
              Today
            </button>
          </div>
          <div
            role="tablist"
            aria-label="Select weekday"
            className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 shadow-card scrollbar-thin"
          >
            {weeklyTimetable.map(({ day }, i) => {
              const active = i === activeIndex
              return (
                <button
                  key={day}
                  role="tab"
                  aria-selected={active}
                  onClick={() => goToDay(i)}
                  className={cx(
                    'flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                    active
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(59,167,242,0.35)]'
                      : 'text-ink-soft hover:bg-primary-light hover:text-primary-dark',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <SectionCard
            title={`${schedule.day}'s Classes`}
            icon={<CalendarDays size={18} className="text-primary" aria-hidden="true" />}
          >
            {/* Swipeable day pager — native scroll-snap keeps gesture handling
                to the browser; tabs above stay in sync with the swipe position. */}
            <div
              ref={trackRef}
              onScroll={handleScroll}
              tabIndex={0}
              aria-label="Weekly timetable, swipe to change day"
              className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-scrollbar]:hidden"
            >
              {weeklyTimetable.length === 0 ? (
                <div className="w-full shrink-0 snap-start">
                  <p className="py-10 text-center text-sm text-ink-soft">
                    No timetable assigned yet — contact your admin office.
                  </p>
                </div>
              ) : (
                weeklyTimetable.map(({ day, classes }) => (
                  <div
                    key={day}
                    role="tabpanel"
                    aria-label={`${day} classes`}
                    className="w-full shrink-0 snap-start"
                  >
                    <ol className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute bottom-2 left-[100px] top-2 w-px bg-line sm:left-[138px] lg:left-[148px]"
                      />
                      {classes.length > 0 ? (
                        classes.map((session) => (
                          <TimetableCard key={session.id} session={session} />
                        ))
                      ) : (
                        <p className="py-8 text-center text-sm text-ink-soft">No classes on {day}.</p>
                      )}
                    </ol>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* Faculty for the selected day — derived from the same day's classes */}
          <SectionCard
            title={`${schedule.day}'s Faculty`}
            icon={<Users size={18} className="text-primary" aria-hidden="true" />}
          >
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                    <th scope="col" className="py-3 pr-4 font-semibold">Subject</th>
                    <th scope="col" className="py-3 pr-4 font-semibold">Faculty</th>
                    <th scope="col" className="py-3 font-semibold">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.classes.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-line/70 transition-colors duration-150 last:border-0 hover:bg-primary-lighter/60"
                    >
                      <td className="py-3 pr-4 font-semibold text-ink">{session.subject}</td>
                      <td className="py-3 pr-4 text-ink-soft">{session.faculty}</td>
                      <td className="py-3 text-ink-soft">Room {session.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
