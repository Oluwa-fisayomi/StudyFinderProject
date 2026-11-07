
import { useState, useEffect } from 'react'
import {
  Search,
  Users,
  ShieldCheck,
  UserRound,
  Ban,
  CheckCircle,
  Filter,
  UserCheck,
  UserX,
  ChevronDown,
} from 'lucide-react'

import apiRequest from '../services/api'

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [updatingUserId, setUpdatingUserId] = useState(null)

  // Fetch registered users from the backend
  useEffect(() => {
    let isMounted = true

    async function fetchUsers() {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest('/admin/users')

        if (!data.success || !Array.isArray(data.users)) {
          throw new Error('Invalid response received from the server.')
        }

        const formattedUsers = data.users.map((user) => ({
          id: user.id,

          name: user.profile
            ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.email
            : user.email,

          email: user.email,

          role: {
            STUDENT: 'Student',
            MODERATOR: 'Moderator',
            ADMIN: 'Administrator',
          }[user.role] || user.role,

          status: {
            ACTIVE: 'Active',
            SUSPENDED: 'Suspended',
            DELETED: 'Deleted',
          }[user.status] || user.status,
        }))

        if (isMounted) {
          setUsers(formattedUsers)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load registered users.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  // Suspend or activate a user
  async function handleStatusChange(user) {
    const nextStatus = user.status === 'Active'
      ? 'SUSPENDED'
      : 'ACTIVE'

    const action = nextStatus === 'SUSPENDED'
      ? 'suspend'
      : 'activate'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    )

    if (!confirmed) return

    try {
      setUpdatingUserId(user.id)
      setActionError('')

      const data = await apiRequest(
        `/admin/users/${user.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      )

      if (!data.success) {
        throw new Error(data.message || 'Unable to update account.')
      }

      // Refresh the user list from PostgreSQL
      setRefreshKey((previous) => previous + 1)

    } catch (err) {
      setActionError(
        err.message || 'Unable to update this account.'
      )
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Search and filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole =
      selectedRole === 'All' || user.role === selectedRole

    const matchesStatus =
      selectedStatus === 'All' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  // User statistics
  const totalUsers = users.length

  const activeUsers = users.filter(
    (user) => user.status === 'Active'
  ).length

  const suspendedUsers = users.filter(
    (user) => user.status === 'Suspended'
  ).length

  const statistics = [
    {
      title: 'Total Users',
      value: totalUsers,
      description: 'Registered accounts',
      icon: Users,
    },
    {
      title: 'Active Users',
      value: activeUsers,
      description: 'Currently active accounts',
      icon: UserCheck,
    },
    {
      title: 'Suspended Users',
      value: suspendedUsers,
      description: 'Restricted accounts',
      icon: UserX,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-8">

      {/* Heading */}
      <section>
        <div className="flex items-center gap-2 text-[#668B72] mb-3">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold tracking-[0.18em]">
            SYSTEM ADMINISTRATION
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          User Management
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          View, monitor and manage accounts registered on StudyFinder.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid sm:grid-cols-3 gap-4">

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

      {/* Search and Filters */}
      <section className="bg-white border border-[#E9EEE9] rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <Filter size={18} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Search & Filters
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Find specific accounts quickly.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={19}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-[#668B72] focus:ring-2 focus:ring-[#A8B9A8]/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="grid sm:grid-cols-2 gap-4 mt-5">

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Filter by Role
            </label>

            <div className="relative">
              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="appearance-none w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3 pr-10 text-sm outline-none focus:border-[#668B72] focus:ring-2 focus:ring-[#A8B9A8]/30"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Moderator">Moderator</option>
                <option value="Administrator">Administrator</option>
              </select>

              <ChevronDown
                size={17}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Filter by Status
            </label>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="appearance-none w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3 pr-10 text-sm outline-none focus:border-[#668B72] focus:ring-2 focus:ring-[#A8B9A8]/30"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Deleted">Deleted</option>
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
              {filteredUsers.length}
            </span>{' '}
            of {totalUsers} users
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setRefreshKey((previous) => previous + 1)}
              disabled={loading}
              className="text-xs font-semibold text-[#315C4C] hover:text-[#183D32] disabled:opacity-50"
            >
              Refresh users
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedRole('All')
                setSelectedStatus('All')
                setActionError('')
              }}
              className="text-xs font-semibold text-[#315C4C] hover:text-[#183D32]"
            >
              Clear filters
            </button>
          </div>

        </div>

      </section>

      {/* Users Table */}
      <section className="bg-white border border-[#E9EEE9] rounded-2xl overflow-hidden shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

        <div className="p-5 sm:p-6 border-b border-[#EDF1ED] flex items-center justify-between gap-3">

          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Registered Users
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Manage account access and permissions.
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <Users size={20} />
          </div>

        </div>

        {actionError && (
          <div className="mx-5 mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {loading ? (

          <div className="p-10 text-center text-sm text-slate-500">
            Loading registered users...
          </div>

        ) : error ? (

          <div className="p-10 text-center">
            <p className="font-bold text-slate-800">
              Unable to load users
            </p>

            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRefreshKey((previous) => previous + 1)}
              className="mt-4 text-sm font-semibold text-[#315C4C] hover:text-[#183D32]"
            >
              Try again
            </button>
          </div>

        ) : filteredUsers.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left">

              <thead className="bg-[#F7F9F6] text-slate-500">
                <tr>
                  <th className="p-4 font-semibold whitespace-nowrap">User</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF1ED]">

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="hover:bg-[#F7F9F6] transition-colors"
                  >

                    {/* User */}
                    <td className="p-4 min-w-[220px]">
                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center shrink-0">
                          <UserRound size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {user.name}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {user.email}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">

                        {(user.role === 'Administrator' ||
                          user.role === 'Moderator') && (
                          <ShieldCheck
                            size={16}
                            className={
                              user.role === 'Administrator'
                                ? 'text-[#315C4C]'
                                : 'text-[#668B72]'
                            }
                          />
                        )}

                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          user.status === 'Active'
                            ? 'bg-[#EDF3EE] text-[#315C4C]'
                            : user.status === 'Suspended'
                              ? 'bg-[#FCEEEE] text-[#A34B4B]'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-[#668B72]'
                              : user.status === 'Suspended'
                                ? 'bg-[#C56A6A]'
                                : 'bg-slate-400'
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 whitespace-nowrap">

                      {user.role === 'Administrator' ? (

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          <ShieldCheck size={15} />
                          Protected account
                        </span>

                      ) : user.status === 'Deleted' ? (

                        <span className="text-xs text-slate-400">
                          Unavailable
                        </span>

                      ) : (

                        <button
                          type="button"
                          onClick={() => handleStatusChange(user)}
                          disabled={updatingUserId === user.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait ${
                            user.status === 'Active'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-[#EDF3EE] text-[#315C4C] hover:bg-[#DDE9DF]'
                          }`}
                        >
                          {updatingUserId === user.id ? (
                            'Updating...'
                          ) : user.status === 'Active' ? (
                            <>
                              <Ban size={14} />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle size={14} />
                              Activate
                            </>
                          )}
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="p-10 text-center">

            <div className="w-14 h-14 rounded-2xl bg-[#EDF3EE] text-[#668B72] flex items-center justify-center mx-auto">
              <Users size={27} />
            </div>

            <p className="font-bold text-slate-800 mt-4">
              No users found
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Try changing your search or filters.
            </p>

          </div>

        )}

      </section>

    </div>
  )
}

export default AdminUsers
