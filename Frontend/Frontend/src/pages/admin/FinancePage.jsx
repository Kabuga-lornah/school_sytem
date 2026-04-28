import Card from '../../components/Card'
import '../../App.css'

function FinancePage() {
  return (
    <Card
      title="Finance"
      subtitle="Track payments, wallets, and school finance summaries in one place."
    >
      <div className="empty-state">
        Admin finance controls will be connected here soon.
      </div>
    </Card>
  )
}

export default FinancePage
