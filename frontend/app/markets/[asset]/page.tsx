'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { KinkedRateCurve } from '@/components/charts/KinkedRateCurve'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { LoadingBlock, ErrorBlock, EmptyBlock, DemoNotice } from '@/components/ui/States'
import { formatUSD, formatPercent, formatTimeAgo } from '@/lib/formatting'

export default function MarketDetailPage() {
  const { asset } = useParams<{ asset: string }>()
  const data = useData()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const activity = useAsync(() => data.getActivity(asset), [asset, data])
  const m = market.data

  return (
    <div style={{ padding: '48px 0 96px' }}>
      <div className="section-container">
        <Link href="/markets" style={{ fontSize: 13, color: 'var(--text-3)' }}>Back to markets</Link>
        {market.loading && <div style={{ marginTop: 24 }}><LoadingBlock rows={6} /></div>}
        {market.error && <div style={{ marginTop: 24 }}><ErrorBlock message={market.error} onRetry={market.reload} /></div>}
        {!market.loading && !market.error && !m && (
          <div style={{ marginTop: 24 }}><EmptyBlock title="Market not found" body="No market uses that collateral yet." href="/markets" cta="See all markets" /></div>
        )}
        {m && (
          <>
            <header style={{ margin: '20px 0 32px' }}>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, letterSpacing: '-0.02em' }}>
                {m.collateralSymbol} <span style={{ color: 'var(--text-3)' }}>/ {m.loanSymbol}</span>
              </h1>
              <p style={{ color: 'var(--text-2)', marginTop: 8 }}>
                Borrow {m.loanSymbol} against {m.collateralName}. This market has its own oracle and its own risk.
              </p>
              <DemoNotice />
            </header>

            <section aria-label="Key figures" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
              {[
                ['Total supplied', formatUSD(m.totalSupplied, true)],
                ['Total borrowed', formatUSD(m.totalBorrowed, true)],
                ['Supply APY', formatPercent(m.supplyAPY, 2)],
                ['Borrow APY', formatPercent(m.borrowAPY, 2)],
                ['Liquidation LTV', formatPercent(m.lltv * 100, 0)],
                ['Liquidation bonus', formatPercent(m.liquidationBonus * 100, 0)],
                ['Oracle price', formatUSD(m.oraclePrice)],
                ['Available', formatUSD(m.totalSupplied - m.totalBorrowed, true)],
              ].map(([k, v]) => (
                <div key={k} className="card" style={{ padding: 16 }}>
                  <div className="stat-label">{k}</div>
                  <div className="stat-value" style={{ fontSize: 20 }}>{v}</div>
                </div>
              ))}
            </section>

            <section className="card" style={{ padding: 24, marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Utilization and the rate curve</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>
                Rates rise slowly until 80% of supply is lent out, then steeply. The steep part pulls borrowers back and keeps withdrawals possible.
              </p>
              <UtilizationBar utilization={m.utilization} />
              <div style={{ marginTop: 20, overflowX: 'auto' }}><KinkedRateCurve currentUtilization={m.utilization} /></div>
            </section>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href={`/supply/${m.slug}`} className="btn btn-primary btn-lg">Supply {m.loanSymbol}</Link>
              <Link href={`/borrow/${m.slug}`} className="btn btn-ghost btn-lg">Borrow against {m.collateralSymbol}</Link>
            </div>

            <section>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Recent activity</h2>
              {activity.loading && <LoadingBlock rows={3} />}
              {activity.error && <ErrorBlock message={activity.error} onRetry={activity.reload} />}
              {activity.data && activity.data.length === 0 && <EmptyBlock title="No activity yet" body="Supplies, borrows and liquidations in this market will show here." />}
              {activity.data && activity.data.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr><th>Action</th><th>Amount</th><th>Account</th><th>When</th></tr></thead>
                    <tbody>
                      {activity.data.map((a) => (
                        <tr key={a.id}>
                          <td style={{ textTransform: 'capitalize' }}>{a.kind}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{formatUSD(a.amount)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{a.account}</td>
                          <td style={{ color: 'var(--text-3)' }}>{formatTimeAgo(a.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
