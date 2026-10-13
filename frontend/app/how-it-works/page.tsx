import Link from 'next/link'

export const metadata = { title: 'How it works | lending-core' }

const steps = [
  { n: '01', title: 'Supply', body: 'Lenders deposit the loan asset into one market and receive supply shares. Interest paid by borrowers grows the value of every share.' },
  { n: '02', title: 'Borrow', body: 'Borrowers post collateral and draw the loan asset. Each market sets a liquidation LTV, the share of collateral value you can owe before the position is at risk.' },
  { n: '03', title: 'Repay or be liquidated', body: 'Repay at any time to free collateral. If the collateral price falls and the health factor drops below 1, any address can repay the debt and take collateral plus a bonus.' },
]

const sections = [
  { h: 'Isolated markets', p: 'A market is a fixed pair of loan asset and collateral with one oracle, one rate model, one LTV and one liquidation bonus. Its id is the hash of those parameters, so nobody can change them after creation. A bad oracle or a crashing collateral can only hurt the market that chose it.' },
  { h: 'The interest rate model', p: 'The borrow rate follows a kinked curve. It climbs gently until 80% of supplied assets are lent out, then climbs fast. Lenders earn the borrow rate times utilization. Interest accrues every time the market is touched, before any balance changes.' },
  { h: 'The health factor', p: 'Health factor is collateral value times the liquidation LTV, divided by debt. Above 1 the position is safe. At 1 or below it can be liquidated. The gauge on each borrow screen shows how a new borrow would move it before you sign.' },
  { h: 'Liquidation', p: 'A liquidator repays the full debt of an unhealthy position and receives collateral worth that debt plus the market bonus. If the collateral is not enough to cover it, the shortfall is written off against that market’s lenders as bad debt and an event records it.' },
  { h: 'Oracles', p: 'Every price read checks that the price is above zero and newer than the market’s staleness limit. If it fails, the market pauses rather than act on bad data. On Base Sepolia the oracles are owner-set test feeds.' },
]

export default function HowItWorksPage() {
  return (
    <div style={{ padding: '56px 0 96px' }}>
      <div className="section-container" style={{ maxWidth: 860 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12 }}>How lending-core works</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 17, marginBottom: 40 }}>Supply to earn. Borrow against collateral. Every market stands alone.</p>
        <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 48 }}>
          {steps.map((s) => (
            <li key={s.n} className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: 8 }}>{s.n}</div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{s.title}</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{s.body}</p>
            </li>
          ))}
        </ol>
        {sections.map((s) => (
          <section key={s.h} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{s.h}</h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>{s.p}</p>
          </section>
        ))}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/markets" className="btn btn-primary btn-lg">View markets</Link>
          <Link href="/docs" className="btn btn-ghost btn-lg">Read the docs</Link>
        </div>
      </div>
    </div>
  )
}
