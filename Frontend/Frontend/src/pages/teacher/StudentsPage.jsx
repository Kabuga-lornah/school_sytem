import { useEffect, useState } from 'react'

import Card from '../../components/Card'
import { fetchParentsAndStudents, inviteParent } from '../../services/onboarding'
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

  return 'Parent invite failed. Please try again.'
}

function createLearner() {
  return {
    student_first_name: '',
    student_last_name: '',
    admission_number: '',
    date_of_birth: '',
    class_name: '',
    class_stream: '',
  }
}

function StudentsPage() {
  const [form, setForm] = useState({
    parent_email: '',
    parent_phone: '',
    parent_first_name: '',
    parent_last_name: '',
    learners: [createLearner()],
  })
  const [students, setStudents] = useState([])
  const [inviteResult, setInviteResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchParentsAndStudents()
        setStudents(data.students || [])
      } catch (requestError) {
        setError(getErrorMessage(requestError))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function updateLearner(index, field, value) {
    setForm((current) => ({
      ...current,
      learners: current.learners.map((learner, learnerIndex) =>
        learnerIndex === index ? { ...learner, [field]: value } : learner,
      ),
    }))
  }

  function addLearner() {
    setForm((current) => ({
      ...current,
      learners: [...current.learners, createLearner()],
    }))
  }

  function removeLearner(index) {
    setForm((current) => ({
      ...current,
      learners: current.learners.filter((_, learnerIndex) => learnerIndex !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError('')
      const data = await inviteParent(form)
      setInviteResult(data)
      setStudents((current) => [...data.students, ...current])
      setForm({
        parent_email: '',
        parent_phone: '',
        parent_first_name: '',
        parent_last_name: '',
        learners: [createLearner()],
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
        title="Register Families"
        subtitle="Add one parent once, then attach as many children as you need. The parent username is generated automatically from the parent first name."
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Parent first name</span>
            <input value={form.parent_first_name} onChange={(event) => setForm((current) => ({ ...current, parent_first_name: event.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Parent last name</span>
            <input value={form.parent_last_name} onChange={(event) => setForm((current) => ({ ...current, parent_last_name: event.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Parent email</span>
            <input type="email" value={form.parent_email} onChange={(event) => setForm((current) => ({ ...current, parent_email: event.target.value }))} />
          </label>
          <label className="auth-field">
            <span>Parent phone</span>
            <input value={form.parent_phone} onChange={(event) => setForm((current) => ({ ...current, parent_phone: event.target.value }))} />
          </label>

          <div className="family-section-header">
            <strong>Children</strong>
            <button type="button" className="button-link button-inline" onClick={addLearner}>
              Add another child
            </button>
          </div>

          <div className="family-grid">
            {form.learners.map((learner, index) => (
              <div key={index} className="family-card">
                <div className="family-card-header">
                  <strong>Child {index + 1}</strong>
                  {form.learners.length > 1 ? (
                    <button type="button" className="button-link button-inline" onClick={() => removeLearner(index)}>
                      Remove
                    </button>
                  ) : null}
                </div>

                <label className="auth-field">
                  <span>First name</span>
                  <input value={learner.student_first_name} onChange={(event) => updateLearner(index, 'student_first_name', event.target.value)} />
                </label>
                <label className="auth-field">
                  <span>Last name</span>
                  <input value={learner.student_last_name} onChange={(event) => updateLearner(index, 'student_last_name', event.target.value)} />
                </label>
                <label className="auth-field">
                  <span>Admission number</span>
                  <input value={learner.admission_number} onChange={(event) => updateLearner(index, 'admission_number', event.target.value)} />
                </label>
                <label className="auth-field">
                  <span>Date of birth</span>
                  <input type="date" value={learner.date_of_birth} onChange={(event) => updateLearner(index, 'date_of_birth', event.target.value)} />
                </label>
                <label className="auth-field">
                  <span>Class name</span>
                  <input value={learner.class_name} onChange={(event) => updateLearner(index, 'class_name', event.target.value)} />
                </label>
                <label className="auth-field">
                  <span>Class stream</span>
                  <input value={learner.class_stream} onChange={(event) => updateLearner(index, 'class_stream', event.target.value)} />
                </label>
              </div>
            ))}
          </div>

          {inviteResult ? (
            <div className="status-banner loading">
              Parent {inviteResult.parent.first_name} {inviteResult.parent.last_name} added with username {inviteResult.parent.username}. {inviteResult.students.length} child{inviteResult.students.length > 1 ? 'ren were' : ' was'} linked. School code: {inviteResult.school_code}. Temporary password: {inviteResult.temporary_password}
            </div>
          ) : null}
          {error ? <div className="status-banner error">{error}</div> : null}

          <div className="login-actions">
            <button type="submit" className="button-primary" disabled={submitting}>
              {submitting ? 'Registering family...' : 'Register family'}
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="Parents And Learners"
        subtitle="One parent account can now cover multiple children, each with separate class details and admission numbers."
      >
        {loading ? <div className="empty-state">Loading parent records...</div> : null}
        {!loading && students.length === 0 ? <div className="empty-state">No parents or learners have been added yet.</div> : null}
        {!loading && students.length > 0 ? (
          <div className="dashboard-list">
            {students.map((student) => (
              <div key={student.id} className="row-item">
                <div>
                  <strong>
                    {student.first_name} {student.last_name}
                  </strong>
                  <small>
                    {student.parent?.first_name} {student.parent?.last_name} ({student.parent?.username}) | {student.admission_number}
                    {student.class_name ? ` | ${student.class_name}` : ''}
                  </small>
                </div>
                <span className="badge">{student.parent?.must_change_password ? 'Setup pending' : 'Active'}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default StudentsPage
