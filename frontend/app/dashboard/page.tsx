'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ArrowRight, ArrowUpRight, Coins, HandCoins, Lightning, Plant, Wallet, CaretDown } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import type { MarketView, PositionView } from '@/providers/types'
import { TxButton } from '@/components/market/TxButton'
import { TokenPair } from '@/components/ui/TokenLogo'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { LoadingBlock, ErrorBlock } from '@/components/ui/States'
import { LcHealthArc } from '@/components/portfolio/LcHealthArc'
import { LcPill } from '@/components/market/LcUi'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { AmountField, AppHeader, DemoBanner, hfLabel, hfTone, panel } from '@/components/app/AppUi'
import { formatUSD, formatPercent, truncateAddress, getHealthStatus } from '@/lib/formatting'
import s from '@/components/app/app.module.css'

export default function DashboardPage() {
  const data = useData()
  const { account, isDemo } = useAccountId()
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([] as PositionView[])), [account, data])
  const markets = useAsync(() => data.getMarkets(), [data])

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
  const worstHF = ps.filter((p) => p.borrowed > 0).reduce((min, p) => Math.min(min, p.healthFactor), Infinity)
  const best = [...ms].sort((a, b) => b.supplyAPY - a.supplyAPY)[0]
  const refresh = () => { positions.reload(); markets.reload() }

  const actions = [
    { href: best ? `/supply/${best.slug}` : '/earn', icon: <Coins size={20} />, title: 'Supply', body: best ? `Lend USDC, best rate now ${formatPercent(best.supplyAPY, 2)}` : 'Lend USDC and earn interest' },
    { href: '/borrow', icon: <HandCoins size={20} />, title: 'Borrow', body: 'Unlock USDC without selling your crypto' },
    { href: '/earn', icon: <Plant size={20} />, title: 'Earn', body: 'Compare every market side by side' },
    { href: '/liquidations', icon: <Lightning size={20} />, title: 'Liquidate', body: 'Repay unsafe loans and earn a bonus' },
  ]

  return (
    <div className={s.page}>
      <div className="section-container">
        <AppHeader eyebrow="Dashboard" title={isDemo ? 'Welcome to lending-core' : 'Welcome back'}
          subtitle={<>
            Everything you have supplied and borrowed, in one place.{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4, padding: '2px 10px', fontSize: 12, borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border-default)', color: 'var(--text-2)', verticalAlign: 'middle' }}>
              <span className="lc-dot" style={{ color: 'var(--positive)' }} />
              {isDemo ? 'Demo account' : truncateAddress(account)}
            </span>
          </>} />
        <DemoBanner />

        <Stagger className={s.grid4}>
          {actions.map((a) => (
            <StaggerItem key={a.title}>
              <Link href={a.href} className={s.action}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="lc-icon-tile">{a.icon}</span>
                  <ArrowUpRight size={16} className={s.actionArrow} />
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{a.title}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{a.body}</span>
                </span>
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
                {ps.length > 0 && <Link href="/portfolio" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>Full portfolio <ArrowRight size={12} /></Link>}
              </div>
              {ps.length === 0 ? (
                <FirstSteps best={best} />
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {ps.map((p) => { const m = market(p.slug); return m ? <PositionCard key={p.slug} p={p} m={m} account={account} onDone={refresh} /> : null })}
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={26} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{m.collateralSymbol} / {m.loanSymbol}</span>
                  </span>
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
      </div>
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

function FirstSteps({ best }: { best: MarketView | undefined }) {
  const steps = [
    { title: 'Pick a market', body: 'Each one lends USDC against a single type of collateral.' },
    { title: 'Supply USDC', body: 'Confirm in your wallet and you start earning that block.' },
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
          Make your first supply <ArrowRight size={14} />
        </Link>
        <Link href="/how-it-works" className="btn btn-on-dark">How it works</Link>
      </div>
    </div>
  )
}

function PositionCard({ p, m, account, onDone }: { p: PositionView; m: MarketView; account: string; onDone: () => void }) {
  const data = useData()
  const [open, setOpen] = useState(false)
  const [repay, setRepay] = useState('')
  const [withdraw, setWithdraw] = useState('')
  const status = getHealthStatus(p.healthFactor)
  const pill = p.borrowed === 0
    ? <LcPill tone="positive" small>Earning</LcPill>
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
        {cell('Collateral', `${p.collateral.toLocaleString()} ${m.collateralSymbol}`, s.hideSm)}
        {cell('Debt', formatUSD(p.borrowed), s.hideSm)}
        {cell('Health', <span style={{ color: `var(--${p.borrowed ? hfTone(p.healthFactor) : 'positive'})` }}>{hfLabel(p.healthFactor)}</span>, s.hideSm)}
        <button className="btn btn-secondary btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          Manage <CaretDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <div className={s.grid3} style={{ padding: 20, borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <AmountField id={`w-${p.slug}`} label="Withdraw" symbol={m.loanSymbol} value={withdraw} onChange={setWithdraw} max={p.supplied} maxLabel="Supplied" />
                <TxButton label="Withdraw" disabled={!(Number(withdraw) > 0) || p.supplied === 0} run={() => data.withdraw(p.slug, Number(withdraw), account)} onDone={() => { setWithdraw(''); onDone() }} />
              </div>
              <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <AmountField id={`r-${p.slug}`} label="Repay" symbol={m.loanSymbol} value={repay} onChange={setRepay} max={p.borrowed} maxLabel="Owed" />
                <TxButton label="Repay" disabled={!(Number(repay) > 0) || p.borrowed === 0} run={() => data.repay(p.slug, Math.min(Number(repay), p.borrowed), account)} onDone={() => { setRepay(''); onDone() }} />
              </div>
              <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <div className="lc-label">More actions</div>
                <Link href={`/supply/${m.slug}`} className="btn btn-secondary" style={{ justifyContent: 'center' }}>Supply more</Link>
                <Link href={`/borrow/${m.slug}`} className="btn btn-secondary" style={{ justifyContent: 'center' }}>Add collateral or borrow</Link>
                <Link href={`/markets/${m.slug}`} className="btn btn-ghost" style={{ justifyContent: 'center' }}>View market</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConnectPrompt() {
  const { connect, isPending } = useConnect()
  const perks = [
    { icon: <Coins size={18} />, title: 'Earn on idle USDC', body: 'Lend into the market you choose and watch your balance grow every block.' },
    { icon: <HandCoins size={18} />, title: 'Borrow against your crypto', body: 'Unlock USDC without selling, and keep the upside of what you hold.' },
    { icon: <Lightning size={18} />, title: 'See your risk at a glance', body: 'One health score tells you how safe each position is, with clear warnings.' },
  ]
  return (
    <div className={s.page}>
      <div className="section-container">
        <Reveal>
          <div className="lc-dark-card" style={{ padding: 'clamp(28px, 5vw, 56px)', borderRadius: 'var(--r-xl)', display: 'grid', gap: 32 }}>
            <div style={{ maxWidth: 560 }}>
              <div className="lc-eyebrow" style={{ color: 'var(--band-muted)', marginBottom: 12 }}>Dashboard</div>
              <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1, marginBottom: 14 }}>
                Connect your wallet to open your dashboard
              </h1>
              <p style={{ fontSize: 15, color: 'var(--band-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Your positions, earnings and health score live here. Connecting only shares your public address. Nothing moves until you confirm a transaction.
              </p>
              <button className="btn btn-lg" disabled={isPending} onClick={() => connect({ connector: injected() })}
                style={{ background: '#fff', color: 'var(--primary)', borderColor: '#fff' }}>
                <Wallet size={16} weight="bold" /> {isPending ? 'Check your wallet' : 'Connect Wallet'}
              </button>
            </div>
            <Stagger className={s.grid3}>
              {perks.map((p) => (
                <StaggerItem key={p.title}>
                  <div className="lc-dark-inset" style={{ padding: 20, height: '100%' }}>
                    <span style={{ display: 'inline-flex', width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', marginBottom: 12 }}>{p.icon}</span>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.title}</div>
                    <p style={{ fontSize: 13, color: 'var(--band-muted)', margin: 0, lineHeight: 1.55 }}>{p.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
