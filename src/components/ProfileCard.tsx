import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './Avatar'

interface ProfileCardProps {
  onNavigate?: () => void
  collapsed?: boolean
}

export function ProfileCard({ onNavigate, collapsed }: ProfileCardProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onNavigate?.()
    navigate('/')
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(20,33,61,0.08)]">
        <Avatar name={user?.name ?? ''} src={user?.avatarUrl ?? null} size="md" />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-lighter text-primary-dark transition-colors hover:bg-primary hover:text-white"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(20,33,61,0.08)]">
      <div className="flex items-center gap-3">
        <Avatar name={user?.name ?? ''} src={user?.avatarUrl ?? null} size="md" />
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
