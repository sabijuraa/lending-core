'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { KinkedRateCurve } from '@/components/charts/KinkedRateCurve'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { OracleDot } from '@/components/ui/OracleDot'
import { LoadingBlock, ErrorBlock, EmptyBlock, DemoNotice } from '@/components/ui/States'
import { formatUSD, formatPercent, formatTimeAgo } from '@/lib/formatting'

export default function MarketDetailPage() {
  const { asset } = useParams<{ asset: string }>()
  const data = useData()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const activity = useAsync(() => data.getActivity(asset), [asset, data])
  const m = market.data

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 96px' }}>
      <div className="section-container">
        {/* Breadcrumb */}
        <Link href="/markets" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--text-3)',
          textDecoration: 'none',
          marginBottom: 20,
          transition: 'color 150ms ease',
        }}>
          <ArrowLeft size={13} />
          All markets
        </Link>

        {market.loading && <LoadingBlock rows={6} />}
        {market.error && <ErrorBlock message={market.error} onRetry={market.reload} />}
        {!market.loading && !market.error && !m && (
          <EmptyBlock title="Market not found" body="No market uses that collateral yet." href="/markets" cta="See all markets" />
        )}

        {m && (
          <>
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{ marginBottom: 28 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}>
                  {m.collateralSymbol.slice(0, 2)}
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {m.collateralSymbol} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>/ {m.loanSymbol}</span>
                </h1>
                <OracleDot lastUpdate={m.oracleLastUpdate} maxStaleness={m.maxStaleness} showLabel size={8} />
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
                Borrow {m.loanSymbol} against {m.collateralName}. This market has its own oracle and risk boundary.
              </p>
              <DemoNotice />
            </motion.header>

            {/* Two column layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: 24,
              alignItems: 'start',
            }}>
              {/* Left: Market data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Key metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1,
                    background: 'var(--border-subtle)',
                    borderRadius: 'var(--r-lg)',
                    overflow: 'hidden',
                  }}
                >
                  {[
                    ['Total Supplied', formatUSD(m.totalSupplied, true)],
                    ['Total Borrowed', formatUSD(m.totalBorrowed, true)],
                    ['Supply APY', formatPercent(m.supplyAPY, 2)],
                    ['Borrow APY', formatPercent(m.borrowAPY, 2)],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface)', padding: '20px 20px' }}>
                      <div className="stat-label">{k}</div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 18,
                        fontWeight: 500,
                        color: k === 'Supply APY' ? 'var(--positive)' : 'var(--text-1)',
                        marginTop: 4,
                        fontVariantNumeric: 'tabular-nums',
                      }}>{v}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Utilization and rate curve */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="card"
                  style={{ padding: 24 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Rate curve</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                        Rates rise slowly until the kink, then steeply.
                      </p>
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <UtilizationBar utilization={m.utilization} />
                  </div>
                  <KinkedRateCurve currentUtilization={m.utilization} />
                </motion.div>

                {/* Market parameters */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="card"
                  style={{ padding: 24 }}
                >
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Parameters</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      ['Liquidation LTV', formatPercent(m.lltv * 100, 0)],
                      ['Liquidation bonus', formatPercent(m.liquidationBonus * 100, 0)],
                      ['Oracle price', formatUSD(m.oraclePrice)],
                      ['Available liquidity', formatUSD(m.totalSupplied - m.totalBorrowed, true)],
                    ].map(([k, v]) => (
                      <div key={k} style={{
                        padding: '12px 14px',
                        background: 'var(--surface-2)',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{k}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--text-1)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent activity */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>Recent activity</h2>
                  {activity.loading && <LoadingBlock rows={3} />}
                  {activity.error && <ErrorBlock message={activity.error} onRetry={activity.reload} />}
                  {activity.data && activity.data.length === 0 && (
                    <EmptyBlock title="No activity yet" body="Supplies, borrows and liquidations in this market will show here." />
                  )}
                  {activity.data && activity.data.length > 0 && (
                    <div style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--r-lg)',
                      overflow: 'hidden',
                    }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ paddingLeft: 20, paddingTop: 14 }}>Action</th>
                            <th style={{ paddingTop: 14 }}>Amount</th>
                            <th style={{ paddingTop: 14 }}>Account</th>
                            <th style={{ paddingTop: 14, paddingRight: 20 }}>When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activity.data.map((a) => (
                            <tr key={a.id}>
                              <td style={{ paddingLeft: 20, textTransform: 'capitalize' }}>
                                <span className={`pill pill-${a.kind === 'supply' || a.kind === 'repay' ? 'positive' : a.kind === 'liquidate' ? 'danger' : 'active'}`}>
                                  {a.kind}
                                </span>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatUSD(a.amount)}</td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{a.account}</td>
                              <td style={{ color: 'var(--text-4)', fontSize: 13, paddingRight: 20 }}>{formatTimeAgo(a.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right: Transaction panel */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ position: 'sticky', top: 88 }}
              >
                <TransactionPanel market={m} />
              </motion.div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: '1fr 380px'"],
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

function TransactionPanel({ market }: { market: { slug: string; collateralSymbol: string; loanSymbol: string; collateralName: string } }) {
  const [tab, setTab] = useState<'supply' | 'borrow'>('supply')

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {(['supply', 'borrow'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '14px 0',
              fontSize: 14,
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? 'var(--accent)' : 'var(--text-3)',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 150ms ease',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === 'supply' ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
              Supply {market.loanSymbol} to earn yield from borrowers in this isolated market.
            </p>
            <Link
              href={`/supply/${market.slug}`}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Supply {market.loanSymbol}
              <ArrowRight size={14} weight="bold" />
            </Link>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
              Deposit {market.collateralSymbol} as collateral and borrow {market.loanSymbol} at the current rate.
            </p>
            <Link
              href={`/borrow/${market.slug}`}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Borrow {market.loanSymbol}
              <ArrowRight size={14} weight="bold" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
