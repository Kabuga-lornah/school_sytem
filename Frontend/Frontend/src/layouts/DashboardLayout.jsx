import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import Navbar from '../components/Navbar'

function DashboardLayout({ children }) {
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || 'User')
  const [role, setRole] = useState(localStorage.getItem('role') || 'parent')

  useEffect(() => {
    function syncUserName() {
      setUserName(localStorage.getItem('user_name') || 'User')
      setRole(localStorage.getItem('role') || 'parent')
    }

    window.addEventListener('auth-user-updated', syncUserName)
    return () => {
      window.removeEventListener('auth-user-updated', syncUserName)
    }
  }, [])

  return (
    <div className="app-shell">
      <div className="app-frame">
        <Navbar userName={userName} role={role} />
        <main className="app-panel">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
