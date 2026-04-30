import { useEffect, useState } from 'react'

import Card from '../../components/Card'
import { fetchTeachers, inviteTeacher } from '../../services/onboarding'
import '../../App.css'

function getErrorMessage(error) {
  const details = error.response?.data
  if (typeof details?.detail === 'string') {
    return details.detail
  }

  const firstValue = Object.values(details || {})[0]
  if (Array.isArray(firstValue) && firstValue[0]) {
    return firstValue[0]
  }

  return 'Teacher invite failed. Please try again.'
}

function TeacherColleaguesPage() {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
  })
  const [teachers, setTeachers] = useState([])
  const [inviteResult, setInviteResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadTeachers() {
      try {
        const data = await fetchTeachers()
        setTeachers(data.teachers || [])
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      } finally {
        setLoading(false)
      }
    }

    loadTeachers()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      const data = await inviteTeacher(form)
      setInviteResult(data)
      setTeachers((current) => [data.teacher, ...current])
      setForm({
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
      })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-grid">
      <Card
        title="Invite Colleagues"
        subtitle="Teachers can suggest new colleagues for the same school. The school admin must approve them before they can activate and access their dashboards."
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Phone</span>
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label className="auth-field">
            <span>First name</span>
            <input value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Last name</span>
            <input value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} />
          </label>

          {inviteResult ? (
            <div className="status-banner loading">
              Invite sent for {inviteResult.teacher.first_name} {inviteResult.teacher.last_name}. The admin must approve this teacher before activation. School code: {inviteResult.school_code}. Activation key: {inviteResult.activation_key}
            </div>
          ) : null}
          {error ? <div className="status-banner error">{error}</div> : null}

          <div className="login-actions">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? 'Sending request...' : 'Invite colleague'}
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="Invited Colleagues"
        subtitle="These are the teachers you have personally invited. They stay pending until the school admin approves them."
      >
        {loading ? <div className="empty-state">Loading invited colleagues...</div> : null}
        {!loading && teachers.length === 0 ? <div className="empty-state">You have not invited any colleagues yet.</div> : null}
        {!loading && teachers.length > 0 ? (
          <div className="dashboard-list">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="row-item">
                <div>
                  <strong>{teacher.first_name} {teacher.last_name}</strong>
                  <small>{teacher.email || teacher.phone || 'No contact added'}</small>
                </div>
                <span className={`badge${teacher.is_approved ? '' : ' badge-warning'}`}>
                  {!teacher.is_approved ? 'Awaiting admin approval' : teacher.must_change_password ? 'Setup pending' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default TeacherColleaguesPage
