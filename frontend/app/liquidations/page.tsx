'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CaretRight, Info, Lightning } from '@phosphor-icons/react'
import { TokenPair } from '@/components/ui/TokenLogo'
import { useData } from '@/providers/provider'
import type { PositionView, MarketView } from '@/providers/types'
import { formatUSD, formatPercent, formatNumber, formatTimeAgo } from '@/lib/formatting'
import { LoadingBlock } from '@/components/ui/States'

type Row = PositionView & { account: string }
type HealthFilter = 'all' | 'eligible' | 'watch'
type SortKey = 'profit' | 'health' | 'debt'

type Outcome = {
  eligible: boolean
  repayable: number
  collateralReceived: number
  collateralValue: number
  bonus: number
  profit: number
}

/** Liquidator view of one position, using the market oracle price and bonus */
function estimate(pos: Row, mkt: MarketView | undefined): Outcome | null {
  if (!mkt || mkt.oraclePrice <= 0) return null
  const repayable = pos.borrowed
  const seizable = (repayable * (1 + mkt.liquidationBonus)) / mkt.oraclePrice
  const collateralReceived = Math.min(seizable, pos.collateral)
  const collateralValue = collateralReceived * mkt.oraclePrice
  return {
    eligible: pos.healthFactor < 1,
    repayable,
    collateralReceived,
    collateralValue,
    bonus: mkt.liquidationBonus,
    profit: collateralValue - repayable,
  }
}

const selectStyle: React.CSSProperties = {
  height: 34,
  padding: '0 12px',
  fontSize: 13,
  color: 'var(--text-2)',
  background: 'var(--surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--r-sm)',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const label: React.CSSProperties = { fontSize: 12, color: 'var(--text-3)' }
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-1)' }

export default function LiquidationsPage() {
  const data = useData()
  const [atRisk, setAtRisk] = useState<Row[]>([])
  const [markets, setMarkets] = useState<MarketView[]>([])
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof data.getActivity>>>([])
  const [loading, setLoading] = useState(true)
  const [marketFilter, setMarketFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('profit')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [simulated, setSimulated] = useState<string | null>(null)

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
  const keyOf = (p: Row) => `${p.account}:${p.slug}`
  const pairOf = (p: Row) => {
    const m = getMarket(p.slug)
    return m ? `${m.collateralSymbol} / ${m.loanSymbol}` : p.slug
  }

  const rows = useMemo(() => {
    const withOutcome = atRisk.map(p => ({ pos: p, out: estimate(p, markets.find(m => m.slug === p.slug)) }))
    let r = withOutcome
    if (marketFilter !== 'all') r = r.filter(x => x.pos.slug === marketFilter)
    if (healthFilter === 'eligible') r = r.filter(x => x.pos.healthFactor < 1)
    if (healthFilter === 'watch') r = r.filter(x => x.pos.healthFactor >= 1)
    return [...r].sort((a, b) => {
      if (sortKey === 'health') return a.pos.healthFactor - b.pos.healthFactor
      if (sortKey === 'debt') return b.pos.borrowed - a.pos.borrowed
      return (b.out?.profit ?? 0) - (a.out?.profit ?? 0)
    })
  }, [atRisk, markets, marketFilter, healthFilter, sortKey])

  const eligible = atRisk.filter(p => p.healthFactor < 1)
  const eligibleDebt = eligible.reduce((s, p) => s + p.borrowed, 0)
  const healthy = eligible.length === 0

  const selected = rows.find(x => keyOf(x.pos) === selectedKey) ?? rows[0]
  const selectedMarket = selected ? getMarket(selected.pos.slug) : undefined

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 96px' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <h1 className="page-heading">Liquidations</h1>
          <p className="page-subtitle">Real time liquidation opportunities across all markets</p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: 0, marginBottom: 20, overflow: 'hidden' }}
        >
          {[
            { l: 'Eligible Positions', v: loading ? '...' : String(eligible.length), s: 'Health factor below 1' },
            { l: 'Total Eligible Debt', v: loading ? '...' : formatUSD(eligibleDebt), s: 'Repayable by liquidators' },
          ].map((c, i) => (
            <div key={c.l} style={{ padding: '18px 24px', borderLeft: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={label}>{c.l}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, color: 'var(--text-1)', margin: '6px 0 2px' }}>{c.v}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{c.s}</div>
            </div>
          ))}
          <div style={{ padding: '18px 24px', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={label}>Market Health</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: healthy ? 'var(--positive)' : 'var(--danger)' }} />
              <span style={{ fontSize: 17, fontWeight: 600, color: healthy ? 'var(--positive)' : 'var(--danger)' }}>
                {loading ? '...' : healthy ? 'Healthy' : 'Positions at risk'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Across {markets.length} isolated markets</div>
          </div>
        </motion.div>

        {loading && <LoadingBlock rows={4} />}

        {!loading && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <select aria-label="Market" style={selectStyle} value={marketFilter} onChange={e => setMarketFilter(e.target.value)}>
                <option value="all">All Markets</option>
                {markets.map(m => <option key={m.slug} value={m.slug}>{m.collateralSymbol} / {m.loanSymbol}</option>)}
              </select>
              <select aria-label="Health" style={selectStyle} value={healthFilter} onChange={e => setHealthFilter(e.target.value as HealthFilter)}>
                <option value="all">All Health Levels</option>
                <option value="eligible">Eligible now</option>
                <option value="watch">Near threshold</option>
              </select>
              <div style={{ flex: 1 }} />
              <select aria-label="Sort" style={selectStyle} value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
                <option value="profit">Sort by Profitability</option>
                <option value="health">Sort by Health</option>
                <option value="debt">Sort by Debt</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: 20, alignItems: 'start', marginBottom: 40 }}>
              {/* Table */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', overflow: 'auto' }}>
                {rows.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <ShieldCheck size={28} weight="fill" style={{ color: 'var(--positive)', marginBottom: 8 }} />
                    <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No positions are near liquidation right now.</p>
                  </div>
                ) : (
                  <table className="data-table" style={{ minWidth: 720 }}>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: 20, paddingTop: 14 }}>Market</th>
                        <th style={{ paddingTop: 14 }}>Borrower</th>
                        <th style={{ paddingTop: 14 }}>Health</th>
                        <th style={{ paddingTop: 14 }}>Repayable</th>
                        <th style={{ paddingTop: 14 }}>Collateral</th>
                        <th style={{ paddingTop: 14 }}>Bonus</th>
                        <th style={{ paddingTop: 14 }}>Est. Profit</th>
                        <th style={{ paddingTop: 14, paddingRight: 20 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ pos, out }) => {
                        const mkt = getMarket(pos.slug)
                        const k = keyOf(pos)
                        const active = selected && keyOf(selected.pos) === k
                        return (
                          <tr key={k} onClick={() => { setSelectedKey(k); setSimulated(null) }} style={active ? { background: 'var(--accent-dim)' } : undefined}>
                            <td style={{ paddingLeft: 20 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {mkt && <TokenPair collateral={mkt.collateralSymbol} loan={mkt.loanSymbol} size={22} />}
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{pairOf(pos)}</span>
                              </div>
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{pos.account}</td>
                            <td style={{ ...mono, color: pos.healthFactor < 1 ? 'var(--danger)' : 'var(--warning)', fontWeight: 500 }}>{pos.healthFactor.toFixed(2)}</td>
                            <td style={mono}>{formatUSD(pos.borrowed)}</td>
                            <td style={mono}>{formatNumber(pos.collateral, 2)} {mkt?.collateralSymbol}</td>
                            <td style={mono}>{out ? formatPercent(out.bonus * 100, 1) : 'N/A'}</td>
                            <td style={{ ...mono, color: out && out.eligible ? 'var(--positive)' : 'var(--text-3)' }}>
                              {out && out.eligible ? formatUSD(out.profit) : 'Not yet'}
                            </td>
                            <td style={{ paddingRight: 20 }}>
                              <button className="btn btn-ghost" style={{ height: 28, padding: '0 10px', fontSize: 12, gap: 2 }}>
                                View <CaretRight size={11} weight="bold" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Detail */}
              {selected && (
                <motion.div
                  key={keyOf(selected.pos)}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="card"
                  style={{ padding: 24 }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14 }}>Liquidation Detail</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    {selectedMarket && <TokenPair collateral={selectedMarket.collateralSymbol} loan={selectedMarket.loanSymbol} size={26} />}
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{pairOf(selected.pos)}</span>
                    <span className={selected.pos.healthFactor < 1 ? 'pill pill-danger' : 'pill pill-warning'}>
                      {selected.pos.healthFactor < 1 ? 'Eligible' : 'Watch'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)', marginBottom: 20 }}>Borrower {selected.pos.account}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Position Details</div>
                      <div style={label}>Health Factor</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: selected.pos.healthFactor < 1 ? 'var(--danger)' : 'var(--warning)', margin: '2px 0 14px' }}>
                        {selected.pos.healthFactor.toFixed(2)}
                      </div>
                      {[
                        { l: 'Collateral', v: `${formatNumber(selected.pos.collateral, 2)} ${selectedMarket?.collateralSymbol ?? ''}`, s: selectedMarket ? formatUSD(selected.pos.collateral * selectedMarket.oraclePrice) : '' },
                        { l: 'Debt', v: `${formatNumber(selected.pos.borrowed, 2)} ${selectedMarket?.loanSymbol ?? ''}`, s: formatUSD(selected.pos.borrowed) },
                        { l: 'Liquidation Threshold', v: selectedMarket ? formatPercent(selectedMarket.lltv * 100, 0) : 'N/A', s: '' },
                      ].map(r => (
                        <div key={r.l} style={{ marginBottom: 12 }}>
                          <div style={label}>{r.l}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                            <span style={mono}>{r.v}</span>
                            {r.s && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)' }}>({r.s})</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Estimated Outcome</div>
                      {selected.out ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {[
                            { l: 'Repayable (max)', v: `${formatNumber(selected.out.repayable, 2)} ${selectedMarket?.loanSymbol ?? ''}` },
                            { l: 'Collateral Received', v: `${formatNumber(selected.out.collateralReceived, 4)} ${selectedMarket?.collateralSymbol ?? ''}` },
                            { l: 'Liquidation bonus', v: formatPercent(selected.out.bonus * 100, 1) },
                            { l: 'Est. Gas cost', v: 'Shown in wallet' },
                          ].map(r => (
                            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                              <span style={{ color: 'var(--text-3)' }}>{r.l}</span>
                              <span style={mono}>{r.v}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Est. Profit (approx.)</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: selected.out.eligible ? 'var(--text-1)' : 'var(--text-4)' }}>
                              {selected.out.eligible ? formatUSD(selected.out.profit) : 'Not eligible'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Market data is unavailable for this position.</p>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 22, height: 42 }}
                    disabled={!selected.out}
                    onClick={() => setSimulated(keyOf(selected.pos))}
                  >
                    <Lightning size={14} weight="bold" /> Simulate Transaction
                  </button>

                  {simulated === keyOf(selected.pos) && selected.out && (
                    <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 'var(--r-sm)', background: selected.out.eligible ? 'var(--positive-dim)' : 'var(--warning-dim)', fontSize: 12, color: selected.out.eligible ? 'var(--positive)' : 'var(--warning)', lineHeight: 1.5 }}>
                      {selected.out.eligible
                        ? `Simulation passes. Repaying ${formatUSD(selected.out.repayable)} would seize ${formatNumber(selected.out.collateralReceived, 4)} ${selectedMarket?.collateralSymbol ?? ''} at the current oracle price.`
                        : 'Simulation reverts. The health factor is still above 1, so this position cannot be liquidated yet.'}
                    </div>
                  )}

                  <p style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11, color: 'var(--text-4)', marginTop: 14, lineHeight: 1.5 }}>
                    <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    Values are estimates from the current oracle price and can change before your transaction is mined. Nothing is sent when you simulate.
                  </p>
                </motion.div>
              )}
            </div>

            {/* History */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>History</h2>

              {activity.length === 0 && (
                <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No liquidations have occurred yet.</p>
                </div>
              )}

              {activity.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', overflow: 'auto' }}>
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
                      {activity.map(liq => (
                        <tr key={liq.id}>
                          <td style={{ paddingLeft: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{formatTimeAgo(liq.timestamp)}</td>
                          <td style={{ fontSize: 13 }}>{liq.slug}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{liq.account}</td>
                          <td style={mono}>{formatUSD(liq.amount)}</td>
                          <td style={{ paddingRight: 20 }}><span className="pill pill-danger">{liq.kind}</span></td>
                        </tr>
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
