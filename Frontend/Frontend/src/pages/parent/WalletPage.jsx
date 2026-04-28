import Card from '../../components/Card'
import '../../App.css'

function WalletPage() {
  return (
    <Card
      title="Wallet"
      subtitle="This page will show balances, top-ups, and recent wallet activity for parents."
    >
      <div className="empty-state">
        Wallet tools are coming next. This placeholder keeps parent navigation working end to end.
      </div>
    </Card>
  )
}

export default WalletPage
