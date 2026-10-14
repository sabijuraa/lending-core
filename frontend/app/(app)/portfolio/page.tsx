'use client'
import { Fragment, useState } from 'react'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Wallet, ArrowDown, ArrowUp, ArrowsClockwise, Lightning, ShieldCheck, HandCoins, Vault, Heartbeat, BookOpen } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { LcHealthArc } from '@/components/portfolio/LcHealthArc'
import { LcCardTitle, LcPill, lcPanel, lcTh, lcTd } from '@/components/market/LcUi'
import { LcActionPanel } from '@/components/market/LcActionPanel'
import { CountUp, LcRow, LcStoryBand, LcSectionHead } from '@/components/market/LcStory'
import { Stagger, StaggerItem } from '@/components/ui/Reveal'
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
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...lcPanel, maxWidth: 440, width: '100%', padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Wallet size={28} style={{ color: 'var(--accent)' }} />
          </motion.div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Your portfolio lives in your wallet</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.6 }}>
              Connect to see what you are earning, what you owe and how safe each loan is, across every market at once.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => connect({ connector: injected() })}>
            Connect wallet
          </button>
          <Link href="/markets" style={{ fontSize: 13, color: 'var(--text-3)' }}>Or browse the markets first</Link>
        </motion.div>
      </div>
    )
  }

  return <PortfolioBody account={account} />
}

function PortfolioBody({ account }: { account: string }) {
  const data = useData()
  const [tab, setTab] = useState<'positions' | 'history'>('positions')
  const [open, setOpen] = useState<string | null>(null)
  const positions = useAsync(() => data.getPositions(account), [account, data])
  const markets = useAsync(() => data.getMarkets(), [data])
  const activity = useAsync(() => data.getActivity(undefined, account), [account, data])

  const mk = (slug: string): MarketView | undefined => markets.data?.find(m => m.slug === slug)
  const list: PositionView[] = positions.data ?? []
  const mine: ActivityItem[] = activity.data ?? []

  const collateralValue = list.reduce((s, p) => s + p.collateral * (mk(p.slug)?.oraclePrice ?? 0), 0)
  const totalDebt = list.reduce((s, p) => s + p.borrowed, 0)
  const totalSupplied = list.reduce((s, p) => s + p.supplied, 0)
  const net = totalSupplied + collateralValue - totalDebt
  const indebted = list.filter(p => p.borrowed > 0)
  const lowest = indebted.length ? Math.min(...indebted.map(p => p.healthFactor)) : Infinity

  const stat = (label: string, value: number, note?: string) => (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
        <CountUp value={value} format={(n) => formatUSD(n)} />
      </div>
      {note && <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 6 }}>{note}</div>}
    </div>
  )

  return (
    <div style={{ padding: '8px 0 64px', overflowX: 'clip' }}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 8 }}>
            Portfolio
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Everything you earn and owe, in one place.</p>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="lc-pf-top"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr 1fr', gap: 16, marginBottom: 28 }}
        >
          <div style={{ ...lcPanel, padding: 28, display: 'flex', alignItems: 'center' }}>
            {stat('Total Net Position', net, 'Supplied plus collateral, minus debt')}
          </div>
          <div style={{ ...lcPanel, padding: '24px 16px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <LcHealthArc value={lowest} />
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ ...lcPanel, padding: '20px 24px' }}>{stat('Collateral Value', collateralValue)}</div>
            <div style={{ ...lcPanel, padding: '20px 24px' }}>{stat('Total Debt', totalDebt)}</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div role="tablist" style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border-default)', marginBottom: 20 }}>
          {(['positions', 'history'] as const).map(t => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              style={{
                position: 'relative', padding: '10px 2px', marginBottom: -1, fontSize: 14, textTransform: 'capitalize', cursor: 'pointer', background: 'none', border: 'none',
                fontWeight: tab === t ? 600 : 500,
                color: tab === t ? 'var(--text-1)' : 'var(--text-3)',
                transition: 'color 150ms ease',
              }}>
              {t}
              {tab === t && (
                <motion.span layoutId="lc-pf-tab" transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'var(--accent)', borderRadius: 1 }} />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
        {tab === 'positions' ? (
          <motion.div key="positions" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }}
            style={{ ...lcPanel, overflow: 'hidden', marginBottom: 24 }}>
            {list.length === 0 ? (
              <div style={{ padding: '44px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 16 }}>
                  {positions.loading ? 'Loading positions' : 'You have no active positions yet.'}
                </p>
                {!positions.loading && (
                  <Link href="/markets" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                    Explore markets
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
                    {list.map((p, i) => {
                      const m = mk(p.slug)
                      const h = HEALTH[getHealthStatus(p.healthFactor)]
                      const col = m?.collateralSymbol ?? p.slug.toUpperCase()
                      const loan = m?.loanSymbol ?? ''
                      return (
                        <Fragment key={p.slug}>
                        <LcRow index={i} className="lc-pf-row">
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
                            <button
                              className={open === p.slug ? 'btn btn-primary' : 'btn btn-secondary'}
                              aria-expanded={open === p.slug}
                              aria-label={`Manage ${col} position`}
                              onClick={() => setOpen(open === p.slug ? null : p.slug)}
                              style={{ padding: '6px 14px', fontSize: 12.5 }}
                            >
                              {open === p.slug ? 'Close' : 'Manage'}
                            </button>
                          </td>
                        </LcRow>
                        <AnimatePresence initial={false}>
                          {open === p.slug && m && (
                            <tr>
                              <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid var(--border-subtle)' }}>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ overflow: 'hidden', background: 'var(--surface-2)' }}
                                >
                                  <div className="lc-pf-manage" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 24, padding: '20px 24px' }}>
                                    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)' }}>
                                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>Manage {col} / {loan}</div>
                                      Supply or withdraw {loan}, add or free up {col} collateral, borrow more or pay down your loan. Your health factor preview updates before you confirm.
                                      <div style={{ marginTop: 12 }}>
                                        <Link href={`/markets/${p.slug}`} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 13 }}>Open full market page</Link>
                                      </div>
                                    </div>
                                    <LcActionPanel
                                      m={m}
                                      initialTab={p.borrowed > 0 ? 'repay' : p.supplied > 0 ? 'withdraw' : 'collateral'}
                                      onChanged={() => { positions.reload(); markets.reload(); activity.reload() }}
                                    />
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}
            style={{ ...lcPanel, padding: '8px 24px', marginBottom: 24 }}>
            {mine.length === 0
              ? <p style={{ padding: '32px 0', textAlign: 'center', fontSize: 14, color: 'var(--text-3)' }}>
                {activity.loading ? 'Loading history' : 'No transactions from this account yet.'}
              </p>
              : mine.map((a, i) => <ActivityRow key={a.id} a={a} loan={mk(a.slug)?.loanSymbol ?? ''} last={i === mine.length - 1} />)}
          </motion.div>
        )}
        </AnimatePresence>

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

        <NextSteps hasPositions={list.length > 0} hasDebt={indebted.length > 0} hasSupply={totalSupplied > 0} />
      </div>

      <style jsx global>{`
        .lc-pf-row td { transition: background 150ms ease; }
        .lc-pf-row:hover td { background: var(--surface-2); }
        .lc-step-card { display: flex; flex-direction: column; gap: 10px; padding: 22px; height: 100%; text-decoration: none; color: inherit; transition: transform 200ms var(--ease-expo), border-color 200ms ease, box-shadow 200ms ease; }
        .lc-step-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: 0 10px 28px -16px rgba(16,43,39,0.35); }
        .lc-step-card:hover .lc-step-go { transform: translateX(3px); }
        .lc-step-go { transition: transform 200ms ease; }
        @media (prefers-reduced-motion: reduce) { .lc-step-card:hover { transform: none; } }
        @media (max-width: 1024px) { .lc-next-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 560px) { .lc-next-grid, .lc-zone-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 960px) {
          .lc-pf-top { grid-template-columns: 1fr !important; }
          .lc-pf-bottom { grid-template-columns: 1fr !important; }
          .lc-pf-manage { grid-template-columns: 1fr !important; }
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

function NextSteps({ hasPositions, hasDebt, hasSupply }: { hasPositions: boolean; hasDebt: boolean; hasSupply: boolean }) {
  const steps = [
    {
      icon: <HandCoins size={18} />, href: '/markets',
      title: hasSupply ? 'Put more to work' : 'Start earning',
      body: hasSupply
        ? 'Spread deposits across a few markets so no single collateral decides your returns.'
        : 'Supply USDC to a market you trust and earn interest from borrowers, block by block.',
      cta: 'Browse markets',
    },
    {
      icon: <Vault size={18} />, href: '/borrow',
      title: hasDebt ? 'Keep a buffer' : 'Borrow without selling',
      body: hasDebt
        ? 'Borrowing well below your limit gives you room to ride out a sharp price drop.'
        : 'Post collateral and draw cash against it, while keeping your exposure to the asset.',
      cta: hasDebt ? 'Manage loans' : 'Open a loan',
    },
    {
      icon: <Lightning size={18} />, href: '/liquidations',
      title: 'Earn as a keeper',
      body: 'Repay loans that slipped underwater and collect the collateral plus a bonus. It keeps markets solvent.',
      cta: 'See opportunities',
    },
    {
      icon: <BookOpen size={18} />, href: '/how-it-works',
      title: hasPositions ? 'Know your risks' : 'Learn the basics',
      body: 'A short walk through supply, borrow, health factor and liquidation, in plain words.',
      cta: 'How it works',
    },
  ]
  return (
    <div style={{ marginTop: 56 }}>
      <LcSectionHead eyebrow="Next steps" title={hasPositions ? 'Make the most of your positions' : 'Where to begin'} />
      <Stagger className="lc-next-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 40 }}>
        {steps.map((st) => (
          <StaggerItem key={st.title}>
            <Link href={st.href} className="lc-card lc-step-card">
              <span className="lc-icon-tile">{st.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{st.title}</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-3)', flex: 1 }}>{st.body}</span>
              <span className="lc-step-go" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                {st.cta}
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <LcStoryBand
        eyebrow="Your safety net"
        title="One number tells you how safe a loan is."
        body="Your health factor compares what your collateral can back with what you owe. It moves with prices, so it is worth a glance whenever markets get busy."
      >
        <div className="lc-zone-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 24 }}>
          {[
            { range: 'Above 1.5', label: 'Comfortable', body: 'Plenty of room for prices to move.', color: '#9FD3B4' },
            { range: '1.1 to 1.5', label: 'Keep an eye on it', body: 'Consider repaying a little or adding collateral.', color: '#F0C27A' },
            { range: 'Below 1.0', label: 'Can be liquidated', body: 'Anyone may repay the loan and claim the collateral.', color: '#F2A49C' },
          ].map((z, i) => (
            <motion.div
              key={z.range}
              className="lc-dark-inset"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '16px 18px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Heartbeat size={16} style={{ color: z.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{z.range}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: z.color, marginBottom: 4 }}>{z.label}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--band-muted)' }}>{z.body}</div>
            </motion.div>
          ))}
        </div>
      </LcStoryBand>
    </div>
  )
}
