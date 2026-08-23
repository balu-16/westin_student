import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { getOneSignalExternalId, getOneSignalState, subscribeOneSignal, whenIdentitySettled } from '../lib/onesignal'
import { canUsePushNow, isIOS } from '../lib/pwa'
import { getSession } from '../lib/api'

const DISMISS_KEY_BASE = 'student-portal.pushBanner:dismissed'

/** Current student for the active session, if any. */
function currentStudent(): { id: string } | null {
  const session = getSession()
  if (session?.user?.id && session.user.role === 'student') return { id: session.user.id }
  return null
}

/** Dismissal is per user (external id): one account's dismissal never silences
 * the ask for a different account on the same shared browser. */
function dismissKeyFor(user: { id: string }): string {
  return `${DISMISS_KEY_BASE}:${getOneSignalExternalId(user)}`
}

/**
 * Post-login banner — the ONLY path that asks for notification permission. In practice
 * it shows only when the native permission was never granted ('default'): the identify
 * heal silently (re)subscribes an already-granted browser under the logged-in student
 * at login, and the browser itself can never re-prompt once granted. The "Enable"
 * button is a direct user gesture, so the permission prompt is not "blocked" (it also
 * re-consents an account that deliberately turned notifications off in Settings).
 * On iPhone browser tabs this never renders (push is impossible there — the install
 * banner handles that case). Dismissal is remembered per user for 7 days.
 */
export function PushPermissionBanner() {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<'idle' | 'enabled' | 'blocked'>('idle')

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        // iPhone browser tabs can never subscribe — the install banner handles that case.
        if (!canUsePushNow()) return
        const user = currentStudent()
        if (!user) return
        try {
          const raw = localStorage.getItem(dismissKeyFor(user))
          if (raw) {
            const { at } = JSON.parse(raw) as { at: number }
            if (Date.now() - at < 7 * 24 * 60 * 60 * 1000) return
          }
        } catch {}
        // Wait for identifyOneSignalUser() (incl. its silent subscription heal) to settle
        // before reading state — otherwise a shared-browser account switch can look
        // briefly "not subscribed" and flash this banner for no reason.
        await whenIdentitySettled()
        const state = await getOneSignalState()
        if (cancelled) return
        // Show only if supported, not denied, and not yet opted-in. When permission is
        // already granted the identify heal re-binds silently, so this banner only ever
        // prompts when the native permission was never granted ('default') — the browser
        // itself can never re-prompt once granted.
        // On iOS standalone, OneSignal's isPushSupported() can lag behind the
        // platform — trust the platform gate there (canUsePushNow already ran).
        if (!state.isSupported && !isIOS()) return
        if (state.permissionNative === 'denied') return
        if (state.optedIn) return
        setVisible(true)
      } catch {}
    }
    // Defer slightly so OneSignal init has settled and doesn't double-prompt
    const t = window.setTimeout(check, 1500)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [])

  const handleEnable = async () => {
    setBusy(true)
    try {
      const ok = await subscribeOneSignal()
      if (ok) {
        setVisible(false)
        setStatus('enabled')
        try {
          const user = currentStudent()
          if (user) localStorage.removeItem(dismissKeyFor(user))
        } catch {}
      } else {
        const state = await getOneSignalState()
        setStatus(state.permissionNative === 'denied' ? 'blocked' : 'idle')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    try {
      const user = currentStudent()
      if (user) localStorage.setItem(dismissKeyFor(user), JSON.stringify({ at: Date.now() }))
    } catch {}
  }

  if (!visible && status === 'idle') return null

  return (
    <div className="animate-fade-in rounded-xl border border-primary/20 bg-primary-lighter/60 p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-dark">
          <Bell size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Enable push notifications?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
            Get instant alerts when the college sends you a notification. You can turn this off anytime in Settings.
          </p>
          {visible && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleEnable}
                disabled={busy}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                <Bell size={14} aria-hidden="true" />
                {busy ? 'Enabling…' : 'Enable notifications'}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-ink-soft hover:bg-primary-lighter"
              >
                <BellOff size={14} aria-hidden="true" />
                Not now
              </button>
            </div>
          )}
          {status === 'enabled' && (
            <p role="status" className="mt-2 text-xs font-medium text-success">
              Push notifications enabled — you&apos;ll receive alerts on this device.
            </p>
          )}
          {status === 'blocked' && (
            <p role="alert" className="mt-2 text-xs font-medium text-danger">
              {isIOS()
                ? 'Notifications are off for Westin — allow them in iPhone Settings → Notifications → Westin, or delete and re-add the Home Screen app.'
                : 'Permission blocked — click the lock icon in the address bar → Notifications → Allow → Reload.'}
            </p>
          )}
        </div>
        {visible && (
          <button type="button" onClick={handleDismiss} aria-label="Dismiss" className="shrink-0 rounded-lg p-1 text-ink-soft hover:bg-white">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
