import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { GraduationCap, LogOut, User } from 'lucide-react'
import { Header } from '../components/Header'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Toggle } from '../components/Toggle'
import { Skeleton, SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { apiFetch, useApi, type SettingsPayload } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1 rounded-xl border border-line bg-primary-lighter/60 px-4 py-2.5 text-sm font-semibold text-ink">
        {value}
      </p>
    </div>
  )
}

export function Settings() {
  const { openMenu } = useOutletContext<DashboardLayoutContext>()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: settings, error, loading, reload } = useApi<SettingsPayload>('/settings')

  const pending = loading && !settings
  const failed = error && !settings

  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [announcementsOn, setAnnouncementsOn] = useState(true)
  const [assignmentReminders, setAssignmentReminders] = useState(true)
  const [lightTheme, setLightTheme] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [applied, setApplied] = useState(false)

  // Apply the persisted settings once they arrive from the API.
  useEffect(() => {
    if (!settings || applied) return
    setPushEnabled(settings.push)
    setEmailEnabled(settings.email)
    setAnnouncementsOn(settings.announcements)
    setAssignmentReminders(settings.reminders)
    setLightTheme(settings.theme !== 'dark')
    setApplied(true)
  }, [settings, applied])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError('')
    try {
      await apiFetch<SettingsPayload>('/settings', {
        method: 'PATCH',
        body: {
          push: pushEnabled,
          email: emailEnabled,
          announcements: announcementsOn,
          reminders: assignmentReminders,
          theme: lightTheme ? 'light' : 'dark',
        },
      })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save settings. Try again.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <Header title="Settings" subtitle="Manage your account and preferences." onMenuClick={openMenu} />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <>
          {/* Profile */}
          <Card>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-dark">
                <GraduationCap size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Profile</h2>
                <p className="text-xs text-ink-soft">Your academic identity on the portal.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-[62px]" />
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Notifications */}
            <Card>
              <h2 className="mb-4 text-base font-semibold text-ink">Notifications</h2>
              <SkeletonRows rows={4} />
            </Card>

            {/* Appearance + Security */}
            <div className="space-y-6">
              <Card>
                <h2 className="mb-4 text-base font-semibold text-ink">Appearance</h2>
                <SkeletonRows rows={1} />
              </Card>
              <Card>
                <h2 className="mb-4 text-base font-semibold text-ink">Security</h2>
                <SkeletonRows rows={1} />
              </Card>
            </div>
          </div>
        </>
      ) : (
      <>
      {/* Profile */}
      <Card>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-dark">
            <GraduationCap size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">Profile</h2>
            <p className="text-xs text-ink-soft">Your academic identity on the portal.</p>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Name" value={user?.name ?? ''} />
            <Field label="Student ID" value={user?.studentId ?? ''} />
            <Field label="Email" value={user?.email ?? ''} />
            <Field label="Department" value={user?.department ?? ''} />
            <Field label="Year" value={user?.year ?? ''} />
            <Field label="Overall Attendance" value={`${user?.overallAttendance ?? 0}%`} />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button type="submit">Save Changes</Button>
            {saved && (
              <span role="status" className="animate-fade-in text-sm font-medium text-success">
                Changes saved ✓
              </span>
            )}
            {saveError && (
              <span role="alert" className="text-sm font-medium text-danger">
                {saveError}
              </span>
            )}
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Notifications */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-ink">Notifications</h2>
          <div className="divide-y divide-line">
            <Toggle
              label="Push notifications"
              description="Receive alerts on your device."
              checked={pushEnabled}
              onChange={setPushEnabled}
            />
            <Toggle
              label="Email notifications"
              description="Get updates delivered to your inbox."
              checked={emailEnabled}
              onChange={setEmailEnabled}
            />
            <Toggle
              label="Announcements"
              description="Exam schedules, events and college news."
              checked={announcementsOn}
              onChange={setAnnouncementsOn}
            />
            <Toggle
              label="Assignment reminders"
              description="Remind me before deadlines."
              checked={assignmentReminders}
              onChange={setAssignmentReminders}
            />
          </div>
        </Card>

        {/* Appearance + Security */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-ink">Appearance</h2>
            <div className="divide-y divide-line">
              <Toggle
                label="Light theme"
                description="The portal uses a light sky-blue theme by default."
                checked={lightTheme}
                onChange={setLightTheme}
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold text-ink">Security</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" onClick={handleLogout} className="text-danger hover:bg-danger/10 hover:text-danger">
                <LogOut size={16} aria-hidden="true" />
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </>
      )}

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-ink-soft/70">
        <User size={12} aria-hidden="true" />
        Signed in as {user?.name ?? ''} • {user?.studentId ?? ''}
      </p>
    </div>
  )
}
