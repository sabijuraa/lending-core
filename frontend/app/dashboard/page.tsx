'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { TxButton } from '@/components/market/TxButton'
import { LoadingBlock, ErrorBlock, EmptyBlock, DemoNotice } from '@/components/ui/States'
import { formatUSD, formatPercent } from '@/lib/formatting'
import type { PositionView } from '@/providers/types'

export default function DashboardPage() {
  const data = useData()
  const { account } = useAccountId()
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([] as PositionView[])), [account, data])
  const markets = useAsync(() => data.getMarkets(), [data])

  if (!account) {
    return (
      <div className="section-container" style={{ padding: '64px 24px' }}>
        <EmptyBlock title="Connect a wallet" body="Your supplies, borrows and health factor show here once a wallet is connected." />
      </div>
    )
  }

  const ps = positions.data ?? []
  const ms = markets.data ?? []
  const rate = (slug: string, side: 'supplyAPY' | 'borrowAPY') => ms.find((m) => m.slug === slug)?.[side] ?? 0
  const supplied = ps.reduce((s, p) => s + p.supplied, 0)
  const borrowed = ps.reduce((s, p) => s + p.borrowed, 0)
  const earn = ps.reduce((s, p) => s + p.supplied * rate(p.slug, 'supplyAPY'), 0)
  const pay = ps.reduce((s, p) => s + p.borrowed * rate(p.slug, 'borrowAPY'), 0)
  const netAPY = supplied > 0 ? (earn - pay) / supplied : 0
  const worstHF = ps.filter((p) => p.borrowed > 0).reduce((min, p) => Math.min(min, p.healthFactor), Infinity)

  return (
    <div style={{ padding: '48px 0 96px' }}>
      <div className="section-container">
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <DemoNotice />
        {(positions.loading || markets.loading) && <div style={{ marginTop: 24 }}><LoadingBlock rows={5} /></div>}
        {positions.error && <div style={{ marginTop: 24 }}><ErrorBlock message={positions.error} onRetry={positions.reload} /></div>}
        {!positions.loading && !positions.error && (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '24px 0 32px' }}>
              <div className="card" style={{ padding: 20, display: 'grid', gap: 14 }}>
                <div><div className="stat-label">Total supplied</div><div className="stat-value">{formatUSD(supplied)}</div></div>
                <div><div className="stat-label">Total borrowed</div><div className="stat-value" style={{ color: 'var(--purple)' }}>{formatUSD(borrowed)}</div></div>
                <div><div className="stat-label">Net APY</div><div className="stat-value">{formatPercent(netAPY, 2)}</div></div>
              </div>
              <div className="card" style={{ padding: 20, display: 'grid', justifyItems: 'center' }}>
                <span className="stat-label">Lowest health factor</span>
                <HealthGauge value={worstHF} />
              </div>
            </section>
            {ps.length === 0 ? (
              <EmptyBlock title="No positions yet" body="Supply to earn, or post collateral and borrow." href="/markets" cta="Browse markets" />
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {ps.map((p) => <PositionRow key={p.slug} p={p} account={account} onDone={positions.reload} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PositionRow({ p, account, onDone }: { p: PositionView; account: string; onDone: () => void }) {
  const data = useData()
  const [repay, setRepay] = useState('')
  const [withdraw, setWithdraw] = useState('')
  const input = { fontFamily: 'var(--font-mono)', padding: '8px 10px', border: '1px solid var(--border-default)', borderRadius: 8, width: '100%', background: 'var(--bg-1)', color: 'var(--text-1)' } as const
  return (
    <article className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'start' }}>
      <div>
        <Link href={`/markets/${p.slug}`} style={{ fontWeight: 600, fontSize: 18 }}>{p.slug.toUpperCase()} market</Link>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          Supplied {formatUSD(p.supplied)}<br />Borrowed {formatUSD(p.borrowed)}<br />Collateral {p.collateral.toLocaleString()}
        </div>
      </div>
      <HealthGauge value={p.healthFactor} size="sm" />
      <div style={{ display: 'grid', gap: 8 }}>
        <label className="stat-label" htmlFor={`r-${p.slug}`}>Repay</label>
        <input id={`r-${p.slug}`} inputMode="decimal" value={repay} onChange={(e) => setRepay(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" style={input} />
        <TxButton label="Repay" disabled={!(Number(repay) > 0) || p.borrowed === 0} run={() => data.repay(p.slug, Number(repay), account)} onDone={() => { setRepay(''); onDone() }} />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <label className="stat-label" htmlFor={`w-${p.slug}`}>Withdraw</label>
        <input id={`w-${p.slug}`} inputMode="decimal" value={withdraw} onChange={(e) => setWithdraw(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" style={input} />
        <TxButton label="Withdraw" disabled={!(Number(withdraw) > 0) || p.supplied === 0} run={() => data.withdraw(p.slug, Number(withdraw), account)} onDone={() => { setWithdraw(''); onDone() }} />
      </div>
    </article>
  )
}
