'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, CaretLeft, CaretRight, Info, Drop, ShieldCheck, ChartLineUp, Gauge, ArrowRight } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { LcPill, LcOracle, LcSelect, LcFootnote, lcPanel, lcTh, lcTd, marketStatus } from '@/components/market/LcUi'
import { CountUp, LcRow, LcStoryBand, LcHelpCard, LcSectionHead } from '@/components/market/LcStory'
import { Stagger, StaggerItem } from '@/components/ui/Reveal'
import { useData } from '@/providers/provider'
import type { MarketView } from '@/providers/types'
import { formatUSD, formatPercent } from '@/lib/formatting'

type SortKey = 'utilization' | 'supply-apy' | 'borrow-apy' | 'liquidity' | 'tvl'
type StatusFilter = 'all' | 'Active' | 'Paused'

const PAGE_SIZE = 8

export default function MarketsPage() {
  const data = useData()
  const router = useRouter()
  const [markets, setMarkets] = useState<MarketView[]>([])
  const [search, setSearch] = useState('')
  const [asset, setAsset] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [collateral, setCollateral] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('utilization')
  const [page, setPage] = useState(0)

  useEffect(() => {
    data.getMarkets().then(setMarkets)
  }, [data])

  const loanAssets = useMemo(() => [...new Set(markets.map(m => m.loanSymbol))], [markets])
  const collaterals = useMemo(() => [...new Set(markets.map(m => m.collateralSymbol))], [markets])

  const filtered = useMemo(() => {
    let r = markets
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(m =>
        m.collateralSymbol.toLowerCase().includes(q) ||
        m.loanSymbol.toLowerCase().includes(q) ||
        m.collateralName.toLowerCase().includes(q)
      )
    }
    if (asset !== 'all') r = r.filter(m => m.loanSymbol === asset)
    if (collateral !== 'all') r = r.filter(m => m.collateralSymbol === collateral)
    if (status !== 'all') r = r.filter(m => marketStatus(m.oracleLastUpdate, m.maxStaleness).label === status)
    const key = (m: MarketView) =>
      sortKey === 'supply-apy' ? m.supplyAPY
        : sortKey === 'borrow-apy' ? m.borrowAPY
          : sortKey === 'liquidity' ? m.totalSupplied - m.totalBorrowed
            : sortKey === 'tvl' ? m.totalSupplied
              : m.utilization
    return [...r].sort((a, b) => key(b) - key(a))
  }, [markets, search, asset, collateral, status, sortKey])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const totalSupplied = markets.reduce((s, m) => s + m.totalSupplied, 0)
  const totalBorrowed = markets.reduce((s, m) => s + m.totalBorrowed, 0)
  const illustrative = data.source === 'mock'

  const resetPage = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(0) }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1.05, marginBottom: 10 }}>
            Markets
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 620, lineHeight: 1.6 }}>
            Every market here is its own small lending pool. Pick one to earn on your idle assets or borrow against what you hold, and know exactly which risks you are taking on.
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="lc-summary"
          style={{ ...lcPanel, display: 'flex', alignItems: 'center', gap: 0, padding: '22px 24px', marginBottom: 24 }}
        >
          {[
            { label: 'Active Markets', value: markets.length, fmt: (n: number) => String(Math.round(n)) },
            { label: illustrative ? 'Total Supplied (Illustrative)' : 'Total Supplied', value: totalSupplied, fmt: (n: number) => formatUSD(n, true) },
            { label: illustrative ? 'Total Borrowed (Illustrative)' : 'Total Borrowed', value: totalBorrowed, fmt: (n: number) => formatUSD(n, true) },
          ].map((s, i) => (
            <div key={s.label} className="lc-summary-item" style={{
              paddingRight: 32,
              marginRight: 32,
              borderRight: i < 2 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
                <CountUp value={s.value} format={s.fmt} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
          <Link href="/markets/create" className="btn btn-primary" style={{ marginLeft: 'auto', padding: '11px 20px', fontSize: 13 }}>
            Create Market
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}
        >
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
            <MagnifyingGlass size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-4)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              aria-label="Search markets"
              style={{
                width: '100%',
                height: 38,
                padding: '0 12px 0 34px',
                fontSize: 13,
                color: 'var(--text-1)',
                background: 'var(--surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-sm)',
              }}
            />
          </div>
          <LcSelect label="Loan asset" value={asset} onChange={resetPage(setAsset)}
            options={[{ value: 'all', label: 'All Assets' }, ...loanAssets.map(a => ({ value: a, label: a }))]} />
          <LcSelect<StatusFilter> label="Status" value={status} onChange={resetPage(setStatus)}
            options={[{ value: 'all', label: 'All Status' }, { value: 'Active', label: 'Active' }, { value: 'Paused', label: 'Paused' }]} />
          <LcSelect label="Collateral" value={collateral} onChange={resetPage(setCollateral)}
            options={[{ value: 'all', label: 'All Collateral' }, ...collaterals.map(c => ({ value: c, label: c }))]} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Sort by</span>
            <LcSelect<SortKey> label="Sort by" value={sortKey} onChange={setSortKey} minWidth={160}
              options={[
                { value: 'utilization', label: 'Utilization' },
                { value: 'supply-apy', label: 'Supply APY' },
                { value: 'borrow-apy', label: 'Borrow APY' },
                { value: 'liquidity', label: 'Liquidity' },
                { value: 'tvl', label: 'Total supplied' },
              ]} />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          style={{ ...lcPanel, overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={{ ...lcTh, paddingLeft: 24 }}>Market</th>
                  <th style={lcTh}>Supply APY</th>
                  <th style={lcTh}>Borrow APY</th>
                  <th style={lcTh}>Utilization</th>
                  <th style={lcTh}>Liquidity</th>
                  <th style={lcTh}>Oracle</th>
                  <th style={{ ...lcTh, paddingRight: 24 }}>Status</th>
                </tr>
              </thead>
              <tbody key={`${asset}-${status}-${collateral}-${sortKey}-${current}`}>
                {rows.map((m, i) => {
                  const st = marketStatus(m.oracleLastUpdate, m.maxStaleness)
                  return (
                    <LcRow
                      key={m.slug}
                      index={i}
                      onClick={() => router.push(`/markets/${m.slug}`)}
                      className="lc-row"
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ ...lcTd, paddingLeft: 24 }}>
                        <Link href={`/markets/${m.slug}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none' }}>
                          <TokenLogo symbol={m.collateralSymbol} size={34} />
                          <span style={{ display: 'grid', gap: 5, justifyItems: 'start' }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{m.collateralSymbol} / {m.loanSymbol}</span>
                            <LcPill tone={st.tone} small>{st.label}</LcPill>
                          </span>
                        </Link>
                      </td>
                      <td style={lcTd}>{formatPercent(m.supplyAPY)}</td>
                      <td style={lcTd}>{formatPercent(m.borrowAPY)}</td>
                      <td style={lcTd}>{formatPercent(m.utilization * 100, 0)}</td>
                      <td style={lcTd}>{formatUSD(m.totalSupplied - m.totalBorrowed, true)}</td>
                      <td style={lcTd}><LcOracle lastUpdate={m.oracleLastUpdate} maxStaleness={m.maxStaleness} /></td>
                      <td style={{ ...lcTd, paddingRight: 24 }}><LcPill tone={st.tone}>{st.label}</LcPill></td>
                    </LcRow>
                  )
                })}
              </tbody>
            </table>
          </div>
          {markets.length > 0 && filtered.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              No markets match your filters.
            </div>
          )}
          {markets.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              Loading markets
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, margin: '16px 0 20px' }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-current={i === current ? 'page' : undefined}
              style={{
                width: 30, height: 30, borderRadius: 'var(--r-sm)', fontSize: 13, cursor: 'pointer',
                border: '1px solid ' + (i === current ? 'var(--border-default)' : 'transparent'),
                background: i === current ? 'var(--surface)' : 'transparent',
                color: i === current ? 'var(--text-1)' : 'var(--text-3)',
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            aria-label="Previous page"
            style={{ width: 30, height: 30, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: current === 0 ? 'default' : 'pointer', opacity: current === 0 ? 0.4 : 1 }}
          >
            <CaretLeft size={13} />
          </button>
          <button
            onClick={() => setPage(Math.min(pages - 1, current + 1))}
            disabled={current >= pages - 1}
            aria-label="Next page"
            style={{ width: 30, height: 30, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: current >= pages - 1 ? 'default' : 'pointer', opacity: current >= pages - 1 ? 0.4 : 1 }}
          >
            <CaretRight size={13} />
          </button>
        </div>

        <LcFootnote icon={<Info size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}>
          {illustrative
            ? 'All data is illustrative and for the Base Sepolia testnet.'
            : 'Rates and balances are read live from the Base Sepolia testnet.'}
        </LcFootnote>

        {/* What a market is */}
        <div style={{ marginTop: 56 }}>
          <LcStoryBand
            eyebrow="What is a market"
            title="One pair, one price feed, one set of rules."
            body={
              <>
                <p style={{ marginBottom: 12 }}>
                  A market brings together one asset people lend out and one asset borrowers put up as collateral. It reads one price feed and follows one interest curve, and none of that can change after it opens.
                </p>
                <p>
                  That is the whole idea behind lending-core. If something goes wrong in one market, like a broken price feed or a sudden crash in a collateral token, it stays inside that market. Your deposits elsewhere are never part of the problem.
                </p>
              </>
            }
            aside={
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { k: 'You lend', v: 'the loan asset, and earn the supply rate' },
                  { k: 'They borrow', v: 'against collateral, and pay the borrow rate' },
                  { k: 'The oracle', v: 'prices the collateral so every loan stays covered' },
                  { k: 'The rules', v: 'are fixed the moment the market is created' },
                ].map((row, i) => (
                  <motion.div
                    key={row.k}
                    className="lc-dark-inset"
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    style={{ padding: '13px 16px', fontSize: 13.5, color: 'var(--band-muted)', lineHeight: 1.5 }}
                  >
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{row.k}</span> {row.v}
                  </motion.div>
                ))}
              </div>
            }
          />
        </div>

        {/* How to pick */}
        <div style={{ marginTop: 56 }}>
          <LcSectionHead
            eyebrow="Choosing well"
            title="How to pick a market"
            body="A few things worth checking before you put money in. Each one is shown on the market page."
          />
          <Stagger className="lc-pick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            <StaggerItem>
              <LcHelpCard icon={<ShieldCheck size={18} />} title="Trust the collateral">
                Only lend into markets whose collateral you would be comfortable holding yourself. If it collapses faster than liquidators can act, lenders share the loss.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<Gauge size={18} />} title="Read the LLTV">
                The liquidation LTV is how far a loan can stretch before it gets closed. A higher number lets borrowers do more, and leaves lenders a thinner cushion.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<ChartLineUp size={18} />} title="Watch utilization">
                High utilization means great rates for lenders but less cash ready to withdraw. Above the kink, borrow rates climb quickly to pull it back down.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<Drop size={18} />} title="Check the oracle">
                A green Fresh dot means the price feed is current. A stale feed pauses the market in practice, so new loans and liquidations wait for a fresh price.
              </LcHelpCard>
            </StaggerItem>
          </Stagger>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/docs?tab=risk" className="btn btn-secondary" style={{ fontSize: 13, padding: '10px 18px' }}>
              Read the risk guide <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .lc-row td { transition: background 150ms ease; }
        .lc-row:hover td { background: var(--surface-2); }
        @media (max-width: 1024px) {
          .lc-pick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 560px) {
          .lc-pick-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .lc-summary { flex-wrap: wrap; row-gap: 16px; }
          .lc-summary-item { border-right: none !important; margin-right: 0 !important; padding-right: 24px !important; }
        }
      `}</style>
    </div>
  )
}
