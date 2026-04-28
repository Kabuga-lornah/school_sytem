import Card from '../../components/Card'
import '../../App.css'

function AnalyticsPage() {
  return (
    <Card
      title="Analytics"
      subtitle="Review charts, trends, and performance metrics across the school."
    >
      <div className="empty-state">
        Analytics visualizations will be added here as reporting endpoints grow.
      </div>
    </Card>
  )
}

export default AnalyticsPage
