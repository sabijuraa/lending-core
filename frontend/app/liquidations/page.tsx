'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Warning } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import type { PositionView, MarketView } from '@/providers/types'
import { formatUSD, formatPercent, formatTimeAgo, getHealthStatus } from '@/lib/formatting'
import { LoadingBlock } from '@/components/ui/States'

export default function LiquidationsPage() {
  const data = useData()
  const [atRisk, setAtRisk] = useState<(PositionView & { account: string })[]>([])
  const [markets, setMarkets] = useState<MarketView[]>([])
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof data.getActivity>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      data.getLiquidatable(),
      data.getMarkets(),
      data.getActivity(),
    ]).then(([liq, mkts, act]) => {
      setAtRisk(liq)
      setMarkets(mkts)
      setActivity(act.filter(a => a.kind === 'liquidate'))
      setLoading(false)
    })
  }, [data])

  const getMarket = (slug: string) => markets.find(m => m.slug === slug)

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 96px' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}
        >
          <div>
            <h1 className="page-heading">Liquidations</h1>
            <p className="page-subtitle">Every liquidation, visible to everyone. Always has been.</p>
          </div>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'var(--positive-dim)',
              border: '1px solid rgba(39,116,75,0.2)',
              borderRadius: 'var(--r-lg)',
              padding: '16px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-4)', marginBottom: 6 }}>Bad debt</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <ShieldCheck size={18} weight="fill" style={{ color: 'var(--positive)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: 'var(--accent)' }}>$0</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Since deployment</div>
          </motion.div>
        </motion.div>

        {loading && <LoadingBlock rows={4} />}

        {!loading && (
          <>
            {/* Positions at risk */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{ marginBottom: 40 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)' }}>Positions at risk</h2>
                {atRisk.length > 0 && (
                  <span className="pill pill-danger">{atRisk.length}</span>
                )}
              </div>

              {atRisk.length === 0 && (
                <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <ShieldCheck size={28} weight="fill" style={{ color: 'var(--positive)', marginBottom: 8 }} />
                  <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No positions are near liquidation right now.</p>
                </div>
              )}

              {atRisk.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {atRisk.map((pos, i) => {
                    const mkt = getMarket(pos.slug)
                    const status = getHealthStatus(pos.healthFactor)
                    const borderColor = status === 'danger' ? 'var(--danger)' : 'var(--warning)'
                    const hfColor = status === 'danger' ? 'var(--danger)' : 'var(--warning)'
                    return (
                      <motion.div
                        key={pos.account + pos.slug}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="card"
                        style={{ padding: 24, borderLeft: `2px solid ${borderColor}` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{pos.account}</span>
                          <span className="pill" style={{ fontSize: 10 }}>
                            {mkt ? `${mkt.collateralSymbol}/${mkt.loanSymbol}` : pos.slug}
                          </span>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                          <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Health factor</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, color: hfColor, lineHeight: 1 }}>
                            {pos.healthFactor.toFixed(2)}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', marginBottom: 16 }}>
                          {[
                            { l: 'Collateral', v: formatUSD(pos.collateral) },
                            { l: 'Debt', v: formatUSD(pos.borrowed) },
                            { l: 'LLTV', v: mkt ? formatPercent(mkt.lltv * 100, 0) : 'N/A' },
                            { l: 'Bonus', v: mkt ? `+${formatPercent(mkt.liquidationBonus * 100, 1)}` : 'N/A', c: 'var(--positive)' },
                          ].map(({ l, v, c }) => (
                            <div key={l}>
                              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{l}</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: (c as string) || 'var(--text-1)' }}>{v}</div>
                            </div>
                          ))}
                        </div>

                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', justifyContent: 'center', background: borderColor }}
                        >
                          <Warning size={14} weight="bold" /> Liquidate
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent liquidation history */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>History</h2>

              {activity.length === 0 && (
                <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No liquidations have occurred yet.</p>
                </div>
              )}

              {activity.length > 0 && (
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: 20, paddingTop: 14 }}>Time</th>
                        <th style={{ paddingTop: 14 }}>Market</th>
                        <th style={{ paddingTop: 14 }}>Account</th>
                        <th style={{ paddingTop: 14 }}>Amount</th>
                        <th style={{ paddingTop: 14, paddingRight: 20 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.map((liq, i) => (
                        <motion.tr
                          key={liq.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <td style={{ paddingLeft: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                            {formatTimeAgo(liq.timestamp)}
                          </td>
                          <td style={{ fontSize: 13 }}>{liq.slug}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{liq.account}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatUSD(liq.amount)}</td>
                          <td style={{ paddingRight: 20 }}>
                            <span className="pill pill-danger">{liq.kind}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
