import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  apiFetch,
  clearApiCache,
  clearSession,
  getSession,
  mapStudentUser,
  setSession,
  type Session,
} from '../lib/api'
import type { Student } from '../types'

interface AuthContextValue {
  user: Student | null
  isAuthenticated: boolean
  login: (emailOrId: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Student | null>(() => {
    const session = getSession()
    return session ? mapStudentUser(session.user) : null
  })

  const login = useCallback(async (emailOrId: string, password: string) => {
    const session = await apiFetch<Session>('/auth/login', {
      method: 'POST',
      body: { identifier: emailOrId, password },
    })
    setSession(session)
    setUser(mapStudentUser(session.user))
  }, [])

  const logout = useCallback(() => {
    const session = getSession()
    if (session?.refreshToken) {
      // Best-effort server-side revocation — ignore failures.
      void fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      }).catch(() => {})
    }
    clearSession()
    clearApiCache()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
