import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '../components/Button'
import { LoginPullScene } from '../components/LoginPullScene'
import { InstallPwaBanner } from '../components/InstallPwaBanner'
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
    <div className="login-page-shell">
      <header className="login-page-header mx-auto flex w-full max-w-[1280px] items-center justify-between px-3 py-2 sm:px-6">
        <div className="flex items-center gap-3">
          <picture>
            <source srcSet={westinLogoAvif} type="image/avif" />
            <img
              src={westinLogoPng}
              width={575}
              height={294}
              alt="Westin College"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </picture>
          <div className="hidden border-l border-[#d4e1e9] pl-3 sm:block">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#325d77]">
              Student access
            </p>
            <p className="text-xs text-[#5d6f7e]">Your next chapter at Westin</p>
          </div>
        </div>
        <span className="rounded-full border border-[#cce7f7] bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-[#32637c]">
          Westin College
        </span>
      </header>

      <main className="login-page-main">
        <LoginPullScene>
          <div className="login-card">
            <div className="mb-7 flex items-center justify-between gap-3">
              <span className="rounded-full border border-[#e0ece6] bg-[#eef5f4] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#32637c]">
                Student portal
              </span>
              <span className="text-[10px] font-medium text-[#6b7f8d]">Secure sign-in</span>
            </div>

            <div className="mb-7 flex flex-col items-center text-center">
              <picture>
                <source srcSet={westinLogoAvif} type="image/avif" />
                <img
                  src={westinLogoPng}
                  width={575}
                  height={294}
                  alt="Westin College — College Of Hotel Management, College Of Business Management, Junior College"
                  className="h-14 w-auto object-contain sm:h-16"
                />
              </picture>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">Student Login</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Enter your student ID or email and password to continue.
              </p>
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
                      className="h-12 w-full rounded-xl border border-line bg-[#f9fbfc] pl-10 pr-4 text-base text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
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
                      className="h-12 w-full rounded-xl border border-line bg-[#f9fbfc] pl-10 pr-11 text-base text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:text-primary"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-5 rounded-xl border border-danger/20 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" loading={loading} className="mt-6 w-full">
                {loading ? 'Signing in…' : 'Login'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm leading-relaxed text-ink-soft">
              Don&apos;t have an account?{' '}
              <a href="mailto:balarakeshg@gmail.com" className="font-semibold text-primary-dark hover:text-primary">
                Contact your college administration
              </a>
            </p>
          </div>
        </LoginPullScene>

        <div className="login-page-install mx-auto w-full max-w-[470px]">
          <InstallPwaBanner />
        </div>
      </main>

      <footer className="login-page-footer mx-auto flex w-full max-w-[1264px] justify-center px-3 py-6 text-center text-xs text-ink-soft sm:justify-between sm:px-6">
        <span className="font-semibold text-[#536b7e]">Learn. Grow. Belong.</span>
        <span className="hidden sm:inline">Westin College · Vijayawada</span>
        <span>Need help? Contact the college IT desk.</span>
      </footer>
    </div>
  )
}
