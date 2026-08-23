import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardLayout } from './layouts/DashboardLayout'
import { InlineSpinner } from './components/Loading'

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

/** Full-page Suspense fallback for routes outside the dashboard shell. */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <InlineSpinner label="Loading…" />
    </div>
  )
}

/** Suspense fallback for pages rendered inside the dashboard layout — the
 *  shell (sidebar/header) is already on screen, so this stays lightweight. */
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <InlineSpinner label="Loading…" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* No public landing page — everyone goes straight to login
                (authenticated visitors are bounced to /dashboard by Login). */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/login"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="/timetable"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Timetable />
                  </Suspense>
                }
              />
              <Route
                path="/attendance"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Attendance />
                  </Suspense>
                }
              />
              <Route
                path="/materials"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <StudyMaterials />
                  </Suspense>
                }
              />
              <Route
                path="/events"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Events />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Settings />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}
