import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Landing Page - Public Home */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Admin Panel Routes */}
      <Route path="/admin/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/admin/dashboard" />} />
      <Route path="/admin/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/admin/dashboard" />} />
      <Route path="/admin" element={<Navigate to="/admin/login" />} />
      
      <Route element={<Layout />}>
        <Route path="/admin/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/admin/login" />} />
      </Route>
      
      {/* Legacy routes - redirect to new structure */}
      <Route path="/login" element={<Navigate to="/admin/login" />} />
      <Route path="/signup" element={<Navigate to="/admin/signup" />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
