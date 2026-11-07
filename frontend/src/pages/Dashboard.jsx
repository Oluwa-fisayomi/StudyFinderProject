import { Link } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  BookOpen,
  CalendarDays,
  MessageSquare,
  ArrowRight,
  Clock,
  UsersRound,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useGroups } from '../context/GroupContext'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { groups } = useGroups()
  const { user } = useAuth()

  const createdGroups = groups.filter(
    (group) => group.creatorId === user?.id
  )

  const myGroups = groups.filter((group) => group.isJoined)

  const availableGroups = groups.filter(
    (group) => !group.isJoined && group.members < group.capacity
  )

  const totalMembers = myGroups.reduce(
    (total, group) => total + group.members,
    0
  )

  const recentPosts = myGroups
    .flatMap((group) =>
      (group.posts || []).map((post) => ({
        ...post,
        groupName: group.name,
        groupId: group.id,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 4)

  const statistics = [
    {
      title: "Groups I've Created",
      value: createdGroups.length,
      description: 'Groups created by you',
      icon: BookOpen,
    },
    {
      title: 'My Groups',
      value: myGroups.length,
      description: 'Groups you have joined',
      icon: Users,
    },
    {
      title: 'Available Groups',
      value: availableGroups.length,
      description: 'Groups with available spaces',
      icon: Search,
    },
    {
      title: 'Group Members',
      value: totalMembers,
      description: 'Combined membership counts',
      icon: UsersRound,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-9 pb-8">

      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-9 lg:p-11 shadow-xl shadow-[#183D32]/10">

        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute -right-5 -top-9 w-48 h-48 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-emerald-100 text-xs font-semibold mb-5">
              <Sparkles size={14} />
              YOUR LEARNING SPACE
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Welcome to StudyFinder.
            </h1>

            <p className="text-emerald-100/80 mt-3 leading-relaxed text-sm sm:text-base max-w-xl">
              Find your study partners, discover new groups
              and make your academic journey more collaborative.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">

              <Link
                to="/find-groups"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#E7EFE9] text-[#183D32] rounded-xl font-semibold text-sm hover:bg-white hover:-translate-y-0.5 transition-all duration-300 shadow-lg"
              >
                <Search size={17} />
                Explore Groups
              </Link>

              <Link
                to="/create-group"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-all duration-300"
              >
                <Plus size={17} />
                Create Group
              </Link>

            </div>
          </div>

          <div className="hidden lg:flex w-32 h-32 rounded-3xl bg-white/10 border border-white/15 items-center justify-center shrink-0">
            <GraduationCapIcon />
          </div>

        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Your Overview
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              A snapshot of your study community.
            </p>
          </div>

          <TrendingUp size={21} className="text-[#315C4C]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

          {statistics.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="group bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:shadow-[0_12px_30px_-15px_rgba(24,61,50,0.2)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between">

                  <span className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center group-hover:bg-[#315C4C] group-hover:text-white transition-all duration-300">
                    <Icon size={21} />
                  </div>

                </div>

                <h3 className="text-3xl font-bold text-slate-900 mt-5 tracking-tight">
                  {stat.value}
                </h3>

                <p className="text-xs text-slate-400 mt-2">
                  {stat.description}
                </p>

              </div>
            )
          })}

        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Quick Actions
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            What would you like to do today?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">

          <Link
            to="/find-groups"
            className="group flex items-center gap-5 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center group-hover:bg-[#315C4C] group-hover:text-white transition-all duration-300">
              <Search size={26} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">
                Find Study Groups
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Discover groups based on your courses.
              </p>
            </div>

            <ArrowRight size={19} className="text-slate-400 group-hover:text-[#315C4C] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/create-group"
            className="group flex items-center gap-5 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center group-hover:bg-[#315C4C] group-hover:text-white transition-all duration-300">
              <Plus size={26} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">
                Create a Group
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Start a new study community.
              </p>
            </div>

            <ArrowRight size={19} className="text-slate-400 group-hover:text-[#315C4C] group-hover:translate-x-1 transition-all" />
          </Link>

        </div>
      </section>

      {/* My Study Groups */}
      <section>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              My Study Groups
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Your current learning communities.
            </p>
          </div>

          <Link
            to="/my-groups"
            className="flex items-center gap-1 text-sm font-semibold text-[#315C4C] hover:text-[#183D32] transition-colors"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {myGroups.length > 0 ? (

          <div className="grid md:grid-cols-2 gap-5">

            {myGroups.slice(0, 4).map((group) => (

              <div
                key={group.id}
                className="group bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex px-3 py-1.5 rounded-lg bg-[#EDF3EE] text-[#315C4C] text-xs font-bold">
                    {group.courseCode}
                  </span>

                  <span className="text-xs text-[#315C4C] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#668B72]" />
                    Joined
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mt-5 group-hover:text-[#315C4C] transition-colors">
                  {group.name}
                </h3>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">

                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-[#668B72]" />
                    {group.meetingDay}
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock size={16} className="text-[#668B72]" />
                    {group.meetingTime}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#EDF1ED]">

                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Users size={16} />
                    {group.members}/{group.capacity} members
                  </span>

                  <Link
                    to={`/groups/${group.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#315C4C] hover:text-[#183D32]"
                  >
                    View Details
                    <ArrowRight size={15} />
                  </Link>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

            <div className="w-16 h-16 rounded-2xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center mx-auto">
              <BookOpen size={30} />
            </div>

            <h3 className="font-bold text-lg text-slate-900 mt-5">
              Your study journey starts here.
            </h3>

            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              You haven't joined any study groups yet.
              Explore available groups and connect with other students.
            </p>

            <Link
              to="/find-groups"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#183D32] text-white rounded-xl font-semibold text-sm hover:bg-[#315C4C] hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Groups
              <ArrowRight size={17} />
            </Link>

          </div>

        )}

      </section>

      {/* Recent Discussions */}
      <section>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <MessageSquare size={20} />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Recent Group Discussions
            </h2>
            <p className="text-sm text-slate-500">
              The latest conversations in your study communities.
            </p>
          </div>
        </div>

        {recentPosts.length > 0 ? (

          <div className="bg-white rounded-2xl shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] divide-y divide-[#EDF1ED] overflow-hidden">

            {recentPosts.map((post) => (

              <Link
                key={post.id}
                to={`/groups/${post.groupId}`}
                className="group block p-5 hover:bg-[#F6F8F5] transition-colors duration-200"
              >

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center shrink-0">
                    <MessageSquare size={18} />
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 group-hover:text-[#315C4C] transition-colors">
                        {post.groupName}
                      </p>

                      <span className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-2 break-words">
                      <span className="font-medium text-slate-800">
                        {post.author}:
                      </span>{' '}
                      {post.content}
                    </p>

                  </div>

                  <ArrowRight size={17} className="text-slate-300 group-hover:text-[#315C4C] transition-colors shrink-0" />

                </div>

              </Link>

            ))}

          </div>

        ) : (

          <div className="bg-white rounded-2xl p-8 text-center shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">

            <div className="w-12 h-12 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center mx-auto">
              <CalendarDays size={23} />
            </div>

            <p className="font-semibold text-slate-700 mt-4">
              No discussions yet.
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Messages from your study groups will appear here.
            </p>

          </div>

        )}

      </section>

    </div>
  )
}

function GraduationCapIcon() {
  return <BookOpen size={58} className="text-[#E7EFE9]" strokeWidth={1.5} />
}

export default Dashboard