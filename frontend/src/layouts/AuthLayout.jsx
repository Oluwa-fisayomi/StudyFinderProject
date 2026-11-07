
import { Outlet, Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F2F5F0]">

      {/* Header */}
      <header className="px-4 py-5 sm:px-6 sm:py-6">
        <Link to="/" className="flex items-center gap-2 w-fit group">

          <GraduationCap
            size={32}
            className="text-[#315C4C] shrink-0 transition-transform duration-200 group-hover:scale-110"
          />

          <span className="text-xl font-bold text-[#183D32]">
            StudyFinder
          </span>
        </Link>
      </header>

      {/* Authentication content */}
      <main className="flex justify-center items-center px-4 py-6 sm:py-10 min-w-0">

        <div className="w-full max-w-md min-w-0">
          <Outlet />
        </div>

      </main>

    </div>
  )
}

export default AuthLayout
