'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import { TxButton } from '@/components/market/TxButton'
import { LoadingBlock, ErrorBlock, EmptyBlock, DemoNotice } from '@/components/ui/States'
import { formatUSD, formatPercent } from '@/lib/formatting'

export default function SupplyPage() {
  const { asset } = useParams<{ asset: string }>()
  const data = useData()
  const { account } = useAccountId()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const [amount, setAmount] = useState('')
  const value = Number(amount)
  const m = market.data
  const valid = Number.isFinite(value) && value > 0

  return (
    <div style={{ padding: '48px 0 96px' }}>
      <div className="section-container" style={{ maxWidth: 720 }}>
        <Link href={`/markets/${asset}`} style={{ fontSize: 13, color: 'var(--text-3)' }}>Back to market</Link>
        {market.loading && <div style={{ marginTop: 24 }}><LoadingBlock /></div>}
        {market.error && <div style={{ marginTop: 24 }}><ErrorBlock message={market.error} onRetry={market.reload} /></div>}
        {!market.loading && !market.error && !m && <div style={{ marginTop: 24 }}><EmptyBlock title="Market not found" body="Pick a market from the list." href="/markets" cta="See markets" /></div>}
        {m && (
          <>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, margin: '16px 0 6px' }}>Supply {m.loanSymbol}</h1>
            <p style={{ color: 'var(--text-2)' }}>Lend {m.loanSymbol} to borrowers who post {m.collateralSymbol}. You earn the supply rate and can withdraw any idle liquidity.</p>
            <DemoNotice />
            <div className="card" style={{ padding: 24, marginTop: 24, display: 'grid', gap: 20 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span className="stat-label">Amount in {m.loanSymbol}</span>
                <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 28, padding: '12px 14px', border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-1)', color: 'var(--text-1)' }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div><div className="stat-label">Supply APY now</div><div className="stat-value" style={{ fontSize: 20 }}>{formatPercent(m.supplyAPY, 2)}</div></div>
                {[30, 90, 365].map((d) => (
                  <div key={d}><div className="stat-label">Earned in {d} days</div><div className="stat-value" style={{ fontSize: 20 }}>{formatUSD(valid ? value * (m.supplyAPY / 100) * (d / 365) : 0)}</div></div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Projections assume today&apos;s rate holds. The rate moves with utilization.</p>
              {account ? (
                <TxButton label={`Supply ${m.loanSymbol}`} disabled={!valid} run={() => data.supply(m.slug, value, account)} onDone={() => { setAmount(''); market.reload() }} />
              ) : (
                <p style={{ color: 'var(--text-2)' }}>Connect a wallet to supply.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
