import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Card from '../components/Card'
import ThemeToggle from '../components/ThemeToggle'
import { registerSchool } from '../services/auth'
import '../App.css'

function RegisterSchoolPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    school_name: '',
    school_email: '',
    school_phone: '',
    location: '',
    admin_username: '',
    admin_email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [successCode, setSuccessCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      const data = await registerSchool(form)
      setSuccessCode(data.school_code)
      localStorage.setItem('selected_role', 'admin')
      setTimeout(() => navigate('/login?role=admin'), 1800)
    } catch (requestError) {
      const details = requestError.response?.data
      setError(details?.detail || Object.values(details || {})[0]?.[0] || 'School registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="landing-toolbar auth-toolbar">
        <ThemeToggle />
      </div>
      <Card
        title="Register School"
        subtitle="Create your school workspace, generate a school code, and open the first admin account."
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>School name</span>
            <input value={form.school_name} onChange={(e) => setForm((c) => ({ ...c, school_name: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>School email</span>
            <input type="email" value={form.school_email} onChange={(e) => setForm((c) => ({ ...c, school_email: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>School phone</span>
            <input value={form.school_phone} onChange={(e) => setForm((c) => ({ ...c, school_phone: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Location</span>
            <input value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Admin username</span>
            <input value={form.admin_username} onChange={(e) => setForm((c) => ({ ...c, admin_username: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Admin email</span>
            <input type="email" value={form.admin_email} onChange={(e) => setForm((c) => ({ ...c, admin_email: e.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} />
          </label>

          {successCode ? (
            <div className="status-banner loading">School created. Your school code is {successCode}. Redirecting to login...</div>
          ) : null}
          {error ? <div className="status-banner error">{error}</div> : null}

          <div className="login-actions">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? 'Creating school...' : 'Create school'}
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

export default RegisterSchoolPage
