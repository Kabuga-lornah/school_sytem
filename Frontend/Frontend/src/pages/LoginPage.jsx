import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import Card from '../components/Card'
import ThemeToggle from '../components/ThemeToggle'
import { loginUser } from '../services/auth'
import { getRoleConfig } from '../utils/roles'
import '../App.css'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role')
  const roleConfig = useMemo(() => getRoleConfig(role), [role])
  const [form, setForm] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!roleConfig) {
      navigate('/', { replace: true })
      return
    }

    localStorage.setItem('selected_role', role)
  }, [navigate, role, roleConfig])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!roleConfig) {
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const data = await loginUser(form)
      localStorage.setItem('selected_role', role)
      localStorage.setItem('role', role)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user_name', form.username)
      window.dispatchEvent(new Event('auth-user-updated'))
      navigate(roleConfig.dashboardPath)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Login failed. Check your credentials and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!roleConfig) {
    return null
  }

  return (
    <div className="login-shell">
      <div className="landing-toolbar auth-toolbar">
        <ThemeToggle />
      </div>
      <Card
        title={`Logging in as ${roleConfig.label}`}
        subtitle="Use the credentials issued by your school to access the correct MyShule portal."
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Enter your username"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
            />
          </label>

          <div className="role-summary">
            <strong>Selected role</strong>
            <span>{roleConfig.label}</span>
          </div>

          {error ? <div className="status-banner error">{error}</div> : null}

          <div className="login-actions">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Continue to dashboard'}
            </button>
            <button type="button" className="button-link" onClick={() => navigate('/')}>
              Back to role selection
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
