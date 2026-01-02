import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LandingPage from './pages/LandingPage'
import UserLoginPage from './pages/UserLoginPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import DepartmentsPage from './pages/DepartmentsPage'
import DepartmentDetailPage from './pages/DepartmentDetailPage'
import TeachersPage from './pages/TeachersPage'
import ClassesPage from './pages/ClassesPage'
import StudentsPage from './pages/StudentsPage'
import TimetablePage from './pages/TimetablePage'
import StaffPage from './pages/StaffPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Landing Page - Public Home */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Student/Teacher Login */}
      <Route path="/login" element={<UserLoginPage />} />
      
      {/* Student Dashboard */}
      <Route path="/student/dashboard" element={isAuthenticated ? <StudentDashboardPage /> : <Navigate to="/login" />} />
      
      {/* Teacher Dashboard */}
      <Route path="/teacher/dashboard" element={isAuthenticated ? <TeacherDashboardPage /> : <Navigate to="/login" />} />
      
      {/* Admin Panel Routes */}
      <Route path="/admin/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/admin/dashboard" />} />
      <Route path="/admin/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/admin/dashboard" />} />
      <Route path="/admin" element={<Navigate to="/admin/login" />} />
      
      <Route element={<Layout />}>
        <Route path="/admin/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/departments" element={isAuthenticated ? <DepartmentsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/departments/:id" element={isAuthenticated ? <DepartmentDetailPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/departments/:id/teachers" element={isAuthenticated ? <TeachersPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/departments/:id/classes" element={isAuthenticated ? <ClassesPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/classes/:classId/students" element={isAuthenticated ? <StudentsPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/classes/:classId/timetable" element={isAuthenticated ? <TimetablePage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/staff" element={isAuthenticated ? <StaffPage /> : <Navigate to="/admin/login" />} />
      </Route>
      
      {/* Legacy routes */}
      <Route path="/signup" element={<Navigate to="/admin/signup" />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
