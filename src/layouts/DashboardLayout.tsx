import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'

export interface DashboardLayoutContext {
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  isMenuOpen: boolean
  toggleSidebar: () => void
  collapsed: boolean
}

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('student-portal.sidebarCollapsed') === 'true'
    } catch {
      return false
    }
  })
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    try {
      localStorage.setItem('student-portal.sidebarCollapsed', String(collapsed))
    } catch {}
  }, [collapsed])

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const toggleSidebar = () => setCollapsed((v) => !v)
  const openMenu = () => setMenuOpen(true)
  const closeMenu = () => setMenuOpen(false)
  const toggleMenu = () => setMenuOpen((v) => !v)
  const context: DashboardLayoutContext = { openMenu, closeMenu, toggleMenu, isMenuOpen: menuOpen, toggleSidebar, collapsed }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} collapsed={collapsed} onToggleCollapsed={toggleSidebar} />
      <div className={collapsed ? 'lg:pl-[72px] transition-[padding] duration-300' : 'lg:pl-[280px] transition-[padding] duration-300'}>
        <main className="mx-auto w-full max-w-[1200px] animate-fade-in px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children ?? <Outlet context={context} />}
        </main>
      </div>
    </div>
  )
}
