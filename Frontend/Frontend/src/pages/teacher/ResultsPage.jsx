import Card from '../../components/Card'
import '../../App.css'

function ResultsPage() {
  return (
    <Card
      title="Results"
      subtitle="This page will help teachers capture and review academic results."
    >
      <div className="empty-state">
        Results entry and moderation tools are reserved for this route.
      </div>
    </Card>
  )
}

export default ResultsPage
