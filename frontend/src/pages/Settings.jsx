
import { useState } from 'react'
import {
  Bell,
  User,
  Save,
  Mail,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-[#315C4C]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-8">
      <section>
        <p className="text-xs font-bold text-[#668B72] uppercase tracking-[0.18em]">
          Account Management
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
          Settings
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Personalise your StudyFinder experience and manage your preferences.
        </p>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full border border-white/10" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
            <SettingsIcon size={28} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Your Preferences
            </h2>

            <p className="text-sm text-emerald-100/75 mt-1">
              Control how you interact with StudyFinder.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E9EEE9] p-5 sm:p-7 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <Bell size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Notifications
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Manage your email notification preference.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#F2F5F0] text-[#668B72] flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>

            <div>
              <p className="font-semibold text-sm text-slate-800">
                Email Notifications
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Choose whether you want to receive updates through email.
              </p>
            </div>
          </div>

          <Toggle
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E9EEE9] p-5 sm:p-7 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
            <User size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Account
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Manage your student account information.
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className="flex items-center justify-between gap-3 p-4 bg-[#F7F9F6] border border-[#E9EEE9] rounded-xl hover:border-[#A8B9A8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-[#315C4C] flex items-center justify-center">
              <User size={18} />
            </div>

            <div>
              <p className="font-semibold text-sm text-slate-800">
                Personal Information
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Update your name, email and academic details.
              </p>
            </div>
          </div>

          <ChevronRight size={19} className="text-slate-400 shrink-0" />
        </Link>
      </section>
    </div>
  )
}

export default Settings
