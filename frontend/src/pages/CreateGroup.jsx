
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  PlusCircle,
  BookOpen,
  CalendarDays,
  Clock,
  Monitor,
  CheckCircle2,
  AlertCircle,
  UsersRound,
  MapPin,
  Video,
} from 'lucide-react'
import { useGroups } from '../context/GroupContext'

function CreateGroup() {
  const { addGroup } = useGroups()

  const [groupName, setGroupName] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [description, setDescription] = useState('')
  const [meetingDay, setMeetingDay] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [format, setFormat] = useState('ONLINE')
  const [meetingLink, setMeetingLink] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('10')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) return

    setError('')
    setMessage('')

    if (
      !groupName.trim() ||
      !courseCode.trim() ||
      !description.trim() ||
      !meetingDay ||
      !meetingTime
    ) {
      setError('Please complete all required fields.')
      return
    }

    if (groupName.trim().length < 3) {
      setError('Group name must contain at least 3 characters.')
      return
    }

    if (courseCode.trim().length < 3) {
      setError('Please enter a valid course code.')
      return
    }

    if (description.trim().length < 10) {
      setError('Description must contain at least 10 characters.')
      return
    }

    if (
      (format === 'ONLINE' || format === 'HYBRID') &&
      !meetingLink.trim()
    ) {
      setError('Please provide a meeting link.')
      return
    }

    if (
      (format === 'IN_PERSON' || format === 'HYBRID') &&
      !location.trim()
    ) {
      setError('Please provide the meeting location.')
      return
    }

    const groupCapacity = Number(capacity)

    if (
      !Number.isInteger(groupCapacity) ||
      groupCapacity < 2 ||
      groupCapacity > 100
    ) {
      setError('Group capacity must be between 2 and 100.')
      return
    }

    setLoading(true)

    try {
      await addGroup({
        name: groupName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        description: description.trim(),
        schedule: `${meetingDay}, ${meetingTime}`,
        format,
        meetingLink: meetingLink.trim() || undefined,
        location: location.trim() || undefined,
        capacity: groupCapacity,
        visibility: 'PUBLIC',
      })

      setMessage('Your study group has been created successfully!')

      setGroupName('')
      setCourseCode('')
      setDescription('')
      setMeetingDay('')
      setMeetingTime('')
      setFormat('ONLINE')
      setMeetingLink('')
      setLocation('')
      setCapacity('10')
    } catch (err) {
      setError(err.message || 'Unable to create your study group.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-[#F7F9F6] border border-[#E3EAE3] rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all placeholder:text-slate-400'

  const labelClass =
    'block text-sm font-semibold text-slate-700 mb-2'

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-8">

      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#315C4C] transition-colors"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-8 lg:p-10">

        <div className="absolute -right-12 -top-12 w-56 h-56 border border-white/10 rounded-full" />
        <div className="absolute -right-2 -top-2 w-36 h-36 border border-white/10 rounded-full" />

        <div className="relative z-10 max-w-2xl">

          <div className="w-12 h-12 bg-white/10 border border-white/15 rounded-2xl flex items-center justify-center text-white">
            <UsersRound size={25} />
          </div>

          <p className="text-emerald-100/70 text-xs font-semibold uppercase tracking-[0.18em] mt-6">
            Build your learning community
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-2 tracking-tight">
            Create a Study Group
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
            Bring students together, organise study sessions and make learning more collaborative.
          </p>

        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E9EEE9] rounded-2xl p-5 sm:p-7 lg:p-8 space-y-8 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]"
      >

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            <AlertCircle size={19} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 bg-[#EDF3EE] border border-[#DCE7DD] text-[#315C4C] p-4 rounded-xl text-sm">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{message}</p>
              <p className="mt-1">
                You can view your new group in My Groups.
              </p>
              <Link
                to="/my-groups"
                className="inline-flex items-center gap-1 font-semibold underline mt-2"
              >
                View My Groups
              </Link>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#EDF3EE] text-[#315C4C] rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tell students what your group is about.
              </p>
            </div>
          </div>

          <div className="space-y-5">

            <div>
              <label className={labelClass}>Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="e.g. CSC 201 Study Team"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Course Code *</label>
              <input
                type="text"
                value={courseCode}
                onChange={(event) => setCourseCode(event.target.value)}
                placeholder="e.g. CSC 201"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Group Description *</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain what this group will study, its objectives and what members can expect..."
                rows={5}
                className={`${inputClass} resize-y`}
              />
              <p className="text-xs text-slate-400 mt-2">
                Minimum 10 characters.
              </p>
            </div>

          </div>
        </div>

        <div className="border-t border-[#EDF1ED]" />

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#EDF3EE] text-[#315C4C] rounded-xl flex items-center justify-center">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Meeting Schedule</h2>
              <p className="text-xs text-slate-400 mt-1">
                Set when your group will meet.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            <div>
              <label className={labelClass}>Meeting Day *</label>
              <select
                value={meetingDay}
                onChange={(event) => setMeetingDay(event.target.value)}
                className={inputClass}
              >
                <option value="">Select a day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Meeting Time *</label>
              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72] pointer-events-none"
                />
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(event) => setMeetingTime(event.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-[#EDF1ED]" />

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#EDF3EE] text-[#315C4C] rounded-xl flex items-center justify-center">
              <Monitor size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Study Preferences</h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose how students will participate.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Study Format *</label>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { value: 'ONLINE', label: 'Online', description: 'Meet virtually' },
                { value: 'IN_PERSON', label: 'In Person', description: 'Meet in person' },
                { value: 'HYBRID', label: 'Hybrid', description: 'Online and in person' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    format === option.value
                      ? 'border-[#668B72] bg-[#EDF3EE] ring-2 ring-[#A8B9A8]/20'
                      : 'border-[#E5EBE5] bg-[#F7F9F6] hover:border-[#A8B9A8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-800">
                      {option.label}
                    </span>
                    {format === option.value && (
                      <CheckCircle2 size={17} className="text-[#315C4C]" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {(format === 'ONLINE' || format === 'HYBRID') && (
            <div className="mt-6">
              <label className={labelClass}>
                Meeting Link *
              </label>
              <div className="relative">
                <Video
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]"
                />
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(event) => setMeetingLink(event.target.value)}
                  placeholder="https://meet.google.com/..."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          )}

          {(format === 'IN_PERSON' || format === 'HYBRID') && (
            <div className="mt-6">
              <label className={labelClass}>
                Meeting Location *
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. University Library, Room 204"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className={labelClass}>
              Maximum Group Members *
            </label>
            <div className="relative">
              <Users
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#668B72]"
              />
              <input
                type="number"
                min="2"
                max="100"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Choose between 2 and 100 members.
            </p>
          </div>
        </div>

        <div className="border-t border-[#EDF1ED] pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#183D32] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#315C4C] transition-colors shadow-lg shadow-[#183D32]/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PlusCircle size={19} />
            {loading ? 'Creating Group...' : 'Create Study Group'}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4">
            Fields marked with * are required.
          </p>
        </div>

      </form>
    </div>
  )
}

export default CreateGroup
