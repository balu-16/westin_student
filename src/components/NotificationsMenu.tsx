import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { apiFetch, useApi, type MyNotificationsPayload } from '../lib/api'
import { cx, timeAgo } from '../utils'

/**
 * Real notifications bell for the student portal header. Lists admin-sent
 * notifications addressed to the logged-in student (`GET /api/notifications/my`),
 * polls the unread count every 60s, and marks items read on click / all-at-once.
 */
export function NotificationsMenu() {
  const { data, reload } = useApi<MyNotificationsPayload>('/notifications/my?limit=30')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Light polling keeps the unread badge fresh while the portal sits open.
  useEffect(() => {
    const t = window.setInterval(() => void reload(), 60_000)
    return () => window.clearInterval(t)
  }, [reload])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items = data?.items ?? []
  const unread = data?.unread ?? 0

  const markRead = useCallback(
    async (id: string) => {
      try {
        await apiFetch(`/notifications/my/${id}/read`, { method: 'PUT' })
        void reload()
      } catch {}
    },
    [reload],
  )

  const markAllRead = useCallback(async () => {
    try {
      await apiFetch('/notifications/my/read-all', { method: 'PUT' })
      void reload()
    } catch {}
  }, [reload])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary sm:h-10 sm:w-10"
      >
        <Bell size={16} className="sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">
              Notifications{unread > 0 && <span className="ml-1.5 text-xs font-medium text-primary">{unread} new</span>}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary"
              >
                <CheckCheck size={13} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-soft">
                No notifications yet — college alerts will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-line/60">
                {items.map((n) => {
                  const isUnread = !n.readAt
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => void markRead(n.id)}
                        className={cx(
                          'block w-full px-4 py-3 text-left transition-colors',
                          isUnread ? 'bg-primary-lighter/50 hover:bg-primary-lighter/70' : 'bg-white hover:bg-primary-lighter/30',
                        )}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cx('truncate text-sm', isUnread ? 'font-bold text-ink' : 'font-medium text-ink')}>{n.title}</span>
                          <span className="shrink-0 text-[11px] text-ink-soft">{timeAgo(n.createdAt)}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-soft">{n.body}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
