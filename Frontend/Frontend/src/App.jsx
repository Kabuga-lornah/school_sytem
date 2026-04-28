import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import ActivateAccountPage from './pages/ActivateAccountPage'
import DashboardLayout from './layouts/DashboardLayout'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterSchoolPage from './pages/RegisterSchoolPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import FinancePage from './pages/admin/FinancePage'
import StudentsPage from './pages/admin/StudentsPage'
import ParentDashboardPage from './pages/parent/ParentDashboardPage'
import FeesPage from './pages/parent/FeesPage'
import WalletPage from './pages/parent/WalletPage'
import ResultsPage from './pages/teacher/ResultsPage'
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage'
import TeacherStudentsPage from './pages/teacher/StudentsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-school" element={<RegisterSchoolPage />} />
      <Route path="/activate" element={<ActivateAccountPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/parent/dashboard" element={<ParentDashboardPage />} />
        <Route path="/parent/wallet" element={<WalletPage />} />
        <Route path="/parent/fees" element={<FeesPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/students" element={<StudentsPage />} />
        <Route path="/admin/finance" element={<FinancePage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/results" element={<ResultsPage />} />
        <Route path="/teacher/students" element={<TeacherStudentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
