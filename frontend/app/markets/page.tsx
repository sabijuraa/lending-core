'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { CaretDown, Plus } from '@phosphor-icons/react'
import { KinkedRateCurve } from '@/components/charts/KinkedRateCurve'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { OracleDot } from '@/components/ui/OracleDot'
import { useUIStore } from '@/lib/store'
import { DEMO_MARKETS, PROTOCOL_STATS } from '@/lib/contracts'
import { formatUSD, formatPercent } from '@/lib/formatting'

type Filter = 'all' | 'stablecoin' | 'volatile' | 'high-lltv'
type Sort = 'tvl' | 'supply-apy' | 'borrow-apy' | 'utilization'

export default function MarketsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('tvl')
  const { expandedMarketId, toggleMarketExpand, openSlideOver } = useUIStore()

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All markets' },
    { value: 'stablecoin', label: 'Stablecoin' },
    { value: 'volatile', label: 'Volatile' },
    { value: 'high-lltv', label: 'High LLTV' },
  ]

  const filtered = useMemo(() => {
    let r = DEMO_MARKETS
    if (filter === 'stablecoin') r = r.filter(m => ['USDC', 'DAI'].includes(m.loanSymbol))
    if (filter === 'volatile') r = r.filter(m => !['USDC', 'DAI'].includes(m.collateralSymbol))
    if (filter === 'high-lltv') r = r.filter(m => m.lltv >= 0.8)
    return [...r].sort((a, b) => {
      if (sort === 'tvl') return b.totalSupplied - a.totalSupplied
      if (sort === 'supply-apy') return b.supplyAPY - a.supplyAPY
      if (sort === 'borrow-apy') return b.borrowAPY - a.borrowAPY
      return b.utilization - a.utilization
    })
  }, [filter, sort])

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Markets</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Every market is completely isolated. Your risk stops at its boundary.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Total locked</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: 'var(--color-accent)' }}>
                {formatUSD(PROTOCOL_STATS.totalSupplied, true)}
              </div>
            </div>
            <div style={{ width: '0.5px', height: 40, background: 'var(--color-border)' }} />
            <Link href="/markets/create" className="btn btn-primary" style={{ gap: 6 }}>
              <Plus size={14} weight="bold" /> Create market
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {filters.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)} className={`pill ${filter === f.value ? 'pill-selected' : ''}`} style={{ cursor: 'pointer', border: 'none', fontSize: 13, padding: '6px 14px' }}>
                {f.label}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} style={{ background: 'var(--color-bg-surface)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', fontSize: 13, padding: '6px 10px', cursor: 'pointer', outline: 'none' }}>
            <option value="tvl">TVL ↓</option>
            <option value="supply-apy">Supply APY ↓</option>
            <option value="borrow-apy">Borrow APY ↓</option>
            <option value="utilization">Utilization ↓</option>
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '14px 20px', width: 240 }}>MARKET</th>
                <th style={{ padding: '14px 16px', width: 110 }}>SUPPLY APY</th>
                <th style={{ padding: '14px 16px', width: 110 }}>BORROW APY</th>
                <th style={{ padding: '14px 16px', width: 200 }}>UTILIZATION</th>
                <th style={{ padding: '14px 16px', width: 140 }}>TVL</th>
                <th style={{ padding: '14px 16px', width: 80 }}>LLTV</th>
                <th style={{ padding: '14px 16px', width: 80 }}>ORACLE</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((market, i) => (
                <>
                  <motion.tr key={market.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} onClick={() => toggleMarketExpand(market.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-surface-2)', border: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                          {market.collateralSymbol.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{market.collateralSymbol} / {market.loanSymbol}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{market.chain}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-positive)' }}>{formatPercent(market.supplyAPY)}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-warning)' }}>{formatPercent(market.borrowAPY)}</span></td>
                    <td style={{ width: 180 }}><UtilizationBar utilization={market.utilization} animated /></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{formatUSD(market.totalSupplied, true)}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{formatPercent(market.lltv * 100, 0)}</span></td>
                    <td><OracleDot lastUpdate={market.oracleLastUpdate} maxStaleness={market.maxStaleness} showLabel /></td>
                    <td>
                      <motion.div animate={{ rotate: expandedMarketId === market.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <CaretDown size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </motion.div>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expandedMarketId === market.id && (
                      <tr key={`${market.id}-exp`}>
                        <td colSpan={8} style={{ padding: 0 }}>
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                            <div style={{ background: 'var(--color-bg-surface-2)', padding: '24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, borderTop: '0.5px solid var(--color-border)' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Rate curve</div>
                                <div style={{ background: 'var(--color-bg-surface)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px 8px' }}>
                                  <KinkedRateCurve size="card" currentUtilization={market.utilization} interactive animated={false} />
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Parameters</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: 20 }}>
                                  {[
                                    { l: 'Collateral', v: market.collateralSymbol },
                                    { l: 'Loan', v: market.loanSymbol },
                                    { l: 'LLTV', v: formatPercent(market.lltv * 100, 0) },
                                    { l: 'Liq. bonus', v: formatPercent(market.liquidationBonus * 100, 0) },
                                    { l: 'TVL', v: formatUSD(market.totalSupplied, true) },
                                    { l: 'Borrowed', v: formatUSD(market.totalBorrowed, true) },
                                  ].map(({ l, v }) => (
                                    <div key={l}>
                                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>{l}</div>
                                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{v}</div>
                                    </div>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                  <button className="btn btn-primary" onClick={e => { e.stopPropagation(); openSlideOver('supply', market.id) }} style={{ flex: 1 }}>Supply</button>
                                  <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); openSlideOver('borrow', market.id) }} style={{ flex: 1 }}>Borrow</button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '0.5px solid var(--color-border)', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Showing {filtered.length} of {DEMO_MARKETS.length} markets
          </div>
        </motion.div>
      </div>
    </div>
  )
}
