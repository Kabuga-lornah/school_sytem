import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = {
  parent: [
    { label: 'Dashboard', to: '/parent/dashboard' },
    { label: 'Wallet', to: '/parent/wallet' },
    { label: 'Fees', to: '/parent/fees' },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Teachers', to: '/admin/students' },
    { label: 'Finance', to: '/admin/finance' },
    { label: 'Analytics', to: '/admin/analytics' },
  ],
  teacher: [
    { label: 'Dashboard', to: '/teacher/dashboard' },
    { label: 'Results', to: '/teacher/results' },
    { label: 'Parents', to: '/teacher/students' },
    { label: 'Colleagues', to: '/teacher/colleagues' },
  ],
}

function Navbar({ userName = 'Parent User', role = 'parent' }) {
  const navigate = useNavigate()
  const navItems = NAV_ITEMS[role] ?? NAV_ITEMS.parent

  function handleLogout() {
    const loginRole = role || localStorage.getItem('selected_role') || localStorage.getItem('role') || 'parent'
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('role')
    localStorage.setItem('selected_role', loginRole)
    window.dispatchEvent(new Event('auth-user-updated'))
    navigate(`/login?role=${loginRole}`)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">MyShule</div>

      <div className="navbar-links" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-user">
        <span className="navbar-user-name">{userName}</span>
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
