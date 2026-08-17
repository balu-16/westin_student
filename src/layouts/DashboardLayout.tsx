import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'

export interface DashboardLayoutContext {
  openMenu: () => void
}

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const context: DashboardLayoutContext = { openMenu: () => setMenuOpen(true) }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[1200px] animate-fade-in px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children ?? <Outlet context={context} />}
        </main>
      </div>
    </div>
  )
}
