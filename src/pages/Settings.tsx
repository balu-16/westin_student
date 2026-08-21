import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { GraduationCap, LogOut, User } from 'lucide-react'
import { Header } from '../components/Header'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Toggle } from '../components/Toggle'
import { Skeleton, SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { Avatar } from '../components/Avatar'
import { apiFetch, uploadBytes, useApi, type SettingsPayload } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="mt-1 break-words rounded-xl border border-line bg-primary-lighter/60 px-4 py-2.5 text-sm font-semibold text-ink">
        {value}
      </p>
    </div>
  )
}

export function Settings() {
  const { openMenu, toggleSidebar, collapsed } = useOutletContext<DashboardLayoutContext>()
  const { user, logout, updateAvatar } = useAuth()
  const navigate = useNavigate()
  const { data: settings, error, loading, reload } = useApi<SettingsPayload>('/settings')
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarSuccess, setAvatarSuccess] = useState('')

  const pending = loading && !settings
  const failed = error && !settings

  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [announcementsOn, setAnnouncementsOn] = useState(true)
  const [assignmentReminders, setAssignmentReminders] = useState(true)
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

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    setAvatarSuccess('')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setAvatarError('Only JPEG, PNG and WebP images are allowed')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be 5 MB or smaller')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setAvatarUploading(true)
    try {
      const { url, path } = await apiFetch<{ url: string; path: string }>('/profile/avatar/upload-url', {
        method: 'POST',
        body: { filename: file.name, contentType: file.type, size: file.size },
      })
      await uploadBytes(url, file)
      const res = await apiFetch<{ avatarUrl: string | null; user: any }>('/profile/avatar', {
        method: 'PATCH',
        body: { path },
      })
      const newUrl = res.avatarUrl ?? res.user?.avatarUrl ?? null
      updateAvatar(newUrl)
      setAvatarSuccess('Profile picture updated')
      setTimeout(() => setAvatarSuccess(''), 2000)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setAvatarUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleAvatarRemove = async () => {
    setAvatarError('')
    setAvatarSuccess('')
    setAvatarUploading(true)
    try {
      await apiFetch('/profile/avatar', { method: 'DELETE' })
      updateAvatar(null)
      setAvatarSuccess('Profile picture removed')
      setTimeout(() => setAvatarSuccess(''), 2000)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Could not remove picture')
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Header title="Settings" subtitle="Manage your account and preferences." onMenuClick={openMenu} onToggleSidebar={toggleSidebar} collapsed={collapsed} />

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

            <Card>
              <h2 className="mb-4 text-base font-semibold text-ink">Security</h2>
              <SkeletonRows rows={1} />
            </Card>
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
        {/* Avatar */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4">
          <Avatar name={user?.name ?? ''} src={user?.avatarUrl ?? null} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Profile picture</p>
            <p className="text-xs text-ink-soft">JPEG, PNG or WebP — max 5 MB. Visible in sidebar.</p>
            {avatarError && <p role="alert" className="mt-1 text-xs font-medium text-danger">{avatarError}</p>}
            {avatarSuccess && <p role="status" className="mt-1 text-xs font-medium text-success">{avatarSuccess}</p>}
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarPick} />
            <Button variant="ghost" onClick={() => fileRef.current?.click()} disabled={avatarUploading}>
              {avatarUploading ? 'Uploading…' : user?.avatarUrl ? 'Change' : 'Upload'}
            </Button>
            {user?.avatarUrl && (
              <Button variant="ghost" className="text-danger hover:bg-danger/10" onClick={handleAvatarRemove} disabled={avatarUploading}>
                Remove
              </Button>
            )}
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
          <div className="mt-6 flex flex-wrap items-center gap-3">
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
      </>
      )}

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-ink-soft/70">
        <User size={12} aria-hidden="true" />
        Signed in as {user?.name ?? ''} • {user?.studentId ?? ''}
      </p>
    </div>
  )
}
