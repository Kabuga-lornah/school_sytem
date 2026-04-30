import { Navigate } from 'react-router-dom'

import { getRoleConfig } from '../utils/roles'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('access_token')
  const role = localStorage.getItem('role') || localStorage.getItem('selected_role') || 'admin'
  const roleConfig = getRoleConfig(role)

  if (!token) {
    return <Navigate to={`/login?role=${role}`} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={roleConfig?.dashboardPath || '/'} replace />
  }

  return children
}

export default ProtectedRoute
