'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useData } from '@/providers/provider'
import { healthFactor } from '@/providers/types'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { TxButton } from '@/components/market/TxButton'
import { LoadingBlock, ErrorBlock, EmptyBlock, DemoNotice } from '@/components/ui/States'
import { formatUSD, formatPercent } from '@/lib/formatting'

const inputStyle = { fontFamily: 'var(--font-mono)', fontSize: 22, padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-1)', color: 'var(--text-1)', width: '100%' } as const

export default function BorrowAssetPage() {
  const { asset } = useParams<{ asset: string }>()
  const data = useData()
  const { account } = useAccountId()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([])), [account, data])
  const [collateral, setCollateral] = useState('')
  const [amount, setAmount] = useState('')
  const m = market.data
  const pos = positions.data?.find((p) => p.slug === asset)
  const col = Number(collateral) || 0
  const amt = Number(amount) || 0
  const totalCol = (pos?.collateral ?? 0) + col
  const totalDebt = (pos?.borrowed ?? 0) + amt
  const hf = m ? healthFactor(totalCol, m.oraclePrice, m.lltv, totalDebt) : Infinity
  const limit = m ? totalCol * m.oraclePrice * m.lltv - (pos?.borrowed ?? 0) : 0
  const liqPrice = m && totalCol > 0 && totalDebt > 0 ? totalDebt / (totalCol * m.lltv) : null

  function refresh() { setCollateral(''); setAmount(''); market.reload(); positions.reload() }

  return (
    <div style={{ padding: '48px 0 96px' }}>
      <div className="section-container" style={{ maxWidth: 960 }}>
        <Link href={`/markets/${asset}`} style={{ fontSize: 13, color: 'var(--text-3)' }}>Back to market</Link>
        {market.loading && <div style={{ marginTop: 24 }}><LoadingBlock /></div>}
        {market.error && <div style={{ marginTop: 24 }}><ErrorBlock message={market.error} onRetry={market.reload} /></div>}
        {!market.loading && !market.error && !m && <div style={{ marginTop: 24 }}><EmptyBlock title="Market not found" body="Pick a market from the list." href="/markets" cta="See markets" /></div>}
        {m && (
          <>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 600, margin: '16px 0 6px' }}>Borrow {m.loanSymbol} against {m.collateralSymbol}</h1>
            <p style={{ color: 'var(--text-2)' }}>Post {m.collateralSymbol} and borrow up to {formatPercent(m.lltv * 100, 0)} of its value. Below a health factor of 1 anyone can liquidate the position.</p>
            <DemoNotice />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 24 }}>
              <div className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
                <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                  Your position has {(pos?.collateral ?? 0).toLocaleString()} {m.collateralSymbol} posted and {formatUSD(pos?.borrowed ?? 0)} borrowed.
                </div>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span className="stat-label">Add collateral in {m.collateralSymbol}</span>
                  <input inputMode="decimal" value={collateral} onChange={(e) => setCollateral(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.0" style={inputStyle} />
                </label>
                {account && <TxButton label={`Post ${m.collateralSymbol}`} disabled={!(col > 0)} run={() => data.supplyCollateral(m.slug, col, account)} onDone={refresh} />}
                <label style={{ display: 'grid', gap: 6 }}>
                  <span className="stat-label">Borrow amount in {m.loanSymbol}</span>
                  <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" style={inputStyle} />
                </label>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Borrow limit {formatUSD(Math.max(0, limit))} at {formatPercent(m.borrowAPY, 2)} APY</div>
                {account ? (
                  <TxButton label={`Borrow ${m.loanSymbol}`} disabled={!(amt > 0) || hf < 1} run={() => data.borrow(m.slug, amt, account)} onDone={refresh} />
                ) : <p style={{ color: 'var(--text-2)' }}>Connect a wallet to borrow.</p>}
              </div>
              <div className="card" style={{ padding: 24, display: 'grid', justifyItems: 'center', alignContent: 'start', gap: 12 }}>
                <span className="stat-label">Health factor after this borrow</span>
                <HealthGauge value={hf} />
                <p style={{ fontSize: 13, color: hf < 1 ? 'var(--danger)' : 'var(--text-2)', textAlign: 'center' }}>
                  {hf < 1 ? 'This would be liquidatable right away. Add collateral or borrow less.' : liqPrice ? `Liquidation if ${m.collateralSymbol} falls to ${formatUSD(liqPrice)}.` : 'No debt yet, so nothing can be liquidated.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
