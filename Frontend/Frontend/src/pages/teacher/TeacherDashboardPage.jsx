import Card from '../../components/Card'
import '../../App.css'

function TeacherDashboardPage() {
  return (
    <Card
      title="Teacher Dashboard"
      subtitle="A working area for class performance, tasks, and teaching activity."
    >
      <div className="empty-state">
        Teacher overview widgets will appear here once those APIs are available.
      </div>
    </Card>
  )
}

export default TeacherDashboardPage
