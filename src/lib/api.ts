import { useCallback, useEffect, useState } from 'react'
import type { AttendanceBreakdown, ClassSession, Student } from '../types'

const SESSION_KEY = 'student-portal.session'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

/** Build an API URL for both local relative requests and deployed backends. */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const apiPath = normalizedPath === '/api' || normalizedPath.startsWith('/api/')
    ? normalizedPath
    : `/api${normalizedPath}`
  return `${API_BASE_URL}${apiPath}`
}

/* ------------------------------------------------------------------ */
/* Session storage                                                     */
/* ------------------------------------------------------------------ */

/** Raw user payload returned by /api/auth/login|refresh|me. */
export interface ApiUser {
  id: string
  role: string
  name: string | null
  firstName: string | null
  email: string
  department: string | null
  designation: string | null
  studentId: string | null
  facultyId: string | null
  adminId: string | null
  year: number | null
  sectionId: string | null
  sectionLabel: string | null
  rollNo: string | null
  overallAttendance: number | string | null
  avatarUrl: string | null
}

export interface Session {
  accessToken: string
  refreshToken: string
  user: ApiUser
}

export function getSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed?.accessToken || !parsed?.refreshToken) return null
    return parsed
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY)
}

/* ------------------------------------------------------------------ */
/* API client                                                          */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(status: number, payload: unknown) {
    const rawMessage =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? (payload as { message?: unknown }).message
        : null
    const message =
      (typeof rawMessage === 'string' && rawMessage
        ? rawMessage
        : Array.isArray(rawMessage)
          ? rawMessage.filter((m): m is string => typeof m === 'string').join(', ')
          : null) ?? `Request failed (${status})`
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export interface ApiFetchOptions {
  method?: string
  body?: unknown
}

async function sendRequest(
  path: string,
  options: ApiFetchOptions,
  token: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(apiUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
}

async function toApiError(res: Response): Promise<ApiError> {
  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    // non-JSON error body — fall through to the generic message
  }
  if (payload === null || payload === undefined) {
    payload = { message: `Request failed (${res.status})` }
  }
  return new ApiError(res.status, payload)
}

/** POST /api/auth/refresh once; persists and returns the new session.
 *  Single-flight: parallel 401s share one rotation, otherwise the first
 *  rotation revokes the refresh token and the losers log the user out. */
let refreshInFlight: Promise<Session | null> | null = null;

function refreshSession(refreshToken: string): Promise<Session | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(apiUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) return null
        const session = (await res.json()) as Session
        if (!session?.accessToken) return null
        setSession(session)
        return session
      } catch {
        return null
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

/**
 * Fetch helper for the portal API. Sends JSON + bearer token; on a 401 it
 * tries the refresh-token flow once and retries the original request. If
 * the refresh fails the session is cleared and the user is sent to /login.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const session = getSession()
  let res = await sendRequest(path, options, session?.accessToken ?? null)

  if (res.status === 401 && session?.refreshToken) {
    const refreshed = await refreshSession(session.refreshToken)
    if (refreshed) {
      res = await sendRequest(path, options, refreshed.accessToken)
    } else {
      clearSession()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
      throw new ApiError(401, { message: 'Your session has expired. Please sign in again.' })
    }
  }

  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function uploadBytes(url: string, file: File): Promise<void> {
  const res = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } })
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
}

/* ------------------------------------------------------------------ */
/* useApi — tiny data-fetching hook                                    */
/* ------------------------------------------------------------------ */

/** GET responses younger than this are served from cache without a refetch. */
const CACHE_TTL_MS = 30_000

/** Module-level GET cache: path → last successful payload + timestamp.
 *  useApi only issues GETs (no method override), so every entry is cacheable. */
const cache = new Map<string, { data: unknown; at: number }>()

/** Dedupe map: concurrent identical GETs share one in-flight promise. */
const inflight = new Map<string, Promise<unknown>>()

/** Empty the GET cache (e.g. on logout, so the next user sees fresh data). */
export function clearApiCache(): void {
  cache.clear()
}

/** GET `path`, caching the result and sharing the request with any
 *  concurrent callers asking for the same path. */
function fetchAndCache<T>(path: string): Promise<T> {
  const pending = inflight.get(path)
  if (pending) return pending as Promise<T>
  const request = apiFetch<T>(path)
    .then((result) => {
      cache.set(path, { data: result, at: Date.now() })
      inflight.delete(path)
      return result
    })
    .catch((err: unknown) => {
      inflight.delete(path)
      throw err
    })
  inflight.set(path, request)
  return request
}

export interface UseApiResult<T> {
  data: T | null
  error: string | null
  loading: boolean
  reload: () => void
}

/**
 * Fetch `path` (relative to /api) whenever it (or any entry of `deps`)
 * changes. Pass `null` to skip fetching entirely (e.g. when the request
 * depends on a condition such as being authenticated).
 *
 * GET responses are served stale-while-revalidate style: a fresh (<30s)
 * cached entry resolves immediately without hitting the network, a stale
 * entry is shown immediately while the request refreshes in the background.
 */
export function useApi<T>(path: string | null, deps: ReadonlyArray<unknown> = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(path !== null)
  const [reloadNonce, setReloadNonce] = useState(0)

  const reload = useCallback(() => setReloadNonce((n) => n + 1), [])

  useEffect(() => {
    if (path === null) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setError(null)

    const cached = cache.get(path)
    if (cached) {
      // Paint the cached payload right away — no loading flash.
      setData(cached.data as T)
      setLoading(false)
      if (Date.now() - cached.at < CACHE_TTL_MS) return // fresh: skip the network
    } else {
      setLoading(true)
    }

    // No cache, or a stale entry: (re)fetch. With stale data on screen this
    // is a background refresh; concurrent identical GETs are deduped.
    fetchAndCache<T>(path)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (!cached) setError(err instanceof Error ? err.message : 'Request failed')
        // Keep serving stale data when a background refresh fails.
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, reloadNonce, ...deps])

  return { data, error, loading, reload }
}

/* ------------------------------------------------------------------ */
/* API payload types                                                   */
/* ------------------------------------------------------------------ */

export interface ApiClassSession {
  id: string
  subject: string
  code: string
  subjectId?: string
  faculty: string
  facultyId?: string
  startTime: string
  endTime: string
  room: string
  section: string
  sectionId?: string
  day?: number
  status: ClassSession['status']
}

export interface DashboardPayload {
  stats: {
    classesToday: number
    classesCompleted: number
    overallAttendance: number
    subjects: number
    pendingAssignments: number
  }
  todaySessions: ApiClassSession[]
  subjectAttendance: Array<{
    subject: string | null
    code: string | null
    attended: number
    total: number
    percentage: number
  }>
  announcements: Array<{
    id: string
    title: string
    message: string
    date: string
    category: string
  }>
}

export interface TimetableDay {
  day: number
  dayName: string
  sessions: ApiClassSession[]
}

export interface AttendancePayload {
  summary: { overall: number; present: number; absent: number; leave: number; total: number }
  subjects: Array<{ id: string; code: string | null; subject: string | null; held: number; attended: number; percentage: number }>
  overview: Array<{ label: string; value: number }>
  calendar: Array<{ date: string; status: 'present' | 'absent' | 'mixed' | 'none' }>
  quickStats: { thisMonth: number; lastMonth: number; semesterAvg: number; required: number }
}

export interface MaterialsFile {
  id: string
  name: string
  description: string | null
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx'
  subject: string | null
  subjectId: string | null
  uploadedBy: string | null
  date: string
  size: number
  downloadUrl: string | null
}

export interface MaterialsPayload {
  files: MaterialsFile[]
  folders: Array<{ id: string; name: string; fileCount: number }>
  stats: { totalFiles: number; totalSize: number; subjects: number }
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
}

export interface ApiEvent {
  id: string
  title: string
  category: string
  startDate: string
  endDate: string | null
  time: string
  location: string
  isLive: boolean
  createdBy: string
}

export interface EventsPayload {
  featured: ApiEvent | null
  upcoming: ApiEvent[]
  calendarMarks: string[]
  categories: Array<{ category: string; count: number }>
}

export interface SettingsPayload {
  push: boolean
  email: boolean
  announcements: boolean
  reminders: boolean
  theme?: string
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** "09:00" → "09:00 AM", "14:15" → "02:15 PM" (API sends 24h HH:MM). */
export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const hour24 = Number.isFinite(h) ? h : 0
  const ampm = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const minutes = Number.isFinite(m) ? String(m).padStart(2, '0') : '00'
  return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`
}

/** ISO date/timestamp → "14 Aug 2026". */
export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ${MONTHS_SHORT[(m ?? 1) - 1]} ${y}`
}

/** Current date → "16 Aug 2026, Sunday" (header pill). */
export function todayDateLabel(): string {
  const now = new Date()
  return `${now.getDate()} ${MONTHS_SHORT[now.getMonth()]} ${now.getFullYear()}, ${WEEKDAYS_LONG[now.getDay()]}`
}

/** Date-only string → { day, month, year, weekday } for the events page. */
export function parseDateParts(dateStr: string): { day: number; month: string; year: number; weekday: string } {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number)
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
  return {
    day: d ?? 1,
    month: MONTHS_SHORT[(m ?? 1) - 1],
    year: y ?? 1970,
    weekday: WEEKDAYS_LONG[dt.getDay()],
  }
}

export function monthLabel(month: string): string {
  return MONTHS_LONG[Number(month.slice(5, 7)) - 1] ?? month
}

export function toMonthString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y ?? 2026, (m ?? 1) - 1 + delta, 1)
  return toMonthString(d)
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  const decimals = unit === 0 || value >= 100 ? 0 : 1
  return `${value.toFixed(decimals)} ${units[unit]}`
}

/* ------------------------------------------------------------------ */
/* Payload → UI mappers                                                */
/* ------------------------------------------------------------------ */

/** Map an API class session onto the UI shape (12h times, "Room 204" → "204"). */
export function mapClassSession(session: ApiClassSession): ClassSession {
  return {
    id: session.id,
    subject: session.subject,
    code: session.code,
    faculty: session.faculty,
    startTime: formatTimeLabel(session.startTime),
    endTime: formatTimeLabel(session.endTime),
    room: session.room.replace(/^Room\s+/i, ''),
    section: session.section,
    status: session.status,
  }
}

const YEAR_LABELS: Record<number, string> = {
  1: '1st Year',
  2: '2nd Year',
  3: '3rd Year',
  4: '4th Year',
}

/** Map the raw auth user payload onto the Student shape used by pages. */
export function mapStudentUser(user: ApiUser): Student {
  const name = user.name ?? user.firstName ?? user.email
  const year = typeof user.year === 'number' ? (YEAR_LABELS[user.year] ?? `${user.year}th Year`) : ''
  return {
    id: user.id,
    name,
    firstName: user.firstName ?? name.split(' ')[0],
    department: user.department ?? '',
    year,
    studentId: user.studentId ?? '',
    email: user.email,
    overallAttendance: Number(user.overallAttendance ?? 0) || 0,
    avatarUrl: (user as any).avatarUrl ?? null,
  }
}

/** In-app notification inbox item (admin-sent, addressed to this student). */
export interface NotificationItem {
  id: string
  title: string
  body: string
  createdAt: string
  readAt: string | null
}

export interface MyNotificationsPayload {
  items: NotificationItem[]
  unread: number
}

/** Donut segments for the dashboard attendance overview. */
export function attendanceBreakdownFrom(payload: AttendancePayload | null): AttendanceBreakdown[] {
  const total = payload?.summary?.total ?? 0
  if (!total) return []
  const byLabel = new Map((payload?.overview ?? []).map((s) => [s.label, s.value]))
  const pct = (label: string) => Math.round(((byLabel.get(label) ?? 0) / total) * 100)
  return [
    { label: 'Present', value: pct('Present'), color: '#3BA7F2' },
    { label: 'Absent', value: pct('Absent'), color: '#93CDF7' },
    { label: 'Leave', value: pct('Leave'), color: '#D8ECFD' },
  ]
}
