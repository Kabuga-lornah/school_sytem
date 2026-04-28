import Card from '../../components/Card'
import '../../App.css'

function StudentsPage() {
  return (
    <Card
      title="Students"
      subtitle="This page will list learners, class groups, and quick academic actions."
    >
      <div className="empty-state">
        Teacher-facing student tools will be connected here.
      </div>
    </Card>
  )
}

export default StudentsPage
