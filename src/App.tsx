import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardLayout } from './layouts/DashboardLayout'
import { PageLoader } from './components/Loading'
import { PublicLayout } from './public/PublicLayout'

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
const OtpDemo = lazy(() => import('./pages/OtpDemo').then((m) => ({ default: m.OtpDemo })))
const PublicHome = lazy(() => import('./public/PublicHome').then((m) => ({ default: m.PublicHome })))
const PublicPage = lazy(() => import('./public/PublicPage').then((m) => ({ default: m.PublicPage })))
const PublicSearch = lazy(() => import('./public/PublicPage').then((m) => ({ default: m.PublicSearch })))
const PublicNotFound = lazy(() => import('./public/PublicPage').then((m) => ({ default: m.NotFound })))

/** Walker fallback for chunk-loaded routes — shows the section's own
 *  dedicated label so it never fights the page's data-loading state. */
function StudentPageFallback({ label }: { label: string }) {
  return <PageLoader label={label} className="min-h-[60vh]" />
}

/** Full-page fallback for the standalone login screen. */
function LoginFallback({ label }: { label: string }) {
  return <PageLoader label={label} className="min-h-screen" />
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
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader label="Opening Westin" className="min-h-[60vh]" />}>
              <PublicHome />
            </Suspense>
          }
        />
        <Route
          path="/about/*"
          element={
            <Suspense fallback={<PageLoader label="Opening About Westin" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/why-westin"
          element={
            <Suspense fallback={<PageLoader label="Opening Why Westin" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/partners/*"
          element={
            <Suspense fallback={<PageLoader label="Opening partners" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/programs/*"
          element={
            <Suspense fallback={<PageLoader label="Opening programs" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/campus/*"
          element={
            <Suspense fallback={<PageLoader label="Opening campus life" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/placements"
          element={
            <Suspense fallback={<PageLoader label="Opening placements" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/career-planner"
          element={
            <Suspense fallback={<PageLoader label="Opening career planning" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/news/*"
          element={
            <Suspense fallback={<PageLoader label="Opening news" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/blog/*"
          element={
            <Suspense fallback={<PageLoader label="Opening the journal" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/gallery/*"
          element={
            <Suspense fallback={<PageLoader label="Opening gallery" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/magazine"
          element={
            <Suspense fallback={<PageLoader label="Opening the Westin shelf" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/testimonials/*"
          element={
            <Suspense fallback={<PageLoader label="Opening stories" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/success-stories/*"
          element={
            <Suspense fallback={<PageLoader label="Opening success stories" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/admissions"
          element={
            <Suspense fallback={<PageLoader label="Opening admissions" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageLoader label="Opening contact" className="min-h-[60vh]" />}>
              <PublicPage />
            </Suspense>
          }
        />
        <Route
          path="/search"
          element={
            <Suspense fallback={<PageLoader label="Opening search" className="min-h-[60vh]" />}>
              <PublicSearch />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader label="Opening page" className="min-h-[60vh]" />}>
              <PublicNotFound />
            </Suspense>
          }
        />
      </Route>
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
        <Route
          path="/otp-demo"
          element={
            <Suspense fallback={<StudentPageFallback label="Loading OTP demo" />}>
              <OtpDemo />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
