import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '../components/Button'
import { CampusIllustration } from '../components/CampusIllustration'
import { AttendanceChart } from '../components/AttendanceChart'
import { TimetableCard } from '../components/TimetableCard'
import { SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { mapClassSession, useApi, type DashboardPayload } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { ClassSession } from '../types'
import { cx } from '../utils'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_16px_rgba(59,167,242,0.35)]">
        <GraduationCap size={22} aria-hidden="true" />
      </span>
      <span className="text-lg font-bold text-ink">Student Portal</span>
    </Link>
  )
}

function MiniDashboardPreview({ sessions }: { sessions: ClassSession[] }) {
  const stats = [
    { label: 'Classes Today', value: String(sessions.length) },
    { label: 'Attendance', value: '87%' },
    { label: 'Subjects', value: '6' },
  ]

  return (
    <div className="w-full max-w-[460px] rounded-[20px] border border-line bg-white p-4 shadow-[0_20px_50px_rgba(22,139,229,0.18)] sm:p-5">
      {/* Mini header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
            <LayoutDashboard size={14} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Good Morning!</p>
            <p className="text-[10px] text-ink-soft">Here&apos;s what&apos;s happening today.</p>
          </div>
        </div>
        <span className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-line text-ink-soft">
          <Bell size={13} aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white" />
        </span>
      </div>

      {/* Mini stats */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-primary-lighter/70 p-2.5">
            <p className="text-lg font-bold text-ink">{s.value}</p>
            <p className="text-[10px] font-medium text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mini timetable */}
      <div className="space-y-2.5">
        {sessions.slice(0, 3).map((session) => {
          const tone =
            session.status === 'completed'
              ? 'border-success/25 bg-success/5'
              : session.status === 'in-progress'
                ? 'border-primary/30 bg-primary-lighter'
                : 'border-line bg-white'
          return (
            <div
              key={session.id}
              className={cx('flex items-center justify-between rounded-xl border p-2.5', tone)}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">{session.subject}</p>
                <p className="text-[10px] text-ink-soft">
                  {session.startTime} • Room {session.room}
                </p>
              </div>
              <span
                className={cx(
                  'ml-2 shrink-0 text-[10px] font-semibold',
                  session.status === 'completed'
                    ? 'text-success'
                    : session.status === 'in-progress'
                      ? 'text-primary-dark'
                      : 'text-ink-soft',
                )}
              >
                {session.status === 'completed'
                  ? 'Completed ✓'
                  : session.status === 'in-progress'
                    ? 'In Progress •'
                    : 'Upcoming'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Loading placeholder mirroring the MiniDashboardPreview card. */
function MiniDashboardSkeleton() {
  return (
    <div
      role="status"
      className="w-full max-w-[460px] rounded-[20px] border border-line bg-white p-4 shadow-[0_20px_50px_rgba(22,139,229,0.18)] sm:p-5"
    >
      {/* Mini header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="h-7 w-7 animate-pulse rounded-lg bg-primary-lighter" />
          <div className="space-y-1.5">
            <span aria-hidden="true" className="block h-3 w-20 animate-pulse rounded-xl bg-primary-lighter" />
            <span aria-hidden="true" className="block h-2.5 w-28 animate-pulse rounded-xl bg-primary-lighter" />
          </div>
        </div>
        <span aria-hidden="true" className="h-7 w-7 animate-pulse rounded-lg bg-primary-lighter" />
      </div>

      {/* Mini stats */}
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} aria-hidden="true" className="rounded-xl border border-line bg-primary-lighter/70 p-2.5">
            <span className="block h-6 w-10 animate-pulse rounded-xl bg-white" />
            <span className="mt-1 block h-2.5 w-12 animate-pulse rounded-xl bg-white" />
          </div>
        ))}
      </div>

      {/* Mini timetable */}
      <div className="space-y-2.5">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} aria-hidden="true" className="block h-[52px] animate-pulse rounded-xl bg-primary-lighter" />
        ))}
      </div>
    </div>
  )
}

const features = [
  {
    icon: CalendarDays,
    title: 'Timetable',
    description: 'Stay updated with your daily and weekly class schedule.',
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: 'Attendance',
    description: 'Track your subject-wise and overall attendance.',
  },
  {
    icon: ClipboardList,
    title: 'Assignments',
    description: 'Never miss important assignment deadlines.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description: 'Stay informed about exams, events and college updates.',
  },
]

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  // Only fetch when signed in — the landing page stays public.
  const {
    data: dashboard,
    error,
    loading,
    reload,
  } = useApi<DashboardPayload>(isAuthenticated ? '/students/me/dashboard' : null)
  const previewPending = isAuthenticated && loading && !dashboard
  const previewFailed = isAuthenticated && error && !dashboard
  const todaySchedule = (dashboard?.todaySessions ?? []).map(mapClassSession)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-page">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-md">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <Logo />

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <Link to="/login">
              <Button size="md">Student Login</Button>
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="animate-fade-in border-t border-line bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-primary-dark"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" className="mt-2">
                <Button className="w-full">Student Login</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-b from-primary-lighter via-white to-page"
      >
        <div
          aria-hidden="true"
          className="absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-40 bottom-0 h-[380px] w-[380px] rounded-full bg-primary/5 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white px-4 py-1.5 text-xs font-semibold text-primary-dark shadow-card">
              <GraduationCap size={14} aria-hidden="true" />
              Your campus companion
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl xl:text-[3.4rem]">
              Your <span className="text-primary">Academic Life</span>, Simplified.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Access your timetable, attendance, assignments, announcements and academic
              information — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/login">
                <Button size="lg">
                  Student Login
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="secondary">
                  Explore Portal
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 sm:gap-x-10">
              {[
                { value: '6', label: 'Subjects' },
                { value: '87%', label: 'Avg. Attendance' },
                { value: '24/7', label: 'Access' },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-bold text-ink">{item.value}</p>
                  <p className="text-xs font-medium text-ink-soft">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div
              aria-hidden="true"
              className="absolute inset-x-8 top-1/4 h-72 rounded-full bg-primary/15 blur-3xl"
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="animate-float">
                <CampusIllustration className="w-64 opacity-90 sm:w-72" />
              </div>
              {previewPending ? (
                <MiniDashboardSkeleton />
              ) : previewFailed ? (
                <div className="w-full max-w-[460px]">
                  <ErrorState message={error ?? undefined} onRetry={reload} />
                </div>
              ) : (
                <MiniDashboardPreview sessions={todaySchedule} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Everything You Need, In One Place
          </h2>
          <p className="mt-4 text-base text-ink-soft">
            All the tools you need to stay organised, on schedule and informed throughout the
            semester.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-[20px] border border-line bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-dark transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                <feature.icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attendance section */}
      <section id="about" className="bg-gradient-to-b from-page to-primary-lighter/60 py-20">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="flex justify-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
              />
              <div className="relative rounded-[28px] border border-line bg-white p-8 shadow-card sm:p-10">
                <AttendanceChart percentage={87} size={240} />
                <p className="mt-5 text-center text-sm font-semibold text-ink-soft">
                  Overall Attendance
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Stay on Top of Your Attendance
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
              Monitor your attendance subject by subject and know exactly where you stand
              throughout the semester.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Subject-wise attendance breakdown',
                'Healthy / warning indicators at a glance',
                'Semester-wide overall percentage',
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm font-medium text-ink">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-primary-dark"
                    aria-hidden="true"
                  >
                    <BookOpen size={13} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link to="/login" className="mt-8 inline-block">
              <Button size="lg">
                Check Attendance
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Timetable section */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Your Schedule, At a Glance
          </h2>
          <p className="mt-4 text-base text-ink-soft">
            A clean daily timeline — completed classes, the live class and what&apos;s coming
            next.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl rounded-[20px] border border-line bg-white p-5 shadow-card sm:p-8">
          {previewPending ? (
            <SkeletonRows rows={3} />
          ) : previewFailed ? (
            <ErrorState message={error ?? undefined} onRetry={reload} compact />
          ) : (
            <ol className="relative">
              <span
                aria-hidden="true"
                className="absolute bottom-2 left-[100px] top-2 w-px bg-line sm:left-[138px] lg:left-[148px]"
              />
              {todaySchedule.map((session) => (
                <TimetableCard key={session.id} session={session} />
              ))}
            </ol>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link to="/login" className="inline-block">
            <Button size="lg" variant="secondary">
              View Full Timetable
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#4FB0F4] via-[#3BA7F2] to-[#168BE5] px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to manage your academic journey?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/85">
              Log in to your Student Portal and stay organized throughout your semester.
            </p>
            <Link to="/login" className="mt-8 inline-block">
              <Button size="lg" variant="white">
                Student Login
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-line bg-white">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-soft">
              Your academic life, simplified. Timetable, attendance and announcements in one
              friendly portal.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-primary-dark transition-colors duration-200 hover:text-primary"
                >
                  Student Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li>support@studentportal.edu</li>
              <li>+1 (555) 010-2025</li>
              <li>University Campus, Innovation Drive</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5">
          <p className="text-center text-xs text-ink-soft">
            © 2025 Student Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
