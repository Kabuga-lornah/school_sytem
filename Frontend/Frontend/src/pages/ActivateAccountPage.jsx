import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import Card from '../components/Card'
import ThemeToggle from '../components/ThemeToggle'
import { activateAccount } from '../services/auth'
import { getRoleConfig } from '../utils/roles'
import '../App.css'

function ActivateAccountPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role')
  const roleConfig = useMemo(() => getRoleConfig(role), [role])
  const [form, setForm] = useState({
    school_code: '',
    identifier: '',
    temporary_password: '',
    username: '',
    new_password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!roleConfig || role === 'admin') {
      navigate('/', { replace: true })
      return
    }

    localStorage.setItem('selected_role', role)
  }, [navigate, role, roleConfig])

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')
      await activateAccount(form)
      setSuccess('Account activated successfully. Redirecting to login...')
      setTimeout(() => navigate(`/login?role=${role}`), 1500)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Activation failed. Check the invite details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!roleConfig || role === 'admin') {
    return null
  }

  return (
    <div className="login-shell">
      <div className="landing-toolbar auth-toolbar">
        <ThemeToggle />
      </div>
      <Card
        title={`Activate ${roleConfig.label} Account`}
        subtitle={role === 'teacher'
          ? 'Use your school code, email or phone number, and activation key. You will choose your username during setup.'
          : 'Use the school code and temporary credentials provided by the school admin.'}
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>School code</span>
            <input value={form.school_code} onChange={(e) => setForm((c) => ({ ...c, school_code: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>{role === 'teacher' ? 'Email or phone number' : 'Username or email'}</span>
            <input value={form.identifier} onChange={(e) => setForm((c) => ({ ...c, identifier: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>{role === 'teacher' ? 'Activation key' : 'Temporary password'}</span>
            <input type="password" value={form.temporary_password} onChange={(e) => setForm((c) => ({ ...c, temporary_password: e.target.value }))} />
          </label>
          {role === 'teacher' ? (
            <label className="auth-field">
              <span>Choose username</span>
              <input value={form.username} onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))} />
            </label>
          ) : null}
          <label className="auth-field">
            <span>New password</span>
            <input type="password" value={form.new_password} onChange={(e) => setForm((c) => ({ ...c, new_password: e.target.value }))} />
          </label>

          <div className="role-summary">
            <strong>Selected role</strong>
            <span>{roleConfig.label}</span>
          </div>

          {success ? <div className="status-banner loading">{success}</div> : null}
          {error ? <div className="status-banner error">{error}</div> : null}

          <div className="login-actions">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? 'Activating...' : 'Activate account'}
            </button>
            <button type="button" className="button-link" onClick={() => navigate('/')}>
              Back
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ActivateAccountPage
