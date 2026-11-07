
import { Routes, Route } from 'react-router-dom'

// Student pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FindGroups from './pages/FindGroups'
import MyGroups from './pages/MyGroups'
import GroupDetails from './pages/GroupDetails'
import CreateGroup from './pages/CreateGroup'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminGroups from './pages/AdminGroups'
import AdminDiscussions from './pages/AdminDiscussions'
import AdminReports from './pages/AdminReports'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

// Authentication protection
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public page */}
      <Route path="/" element={<Home />} />

      {/* Authentication pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Student pages - login required */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'MODERATOR', 'ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find-groups" element={<FindGroups />} />
          <Route path="/my-groups" element={<MyGroups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Administration pages - admin role required */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/groups" element={<AdminGroups />} />
          <Route path="/admin/discussions" element={<AdminDiscussions />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
