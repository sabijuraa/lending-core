import { SecurityTabs } from '@/components/security/SecurityTabs'
import { SafetyStory, SecurityHero } from '@/components/security/SafetyStory'
import { CtaBand } from '@/components/layout/CtaBand'

export const metadata = { title: 'Security | lending-core' }

export default function SecurityPage() {
  return (
    <>
    <div style={{ minHeight: '100vh', padding: '40px 0 96px', overflowX: 'hidden' }}>
      <div className="section-container" style={{ maxWidth: 1040 }}>
        <SecurityHero />
        <SecurityTabs />
        <SafetyStory />
      </div>
    </div>
    <CtaBand />
    </>
  )
}
