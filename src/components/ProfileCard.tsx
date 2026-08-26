import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
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
    navigate('/login')
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_rgba(12,64,115,0.18)] ring-1 ring-black/[0.04]">
        <Avatar name={user?.name ?? ''} src={user?.avatarUrl ?? null} size="sm" />
        <span className="h-px w-full bg-line" aria-hidden="true" />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0E6EBD] transition-colors hover:bg-[#0E6EBD] hover:text-white"
        >
          <LogOut size={14} aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-[0_8px_24px_rgba(12,64,115,0.18)] ring-1 ring-black/[0.04]">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar name={user?.name ?? ''} src={user?.avatarUrl ?? null} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight text-ink">{user?.name ?? 'Student'}</p>
          <p className="truncate text-xs font-medium leading-tight text-ink-soft">
            {user?.department ?? '—'} • {user?.year ?? '—'}
          </p>
        </div>
        <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-lighter text-primary-dark sm:flex">
          <ChevronRight size={14} aria-hidden="true" />
        </span>
      </div>
      <div className="my-3 h-px bg-line" />
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[#F0F7FF] px-3 py-2.5 text-[13px] font-semibold text-[#0E6EBD] transition-all duration-200 hover:border-[#0E6EBD]/15 hover:bg-[#0E6EBD] hover:text-white hover:shadow-[0_4px_12px_rgba(14,110,189,0.22)]"
      >
        <LogOut size={15} aria-hidden="true" />
        Sign out
      </button>
    </div>
  )
}
