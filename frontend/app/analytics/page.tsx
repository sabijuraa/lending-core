'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Info, ArrowRight, Eye, ListChecks, LockKey } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { LcCardTitle, LcPill, LcFootnote, lcPanel, lcTh, lcTd, marketStatus } from '@/components/market/LcUi'
import { CountUp, LcRow, LcStoryBand, LcHelpCard, LcSectionHead } from '@/components/market/LcStory'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { useData } from '@/providers/provider'
import type { ActivityItem, MarketView } from '@/providers/types'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'
import { formatUSD, formatPercent } from '@/lib/formatting'

const EASE = [0.16, 1, 0.3, 1] as const

type SortKey = 'supplied' | 'utilization' | 'supply' | 'borrow'

export default function AnalyticsPage() {
  const data = useData()
  const [markets, setMarkets] = useState<MarketView[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [atRisk, setAtRisk] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('supplied')

  useEffect(() => {
    Promise.all([data.getMarkets(), data.getActivity(), data.getLiquidatable()]).then(([m, a, l]) => {
      setMarkets(m)
      setActivity(a)
      setAtRisk(l.filter((p) => p.healthFactor < 1).length)
      setLoading(false)
    })
  }, [data])

  const illustrative = data.source === 'mock'
  const supplied = markets.reduce((s, m) => s + m.totalSupplied, 0)
  const borrowed = markets.reduce((s, m) => s + m.totalBorrowed, 0)
  const utilization = supplied > 0 ? (borrowed / supplied) * 100 : 0
  const avgSupply = supplied > 0 ? markets.reduce((s, m) => s + m.supplyAPY * m.totalSupplied, 0) / supplied : 0

  const sorted = useMemo(() => {
    const key = (m: MarketView) => sortKey === 'utilization' ? m.utilization : sortKey === 'supply' ? m.supplyAPY : sortKey === 'borrow' ? m.borrowAPY : m.totalSupplied
    return [...markets].sort((a, b) => key(b) - key(a))
  }, [markets, sortKey])

  const mix = useMemo(() => {
    const kinds: ActivityItem['kind'][] = ['supply', 'borrow', 'repay', 'withdraw', 'liquidate']
    return kinds.map((k) => ({ kind: k, count: activity.filter((a) => a.kind === k).length, volume: activity.filter((a) => a.kind === k).reduce((s, a) => s + a.amount, 0) }))
  }, [activity])
  const maxMix = Math.max(1, ...mix.map((m) => m.volume))

  const stats = [
    { label: 'Total supplied', value: supplied, f: (n: number) => formatUSD(n, true) },
    { label: 'Total borrowed', value: borrowed, f: (n: number) => formatUSD(n, true) },
    { label: 'Utilization', value: utilization, f: (n: number) => formatPercent(n) },
    { label: 'Avg supply APY', value: avgSupply, f: (n: number) => formatPercent(n, 2) },
    { label: 'Live markets', value: markets.length, f: (n: number) => String(Math.round(n)) },
    { label: 'Loans underwater', value: atRisk, f: (n: number) => String(Math.round(n)) },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} style={{ marginBottom: 28 }}>
          <div className="lc-eyebrow" style={{ marginBottom: 10 }}>Open data</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 46px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1.05, marginBottom: 10 }}>
            Analytics
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 620, lineHeight: 1.6 }}>
            How much is lent, how much is borrowed and how busy each market is. Nothing here is self reported, every number comes from the same contracts you use.
          </p>
        </motion.div>

        <Stagger className="lc-an-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <div style={{ ...lcPanel, padding: '18px 18px 16px', height: '100%' }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: s.label === 'Loans underwater' && s.value > 0 ? 'var(--danger)' : 'var(--text-1)' }}>
                  {loading ? '...' : <CountUp value={s.value} format={s.f} />}
                </div>
                {illustrative && <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Illustrative</div>}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="lc-an-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Reveal>
            <section style={{ ...lcPanel, padding: 24, height: '100%' }}>
              <LcCardTitle right={<span style={{ fontSize: 12, color: 'var(--text-3)' }}>Share of deposits</span>}>Where the money is</LcCardTitle>
              <div style={{ display: 'grid', gap: 16 }}>
                {[...markets].sort((a, b) => b.totalSupplied - a.totalSupplied).map((m, i) => (
                  <div key={m.slug}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontSize: 13 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-1)', fontWeight: 500 }}>
                        <TokenLogo symbol={m.collateralSymbol} size={20} />
                        {m.collateralSymbol} / {m.loanSymbol}
                      </span>
                      <span style={{ color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatUSD(m.totalSupplied, true)}
                        <span style={{ color: 'var(--text-4)', marginLeft: 8 }}>{formatPercent(supplied ? (m.totalSupplied / supplied) * 100 : 0, 0)}</span>
                      </span>
                    </div>
                    <Bar frac={supplied ? m.totalSupplied / supplied : 0} delay={i * 0.08} color="var(--accent)" />
                  </div>
                ))}
                {loading && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading markets</p>}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section style={{ ...lcPanel, padding: 24, height: '100%' }}>
              <LcCardTitle right={<span style={{ fontSize: 12, color: '#C7772E' }}>Kink at {formatPercent(RATE_MODEL_PARAMS.kink * 100, 0)}</span>}>How busy each market is</LcCardTitle>
              <div style={{ display: 'grid', gap: 16 }}>
                {markets.map((m, i) => (
                  <div key={m.slug}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{m.collateralSymbol} / {m.loanSymbol}</span>
                      <span style={{ color: m.utilization >= RATE_MODEL_PARAMS.kink ? 'var(--warning)' : 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatPercent(m.utilization * 100, 0)} lent out
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Bar frac={m.utilization} delay={i * 0.08} color={m.utilization >= RATE_MODEL_PARAMS.kink ? 'var(--warning)' : 'var(--positive)'} />
                      <span aria-hidden style={{ position: 'absolute', left: `${RATE_MODEL_PARAMS.kink * 100}%`, top: -3, bottom: -3, width: 0, borderLeft: '1.5px dashed #C7772E' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 18, lineHeight: 1.55 }}>
                Past the kink, borrowing gets expensive fast. That pulls utilization back down so lenders can always withdraw.
              </p>
            </section>
          </Reveal>
        </div>

        <div className="lc-an-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          <Reveal>
            <section style={{ ...lcPanel, overflow: 'hidden', height: '100%' }}>
              <div style={{ padding: '20px 24px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <LcCardTitle>Market breakdown</LcCardTitle>
                <div role="tablist" style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', marginBottom: 16 }}>
                  {([['supplied', 'Size'], ['utilization', 'Utilization'], ['supply', 'Supply APY'], ['borrow', 'Borrow APY']] as const).map(([k, l]) => (
                    <button key={k} role="tab" aria-selected={sortKey === k} onClick={() => setSortKey(k)}
                      style={{ position: 'relative', padding: '6px 10px', fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent', cursor: 'pointer', color: sortKey === k ? 'var(--text-1)' : 'var(--text-3)' }}>
                      {sortKey === k && (
                        <motion.span layoutId="lc-an-sort" transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          style={{ position: 'absolute', inset: 0, background: 'var(--surface)', border: '1px solid var(--border-default)', borderRadius: 6 }} />
                      )}
                      <span style={{ position: 'relative' }}>{l}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
                  <thead>
                    <tr>
                      <th style={{ ...lcTh, paddingLeft: 24 }}>Market</th>
                      <th style={lcTh}>Supplied</th>
                      <th style={lcTh}>Borrowed</th>
                      <th style={lcTh}>Supply APY</th>
                      <th style={lcTh}>Borrow APY</th>
                      <th style={{ ...lcTh, paddingRight: 24 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody key={sortKey}>
                    {sorted.map((m, i) => {
                      const st = marketStatus(m.oracleLastUpdate, m.maxStaleness)
                      return (
                        <LcRow key={m.slug} index={i} className="lc-an-row">
                          <td style={{ ...lcTd, paddingLeft: 24 }}>
                            <Link href={`/markets/${m.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>
                              <TokenLogo symbol={m.collateralSymbol} size={26} />
                              {m.collateralSymbol} / {m.loanSymbol}
                            </Link>
                          </td>
                          <td style={lcTd}>{formatUSD(m.totalSupplied, true)}</td>
                          <td style={lcTd}>{formatUSD(m.totalBorrowed, true)}</td>
                          <td style={{ ...lcTd, color: 'var(--positive)' }}>{formatPercent(m.supplyAPY)}</td>
                          <td style={lcTd}>{formatPercent(m.borrowAPY)}</td>
                          <td style={{ ...lcTd, paddingRight: 24 }}><LcPill tone={st.tone}>{st.label}</LcPill></td>
                        </LcRow>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section style={{ ...lcPanel, padding: 24, height: '100%' }}>
              <LcCardTitle>What people are doing</LcCardTitle>
              {activity.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{loading ? 'Loading activity' : 'No activity recorded yet.'}</p>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {mix.map((x, i) => (
                    <div key={x.kind}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--text-1)', fontWeight: 500 }}>{x.kind === 'liquidate' ? 'Liquidations' : `${x.kind}`}</span>
                        <span style={{ color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{x.count} · {formatUSD(x.volume, true)}</span>
                      </div>
                      <Bar frac={x.volume / maxMix} delay={i * 0.06} color={x.kind === 'liquidate' ? 'var(--danger)' : x.kind === 'borrow' ? 'var(--warning)' : 'var(--accent)'} thin />
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Recent transactions by type, count and volume.</p>
                </div>
              )}
            </section>
          </Reveal>
        </div>

        <LcFootnote icon={<Info size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}>
          {illustrative
            ? 'All figures are illustrative and come from the demo data set for the Base Sepolia testnet.'
            : 'All figures are read live from the Base Sepolia testnet.'}
        </LcFootnote>

        <div style={{ marginTop: 64 }}>
          <LcStoryBand
            eyebrow="Nothing to take on trust"
            title="If it is on this page, you can check it yourself."
            body="Every balance, rate and liquidation lives in public contracts. This page reads them, it does not keep its own books. Anyone with a block explorer can reach the same numbers."
          />
        </div>

        <div style={{ marginTop: 56 }}>
          <LcSectionHead eyebrow="Reading the numbers" title="Three things worth knowing" />
          <Stagger className="lc-an-tips" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <StaggerItem>
              <LcHelpCard icon={<Eye size={18} />} title="Utilization drives rates">
                The more of a market is lent out, the more borrowers pay and the more lenders earn. That is why rates move on their own.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<LockKey size={18} />} title="Totals do not mix risk">
                Adding markets together is only a summary. Each one still stands alone, a problem in one never touches the others.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<ListChecks size={18} />} title="Underwater loans are normal">
                A few loans dipping below 1 just means liquidators have work to do. The number to watch is whether they get closed quickly.
              </LcHelpCard>
            </StaggerItem>
          </Stagger>
          <Reveal style={{ marginTop: 20 }}>
            <Link href="/markets" className="btn btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
              Explore the markets <ArrowRight size={13} />
            </Link>
          </Reveal>
        </div>
      </div>

      <style jsx global>{`
        .lc-an-row td { transition: background 150ms ease; }
        .lc-an-grid > * { min-width: 0; }
        .lc-an-row:hover td { background: var(--surface-2); }
        @media (max-width: 1100px) { .lc-an-stats { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }
        @media (max-width: 960px) { .lc-an-grid, .lc-an-tips { grid-template-columns: 1fr !important; } }
        @media (max-width: 520px) { .lc-an-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
      `}</style>
    </div>
  )
}

function Bar({ frac, delay = 0, color, thin }: { frac: number; delay?: number; color: string; thin?: boolean }) {
  const reduce = useReducedMotion()
  const w = `${Math.max(0, Math.min(1, frac)) * 100}%`
  return (
    <div style={{ height: thin ? 6 : 8, borderRadius: 99, background: 'var(--accent-soft)', overflow: 'hidden' }}>
      <motion.div
        initial={reduce ? false : { width: 0 }}
        whileInView={{ width: w }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
        style={{ height: '100%', borderRadius: 99, background: color, width: reduce ? w : undefined }}
      />
    </div>
  )
}
