
import {
  Flag,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react'

function AdminReports() {
  const statistics = [
    {
      title: 'Total Reports',
      value: 0,
      description: 'All submitted reports',
      icon: FileText,
    },
    {
      title: 'Pending Reports',
      value: 0,
      description: 'Awaiting moderation',
      icon: Clock,
    },
    {
      title: 'Resolved Reports',
      value: 0,
      description: 'Successfully reviewed',
      icon: CheckCircle,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-8">
      {/* Page Heading */}
      <section>
        <div className="flex items-center gap-2 text-[#668B72] mb-3">
          <ShieldCheck size={20} />
          <span className="text-xs font-bold tracking-[0.18em]">
            ADMINISTRATION
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Reports Management
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Review and manage reports submitted within StudyFinder.
        </p>
      </section>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-7">
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-100/70 uppercase tracking-wider">
              Platform Safety
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Maintain a Better Community
            </h2>

            <p className="text-sm text-emerald-100/75 mt-2 max-w-xl">
              Review reported users, groups and discussions to help keep
              StudyFinder safe and productive.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
            <Flag size={28} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* Report Management */}
      <section className="bg-white border border-[#E9EEE9] rounded-2xl overflow-hidden shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
        <div className="p-5 sm:p-6 border-b border-[#EDF1ED] flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Submitted Reports
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Review reports submitted by platform users.
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <FileText size={20} />
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 px-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EDF3EE] text-[#668B72] flex items-center justify-center mx-auto">
            <Flag size={25} />
          </div>

          <h3 className="font-semibold text-slate-800 mt-4">
            No reports have been submitted yet
          </h3>

          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Reports submitted by students will appear here for administrators
            to review and manage.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#EDF1ED] bg-[#FAFBF9]">
          <p className="text-xs text-slate-500">
            0 reports
          </p>
        </div>
      </section>
    </div>
  )
}

export default AdminReports
