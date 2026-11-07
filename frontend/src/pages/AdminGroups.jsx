
import { useEffect, useState } from 'react'
import {
  Search,
  BookOpen,
  Users,
  Archive,
  RotateCcw,
  CalendarDays,
  Clock,
  Filter,
  ChevronDown,
  UsersRound,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import apiRequest from '../services/api'

function AdminGroups() {
  const [groups, setGroups] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          page: String(page),
          limit: '10',
        })

        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim())
        }

        if (selectedFormat !== 'All') {
          params.set('format', selectedFormat)
        }

        if (selectedStatus !== 'All') {
          params.set('status', selectedStatus)
        }

        const data = await apiRequest(
          `/admin/groups?${params.toString()}`
        )

        if (cancelled) return

        if (!data.success || !Array.isArray(data.groups)) {
          throw new Error('Invalid response received from the server.')
        }

        setGroups(data.groups)
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: data.groups.length,
          totalPages: 1,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to retrieve study groups.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchTerm, selectedFormat, selectedStatus, page, refreshKey])

  function clearFilters() {
    setSearchTerm('')
    setSelectedFormat('All')
    setSelectedStatus('All')
    setPage(1)
  }

  async function handleGroupAction(group) {
    if (group.status !== 'ACTIVE' && group.status !== 'ARCHIVED') {
      return
    }

    const isArchived = group.status === 'ARCHIVED'
    const action = isArchived ? 'restore' : 'archive'
    const actionLabel = isArchived ? 'restore' : 'archive'

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} "${group.name}"?`
    )

    if (!confirmed) return

    try {
      setActionLoadingId(group.id)
      setError('')

      const data = await apiRequest(
        `/admin/groups/${group.id}/${action}`,
        {
          method: 'PATCH',
        }
      )

      if (!data.success) {
        throw new Error(data.message || `Unable to ${actionLabel} this group.`)
      }

      setRefreshKey((previous) => previous + 1)
    } catch (err) {
      setError(err.message || `Unable to ${actionLabel} this group.`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const totalMemberships = groups.reduce(
    (total, group) => total + (Number(group._count?.memberships) || 0),
    0
  )

  const statistics = [
    {
      title: 'Total Study Groups',
      value: pagination.total,
      description: 'Groups across the platform',
      icon: BookOpen,
    },
    {
      title: 'Memberships on This Page',
      value: totalMemberships,
      description: 'Active student memberships on this page',
      icon: Users,
    },
  ]

  function formatLabel(format) {
    const labels = {
      ONLINE: 'Online',
      IN_PERSON: 'In Person',
      HYBRID: 'Hybrid',
    }

    return labels[format] || format || 'Not specified'
  }

  function getCreatorName(group) {
    const profile = group.creator?.profile

    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    }

    return group.creator?.email || 'Unknown creator'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-8">
      <section>
        <div className="flex items-center gap-2 text-[#668B72] mb-3">
          <Layers size={20} />
          <span className="text-xs font-bold tracking-[0.18em]">
            SYSTEM ADMINISTRATION
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Group Management
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          View, monitor and manage all study groups on StudyFinder.
        </p>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-7">
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">
              Group Administration
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Manage Study Communities
            </h2>

            <p className="text-sm text-emerald-100/75 mt-2 max-w-xl">
              Oversee study groups, review their schedules and monitor student participation.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
            <UsersRound size={28} />
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {statistics.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="bg-white border border-[#E9EEE9] rounded-2xl p-5 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]"
            >
              <div className="flex justify-between items-center gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {item.title}
                </p>

                <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
                  <Icon size={21} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mt-4">
                {item.value}
              </h2>

              <p className="text-xs text-slate-400 mt-2">
                {item.description}
              </p>
            </div>
          )
        })}
      </section>

      <section className="bg-white border border-[#E9EEE9] rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <Filter size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Search & Filters
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Find groups by name, course code, subject, format or status.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            size={19}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value)
              setPage(1)
            }}
            placeholder="Search by group name, course code or subject..."
            className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-[#668B72] focus:ring-2 focus:ring-[#A8B9A8]/30 transition-all"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Study Format
            </label>

            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(event) => {
                  setSelectedFormat(event.target.value)
                  setPage(1)
                }}
                className="appearance-none w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3 pr-10 text-sm outline-none focus:border-[#668B72]"
              >
                <option value="All">All Formats</option>
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In Person</option>
                <option value="HYBRID">Hybrid</option>
              </select>

              <ChevronDown
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Group Status
            </label>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value)
                  setPage(1)
                }}
                className="appearance-none w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3 pr-10 text-sm outline-none focus:border-[#668B72]"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <ChevronDown
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-[#EDF1ED]">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-bold text-[#315C4C]">
              {groups.length}
            </span>{' '}
            of {pagination.total} groups
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setRefreshKey((previous) => previous + 1)}
              disabled={loading}
              className="text-xs font-semibold text-[#315C4C] hover:text-[#183D32] disabled:opacity-50"
            >
              Refresh groups
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-[#315C4C] hover:text-[#183D32]"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white border border-[#E9EEE9] rounded-2xl overflow-hidden shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
        <div className="p-5 sm:p-6 border-b border-[#EDF1ED] flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              All Study Groups
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Review group information and manage availability.
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw size={26} className="animate-spin text-[#668B72] mx-auto" />
            <p className="text-sm text-slate-500 mt-3">
              Loading study groups...
            </p>
          </div>
        ) : groups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F9F6] text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Group</th>
                  <th className="p-4 font-semibold">Schedule</th>
                  <th className="p-4 font-semibold">Members</th>
                  <th className="p-4 font-semibold">Format</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF1ED]">
                {groups.map((group) => {
                  const members = Number(group._count?.memberships) || 0
                  const capacity = Number(group.capacity)
                  const hasCapacity =
                    group.capacity !== null &&
                    group.capacity !== undefined &&
                    Number.isFinite(capacity) &&
                    capacity > 0

                  const canManage =
                    group.status === 'ACTIVE' ||
                    group.status === 'ARCHIVED'

                  return (
                    <tr
                      key={group.id}
                      className="hover:bg-[#F7F9F6] transition-colors"
                    >
                      <td className="p-4 min-w-[220px]">
                        <p className="font-semibold text-slate-800">
                          {group.name}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {group.courseCode}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {group.subject || 'No subject specified'}
                        </p>

                        <p className="text-xs text-slate-400 mt-2">
                          Created by: {getCreatorName(group)}
                        </p>
                      </td>

                      <td className="p-4 min-w-[160px]">
                        <div className="space-y-2 text-slate-600">
                          <p className="flex items-center gap-2 text-xs">
                            <CalendarDays size={15} className="text-[#668B72]" />
                            {group.schedule || 'Not specified'}
                          </p>

                          <p className="flex items-center gap-2 text-xs">
                            <Clock size={15} className="text-[#668B72]" />
                            {group.format === 'ONLINE'
                              ? 'Online meeting'
                              : group.format === 'IN_PERSON'
                                ? 'Physical meeting'
                                : group.format === 'HYBRID'
                                  ? 'Hybrid meeting'
                                  : 'Not specified'}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users size={16} className="text-[#668B72]" />

                          <span className="font-medium">
                            {members} / {hasCapacity ? capacity : 'Unlimited'}
                          </span>
                        </div>

                        {hasCapacity && (
                          <div className="w-24 h-1.5 bg-[#EDF1ED] rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-[#668B72] rounded-full"
                              style={{
                                width: `${Math.min(
                                  (members / capacity) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#EDF3EE] text-[#315C4C] text-xs font-semibold">
                          {formatLabel(group.format)}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            group.status === 'ACTIVE'
                              ? 'bg-green-50 text-green-700'
                              : group.status === 'ARCHIVED'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {group.status || 'Unknown'}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {canManage ? (
                          <button
                            type="button"
                            disabled={actionLoadingId === group.id}
                            onClick={() => handleGroupAction(group)}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                              group.status === 'ARCHIVED'
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {actionLoadingId === group.id ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : group.status === 'ARCHIVED' ? (
                              <RotateCcw size={15} />
                            ) : (
                              <Archive size={15} />
                            )}

                            {actionLoadingId === group.id
                              ? 'Please wait...'
                              : group.status === 'ARCHIVED'
                                ? 'Restore'
                                : 'Archive'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No action available
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EDF3EE] text-[#668B72] flex items-center justify-center mx-auto">
              <BookOpen size={27} />
            </div>

            <h3 className="font-semibold text-slate-800 mt-4">
              No study groups found
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Try another search or filter.
            </p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-[#EDF1ED]">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E5EBE5] text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E5EBE5] text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminGroups
