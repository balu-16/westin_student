import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  apiFetch,
  apiUrl,
  clearApiCache,
  clearSession,
  getSession,
  mapStudentUser,
  setSession,
  type Session,
} from '../lib/api'
import { identifyOneSignalUser, logoutOneSignalUser, subscribeOneSignal } from '../lib/onesignal'
import type { Student } from '../types'

interface AuthContextValue {
  user: Student | null
  isAuthenticated: boolean
  login: (emailOrId: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  updateAvatar: (avatarUrl: string | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | null>(() => {
    const session = getSession()
    return session ? mapStudentUser(session.user) : null
  })

  // OneSignal: identify on login AND on session restore (page reload) — OneSignal best
  // practice is to call login(external_id) on every load once the user is known. When the
  // browser already granted permission this also silently re-subscribes the device; the
  // native prompt itself only ever comes from a user gesture, never from here.
  useEffect(() => {
    if (!user?.id) return
    void identifyOneSignalUser({ id: user.id }).catch(() => undefined)
  }, [user?.id])

  const login = useCallback(async (emailOrId: string, password: string) => {
    const session = await apiFetch<Session>('/auth/login', {
      method: 'POST',
      body: { identifier: emailOrId, password },
    })
    setSession(session)
    setUser(mapStudentUser(session.user))
    // Ask for notification permission immediately on successful login, while the login
    // click's transient activation is still valid. Identify first so the subscription
    // attaches to THIS account. The post-login banner is the fallback if timing misses.
    if (session.user?.id) {
      void (async () => {
        await identifyOneSignalUser({ id: session.user.id })
        await subscribeOneSignal()
      })().catch(() => undefined)
    }
  }, [])

  const logout = useCallback(() => {
    const session = getSession()
    if (session?.refreshToken) {
      void fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      }).catch(() => {})
    }
    // OneSignal: unlink device before clearing session
    void logoutOneSignalUser().catch(() => undefined)
    clearSession()
    clearApiCache()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const me = await apiFetch<any>('/auth/me')
      const session = getSession()
      if (session) {
        const updated = { ...session, user: me.user ?? me }
        setSession(updated as Session)
        setUser(mapStudentUser(updated.user as any))
      } else if (me) {
        setUser(mapStudentUser((me.user ?? me) as any))
      }
    } catch {}
  }, [])

  const updateAvatar = useCallback((avatarUrl: string | null) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl } : prev))
    const session = getSession()
    if (session) {
      ;(session.user as any).avatarUrl = avatarUrl
      setSession(session)
    }
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout, refreshProfile, updateAvatar }),
    [user, login, logout, refreshProfile, updateAvatar],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
