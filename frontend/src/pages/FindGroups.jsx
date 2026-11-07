
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Users,
  Clock,
  CalendarDays,
  BookOpen,
  Filter,
  ArrowRight,
  SlidersHorizontal,
  X,
  UsersRound,
  Plus,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import { useGroups } from '../context/GroupContext'

function FindGroups() {
  const {
    groups,
    joinGroup,
    leaveGroup,
    loading,
    error,
    refreshGroups,
  } = useGroups()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('All')
  const [availability, setAvailability] = useState('All')
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState('')

  const formatLabels = {
    ONLINE: 'Online',
    IN_PERSON: 'Physical',
    HYBRID: 'Hybrid',
  }

  const filteredGroups = groups.filter((group) => {
    const search = searchTerm.toLowerCase().trim()

    const searchableFields = [
      group.name,
      group.courseCode,
      group.description,
      group.subject,
    ]

    const matchesSearch = searchableFields.some((field) =>
      String(field || '').toLowerCase().includes(search)
    )

    const matchesFormat =
      selectedFormat === 'All' ||
      group.format === selectedFormat

    const members = Number(group.members) || 0
    const hasCapacity =
      group.capacity !== null &&
      group.capacity !== undefined &&
      Number(group.capacity) > 0

    const isFull =
      hasCapacity && members >= Number(group.capacity)

    const matchesAvailability =
      availability === 'All' ||
      (availability === 'Available' && !isFull) ||
      (availability === 'Full' && isFull)

    return matchesSearch && matchesFormat && matchesAvailability
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedFormat('All')
    setAvailability('All')
  }

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedFormat !== 'All' ||
    availability !== 'All'

  async function handleMembershipAction(group) {
    setActionError('')
    setActionLoading(group.id)

    try {
      if (group.isJoined) {
        await leaveGroup(group.id)
      } else {
        await joinGroup(group.id)
      }
    } catch (err) {
      setActionError(err.message || 'Unable to update membership.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRetry() {
    try {
      await refreshGroups()
    } catch {
      // The GroupContext manages the loading error.
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">

      {/* Page Heading */}
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[#315C4C] text-xs font-bold tracking-wider mb-3">
            <Search size={15} />
            DISCOVER YOUR COMMUNITY
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Find Study Groups
          </h1>

          <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-xl">
            Discover students who share your courses, interests
            and academic goals.
          </p>
        </div>

        <Link
          to="/create-group"
          className="inline-flex items-center justify-center gap-2 bg-[#183D32] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#183D32]/10"
        >
          <Plus size={18} />
          Create a Group
        </Link>
      </section>

      {/* Search and Filters */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] space-y-6">

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-[#315C4C]" />
          <h2 className="font-bold text-slate-900">
            Search and Filters
          </h2>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by course code, group name or keyword..."
            className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl py-3.5 pl-12 pr-11 text-sm outline-none focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Study Format
            </label>

            <select
              value={selectedFormat}
              onChange={(event) => setSelectedFormat(event.target.value)}
              className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3.5 text-sm text-slate-700 outline-none focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all"
            >
              <option value="All">All Formats</option>
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">Physical</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Group Availability
            </label>

            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3.5 text-sm text-slate-700 outline-none focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all"
            >
              <option value="All">All Groups</option>
              <option value="Available">Available Spaces</option>
              <option value="Full">Full Groups</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[#EDF1ED]">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <Filter size={16} className="text-[#668B72]" />
            <span>
              <strong className="text-slate-800">
                {filteredGroups.length}
              </strong>{' '}
              {filteredGroups.length === 1 ? 'group' : 'groups'} found
            </span>
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-[#315C4C] font-semibold hover:text-[#183D32] inline-flex items-center gap-1.5"
            >
              <X size={15} />
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Explore Groups
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Find the right learning environment for you.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <UsersRound size={16} className="text-[#668B72]" />
            Student communities
          </div>
        </div>

        {actionError && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
            <AlertCircle size={19} className="shrink-0" />
            <p>{actionError}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-[#315C4C] mx-auto"
            />

            <p className="text-sm text-slate-500 mt-4">
              Loading study groups...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 text-center">
            <AlertCircle size={30} className="text-red-500 mx-auto" />

            <h2 className="text-lg font-bold text-slate-900 mt-4">
              Unable to load study groups
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 mt-6 bg-[#183D32] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredGroups.length > 0 ? (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGroups.map((group) => {
              const members = Number(group.members) || 0

              const hasCapacity =
                group.capacity !== null &&
                group.capacity !== undefined &&
                Number(group.capacity) > 0

              const capacity = hasCapacity
                ? Number(group.capacity)
                : null

              const isFull =
                hasCapacity && members >= capacity

              const spotsLeft = hasCapacity
                ? Math.max(0, capacity - members)
                : null

              const percentage = hasCapacity
                ? Math.min(100, (members / capacity) * 100)
                : 0

              const busy = actionLoading === group.id

              return (
                <div
                  key={group.id}
                  className="group bg-white rounded-2xl p-5 sm:p-6 flex flex-col shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:shadow-[0_15px_35px_-18px_rgba(24,61,50,0.25)] hover:-translate-y-1 transition-all duration-300"
                >

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold bg-[#EDF3EE] text-[#315C4C] px-3 py-1.5 rounded-lg">
                      {group.courseCode}
                    </span>

                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                        isFull
                          ? 'bg-[#F5EEEE] text-[#986363]'
                          : 'bg-[#EDF3EE] text-[#315C4C]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isFull ? 'bg-[#B77D7D]' : 'bg-[#668B72]'
                        }`}
                      />
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-5 group-hover:text-[#315C4C] transition-colors">
                    {group.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {group.description || 'No description provided.'}
                  </p>

                  <div className="space-y-3 mt-6 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={17} className="text-[#668B72] shrink-0" />
                      <span>{group.schedule || 'Schedule not specified'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock size={17} className="text-[#668B72] shrink-0" />
                      <span>{formatLabels[group.format] || group.format || 'Not specified'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users size={17} className="text-[#668B72] shrink-0" />
                      <span>
                        {members} / {capacity ?? 'Unlimited'} members
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <BookOpen size={17} className="text-[#668B72] shrink-0" />
                      <span>{group.subject || group.courseCode || 'Not specified'}</span>
                    </div>
                  </div>

                  {hasCapacity && (
                    <div className="mt-5 bg-[#F7F9F6] rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">
                          Group capacity
                        </span>

                        <span className="font-semibold text-[#315C4C]">
                          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#E5EBE5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#668B72] rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-6 pt-4 border-t border-[#EDF1ED]">
                    <Link
                      to={`/groups/${group.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 border border-[#D8E2D9] text-[#315C4C] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#EDF3EE] transition-colors"
                    >
                      Details
                      <ArrowRight size={15} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleMembershipAction(group)}
                      disabled={(isFull && !group.isJoined) || busy}
                      className="flex-1 bg-[#183D32] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {busy
                        ? 'Please wait...'
                        : group.isJoined
                          ? 'Leave Group'
                          : isFull
                            ? 'Full'
                            : 'Join Group'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        ) : (
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
            <div className="w-16 h-16 rounded-2xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center mx-auto">
              <Search size={30} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              No Study Groups Found
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              We couldn't find any groups matching your search.
              Try a different keyword or adjust your filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 bg-[#183D32] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors"
            >
              <Search size={16} />
              Reset Search
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default FindGroups
