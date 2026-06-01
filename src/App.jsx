import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Lazy load pages
const LoginPage          = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/auth/ResetPasswordPage'))
const DashboardPage      = lazy(() => import('./pages/dashboard/DashboardPage'))
const ProjectsPage       = lazy(() => import('./pages/projects/ProjectsPage'))
const ProjectDetailPage  = lazy(() => import('./pages/projects/ProjectDetailPage'))
const TaskDetailPage     = lazy(() => import('./pages/tasks/TaskDetailPage'))
const InvitePage         = lazy(() => import('./pages/invite/InvitePage'))

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/invite/:token"   element={<InvitePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"                          element={<DashboardPage />} />
            <Route path="/projects"                           element={<ProjectsPage />} />
            <Route path="/projects/:id"                       element={<ProjectDetailPage />} />
            <Route path="/projects/:id/tasks/:taskId"         element={<TaskDetailPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}