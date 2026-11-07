import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import apiRequest from '../services/api'

function Register() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [username, setUsername] = useState('')
  const [availability, setAvailability] = useState('idle')

  const cleanUsername = username.trim()
  const validUsername = /^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)

  useEffect(() => {
    if (!validUsername) return

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setAvailability('checking')

      try {
        const data = await apiRequest(
          `/auth/username-availability?username=${encodeURIComponent(cleanUsername)}`,
          {
            method: 'GET',
            signal: controller.signal,
          }
        )

        if (!controller.signal.aborted) {
          setAvailability(data.available ? 'available' : 'taken')
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setAvailability('error')
        }
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [cleanUsername, validUsername])

  async function handleRegister(event) {
    event.preventDefault()

    if (isSubmitting) return

    setError('')

    const formData = new FormData(event.currentTarget)

    const fullName = formData.get('fullName').trim()
    const email = formData.get('email').trim()
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (!validUsername || availability !== 'available') {
      setError(
        'Please choose a username that has been confirmed as available.'
      )
      return
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match. Please try again.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          username: cleanUsername,
          email,
          password,
          confirmPassword,
        }),
      })

      navigate('/login', {
        state: {
          message:
            data.message ||
            'Account created successfully. Please sign in.',
          email: data.user.email,
        },
      })
    } catch (err) {
      setError(
        err.message || 'Registration failed. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden bg-white rounded-3xl border border-emerald-100 shadow-[0_20px_60px_-20px_rgba(6,78,59,0.18)] p-6 sm:p-9 transition-all duration-300 hover:shadow-[0_25px_70px_-20px_rgba(6,78,59,0.25)]">

        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-green-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-700 to-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/20 transition-transform duration-300 hover:scale-110 hover:-rotate-3">
              <GraduationCap size={34} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-4">
              <Sparkles size={13} />
              JOIN THE COMMUNITY
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Create Account
            </h1>

            <p className="text-slate-500 mt-3 text-sm sm:text-base">
              Connect with students and learn together.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              <XCircle size={19} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Full Name
              </label>

              <div className="relative group">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-emerald-300"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Username
              </label>

              <div className="relative group">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                />

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_]+"
                  title="Use 3–20 letters, numbers, or underscores."
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setAvailability('idle')
                    setError('')
                  }}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-emerald-300"
                />
              </div>

              <div className="text-xs mt-2" aria-live="polite">
                {username && !validUsername && (
                  <p className="text-red-600">
                    Use 3–20 letters, numbers, or underscores.
                  </p>
                )}

                {validUsername && availability === 'checking' && (
                  <p className="text-slate-500">
                    Checking username...
                  </p>
                )}

                {availability === 'available' && (
                  <p className="text-emerald-600 font-medium">
                    Username is available.
                  </p>
                )}

                {availability === 'taken' && (
                  <p className="text-red-600 font-medium">
                    Username is already taken. Try another one.
                  </p>
                )}

                {availability === 'error' && (
                  <p className="text-red-600">
                    Unable to check username. Please try again.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email Address
              </label>

              <div className="relative group">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-emerald-300"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>

              <div className="relative group">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-emerald-300"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 transition-colors"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Use at least 8 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Confirm Password
              </label>

              <div className="relative group">
                <Lock
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-emerald-300"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !validUsername ||
                availability !== 'available'
              }
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/20 hover:from-emerald-700 hover:to-green-500 hover:shadow-xl hover:shadow-emerald-900/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}

              {!isSubmitting && (
                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>

          </form>

          <p className="text-center text-sm text-slate-600 mt-7">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-7">
            <ShieldCheck size={15} className="text-emerald-600" />
            Your learning journey starts here.
          </div>

          <div className="text-center mt-6 pt-5 border-t border-emerald-100">
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register