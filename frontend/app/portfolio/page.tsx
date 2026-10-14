'use client'
import { useState } from 'react'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Wallet, ArrowRight, CaretRight, ArrowDown, ArrowUp, ArrowsClockwise, Lightning, ShieldCheck } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { LcHealthArc } from '@/components/portfolio/LcHealthArc'
import { LcCardTitle, LcPill, lcPanel, lcTh, lcTd } from '@/components/market/LcUi'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import type { ActivityItem, MarketView, PositionView } from '@/providers/types'
import { formatUSD, formatNumber, getHealthStatus } from '@/lib/formatting'

const HEALTH = {
  safe: { label: 'Safe', tone: 'positive' },
  warning: { label: 'Caution', tone: 'warning' },
  danger: { label: 'At risk', tone: 'danger' },
} as const

export default function PortfolioPage() {
  const { account } = useAccountId()
  const { connect } = useConnect()

  if (!account) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>Connect your wallet</h2>
          <p style={{ color: 'var(--text-3)', maxWidth: 320, fontSize: 14 }}>
            View and manage your positions across all isolated markets.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => connect({ connector: injected() })}>
          <Wallet size={14} /> Connect Wallet
        </button>
      </div>
    )
  }

  return <PortfolioBody account={account} />
}

function PortfolioBody({ account }: { account: string }) {
  const data = useData()
  const [tab, setTab] = useState<'positions' | 'history'>('positions')
  const positions = useAsync(() => data.getPositions(account), [account, data])
  const markets = useAsync(() => data.getMarkets(), [data])
  const activity = useAsync(() => data.getActivity(), [data])

  const mk = (slug: string): MarketView | undefined => markets.data?.find(m => m.slug === slug)
  const list: PositionView[] = positions.data ?? []
  const mine: ActivityItem[] = (activity.data ?? []).filter(a => a.account.toLowerCase() === account.toLowerCase())

  const collateralValue = list.reduce((s, p) => s + p.collateral * (mk(p.slug)?.oraclePrice ?? 0), 0)
  const totalDebt = list.reduce((s, p) => s + p.borrowed, 0)
  const totalSupplied = list.reduce((s, p) => s + p.supplied, 0)
  const net = totalSupplied + collateralValue - totalDebt
  const indebted = list.filter(p => p.borrowed > 0)
  const lowest = indebted.length ? Math.min(...indebted.map(p => p.healthFactor)) : Infinity
  const illustrative = data.source === 'mock'

  const stat = (label: string, value: string, note?: string) => (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 6 }}>{note}</div>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 24 }}>
          Portfolio
        </motion.h1>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="lc-pf-top"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: 16, marginBottom: 28 }}
        >
          <div style={{ ...lcPanel, padding: 28, display: 'flex', alignItems: 'center' }}>
            {stat('Total Net Position', formatUSD(net), illustrative ? 'Illustrative' : undefined)}
          </div>
          <div style={{ ...lcPanel, padding: '24px 16px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LcHealthArc value={lowest} />
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ ...lcPanel, padding: '20px 24px' }}>{stat('Collateral Value', formatUSD(collateralValue))}</div>
            <div style={{ ...lcPanel, padding: '20px 24px' }}>{stat('Total Debt', formatUSD(totalDebt))}</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div role="tablist" style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border-default)', marginBottom: 20 }}>
          {(['positions', 'history'] as const).map(t => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              style={{
                padding: '10px 2px', marginBottom: -1, fontSize: 14, textTransform: 'capitalize', cursor: 'pointer', background: 'none', border: 'none',
                fontWeight: tab === t ? 600 : 500,
                color: tab === t ? 'var(--text-1)' : 'var(--text-3)',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'positions' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ ...lcPanel, overflow: 'hidden', marginBottom: 24 }}>
            {list.length === 0 ? (
              <div style={{ padding: '44px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 16 }}>
                  {positions.loading ? 'Loading positions' : 'You have no active positions yet.'}
                </p>
                {!positions.loading && (
                  <Link href="/markets" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                    Explore markets <ArrowRight size={14} weight="bold" />
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                  <thead>
                    <tr>
                      <th style={{ ...lcTh, paddingLeft: 24 }}>Market</th>
                      <th style={lcTh}>Collateral</th>
                      <th style={lcTh}>Supplied</th>
                      <th style={lcTh}>Debt</th>
                      <th style={lcTh}>Health Factor</th>
                      <th style={lcTh}>Status</th>
                      <th style={{ ...lcTh, paddingRight: 24, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(p => {
                      const m = mk(p.slug)
                      const h = HEALTH[getHealthStatus(p.healthFactor)]
                      const col = m?.collateralSymbol ?? p.slug.toUpperCase()
                      const loan = m?.loanSymbol ?? ''
                      return (
                        <tr key={p.slug}>
                          <td style={{ ...lcTd, paddingLeft: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <TokenLogo symbol={col} size={32} />
                              <span style={{ display: 'grid', gap: 5, justifyItems: 'start' }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{col} / {loan}</span>
                                <LcPill small tone="positive">Active</LcPill>
                              </span>
                            </div>
                          </td>
                          <td style={lcTd}>{formatNumber(p.collateral, 4)} {col}</td>
                          <td style={lcTd}>{formatNumber(p.supplied)} {loan}</td>
                          <td style={lcTd}>{formatNumber(p.borrowed)} {loan}</td>
                          <td style={lcTd}>{Number.isFinite(p.healthFactor) ? p.healthFactor.toFixed(2) : 'No debt'}</td>
                          <td style={lcTd}><LcPill tone={h.tone}>{h.label}</LcPill></td>
                          <td style={{ ...lcTd, paddingRight: 24, textAlign: 'right' }}>
                            <Link href={`/markets/${p.slug}`} aria-label={`Manage ${col} position`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>
                              Manage <CaretRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ ...lcPanel, padding: '8px 24px', marginBottom: 24 }}>
            {mine.length === 0
              ? <p style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: 'var(--text-3)' }}>
                {activity.loading ? 'Loading history' : 'No transactions from this account yet.'}
              </p>
              : mine.map((a, i) => <ActivityRow key={a.id} a={a} loan={mk(a.slug)?.loanSymbol ?? ''} last={i === mine.length - 1} />)}
          </motion.div>
        )}

        {/* Activity and insights */}
        <div className="lc-pf-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <section style={{ ...lcPanel, padding: 24 }}>
            <LcCardTitle>Recent Activity</LcCardTitle>
            {mine.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Your supplies, borrows and repayments will show here.</p>
              : mine.slice(0, 3).map((a, i, arr) => <ActivityRow key={a.id} a={a} loan={mk(a.slug)?.loanSymbol ?? ''} last={i === arr.length - 1} />)}
          </section>
          <section style={{ ...lcPanel, padding: 24 }}>
            <LcCardTitle>Risk Insights</LcCardTitle>
            <RiskInsight lowest={lowest} hasDebt={indebted.length > 0} />
          </section>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .lc-pf-top { grid-template-columns: 1fr !important; }
          .lc-pf-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const KIND = {
  supply: { label: 'Supply', icon: ArrowDown, color: 'var(--positive)' },
  withdraw: { label: 'Withdraw', icon: ArrowUp, color: 'var(--text-2)' },
  borrow: { label: 'Borrow', icon: ArrowUp, color: 'var(--danger)' },
  repay: { label: 'Repay', icon: ArrowsClockwise, color: 'var(--positive)' },
  liquidate: { label: 'Liquidation', icon: Lightning, color: 'var(--danger)' },
} as const

function ActivityRow({ a, loan, last }: { a: ActivityItem; loan: string; last: boolean }) {
  const k = KIND[a.kind]
  const Icon = k.icon
  const when = new Date(a.timestamp)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border-default)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexShrink: 0 }}>
        <Icon size={13} />
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{k.label} {loan}</span>
      <span style={{ textAlign: 'right' }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: k.color, fontVariantNumeric: 'tabular-nums' }}>
          {formatNumber(a.amount)} {loan}
        </span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>
          {when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
      </span>
    </div>
  )
}

function RiskInsight({ lowest, hasDebt }: { lowest: number; hasDebt: boolean }) {
  const status = getHealthStatus(lowest)
  const text = !hasDebt
    ? 'You have no debt, so nothing in your portfolio can be liquidated.'
    : status === 'safe'
      ? 'Your health factor is healthy. Consider adding collateral if the market becomes volatile.'
      : status === 'warning'
        ? 'Your health factor is getting close to 1. Add collateral or repay some debt to stay clear of liquidation.'
        : 'A position is close to liquidation. Repay debt or add collateral now.'
  const tone = !hasDebt || status === 'safe' ? 'var(--positive)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)'
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${tone}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone, flexShrink: 0, opacity: 0.9 }}>
          <ShieldCheck size={22} weight="duotone" />
        </span>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-2)' }}>{text}</p>
      </div>
      <Link href="/docs" className="btn btn-secondary" style={{ justifySelf: 'center', minWidth: 180, justifyContent: 'center' }}>
        Learn more
      </Link>
    </div>
  )
}
