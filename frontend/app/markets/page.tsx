'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CaretDown, CaretUp, Plus, MagnifyingGlass, ArrowRight } from '@phosphor-icons/react'
import { TokenPair } from '@/components/ui/TokenLogo'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { OracleDot } from '@/components/ui/OracleDot'
import { useData } from '@/providers/provider'
import type { MarketView } from '@/providers/types'
import { formatUSD, formatPercent } from '@/lib/formatting'

type Filter = 'all' | 'stablecoin' | 'volatile' | 'high-lltv'
type SortKey = 'tvl' | 'supply-apy' | 'borrow-apy' | 'utilization'
type SortDir = 'asc' | 'desc'

export default function MarketsPage() {
  const data = useData()
  const [markets, setMarkets] = useState<MarketView[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('tvl')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')

  useEffect(() => {
    data.getMarkets().then(setMarkets)
  }, [data])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All markets' },
    { value: 'stablecoin', label: 'Stablecoin' },
    { value: 'volatile', label: 'Volatile' },
    { value: 'high-lltv', label: 'High LLTV' },
  ]

  const filtered = useMemo(() => {
    let r = markets
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(m =>
        m.collateralSymbol.toLowerCase().includes(q) ||
        m.loanSymbol.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
      )
    }
    if (filter === 'stablecoin') r = r.filter(m => ['USDC', 'DAI', 'USDT'].includes(m.loanSymbol))
    if (filter === 'volatile') r = r.filter(m => !['USDC', 'DAI', 'USDT'].includes(m.collateralSymbol))
    if (filter === 'high-lltv') r = r.filter(m => m.lltv >= 0.8)
    const mul = sortDir === 'desc' ? -1 : 1
    return [...r].sort((a, b) => {
      if (sortKey === 'tvl') return mul * (a.totalSupplied - b.totalSupplied)
      if (sortKey === 'supply-apy') return mul * (a.supplyAPY - b.supplyAPY)
      if (sortKey === 'borrow-apy') return mul * (a.borrowAPY - b.borrowAPY)
      return mul * (a.utilization - b.utilization)
    })
  }, [markets, filter, sortKey, sortDir, search])

  const sortIcon = (col: SortKey) => {
    if (sortKey !== col) return null
    return sortDir === 'desc'
      ? <CaretDown size={10} weight="bold" style={{ marginLeft: 3 }} />
      : <CaretUp size={10} weight="bold" style={{ marginLeft: 3 }} />
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-heading">Markets</h1>
              <p className="page-subtitle">Every market is completely isolated. Your risk stops at its boundary.</p>
            </div>
            <Link href="/markets/create" className="btn btn-primary" style={{ gap: 6, flexShrink: 0 }}>
              <Plus size={14} weight="bold" /> Create market
            </Link>
          </div>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`pill ${filter === f.value ? 'pill-selected' : ''}`}
                style={{ cursor: 'pointer', fontSize: 12, padding: '5px 14px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <MagnifyingGlass size={14} style={{
              position: 'absolute',
              left: 10,
              color: 'var(--text-4)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{
                paddingLeft: 30,
                width: 200,
                fontSize: 13,
                padding: '7px 12px 7px 30px',
              }}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24, paddingTop: 16, width: 220 }}>Market</th>
                <th
                  style={{ paddingTop: 16, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('supply-apy')}
                >
                  Supply APY {sortIcon('supply-apy')}
                </th>
                <th
                  style={{ paddingTop: 16, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('borrow-apy')}
                >
                  Borrow APY {sortIcon('borrow-apy')}
                </th>
                <th
                  style={{ paddingTop: 16, width: 160, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('utilization')}
                >
                  Utilization {sortIcon('utilization')}
                </th>
                <th
                  style={{ paddingTop: 16, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('tvl')}
                >
                  Total Supplied {sortIcon('tvl')}
                </th>
                <th style={{ paddingTop: 16 }}>LLTV</th>
                <th style={{ paddingTop: 16 }}>Oracle</th>
                <th style={{ paddingTop: 16, paddingRight: 24, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr
                  key={m.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td style={{ paddingLeft: 24 }}>
                    <Link href={`/markets/${m.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={32} />
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: 14 }}>
                            {m.collateralSymbol}/{m.loanSymbol}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--positive)' }}>
                      {formatPercent(m.supplyAPY)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-1)' }}>
                      {formatPercent(m.borrowAPY)}
                    </span>
                  </td>
                  <td>
                    <UtilizationBar utilization={m.utilization} height={5} showLabel animated={false} />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                      {formatUSD(m.totalSupplied, true)}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                      {formatPercent(m.lltv * 100, 0)}
                    </span>
                  </td>
                  <td>
                    <OracleDot lastUpdate={m.oracleLastUpdate} maxStaleness={m.maxStaleness} showLabel />
                  </td>
                  <td style={{ paddingRight: 24 }}>
                    <Link href={`/markets/${m.slug}`} style={{ color: 'var(--text-4)', display: 'flex' }}>
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-4)', fontSize: 14 }}>
              No markets match your filters.
            </div>
          )}
          <div style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-4)',
          }}>
            Showing {filtered.length} of {markets.length} markets
          </div>
        </motion.div>
      </div>
    </div>
  )
}
