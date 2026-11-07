
import {
  Users,
  BookOpen,
  MessageSquare,
  Flag,
  ShieldCheck,
  ArrowUpRight,
  UserRoundCog,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function AdminDashboard() {
  const statistics = [
    {
      title: 'Total Users',
      value: '0',
      description: 'Registered student accounts',
      icon: Users,
    },
    {
      title: 'Study Groups',
      value: '0',
      description: 'Groups created',
      icon: BookOpen,
    },
    {
      title: 'Discussions',
      value: '0',
      description: 'Group messages',
      icon: MessageSquare,
    },
    {
      title: 'Pending Reports',
      value: '0',
      description: 'Reports requiring attention',
      icon: Flag,
    },
  ]

  const managementSections = [
    {
      title: 'User Management',
      description:
        'Manage student accounts, review user activity and control administrative privileges.',
      icon: Users,
      link: '/admin/users',
      action: 'Manage Users',
    },
    {
      title: 'Group Management',
      description:
        'Review study groups, investigate inappropriate groups and manage group availability.',
      icon: BookOpen,
      link: '/admin/groups',
      action: 'Manage Groups',
    },
    {
      title: 'Discussion Moderation',
      description:
        'Monitor group discussions and review inappropriate or reported messages.',
      icon: MessageSquare,
      link: '/admin/discussions',
      action: 'Review Discussions',
    },
    {
      title: 'Reports & Complaints',
      description:
        'Review submitted reports and take appropriate moderation actions.',
      icon: Flag,
      link: '/admin/reports',
      action: 'View Reports',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-8">
      <section>
        <div className="flex items-center gap-2 text-[#668B72] mb-3">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold tracking-[0.18em]">
            SYSTEM ADMINISTRATION
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Monitor, manage and maintain the StudyFinder platform.
        </p>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-12 -top-16 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute -right-3 -top-7 w-44 h-44 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-emerald-50 text-xs px-3 py-1.5 rounded-full mb-4">
              <ShieldCheck size={14} />
              Administrator Workspace
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Welcome to StudyFinder Administration
            </h2>

            <p className="text-sm text-emerald-100/75 mt-2 max-w-xl leading-relaxed">
              Your central workspace for overseeing students, study groups,
              discussions and platform activities.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
            <UserRoundCog size={32} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Platform Overview
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Key platform statistics
            </p>
          </div>

          <span className="text-xs text-[#668B72] font-semibold bg-[#EDF3EE] px-3 py-1.5 rounded-full">
            Overview
          </span>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statistics.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="bg-white border border-[#E9EEE9] rounded-2xl p-5 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-slate-900 mt-5">
                  {item.value}
                </h3>

                <p className="text-xs text-slate-400 mt-2">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-bold text-lg text-slate-900">
            Management Centre
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Access the different areas of platform administration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {managementSections.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.title}
                to={item.link}
                className="group bg-white border border-[#E9EEE9] rounded-2xl p-5 hover:border-[#A8B9A8] hover:shadow-lg hover:shadow-[#183D32]/5 transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center group-hover:bg-[#183D32] group-hover:text-white transition-colors">
                    <Icon size={22} />
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="text-slate-300 group-hover:text-[#315C4C] transition-colors"
                  />
                </div>

                <h3 className="font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mt-2 min-h-[60px]">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-semibold text-[#315C4C] mt-5">
                  {item.action}
                  <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
