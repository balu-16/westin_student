import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '../components/Button'
import { FallingIcons, HotelScene } from '../components/HotelScene'
import westinLogoAvif from '../assets/images/westin-logo.avif'
import westinLogoPng from '../assets/images/westin-logo.png'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../lib/api'

// Preload the AVIF logo via its hashed build URL (Vite rewrites the import to
// e.g. /assets/westin-logo-BOnCdI7I.avif, which is why index.html can't hard-
// code it). Runs at module evaluation — before Login first renders/paints —
// so the logo request is already in flight when <picture> mounts.
if (typeof document !== 'undefined' && !document.querySelector('link[data-login-logo]')) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.type = 'image/avif'
  link.href = westinLogoAvif
  link.dataset.loginLogo = ''
  document.head.appendChild(link)
}

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your student ID / email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      let message: string
      if (err instanceof ApiError) {
        const payload = err.payload as { code?: string; message?: string } | null
        const code = payload?.code
        const serverMessage = typeof payload?.message === 'string' ? payload.message : ''
        if (code === 'ACCOUNT_NOT_REGISTERED' || /not registered/i.test(serverMessage)) {
          message = 'This email is not registered. Please contact your college administration.'
        } else if (code === 'INVALID_CREDENTIALS' || /incorrect/i.test(serverMessage)) {
          message = 'The password is incorrect.'
        } else if (code === 'ACCOUNT_INACTIVE' || /inactive/i.test(serverMessage)) {
          message = 'This account is inactive. Contact your college administration.'
        } else {
          message = err.message || 'Unable to sign in right now. Please try again.'
        }
      } else {
        message =
          err instanceof Error && err.message
            ? err.message
            : 'Unable to sign in right now. Please try again.'
      }
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-page">
      {/* Left — Westin College hotel & business scene */}
      <div className="relative hidden w-[46%] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#5FB7F5] via-[#3BA7F2] to-[#168BE5] p-12 lg:flex">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        {/* Very subtle slow-moving shimmer across the gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-shimmer bg-[linear-gradient(115deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.09)_50%,rgba(255,255,255,0)_70%)] bg-[length:220%_100%]"
        />

        {/* Ambient falling hospitality/business icons (behind text and scene) */}
        <FallingIcons />

        <div className="relative z-10 w-full">
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome Back!
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-white/85 sm:text-lg">
              Sign in to access your Westin College of Hotel and Business Management dashboard.
            </p>
          </div>
          <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <HotelScene />
          </div>
        </div>
      </div>

      {/* Right — login card */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary-light blur-3xl lg:hidden"
        />
        <div className="relative w-full max-w-md animate-fade-in-up">
          <div className="rounded-[20px] border border-line bg-white p-7 shadow-[0_8px_30px_rgba(20,33,61,0.06)] sm:p-9">
            <div className="mb-8 flex flex-col items-center text-center">
              <picture>
                <source srcSet={westinLogoAvif} type="image/avif" />
                <img
                  src={westinLogoPng}
                  width={575}
                  height={294}
                  alt="Westin College — College Of Hotel Management, College Of Business Management, Junior College"
                  className="h-16 w-auto object-contain sm:h-[72px]"
                />
              </picture>
              <p className="mt-3 text-sm font-semibold text-ink-soft">Student Portal</p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Student Login</h1>
              <p className="mt-1.5 text-sm text-ink-soft">Enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                    Student ID / Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/70"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="text"
                      autoComplete="username"
                      placeholder="e.g. STU-2025-001"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-primary-lighter/60 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/70"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border border-line bg-primary-lighter/60 pl-10 pr-11 text-sm text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:text-primary lg:h-8 lg:w-8"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-5 rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-danger">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" loading={loading} className="mt-6 w-full">
                {loading ? 'Signing in…' : 'Login'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-soft">
              Don&apos;t have an account?{' '}
              <span className="font-semibold text-primary-dark">Contact your college administration</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
