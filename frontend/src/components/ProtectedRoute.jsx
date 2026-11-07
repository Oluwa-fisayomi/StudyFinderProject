
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Wait until the authentication check is complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-600">
            Checking your account...
          </p>
        </div>
      </div>
    )
  }

  // Redirect users who are not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // Restrict access according to user role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
