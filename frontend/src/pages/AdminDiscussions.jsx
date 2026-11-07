
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MessageSquare,
  Trash2,
  MessagesSquare,
  Users,
  BookOpen,
  ShieldCheck,
  Clock,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import apiRequest from '../services/api'

function AdminDiscussions() {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [actionLoading, setActionLoading] = useState(null)

  const requestIdRef = useRef(0)

  const fetchDiscussions = useCallback(async () => {
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        search,
        status: filter,
      })

      const response = await apiRequest(
        `/admin/discussions?${params.toString()}`
      )

      if (requestId !== requestIdRef.current) return

      if (!Array.isArray(response.posts)) {
        throw new Error('Invalid discussion data received from the server.')
      }

      setDiscussions(response.posts)
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || 'Unable to load discussion posts.')
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [page, search, filter])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDiscussions()
    }, 0)

    return () => {
      clearTimeout(timer)
      requestIdRef.current += 1
    }
  }, [fetchDiscussions])

  function handleSearch(event) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function handleFilterChange(value) {
    setFilter(value)
    setPage(1)
  }

  async function handleModeration(post, action) {
    const isDeleting = action === 'delete'

    const confirmed = window.confirm(
      isDeleting
        ? 'Are you sure you want to remove this discussion post? It will be soft-deleted and can be restored later.'
        : 'Are you sure you want to restore this discussion post?'
    )

    if (!confirmed) return

    setActionLoading(post.id)
    setError('')

    try {
      await apiRequest(
        `/admin/discussions/${post.id}/${action}`,
        {
          method: 'PATCH',
        }
      )

      await fetchDiscussions()
    } catch (err) {
      setError(
        err.message ||
          `Unable to ${isDeleting ? 'delete' : 'restore'} this post.`
      )
    } finally {
      setActionLoading(null)
    }
  }

  const totalGroupsWithDiscussions = new Set(
    discussions.map((post) => post.groupId)
  ).size

  const statistics = [
    {
      title: 'Total Discussion Posts',
      value: pagination.total,
      description: 'Posts matching the current filters',
      icon: MessagesSquare,
    },
    {
      title: 'Groups With Discussions',
      value: totalGroupsWithDiscussions,
      description: 'Groups represented on this page',
      icon: Users,
    },
  ]

  function getAuthorName(post) {
    const profile = post.author?.profile

    return [
      profile?.firstName,
      profile?.lastName,
    ]
      .filter(Boolean)
      .join(' ') || profile?.username || post.author?.email || 'Unknown user'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-8">

      {/* Page Heading */}
      <section>
        <div className="flex items-center gap-2 text-[#668B72] mb-3">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold tracking-[0.18em]">
            COMMUNITY MODERATION
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Discussion Moderation
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Review and manage discussions across all StudyFinder communities.
        </p>
      </section>

      {/* Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-7">

        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">
              Community Management
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Keep Discussions Productive
            </h2>

            <p className="text-sm text-emerald-100/75 mt-2 max-w-xl">
              Monitor conversations and maintain a useful learning environment for students.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
            <MessagesSquare size={28} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid sm:grid-cols-2 gap-4">

        {statistics.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="bg-white border border-[#E9EEE9] rounded-2xl p-5 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]"
            >
              <div className="flex items-center justify-between gap-3">
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
      <section className="bg-white border border-[#E9EEE9] rounded-2xl p-5 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search post content, author, group or course..."
              className="w-full pl-11 pr-4 py-3 border border-[#E5EAE5] rounded-xl text-sm outline-none focus:border-[#668B72]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-[#315C4C] hover:bg-[#183D32] text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Posts', value: 'all' },
              { label: 'Active Posts', value: 'active' },
              { label: 'Deleted Posts', value: 'deleted' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleFilterChange(item.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  filter === item.value
                    ? 'bg-[#315C4C] text-white'
                    : 'bg-[#EDF3EE] text-[#496456] hover:bg-[#DCE7DD]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchDiscussions}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#315C4C] bg-[#EDF3EE] hover:bg-[#DCE7DD] disabled:opacity-50"
          >
            <RotateCcw size={15} />
            Refresh
          </button>

        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Discussion List */}
      <section className="bg-white border border-[#E9EEE9] rounded-2xl overflow-hidden shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

        <div className="p-5 sm:p-6 border-b border-[#EDF1ED] flex items-center justify-between gap-3">

          <div>
            <h2 className="font-bold text-lg text-slate-900">
              All Discussion Posts
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Review student conversations and moderate posts.
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <MessageSquare size={20} />
          </div>

        </div>

        {loading ? (

          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-[#DCE7DD] border-t-[#315C4C] rounded-full animate-spin mx-auto" />

            <p className="text-sm text-slate-500 mt-4">
              Loading discussion posts...
            </p>
          </div>

        ) : discussions.length === 0 ? (

          <div className="p-10 text-center">

            <div className="w-14 h-14 rounded-2xl bg-[#EDF3EE] text-[#668B72] flex items-center justify-center mx-auto">
              <MessageSquare size={27} />
            </div>

            <h3 className="font-semibold text-slate-800 mt-4">
              No discussions found
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              No posts match your current search or filter.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-[#EDF1ED]">

            {discussions.map((post) => {
              const isDeleted = Boolean(post.deletedAt)

              return (
                <article
                  key={post.id}
                  className="p-5 sm:p-6 hover:bg-[#FAFBF9] transition-colors"
                >

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2 mb-3">

                        <div className="w-9 h-9 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
                          <Users size={17} />
                        </div>

                        <span className="font-semibold text-slate-900">
                          {getAuthorName(post)}
                        </span>

                        <span className="text-xs bg-[#EDF3EE] text-[#315C4C] px-3 py-1.5 rounded-full font-semibold">
                          {post.group?.courseCode || 'No course'}
                        </span>

                        {isDeleted && (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold">
                            Deleted
                          </span>
                        )}

                      </div>

                      <div className="bg-[#F7F9F6] border border-[#EDF1ED] rounded-xl p-4">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-slate-500">

                        <p className="flex items-center gap-2">
                          <BookOpen size={14} className="text-[#668B72]" />
                          {post.group?.name || 'Unknown group'}
                        </p>

                        <p className="flex items-center gap-2">
                          <Clock size={14} className="text-[#668B72]" />
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : 'Date unavailable'}
                        </p>

                        <p className="flex items-center gap-2">
                          <MessageSquare size={14} className="text-[#668B72]" />
                          {post._count?.comments ?? 0} comments
                        </p>

                      </div>

                      {isDeleted && post.deletedReason && (
                        <p className="text-xs text-red-600 mt-3">
                          Moderation reason: {post.deletedReason}
                        </p>
                      )}

                    </div>

                    <div className="sm:pt-1 shrink-0">

                      {isDeleted ? (

                        <button
                          type="button"
                          disabled={actionLoading === post.id}
                          onClick={() => handleModeration(post, 'restore')}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#315C4C] bg-[#EDF3EE] hover:bg-[#DCE7DD] disabled:opacity-50 transition-colors"
                        >
                          <RotateCcw size={16} />
                          {actionLoading === post.id ? 'Please wait...' : 'Restore Post'}
                        </button>

                      ) : (

                        <button
                          type="button"
                          disabled={actionLoading === post.id}
                          onClick={() => handleModeration(post, 'delete')}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#A34B4B] bg-[#FCEEEE] hover:bg-[#F8DEDE] disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          {actionLoading === post.id ? 'Please wait...' : 'Delete Post'}
                        </button>

                      )}

                    </div>

                  </div>

                </article>
              )
            })}

          </div>

        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="p-5 border-t border-[#EDF1ED] flex items-center justify-between gap-3">

            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
              {' '}({pagination.total} posts)
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="p-2 rounded-lg bg-[#EDF3EE] text-[#315C4C] disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="p-2 rounded-lg bg-[#EDF3EE] text-[#315C4C] disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>

            </div>

          </div>
        )}

      </section>

    </div>
  )
}

export default AdminDiscussions
