
import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Save,
  ShieldCheck,
  UserRound,
  CheckCircle2,
  FileText,
  AtSign,
  Building2,
  Hash,
  LoaderCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiRequest from '../services/api'

function Profile() {
  const { user } = useAuth()

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    username: '',
    studentId: '',
    institution: '',
    department: '',
    level: '',
    bio: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      setError('')

      try {
        const data = await apiRequest('/profile')

        if (cancelled) return

        const savedProfile = data.profile || {}

        setProfile({
          fullName: `${savedProfile.firstName || ''} ${savedProfile.lastName || ''}`.trim(),
          email: data.user?.email || user?.email || '',
          username: savedProfile.username || '',
          studentId: savedProfile.studentId || '',
          institution: savedProfile.institution || '',
          department: savedProfile.department || '',
          level: savedProfile.level || '',
          bio: savedProfile.bio || '',
        })
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load your profile.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [user?.email])

  function handleChange(event) {
    const { name, value } = event.target

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }))

    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const fullName = profile.fullName.trim()
      const nameParts = fullName.split(/\s+/)

      if (nameParts.length < 2 || !nameParts[0] || !nameParts[1]) {
        throw new Error('Please enter both your first name and last name.')
      }

      const username = profile.username.trim()

      if (username.length < 3 || username.length > 20) {
        throw new Error('Username must be between 3 and 20 characters.')
      }

      const data = await apiRequest('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          username,
          studentId: profile.studentId.trim() || null,
          institution: profile.institution.trim() || null,
          department: profile.department.trim() || null,
          level: profile.level || null,
          bio: profile.bio.trim() || null,
        }),
      })

      const savedProfile = data.profile || {}

      setProfile((previousProfile) => ({
        ...previousProfile,
        fullName: `${savedProfile.firstName || nameParts[0]} ${savedProfile.lastName || nameParts.slice(1).join(' ')}`.trim(),
        username: savedProfile.username || username,
        studentId: savedProfile.studentId || '',
        institution: savedProfile.institution || '',
        department: savedProfile.department || '',
        level: savedProfile.level || '',
        bio: savedProfile.bio || '',
      }))

      setMessage('Your profile has been updated successfully.')
    } catch (err) {
      setError(err.message || 'Unable to update your profile.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-[#F7F9F6] border border-[#E3EAE3] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all'

  const labelClass =
    'block text-sm font-semibold text-slate-700 mb-2'

  const initial =
    profile.fullName.trim().charAt(0).toUpperCase() || 'U'

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <LoaderCircle size={32} className="animate-spin text-[#315C4C]" />
        <p className="text-sm text-slate-500">Loading your profile...</p>
      </div>
    )
  }

  if (error && !profile.email) {
    return (
      <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
        <p className="font-semibold">Unable to load your profile</p>
        <p className="text-sm mt-2">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-semibold underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-8">

      {/* Page Heading */}
      <section>
        <p className="text-xs font-bold text-[#668B72] tracking-[0.18em] uppercase">
          Account Management
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
          My Profile
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Manage your personal and academic information.
        </p>
      </section>

      {/* Profile Overview */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-8 shadow-lg shadow-[#183D32]/10">

        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full border border-white/10" />
        <div className="absolute -right-3 -top-3 w-32 h-32 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-[#DDE8DE] text-[#183D32] flex items-center justify-center text-4xl font-bold border-4 border-white/20 shadow-lg">
              {initial}
            </div>

            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#315C4C] shadow">
              <UserRound size={17} />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <p className="text-xs text-emerald-100/70 font-semibold uppercase tracking-wider">
              Student Profile
            </p>

            <h2 className="text-2xl font-bold text-white mt-2 break-words">
              {profile.fullName || 'Complete your profile'}
            </h2>

            <p className="text-sm text-emerald-100/80 mt-1">
              {profile.department || 'Department not added'}
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
                <GraduationCap size={14} />
                {profile.level || 'Level not added'}
              </span>

              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
                <ShieldCheck size={14} />
                {user?.role === 'ADMIN'
                  ? 'Administrator'
                  : user?.role === 'MODERATOR'
                    ? 'Moderator'
                    : 'Student Account'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Personal Information */}
      <section className="bg-white border border-[#E9EEE9] rounded-2xl p-5 sm:p-7 lg:p-8 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <User size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Personal Information
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Update your student profile details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name
            </label>

            <div className="relative">
              <User size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={profile.fullName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address
            </label>

            <div className="relative">
              <Mail size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                readOnly
                className={`${inputClass} cursor-not-allowed opacity-75`}
              />
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Your registered email address is currently read-only.
            </p>
          </div>

          {/* Username and Matric Number */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="username" className={labelClass}>
                Username
              </label>

              <div className="relative">
                <AtSign size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profile.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={20}
                  className={inputClass}
                  placeholder="Your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="studentId" className={labelClass}>
                Matric Number
              </label>

              <div className="relative">
                <Hash size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={profile.studentId}
                  onChange={handleChange}
                  maxLength={50}
                  className={inputClass}
                  placeholder="Your student id or matric number"
                />
              </div>
            </div>
          </div>

          {/* Institution */}
          <div>
            <label htmlFor="institution" className={labelClass}>
              Institution
            </label>

            <div className="relative">
              <Building2 size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

              <input
                id="institution"
                name="institution"
                type="text"
                value={profile.institution}
                onChange={handleChange}
                maxLength={150}
                className={inputClass}
                placeholder="Your university or institution"
              />
            </div>
          </div>

          {/* Department and Level */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="department" className={labelClass}>
                Department
              </label>

              <div className="relative">
                <BookOpen size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

                <input
                  id="department"
                  name="department"
                  type="text"
                  value={profile.department}
                  onChange={handleChange}
                  maxLength={100}
                  className={inputClass}
                  placeholder="Your department"
                />
              </div>
            </div>

            <div>
              <label htmlFor="level" className={labelClass}>
                Academic Level
              </label>

              <div className="relative">
                <GraduationCap size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]" />

                <select
                  id="level"
                  name="level"
                  value={profile.level}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select your level</option>
                  <option value="100 Level">100 Level</option>
                  <option value="200 Level">200 Level</option>
                  <option value="300 Level">300 Level</option>
                  <option value="400 Level">400 Level</option>
                  <option value="500 Level">500 Level</option>
                  <option value="600 Level">600 Level</option>
                </select>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div>
            <label htmlFor="bio" className={labelClass}>
              About Me
            </label>

            <div className="relative">
              <FileText size={19} className="absolute left-3 top-4 text-[#668B72]" />

              <textarea
                id="bio"
                name="bio"
                rows={5}
                value={profile.bio}
                onChange={handleChange}
                maxLength={500}
                placeholder="Tell other students about yourself..."
                className={`${inputClass} pl-11 resize-y`}
              />
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Share your interests, learning goals and academic interests.
            </p>
          </div>

          {/* Success Feedback */}
          {message && (
            <div className="flex items-center gap-3 bg-[#EDF3EE] border border-[#DCE7DD] text-[#315C4C] p-4 rounded-xl text-sm">
              <CheckCircle2 size={19} className="shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Error Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Save */}
          <div className="border-t border-[#EDF1ED] pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#183D32] text-white rounded-xl font-semibold text-sm hover:bg-[#315C4C] transition-colors shadow-lg shadow-[#183D32]/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </section>

    </div>
  )
}

export default Profile
