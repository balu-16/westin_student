import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ProfileCardProps {
  onNavigate?: () => void
}

export function ProfileCard({ onNavigate }: ProfileCardProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onNavigate?.()
    navigate('/')
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(20,33,61,0.08)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-dark">
          <User size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">{user?.name ?? ''}</p>
          <p className="truncate text-xs text-ink-soft">
            {user?.department ?? ''} • {user?.year ?? ''}
          </p>
        </div>
      </div>
      <div className="my-3 h-px bg-line" />
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-lighter px-3 py-2.5 text-sm font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary hover:text-white"
      >
        <LogOut size={16} aria-hidden="true" />
        Log out
      </button>
    </div>
  )
}
