'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import type { ActivityItem, MarketView, PositionView } from '@/providers/types'
import { TokenPair } from '@/components/ui/TokenLogo'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { LoadingBlock, ErrorBlock } from '@/components/ui/States'
import { LcHealthArc } from '@/components/portfolio/LcHealthArc'
import { LcPill } from '@/components/market/LcUi'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { AppHeader, ConnectWalletButton, hfLabel, hfTone, panel, useWallet } from '@/components/app/AppUi'
import { SupplyPanel } from '@/components/app/SupplyPanel'
import { BorrowPanel } from '@/components/app/BorrowPanel'
import { formatUSD, formatPercent, truncateAddress, getHealthStatus, formatTimeAgo } from '@/lib/formatting'
import s from '@/components/app/app.module.css'

export default function DashboardPage() {
  const data = useData()
  const account = useWallet()
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([] as PositionView[])), [account, data])
  const markets = useAsync(() => data.getMarkets(), [data])
  const activity = useAsync(() => (account ? data.getActivity(undefined, account) : Promise.resolve([] as ActivityItem[])), [account, data])

  if (!account) return <ConnectPrompt />

  const ps = positions.data ?? []
  const ms = markets.data ?? []
  const market = (slug: string) => ms.find((m) => m.slug === slug)
  const supplied = ps.reduce((t, p) => t + p.supplied, 0)
  const borrowed = ps.reduce((t, p) => t + p.borrowed, 0)
  const collateralValue = ps.reduce((t, p) => t + p.collateral * (market(p.slug)?.oraclePrice ?? 0), 0)
  const net = supplied + collateralValue - borrowed
  const earn = ps.reduce((t, p) => t + p.supplied * (market(p.slug)?.supplyAPY ?? 0), 0)
  const pay = ps.reduce((t, p) => t + p.borrowed * (market(p.slug)?.borrowAPY ?? 0), 0)
  const netAPY = supplied > 0 ? (earn - pay) / supplied : 0
  const borrowPower = ps.reduce((t, p) => { const m = market(p.slug); return t + (m ? p.collateral * m.oraclePrice * m.lltv : 0) }, 0)
  const used = borrowPower > 0 ? Math.min(1, borrowed / borrowPower) : 0
  const worstHF = ps.filter((p) => p.borrowed > 0).reduce((min, p) => Math.min(min, p.healthFactor), Infinity)
  const best = [...ms].sort((a, b) => b.supplyAPY - a.supplyAPY)[0]
  const refresh = () => { positions.reload(); markets.reload(); activity.reload() }

  const actions = [
    { href: best ? `/supply/${best.slug}` : '/earn', title: 'Supply', body: best ? `Lend ${best.loanSymbol} at up to ${formatPercent(best.supplyAPY, 2)} APY` : 'Lend USDC and earn interest' },
    { href: '/borrow', title: 'Borrow', body: 'Unlock USDC without selling your crypto' },
    { href: '/earn', title: 'Earn', body: 'Compare every market side by side' },
    { href: '/liquidations', title: 'Liquidate', body: 'Repay unsafe loans and earn a bonus' },
  ]

  return (
    <div className={s.page}>
      <AppHeader title="Welcome back"
        subtitle={<>
          Everything you have supplied and borrowed, in one place.{' '}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4, padding: '2px 10px', fontSize: 12, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-default)', color: 'var(--text-2)', verticalAlign: 'middle' }}>
            <span className="lc-dot" style={{ color: 'var(--positive)' }} />
            {truncateAddress(account)}
          </span>
        </>} />

      <Stagger className={s.grid4}>
        {actions.map((a) => (
          <StaggerItem key={a.title}>
            <Link href={a.href} className={s.action}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 600 }}>{a.title}</span>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{a.body}</span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {(positions.loading && !positions.data) && <div style={{ marginTop: 24 }}><LoadingBlock rows={4} /></div>}
      {positions.error && <div style={{ marginTop: 24 }}><ErrorBlock message={positions.error} onRetry={positions.reload} /></div>}

      {positions.data && (
        <>
          <Reveal style={{ marginTop: 24 }}>
            <div style={{ ...panel, padding: 28 }} className={s.summary}>
              <div style={{ display: 'grid', gap: 18 }}>
                <Stat label="Net position" value={net} big />
                <div>
                  <div className="lc-label">Net APY</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: netAPY >= 0 ? 'var(--positive)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>{formatPercent(netAPY, 2)}</div>
                </div>
                <div>
                  <div className="lc-label" style={{ marginBottom: 6 }}>Borrow limit used</div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${used * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: '100%', background: used > 0.9 ? 'var(--danger)' : used > 0.75 ? 'var(--warning)' : 'var(--positive)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{formatPercent(used * 100, 0)} of {formatUSD(borrowPower)}</div>
                </div>
              </div>
              <LcHealthArc value={worstHF} />
              <div style={{ display: 'grid', gap: 14 }}>
                <Stat label="Supplied" value={supplied} />
                <Stat label="Collateral value" value={collateralValue} />
                <Stat label="Debt" value={borrowed} />
              </div>
            </div>
          </Reveal>

          <Reveal style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h2 className="lc-section-title">Your positions</h2>
              {ps.length > 0 && <Link href="/portfolio" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>Full portfolio</Link>}
            </div>
            {ps.length === 0 ? (
              <FirstSteps best={best} />
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {ps.map((p) => { const m = market(p.slug); return m ? <PositionCard key={p.slug} p={p} m={m} onDone={refresh} /> : null })}
              </div>
            )}
          </Reveal>
        </>
      )}

      {ms.length > 0 && (
        <Reveal style={{ marginTop: 40 }}>
          <h2 className="lc-section-title" style={{ marginBottom: 14 }}>Markets you can use</h2>
          <div style={{ ...panel, overflow: 'hidden' }}>
            <div className={s.listRow} style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Market</span><span>Supply APY</span><span className={s.hideSm}>Borrow APY</span><span className={s.hideSm}>Liquidity</span><span />
            </div>
            {ms.map((m, i) => (
              <div key={m.slug} className={s.listRow} style={{ padding: '14px 20px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <Link href={`/markets/${m.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, color: 'inherit', textDecoration: 'none' }}>
                  <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={26} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{m.collateralSymbol} / {m.loanSymbol}</span>
                </Link>
                <span style={{ fontSize: 14, color: 'var(--positive)', fontWeight: 500 }}>{formatPercent(m.supplyAPY, 2)}</span>
                <span className={s.hideSm} style={{ fontSize: 14 }}>{formatPercent(m.borrowAPY, 2)}</span>
                <span className={s.hideSm} style={{ fontSize: 14, color: 'var(--text-2)' }}>{formatUSD(Math.max(0, m.totalSupplied - m.totalBorrowed), true)}</span>
                <span style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Link href={`/supply/${m.slug}`} className="btn btn-secondary btn-sm">Supply</Link>
                  <Link href={`/borrow/${m.slug}`} className={`btn btn-primary btn-sm ${s.hideSm}`}>Borrow</Link>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal style={{ marginTop: 40 }}>
        <h2 className="lc-section-title" style={{ marginBottom: 14 }}>Recent activity</h2>
        <RecentActivity items={activity.data ?? []} loading={activity.loading && !activity.data} markets={ms} />
      </Reveal>
    </div>
  )
}

function Stat({ label, value, big }: { label: string; value: number; big?: boolean }) {
  return (
    <div>
      <div className="lc-label">{label}</div>
      <AnimatedNumber value={value} format="currency" style={{ fontFamily: 'inherit', fontSize: big ? 32 : 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }} />
    </div>
  )
}

const KIND_LABEL: Record<ActivityItem['kind'], string> = {
  supply: 'Supplied', withdraw: 'Withdrew', borrow: 'Borrowed', repay: 'Repaid', liquidate: 'Liquidated',
}

function RecentActivity({ items, loading, markets }: { items: ActivityItem[]; loading: boolean; markets: MarketView[] }) {
  if (loading) return <LoadingBlock rows={3} />
  if (items.length === 0) {
    return (
      <div style={{ ...panel, padding: 24, fontSize: 14, color: 'var(--text-3)' }}>
        Your supplies, borrows and repayments will show up here as you make them.
      </div>
    )
  }
  return (
    <div style={{ ...panel, overflow: 'hidden' }}>
      {items.slice(0, 8).map((a, i) => {
        const m = markets.find((x) => x.slug === a.slug)
        return (
          <div key={a.id} className={s.activityRow} style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{KIND_LABEL[a.kind]}</span>
            <span style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{formatUSD(a.amount)}</span>
            <span className={s.hideSm} style={{ fontSize: 13, color: 'var(--text-2)' }}>{m ? `${m.collateralSymbol} / ${m.loanSymbol}` : a.slug.toUpperCase()}</span>
            <span style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'right' }}>{formatTimeAgo(a.timestamp)}</span>
          </div>
        )
      })}
    </div>
  )
}

function FirstSteps({ best }: { best: MarketView | undefined }) {
  const steps = [
    { title: 'Pick a market', body: 'Each one lends USDC against a single type of collateral.' },
    { title: 'Supply USDC', body: 'Confirm in your wallet and you start earning from the next block.' },
    { title: 'Watch it grow', body: 'Your balance rises as borrowers pay interest. Withdraw any time.' },
  ]
  return (
    <div className="lc-dark-card" style={{ padding: 32, borderRadius: 'var(--r-lg)', display: 'grid', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Make your first move</h3>
        <p style={{ fontSize: 14, color: 'var(--band-muted)', maxWidth: 520, margin: 0 }}>
          You have no positions yet. Most people start by supplying a little USDC to see how it works.
        </p>
      </div>
      <div className={s.grid3}>
        {steps.map((st, i) => (
          <div key={st.title} className="lc-dark-inset" style={{ padding: 18 }}>
            <span className="lc-step-num" style={{ marginBottom: 12 }}>{i + 1}</span>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '10px 0 4px' }}>{st.title}</div>
            <p style={{ fontSize: 13, color: 'var(--band-muted)', margin: 0, lineHeight: 1.55 }}>{st.body}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href={best ? `/supply/${best.slug}` : '/earn'} className="btn btn-on-dark" style={{ background: '#fff', color: 'var(--primary)', borderColor: '#fff' }}>
          Make your first supply
        </Link>
        <Link href="/borrow" className="btn btn-on-dark">Borrow instead</Link>
      </div>
    </div>
  )
}

function PositionCard({ p, m, onDone }: { p: PositionView; m: MarketView; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const status = getHealthStatus(p.healthFactor)
  const pill = p.borrowed === 0
    ? <LcPill tone="positive" small>{p.supplied > 0 ? 'Earning' : 'No debt'}</LcPill>
    : <LcPill tone={status === 'safe' ? 'positive' : status === 'warning' ? 'warning' : 'danger'} small>{status === 'safe' ? 'Safe' : status === 'warning' ? 'Caution' : 'At risk'}</LcPill>
  const cell = (label: string, value: React.ReactNode, cls?: string) => (
    <div className={cls}><div className="lc-label">{label}</div><div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{value}</div></div>
  )
  return (
    <div style={{ ...panel, overflow: 'hidden' }}>
      <div className={s.posRow} style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={28} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{m.collateralSymbol} / {m.loanSymbol}</div>
            <div style={{ marginTop: 4 }}>{pill}</div>
          </div>
        </div>
        {cell('Supplied', formatUSD(p.supplied), s.hideSm)}
        {cell('Collateral', `${p.collateral.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${m.collateralSymbol}`, s.hideSm)}
        {cell('Debt', formatUSD(p.borrowed), s.hideSm)}
        {cell('Health', <span style={{ color: `var(--${p.borrowed ? hfTone(p.healthFactor) : 'positive'})` }}>{hfLabel(p.healthFactor)}</span>, s.hideSm)}
        <button type="button" className={`btn btn-sm ${open ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Close' : 'Manage'}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <div className={s.manage} style={{ padding: 20, borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
              <SupplyPanel m={m} onChanged={onDone} initialTab={p.supplied > 0 ? 'withdraw' : 'supply'} />
              <BorrowPanel m={m} pos={p} onChanged={onDone} initialTab={p.borrowed > 0 ? 'repay' : p.collateral > 0 ? 'borrow' : 'collateral'} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConnectPrompt() {
  const perks = [
    { title: 'Earn on idle USDC', body: 'Lend into the market you choose and watch your balance grow every block.' },
    { title: 'Borrow against your crypto', body: 'Unlock USDC without selling, and keep the upside of what you hold.' },
    { title: 'See your risk at a glance', body: 'One health score tells you how safe each position is, with clear warnings.' },
  ]
  return (
    <div className={s.page}>
      <Reveal>
        <div className="lc-dark-card" style={{ padding: 'clamp(28px, 5vw, 56px)', borderRadius: 'var(--r-xl)', display: 'grid', gap: 32 }}>
          <div style={{ maxWidth: 560 }}>
            <div className="lc-eyebrow" style={{ color: 'var(--band-muted)', marginBottom: 12 }}>Dashboard</div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1, marginBottom: 14 }}>
              Connect your wallet to open your dashboard
            </h1>
            <p style={{ fontSize: 15, color: 'var(--band-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Your positions, earnings and health score live here. Connecting only shares your public address. Nothing moves until you confirm a transaction.
            </p>
            <div style={{ maxWidth: 280 }}>
              <ConnectWalletButton label="Connect Wallet" onDark />
            </div>
          </div>
          <Stagger className={s.grid3}>
            {perks.map((p) => (
              <StaggerItem key={p.title}>
                <div className="lc-dark-inset" style={{ padding: 20, height: '100%' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--band-muted)', margin: 0, lineHeight: 1.55 }}>{p.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Reveal>
    </div>
  )
}
