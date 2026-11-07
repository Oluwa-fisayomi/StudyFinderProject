
import { useState } from 'react'
import {
  NavLink,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  MessageSquare,
  Flag,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'Manage Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Manage Groups',
      path: '/admin/groups',
      icon: GraduationCap,
    },
    {
      name: 'Discussions',
      path: '/admin/discussions',
      icon: MessageSquare,
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: Flag,
    },
  ]

  const currentPage = navigation.find((item) =>
    item.end
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
  )

  const pageTitle = currentPage?.name || 'Administration'
  const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-64'

  async function handleLogout() {
    if (logoutLoading) return

    setLogoutLoading(true)
    setLogoutError('')

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(
        error.message || 'Unable to log out. Please try again.'
      )
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F5F0]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col
          bg-[#183D32] text-white transition-all duration-300
          w-64 ${sidebarWidth}
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Logo */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <GraduationCap
              size={30}
              className="text-[#A8B9A8] shrink-0"
            />

            <span
              className={`${collapsed ? 'md:hidden' : ''}
                font-bold text-xl whitespace-nowrap`}
            >
              StudyFinder
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block text-white/60 hover:text-white"
            aria-label="Toggle sidebar width"
            aria-expanded={!collapsed}
          >
            {collapsed
              ? <ChevronRight size={20} />
              : <ChevronLeft size={20} />
            }
          </button>
        </div>

        {/* Administrator label */}
        <div className={`px-5 pt-6 pb-3 ${collapsed ? 'md:hidden' : ''}`}>
          <div className="flex items-center gap-2 text-[#A8B9A8]">
            <ShieldCheck size={15} />

            <span className="text-xs font-semibold uppercase tracking-wider">
              Administration
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#315C4C] text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                  ${collapsed ? 'md:justify-center' : ''}`
                }
              >
                <Icon size={20} className="shrink-0" />

                <span
                  className={`${collapsed ? 'md:hidden' : ''}
                    text-sm font-medium whitespace-nowrap`}
                >
                  {item.name}
                </span>
              </NavLink>
            )
          })}
        </nav>

        {/* Administrator information */}
        <div className="px-4 py-4 border-t border-white/10">
          <div
            className={`flex items-center gap-3 mb-4 ${
              collapsed ? 'md:justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-[#A8B9A8]/20 flex items-center justify-center shrink-0">
              <ShieldCheck size={19} className="text-[#A8B9A8]" />
            </div>

            <div className={`${collapsed ? 'md:hidden' : ''} min-w-0`}>
              <p className="text-sm font-semibold truncate">
                Administrator
              </p>

              <p className="text-xs text-white/50">
                System Management
              </p>
            </div>
          </div>

          {/* Logout error */}
          {logoutError && (
            <p
              role="alert"
              className="text-xs text-red-300 mb-3"
            >
              {logoutError}
            </p>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            title={collapsed ? 'Logout' : ''}
            className={`w-full flex items-center gap-3 p-3 rounded-xl
              text-white/70 hover:bg-white/10 hover:text-white transition
              disabled:opacity-50 disabled:cursor-not-allowed
              ${collapsed ? 'md:justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0" />

            <span className={`${collapsed ? 'md:hidden' : ''} text-sm`}>
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`min-h-screen transition-all duration-300
          ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}
      >
        {/* Header */}
        <header
          className="h-16 bg-white border-b border-[#E2E9E1]
          flex items-center justify-between px-4 md:px-6
          sticky top-0 z-30"
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-[#EDF3EE]"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              <Menu size={23} className="text-[#183D32]" />
            </button>

            <div>
              <h2 className="font-semibold text-[#183D32]">
                {pageTitle}
              </h2>

              <p className="text-xs text-gray-500 hidden sm:block">
                StudyFinder Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-[#EDF3EE]">
              <ShieldCheck size={16} className="text-[#315C4C]" />

              <span className="text-xs font-medium text-[#315C4C]">
                Admin Panel
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
