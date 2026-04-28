import Card from '../../components/Card'
import '../../App.css'

function AdminDashboardPage() {
  return (
    <Card
      title="Admin Dashboard"
      subtitle="Overview of school operations, finance summaries, and system-wide alerts."
    >
      <div className="empty-state">
        Admin dashboard widgets will appear here once admin APIs are connected.
      </div>
    </Card>
  )
}

export default AdminDashboardPage
