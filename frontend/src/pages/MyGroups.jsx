import { Link } from 'react-router-dom'
import {
  Users,
  CalendarDays,
  Clock,
  Search,
  BookOpen,
  ArrowRight,
  MessageSquare,
  UsersRound,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import { useGroups } from '../context/GroupContext'

function MyGroups() {
  const { groups, loading, error, refreshGroups } = useGroups()

  const myGroups = groups.filter((group) => group.isJoined)

  const totalMembers = myGroups.reduce(
    (total, group) => total + (group.members || 0),
    0
  )

  const totalDiscussions = myGroups.reduce(
    (total, group) => total + (group.posts || []).length,
    0
  )

  const formatLabels = {
    ONLINE: 'Online',
    IN_PERSON: 'Physical',
    HYBRID: 'Hybrid',
  }

  const statistics = [
    {
      title: 'Groups Joined',
      value: myGroups.length,
      description: 'Your learning communities',
      icon: BookOpen,
    },
    {
      title: 'Total Group Members',
      value: totalMembers,
      description: 'Across your study groups',
      icon: Users,
    },
    {
      title: 'Group Discussions',
      value: totalDiscussions,
      description: 'Messages in your groups',
      icon: MessageSquare,
    },
  ]

  async function handleRetry() {
    try {
      await refreshGroups()
    } catch {
      // The GroupContext already stores the loading error.
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">

      {/* Page Heading */}
      <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[#315C4C] text-xs font-bold tracking-wider mb-3">
            <GraduationCap size={16} />
            YOUR LEARNING COMMUNITIES
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Study Groups
          </h1>

          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Keep track of the study communities you've joined.
          </p>
        </div>

        <Link
          to="/find-groups"
          className="inline-flex items-center justify-center gap-2 bg-[#183D32] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#183D32]/10"
        >
          <Search size={18} />
          Find Groups
        </Link>
      </section>

      {/* Statistics */}
      <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statistics.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="w-11 h-11 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
                  <Icon size={21} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mt-5">
                {stat.value}
              </h2>

              <p className="text-xs text-slate-400 mt-2">
                {stat.description}
              </p>
            </div>
          )
        })}
      </section>

      {/* Group Collection */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Your Communities
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {myGroups.length} {myGroups.length === 1 ? 'group' : 'groups'} in your collection.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#315C4C] font-medium">
            <CheckCircle2 size={16} />
            Membership overview
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <LoaderCircle
              size={30}
              className="animate-spin text-[#315C4C] mx-auto"
            />

            <p className="text-sm text-slate-500 mt-4">
              Loading your study groups...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <AlertCircle size={30} className="text-red-500 mx-auto" />

            <h2 className="text-lg font-bold text-slate-900 mt-4">
              Unable to load your groups
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
        ) : myGroups.length === 0 ? (

          /* Empty State */
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
            <div className="w-16 h-16 rounded-2xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center mx-auto">
              <UsersRound size={30} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              Your study communities await.
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              You haven't joined any study groups yet.
              Explore available communities and connect with students
              who share your academic interests.
            </p>

            <Link
              to="/find-groups"
              className="inline-flex items-center gap-2 mt-6 bg-[#183D32] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors"
            >
              <Search size={17} />
              Explore Groups
              <ArrowRight size={16} />
            </Link>
          </div>

        ) : (

          <div className="grid md:grid-cols-2 gap-5">
            {myGroups.map((group) => {
              const hasCapacity =
                group.capacity !== null &&
                group.capacity !== undefined &&
                group.capacity > 0

              const percentage = hasCapacity
                ? Math.min(100, (group.members / group.capacity) * 100)
                : 0

              return (
                <div
                  key={group.id}
                  className="group bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:shadow-[0_15px_35px_-18px_rgba(24,61,50,0.25)] hover:-translate-y-1 transition-all duration-300"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-flex text-xs font-bold bg-[#EDF3EE] text-[#315C4C] px-3 py-1.5 rounded-lg">
                        {group.courseCode}
                      </span>

                      <h3 className="font-bold text-lg text-slate-900 mt-4 group-hover:text-[#315C4C] transition-colors">
                        {group.name}
                      </h3>
                    </div>

                    <span className="shrink-0 bg-[#EDF3EE] text-[#315C4C] px-3 py-1.5 rounded-full text-xs font-semibold">
                      {formatLabels[group.format] || group.format}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed line-clamp-3">
                    {group.description}
                  </p>

                  {/* Meeting Details */}
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#EDF3EE] text-[#668B72] flex items-center justify-center shrink-0">
                        <CalendarDays size={17} />
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Schedule
                        </p>

                        <p className="text-sm font-semibold text-slate-700 mt-0.5">
                          {group.schedule || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#EDF3EE] text-[#668B72] flex items-center justify-center shrink-0">
                        <Clock size={17} />
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Study Format
                        </p>

                        <p className="text-sm font-semibold text-slate-700 mt-0.5">
                          {formatLabels[group.format] || group.format}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Membership Progress */}
                  <div className="mt-6 bg-[#F7F9F6] rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="flex items-center gap-2 text-slate-500 font-medium">
                        <Users size={15} />
                        Group Membership
                      </span>

                      <span className="font-bold text-[#315C4C]">
                        {group.members}/{hasCapacity ? group.capacity : 'Unlimited'}
                      </span>
                    </div>

                    {hasCapacity && (
                      <div className="h-1.5 bg-[#E5EBE5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#668B72] rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Membership Status */}
                  {group.membershipStatus === 'PENDING' && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-4">
                      Your membership is awaiting approval.
                    </p>
                  )}

                  {/* Group Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-[#EDF1ED]">
                    <Link
                      to={`/groups/${group.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#183D32] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors"
                    >
                      View Group
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to={`/groups/${group.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-[#D8E2D9] text-[#315C4C] py-3 rounded-xl text-sm font-semibold hover:bg-[#EDF3EE] transition-colors"
                    >
                      <MessageSquare size={16} />
                      Discussions
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyGroups