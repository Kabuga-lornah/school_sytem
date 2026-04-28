import { useEffect, useState } from 'react'

import AlertBox from '../../components/AlertBox'
import Card from '../../components/Card'
import { fetchParentDashboard } from '../../services/dashboard'
import '../../App.css'

function ParentDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')
        const data = await fetchParentDashboard()
        if (isActive) {
          localStorage.setItem('user_name', data?.parent?.username ?? 'User')
          localStorage.setItem('role', 'parent')
          window.dispatchEvent(new Event('auth-user-updated'))
          setDashboard(data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError.response?.data?.detail ||
              'Unable to load the dashboard. Make sure the backend server is running and you are authenticated.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isActive = false
    }
  }, [])

  if (loading) {
    return <div className="status-banner loading">Loading dashboard data...</div>
  }

  if (error) {
    return <div className="status-banner error">{error}</div>
  }

  const children = dashboard?.children ?? []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {dashboard?.parent?.username ?? 'Parent'}</h1>
          <p>
            This dashboard pulls student academics, finance balances, and alerts from one backend
            endpoint.
          </p>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="empty-state">No children are linked to this parent account yet.</div>
      ) : (
        <div className="dashboard-grid">
          {children.map((child) => {
            const wallet = child.finance?.wallet
            const fees = child.finance?.fees
            const results = child.academics?.latest_results ?? []
            const transactions = wallet?.recent_transactions ?? []
            const alerts = child.alerts ?? []

            return (
              <Card
                key={child.id}
                title={child.name}
                subtitle={`Admission No: ${child.admission_number}`}
              >
                <div className="student-meta">
                  <div id="fees">
                    <span className="meta-label">Class</span>
                    <span className="meta-value">{child.class ?? 'Not assigned'}</span>
                  </div>
                  <div id="wallet">
                    <span className="meta-label">Wallet balance</span>
                    <span className="meta-value">KES {wallet?.balance ?? 0}</span>
                  </div>
                  <div>
                    <span className="meta-label">Fees balance</span>
                    <span className="meta-value">KES {fees?.balance ?? 0}</span>
                  </div>
                </div>

                <h3 className="section-title">Alerts</h3>
                {alerts.length ? (
                  <div className="alert-list">
                    {alerts.map((alert) => (
                      <AlertBox key={alert} message={alert} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No active alerts.</div>
                )}

                <h3 className="section-title">Latest Results</h3>
                {results.length ? (
                  <div className="result-list">
                    {results.map((result) => (
                      <div className="row-item" key={result.id}>
                        <div>
                          <strong>{result.subject}</strong>
                          <small>{result.assessment_title}</small>
                        </div>
                        <span className="badge">
                          {result.score} / {result.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No results available.</div>
                )}

                <h3 className="section-title">Recent Wallet Transactions</h3>
                {transactions.length ? (
                  <div className="transaction-list">
                    {transactions.map((transaction) => (
                      <div className="row-item" key={transaction.id}>
                        <div>
                          <strong>{transaction.type}</strong>
                          <small>{transaction.description || 'No description'}</small>
                        </div>
                        <span className="badge">KES {transaction.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No recent wallet transactions.</div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ParentDashboardPage
