
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  NavLink,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  LayoutDashboard,
  Search,
  Users,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  UserPlus,
  Info,
  RefreshCw,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import apiRequest from '../services/api'

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [notificationAction, setNotificationAction] = useState('')

  const location = useLocation()
  const navigate = useNavigate()
  const notificationRef = useRef(null)
  const notificationRequestRef = useRef(0)

  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Groups', path: '/find-groups', icon: Search },
    { name: 'My Groups', path: '/my-groups', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const currentPage = navigation.find(
    (item) => item.path === location.pathname
  )

  const pageTitle = currentPage?.name || 'Student Dashboard'
  const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-64'

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (!user) return

    const requestId = ++notificationRequestRef.current

    if (showLoading) {
      setNotificationsLoading(true)
    }

    try {
      const data = await apiRequest('/notifications?page=1&limit=10')

      if (requestId !== notificationRequestRef.current) return

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      )
      setUnreadCount(Number(data.unreadCount) || 0)
      setNotificationError('')
    } catch (error) {
      if (requestId !== notificationRequestRef.current) return

      setNotificationError(
        error.message || 'Unable to load notifications.'
      )
    } finally {
      if (requestId === notificationRequestRef.current && showLoading) {
        setNotificationsLoading(false)
      }
    }
  }, [user])

  // Load notifications and refresh them periodically.
  useEffect(() => {
    if (!user) {
      notificationRequestRef.current += 1
      setNotifications([])
      setUnreadCount(0)
      setNotificationsLoading(false)
      setNotificationError('')
      return
    }

    fetchNotifications(true)

    const interval = setInterval(() => {
      fetchNotifications(false)
    }, 30000)

    return () => {
      clearInterval(interval)
      notificationRequestRef.current += 1
    }
  }, [user, fetchNotifications])

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(
        error.message || 'Unable to log out. Please try again.'
      )
      setLoggingOut(false)
    }
  }

  async function handleMarkAsRead(notificationId) {
    if (notificationAction) return false

    setNotificationAction(notificationId)

    try {
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )

      setUnreadCount((previous) => Math.max(0, previous - 1))
      setNotificationError('')
      return true
    } catch (error) {
      setNotificationError(
        error.message || 'Unable to update notification.'
      )
      return false
    } finally {
      setNotificationAction('')
    }
  }

  async function handleMarkAllAsRead() {
    if (notificationAction || unreadCount === 0) return

    setNotificationAction('all')

    try {
      await apiRequest('/notifications/read-all', {
        method: 'PATCH',
      })

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )

      setUnreadCount(0)
      setNotificationError('')
    } catch (error) {
      setNotificationError(
        error.message || 'Unable to update notifications.'
      )
    } finally {
      setNotificationAction('')
    }
  }

  async function handleDeleteNotification(notification) {
    if (notificationAction) return

    setNotificationAction(notification.id)

    try {
      await apiRequest(`/notifications/${notification.id}`, {
        method: 'DELETE',
      })

      setNotifications((previous) =>
        previous.filter((item) => item.id !== notification.id)
      )

      if (!notification.isRead) {
        setUnreadCount((previous) => Math.max(0, previous - 1))
      }

      setNotificationError('')
    } catch (error) {
      setNotificationError(
        error.message || 'Unable to delete notification.'
      )
    } finally {
      setNotificationAction('')
    }
  }

  async function handleNotificationClick(notification) {
    if (notificationAction) return

    if (!notification.isRead) {
      const markedAsRead = await handleMarkAsRead(notification.id)

      if (!markedAsRead) return
    }

    if (notification.link) {
      setNotificationsOpen(false)
      navigate(notification.link)
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'NEW_COMMENT':
      case 'NEW_DISCUSSION':
        return MessageSquare

      case 'GROUP_UPDATE':
      case 'GROUP_INVITATION':
      case 'MEMBERSHIP_APPROVED':
        return UserPlus

      default:
        return Info
    }
  }

  function formatNotificationDate(date) {
    const notificationDate = new Date(date)

    if (Number.isNaN(notificationDate.getTime())) {
      return ''
    }

    return notificationDate.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
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
        className={`fixed inset-y-0 left-0 z-50 bg-[#183D32] text-white flex flex-col transition-all duration-300
          w-64 ${sidebarWidth}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >

        {/* Logo */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 overflow-hidden"
          >
            <GraduationCap
              size={30}
              className="text-[#A8B9A8] shrink-0"
            />

            <span
              className={`${collapsed ? 'md:hidden' : ''} font-bold text-xl whitespace-nowrap`}
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
          >
            {collapsed
              ? <ChevronRight size={20} />
              : <ChevronLeft size={20} />
            }
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          <p
            className={`px-3 pt-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[#A8B9A8] ${
              collapsed ? 'md:hidden' : ''
            }`}
          >
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#315C4C] text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'md:justify-center' : ''}`
                }
              >
                <Icon size={20} className="shrink-0" />

                <span
                  className={`${collapsed ? 'md:hidden' : ''} text-sm font-medium whitespace-nowrap`}
                >
                  {item.name}
                </span>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? 'Logout' : ''}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
              collapsed ? 'md:justify-center' : ''
            }`}
          >
            <LogOut size={20} className="shrink-0" />

            <span className={`${collapsed ? 'md:hidden' : ''} text-sm`}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </button>

          {logoutError && (
            <p className="px-3 mt-2 text-xs text-red-300" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >

        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E2E9E1] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">

          <div className="flex items-center gap-3">

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-[#EDF3EE] text-[#183D32]"
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>

            <div>
              <h2 className="font-semibold text-[#183D32]">
                {pageTitle}
              </h2>

              <p className="text-xs text-gray-500 hidden sm:block">
                Welcome to StudyFinder
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>

            <button
              type="button"
              onClick={() => {
                const opening = !notificationsOpen
                setNotificationsOpen(opening)

                if (opening) {
                  fetchNotifications(true)
                }
              }}
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-expanded={notificationsOpen}
              className="relative p-2 rounded-full hover:bg-[#EDF3EE] text-[#315C4C] transition"
            >
              <Bell size={22} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold border-2 border-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-[min(380px,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-[#E2E9E1] z-50 overflow-hidden">

                {/* Dropdown header */}
                <div className="px-4 py-4 border-b border-[#E2E9E1] flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#183D32]">
                      Notifications
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchNotifications(true)}
                      disabled={notificationsLoading}
                      title="Refresh notifications"
                      aria-label="Refresh notifications"
                      className="p-2 rounded-lg text-gray-500 hover:bg-[#EDF3EE] hover:text-[#183D32] disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={notificationsLoading ? 'animate-spin' : ''}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Close notifications"
                      className="p-2 rounded-lg text-gray-500 hover:bg-[#EDF3EE]"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                {/* Mark all as read */}
                {unreadCount > 0 && (
                  <div className="px-4 py-2 border-b border-[#E2E9E1]">
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={notificationAction === 'all'}
                      className="flex items-center gap-2 text-xs font-medium text-[#315C4C] hover:text-[#183D32] disabled:opacity-50"
                    >
                      <CheckCheck size={15} />
                      {notificationAction === 'all'
                        ? 'Updating...'
                        : 'Mark all as read'}
                    </button>
                  </div>
                )}

                {/* Error message */}
                {notificationError && (
                  <div
                    className="px-4 py-2 bg-red-50 text-red-600 text-xs"
                    role="alert"
                  >
                    {notificationError}
                  </div>
                )}

                {/* Notification list */}
                <div className="max-h-[420px] overflow-y-auto">

                  {notificationsLoading && notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-10 px-5 text-center">
                      <Bell
                        size={28}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="text-sm font-medium text-gray-600">
                        No notifications yet
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        New updates will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(
                        notification.type
                      )

                      return (
                        <div
                          key={notification.id}
                          className={`flex gap-3 p-4 border-b border-[#F0F3EF] transition ${
                            notification.isRead
                              ? 'bg-white'
                              : 'bg-[#F1F6F0]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            disabled={Boolean(notificationAction)}
                            className="flex-1 min-w-0 flex gap-3 text-left disabled:opacity-60"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E2EDE2] text-[#315C4C] flex items-center justify-center">
                              <NotificationIcon size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <p className="text-sm font-semibold text-[#183D32] leading-5">
                                  {notification.title}
                                </p>

                                {!notification.isRead && (
                                  <span className="w-2 h-2 shrink-0 mt-1.5 rounded-full bg-[#315C4C]" />
                                )}
                              </div>

                              <p className="text-xs text-gray-600 mt-1 leading-5">
                                {notification.message}
                              </p>

                              <p className="text-[11px] text-gray-400 mt-2">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>
                          </button>

                          {/* Notification actions */}
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                disabled={Boolean(notificationAction)}
                                title="Mark as read"
                                aria-label="Mark notification as read"
                                className="p-1.5 rounded-lg text-[#315C4C] hover:bg-[#E2EDE2] disabled:opacity-50"
                              >
                                <Check size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteNotification(notification)
                              }
                              disabled={Boolean(notificationAction)}
                              title="Delete notification"
                              aria-label="Delete notification"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Dropdown footer */}
                <div className="px-4 py-3 bg-[#FAFCF9] border-t border-[#E2E9E1]">
                  <button
                    type="button"
                    onClick={() => fetchNotifications(true)}
                    disabled={notificationsLoading}
                    className="w-full text-center text-xs font-semibold text-[#315C4C] hover:text-[#183D32] disabled:opacity-50"
                  >
                    Refresh notifications
                  </button>
                </div>
              </div>
            )}
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

export default MainLayout
