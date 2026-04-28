import Card from '../../components/Card'
import '../../App.css'

function FeesPage() {
  return (
    <Card
      title="Fees"
      subtitle="This page will show fee statements, overdue items, and payment history."
    >
      <div className="empty-state">
        Fee management content will live here. The route is ready for future API integration.
      </div>
    </Card>
  )
}

export default FeesPage
