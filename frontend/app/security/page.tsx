import { SecurityTabs } from '@/components/security/SecurityTabs'

export const metadata = { title: 'Security | lending-core' }

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 96px' }}>
      <div className="section-container" style={{ maxWidth: 1040 }}>
        <h1 className="page-heading">Security &amp; Risk</h1>
        <p className="page-subtitle">We prioritize transparency and responsible risk management.</p>
        <SecurityTabs />
      </div>
    </div>
  )
}
