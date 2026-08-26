import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardLayout } from './layouts/DashboardLayout'
import { PageLoader } from './components/Loading'

// Route-level code splitting: every page ships as its own lazy chunk so the
// initial bundle only carries the router, layout and shared primitives.
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Timetable = lazy(() => import('./pages/Timetable').then((m) => ({ default: m.Timetable })))
const Attendance = lazy(() => import('./pages/Attendance').then((m) => ({ default: m.Attendance })))
const StudyMaterials = lazy(() =>
  import('./pages/StudyMaterials').then((m) => ({ default: m.StudyMaterials })),
)
const Events = lazy(() => import('./pages/Events').then((m) => ({ default: m.Events })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))

/** Walker fallback for chunk-loaded routes — shows the section's own
 *  dedicated label so it never fights the page's data-loading state. */
function StudentPageFallback({ label }: { label: string }) {
  return <PageLoader label={label} className="min-h-[60vh]" />
}

/** Full-page fallback for the standalone login screen. */
function LoginFallback({ label }: { label: string }) {
  return <PageLoader label={label} className="min-h-screen" />
}

/** Root "/" is auth-aware: authenticated users go to dashboard, guests to login.
 *  Using a component (not a static <Navigate>) prevents an authenticated user
 *  from ever landing on /login via history back. */
function RootRedirect() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Navigate to="/login" replace />
}

/** Catch-all is also auth-aware so unknown URLs never expose login to authed users. */
function CatchAllRedirect() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Navigate to="/login" replace />
}

/** Blocks authenticated users from seeing the login screen.
 *  If they hit back to /login or type it directly, they are bounced to the
 *  page they came from (or dashboard) with `replace` so the login entry is
 *  removed from history — pressing back again never shows login. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  if (isAuthenticated) return <Navigate to={from} replace />
  return <>{children}</>
}

/** Blocks unauthenticated users from the dashboard shell. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Suspense fallback={<LoginFallback label="Loading sign-in" />}>
              <Login />
            </Suspense>
          </GuestOnly>
        }
      />
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<StudentPageFallback label="Loading your dashboard" />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/timetable"
          element={
            <Suspense fallback={<StudentPageFallback label="Fetching timetable" />}>
              <Timetable />
            </Suspense>
          }
        />
        <Route
          path="/attendance"
          element={
            <Suspense fallback={<StudentPageFallback label="Fetching attendance" />}>
              <Attendance />
            </Suspense>
          }
        />
        <Route
          path="/materials"
          element={
            <Suspense fallback={<StudentPageFallback label="Fetching materials" />}>
              <StudyMaterials />
            </Suspense>
          }
        />
        <Route
          path="/events"
          element={
            <Suspense fallback={<StudentPageFallback label="Fetching events" />}>
              <Events />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<StudentPageFallback label="Loading settings" />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}
