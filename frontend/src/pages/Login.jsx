import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiRequest from '../services/api'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()

    if (loading) return

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      })

      login(data.user)

      const destination = location.state?.from || '/dashboard'

      navigate(destination, { replace: true })
    } catch (err) {
      setError(
        err.message || 'Unable to sign in. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden bg-white rounded-3xl border border-emerald-100 shadow-[0_20px_60px_-20px_rgba(6,78,59,0.18)] p-6 sm:p-9 transition-all duration-300 hover:shadow-[0_25px_70px_-20px_rgba(6,78,59,0.25)]">

        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-green-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">

          <div className="text-center mb-8">
            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-700 to-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-900/20 transition-transform duration-300 hover:scale-110 hover:-rotate-3">
              <GraduationCap size={34} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-4">
              <Sparkles size={13} />
              YOUR LEARNING COMMUNITY
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h1>

            <p className="text-slate-500 mt-3 text-sm sm:text-base">
              Sign in and continue learning together.
            </p>
          </div>

          {message && (
            <div
              role="status"
              className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

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
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/20 hover:from-emerald-700 hover:to-green-500 hover:shadow-xl hover:shadow-emerald-900/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Signing in...' : 'Sign In'}

              {!loading && (
                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>

          </form>

          <p className="text-center text-sm text-slate-600 mt-7">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              Create an account
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

export default Login