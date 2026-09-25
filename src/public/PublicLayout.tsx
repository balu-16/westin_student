import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import westinLogo from '../assets/images/westin-logo.avif'
import { useAuth } from '../contexts/AuthContext'
import { cx } from '../utils'
import { getFixturePage, publicPageCopy } from './content'
import { PUBLIC_CONTENT_MODE } from './usePublicContent'

const links = [
  { label: 'About', to: '/about' },
  { label: 'Programs', to: '/programs' },
  { label: 'Campus life', to: '/campus' },
  { label: 'Placements', to: '/placements' },
  { label: 'Contact', to: '/contact' },
]

export function PublicLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const page = getFixturePage(location.pathname)
  const pageTitle = page?.program?.title ?? (page ? publicPageCopy[page.kind].title : 'Westin College')
  const pageDescription = page ? publicPageCopy[page.kind].summary : 'Westin College public information, programs, campus life, and next steps.'
  const canonicalOrigin = (import.meta.env.VITE_PUBLIC_SITE_ORIGIN ?? 'https://www.westincolleges.com').replace(/\/+$/, '')
  const canonicalPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '')

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7fbff] text-[#142d46]">
      <title>{pageTitle + ' · Westin College'}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalOrigin + canonicalPath} />
      <a
        href="#public-content"
        className="fixed left-3 top-3 z-[70] -translate-y-24 rounded-xl bg-[#142d46] px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="relative z-50 mx-auto flex w-full max-w-[1360px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
        <Link to="/" className="flex min-w-0 items-center gap-3 rounded-xl" aria-label="Westin College home">
          <img src={westinLogo} width={575} height={294} alt="Westin College" className="h-12 w-auto object-contain sm:h-14" />
          <span className="hidden border-l border-[#cfe2ee] pl-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#325d77] sm:block">
            <span className="block">The Westin way</span>
            <span className="mt-1 block text-[11px] font-medium normal-case tracking-normal text-[#5d6f7e]">
              Vijayawada campus
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Public website">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cx(
                  'rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-white text-[#1468aa] shadow-sm' : 'text-[#42647a] hover:bg-white/70 hover:text-[#1468aa]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex lg:flex">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#b9dced] bg-white px-4 text-sm font-bold text-[#1468aa] shadow-sm transition hover:border-[#3ba7f2]"
            >
              Open dashboard <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center rounded-xl border border-[#b9dced] bg-white px-4 text-sm font-bold text-[#1468aa] shadow-sm transition hover:border-[#3ba7f2]"
            >
              Student login
            </Link>
          )}
          <Link
            to="/admissions#visit"
            className="inline-flex min-h-11 items-center rounded-xl bg-[#1468aa] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(20,104,170,.2)] transition hover:bg-[#0f527f]"
          >
            Enquire
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={open ? 'Close website menu' : 'Open website menu'}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#cfe2ee] bg-white text-[#1468aa] shadow-sm lg:hidden"
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </header>

      {open && (
        <div id="public-mobile-menu" className="relative z-40 border-y border-[#d9eaf3] bg-white px-5 py-4 shadow-lg lg:hidden">
          <nav className="mx-auto flex max-w-[1360px] flex-col gap-1" aria-label="Mobile public website">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'rounded-xl px-4 py-3 text-sm font-semibold',
                    isActive ? 'bg-[#eaf6ff] text-[#1468aa]' : 'text-[#42647a] hover:bg-[#f4faff]',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e6f0f5] pt-3">
              <Link to={isAuthenticated ? '/dashboard' : '/login'} className="rounded-xl border border-[#b9dced] px-3 py-3 text-center text-sm font-bold text-[#1468aa]">
                {isAuthenticated ? 'Dashboard' : 'Student login'}
              </Link>
              <Link to="/admissions#visit" className="rounded-xl bg-[#1468aa] px-3 py-3 text-center text-sm font-bold text-white">
                Enquire
              </Link>
            </div>
          </nav>
        </div>
      )}

      {PUBLIC_CONTENT_MODE === 'fixture' && (
        <div className="border-y border-dashed border-[#efc27d] bg-[#fff8e7] px-5 py-2 text-center text-xs font-semibold text-[#7a5b24]" role="note">
          Preview content · local fixtures · not approved for publication
        </div>
      )}

      <main id="public-content">
        <Outlet />
      </main>

      <footer className="border-t border-[#d9eaf3] bg-[#eaf6ff]">
        <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-12">
          <div>
            <img src={westinLogo} width={575} height={294} alt="Westin College" className="h-14 w-auto object-contain" />
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#42647a]">
              Learn, grow, and find a useful next step in business, hospitality, and beyond.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#325d77]">Explore</p>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-[#42647a]">
              <Link to="/about" className="hover:text-[#1468aa]">About Westin</Link>
              <Link to="/programs" className="hover:text-[#1468aa]">Programs</Link>
              <Link to="/campus" className="hover:text-[#1468aa]">Campus life</Link>
              <Link to="/placements" className="hover:text-[#1468aa]">Placements</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#325d77]">Next steps</p>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-[#42647a]">
              <Link to="/admissions" className="hover:text-[#1468aa]">Admissions</Link>
              <Link to="/contact" className="hover:text-[#1468aa]">Contact</Link>
              <Link to="/login" className="hover:text-[#1468aa]">Student login</Link>
              <Link to="/contact" className="hover:text-[#1468aa]">Contact details</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#d1e5f0] px-5 py-4 text-center text-xs text-[#5d6f7e] sm:px-8">
          Westin College · Vijayawada · Public information is subject to college approval.
        </div>
      </footer>
    </div>
  )
}
