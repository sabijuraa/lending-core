'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Info, HandCoins, Vault, Drop, ChartLineUp, ShieldCheck } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { useData } from '@/providers/provider'
import type { MarketView } from '@/providers/types'
import { useAsync } from '@/lib/use-async'
import { LcActionPanel } from '@/components/market/LcActionPanel'
import { LcRateCurve } from '@/components/market/LcRateCurve'
import { LcCardTitle, LcPill, LcFootnote, lcPanel, marketStatus } from '@/components/market/LcUi'
import { CountUp, LcStoryBand } from '@/components/market/LcStory'
import { Reveal } from '@/components/ui/Reveal'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States'
import { formatUSD, formatPercent, formatTimeAgo, formatNumber } from '@/lib/formatting'

export default function MarketDetailPage() {
  const { asset } = useParams<{ asset: string }>()
  const data = useData()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const activity = useAsync(() => data.getActivity(asset), [asset, data])
  const m = market.data

  return (
    <div style={{ padding: '8px 0 64px', overflowX: 'clip' }}>
      <div className="section-container">
        <Link href="/markets" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 20 }}>
          All markets
        </Link>

        {market.loading && <LoadingBlock rows={6} />}
        {market.error && <ErrorBlock message={market.error} onRetry={market.reload} />}
        {!market.loading && !market.error && !m && (
          <EmptyBlock title="Market not found" body="No market uses that collateral yet." href="/markets" cta="See all markets" />
        )}

        {m && (
          <MarketBody
            m={m}
            onChanged={() => { market.reload(); activity.reload() }}
            activity={
              <ActivityCard loading={activity.loading} error={activity.error} reload={activity.reload} items={activity.data} />
            }
          />
        )}
      </div>
    </div>
  )
}

function MarketBody({ m, onChanged, activity }: { m: MarketView; onChanged: () => void; activity: React.ReactNode }) {
  const st = marketStatus(m.oracleLastUpdate, m.maxStaleness)
  const liquidity = m.totalSupplied - m.totalBorrowed

  const metrics = [
    { k: 'Supply APY', v: m.supplyAPY, f: (n: number) => formatPercent(n), color: 'var(--positive)' },
    { k: 'Borrow APY', v: m.borrowAPY, f: (n: number) => formatPercent(n), color: 'var(--text-1)' },
    { k: 'Utilization', v: m.utilization * 100, f: (n: number) => formatPercent(n, 0), color: 'var(--positive)' },
    { k: 'Available Liquidity', v: liquidity, f: (n: number) => formatUSD(n, true), color: 'var(--text-1)' },
  ]

  const params = [
    { k: 'Loan asset', v: m.loanSymbol },
    { k: 'Collateral asset', v: m.collateralSymbol },
    { k: 'Liquidation LTV', v: formatPercent(m.lltv * 100, 0) },
    { k: 'Liquidation bonus', v: formatPercent(m.liquidationBonus * 100, 0) },
    { k: 'Oracle price', v: formatUSD(m.oraclePrice) },
    { k: 'Oracle', v: `${st.oracle} (${formatTimeAgo(m.oracleLastUpdate)})` },
  ]

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}
      >
        <TokenLogo symbol={m.collateralSymbol} size={40} />
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
          {m.collateralSymbol} / {m.loanSymbol}
        </h1>
        <LcPill tone={st.tone}>{st.label}</LcPill>
      </motion.header>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 28 }}>
        Borrow {m.loanSymbol} against {m.collateralName}. This market has its own oracle and its own risk boundary.
      </p>

      <div className="lc-detail-grid" style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 20, marginBottom: 20 }}>
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          style={{ ...lcPanel, padding: 24 }}>
          <LcCardTitle>Key Metrics</LcCardTitle>
          <div>
            {metrics.map((r, i) => (
              <div key={r.k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0',
                borderBottom: i < metrics.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{r.k}</span>
                <CountUp value={r.v} format={r.f} style={{ fontSize: 18, fontWeight: 600, color: r.color }} />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
          style={{ ...lcPanel, padding: 24 }}>
          <LcCardTitle>Rate Curve</LcCardTitle>
          <LcRateCurve utilization={m.utilization} />
        </motion.section>
      </div>

      <div className="lc-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
          style={{ ...lcPanel, padding: 24 }}>
          <LcCardTitle>Market Parameters</LcCardTitle>
          {params.map((r, i) => (
            <div key={r.k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0',
              borderBottom: i < params.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: 13,
            }}>
              <span style={{ color: 'var(--text-3)' }}>{r.k}</span>
              <span style={{ color: 'var(--text-1)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{r.v}</span>
            </div>
          ))}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          style={{ ...lcPanel, padding: 24 }}>
          <LcCardTitle>Manage your position</LcCardTitle>
          <LcActionPanel m={m} onChanged={onChanged} />
        </motion.section>
      </div>

      <Reveal style={{ marginBottom: 20 }}>
        <ForYou m={m} />
      </Reveal>

      <div style={{ marginBottom: 20 }}>
        <LcFootnote icon={<Info size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}>
          Rates move with utilization every block. Market parameters are fixed when the market is created and can never change.
        </LcFootnote>
      </div>

      {activity}

      <style jsx global>{`
        @media (max-width: 960px) { .lc-detail-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) {
          .lc-act-row { grid-template-columns: auto 1fr auto !important; gap: 10px !important; }
          .lc-act-account { display: none; }
        }
      `}</style>
    </>
  )
}

function ActivityCard({ loading, error, reload, items }: {
  loading: boolean
  error: string | null
  reload: () => void
  items: { id: string; kind: string; amount: number; account: string; timestamp: number }[] | null
}) {
  return (
    <section style={{ ...lcPanel, padding: 24 }}>
      <LcCardTitle>Recent Activity</LcCardTitle>
      {loading && <LoadingBlock rows={3} />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {items && items.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Supplies, borrows and liquidations in this market will show here.</p>
      )}
      {items && items.length > 0 && items.slice(0, 6).map((a, i, arr) => (
        <div key={a.id} className="lc-act-row" style={{
          display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 16, alignItems: 'center', padding: '12px 0',
          borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: 13,
        }}>
          <span style={{ textTransform: 'capitalize' }}>
            <LcPill tone={a.kind === 'liquidate' ? 'danger' : a.kind === 'borrow' ? 'warning' : 'positive'}>{a.kind}</LcPill>
          </span>
          <span className="lc-act-account" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.account}</span>
          <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatUSD(a.amount)}</span>
          <span style={{ color: 'var(--text-4)', fontSize: 12, minWidth: 56, textAlign: 'right' }}>{formatTimeAgo(a.timestamp)}</span>
        </div>
      ))}
    </section>
  )
}

/** Plain language reading of the market parameters, plus a three line risk summary. */
function ForYou({ m }: { m: MarketView }) {
  const st = marketStatus(m.oracleLastUpdate, m.maxStaleness)
  const { kink } = RATE_MODEL_PARAMS
  const perThousand = (1000 * m.supplyAPY) / 100
  const borrowPerHundred = 100 * m.lltv
  const halfwayDrop = 50

  const util = m.utilization >= kink
    ? { tone: 'warning' as const, label: 'Busy', body: `Utilization is past the ${formatPercent(kink * 100, 0)} kink, so rates are climbing and withdrawals may need to wait for repayments.` }
    : m.utilization >= kink * 0.75
      ? { tone: 'positive' as const, label: 'Healthy', body: `Most of the pool is lent out and earning, with room left before the ${formatPercent(kink * 100, 0)} kink.` }
      : { tone: 'positive' as const, label: 'Plenty of room', body: 'Lots of cash is sitting ready, so withdrawals and new loans go through easily.' }
  const cushion = m.lltv >= 0.86
    ? { tone: 'warning' as const, label: 'Thin cushion', body: `Loans can stretch to ${formatPercent(m.lltv * 100, 0)} of collateral value, which leaves lenders less buffer in a sharp crash.` }
    : m.lltv >= 0.75
      ? { tone: 'positive' as const, label: 'Standard', body: `Loans close at ${formatPercent(m.lltv * 100, 0)} of collateral value, a common middle ground between borrower room and lender safety.` }
      : { tone: 'positive' as const, label: 'Conservative', body: `Loans close early at ${formatPercent(m.lltv * 100, 0)} of collateral value, which keeps a wide buffer for lenders.` }
  const oracle = st.oracle === 'Fresh'
    ? { tone: 'positive' as const, label: 'Fresh', body: 'The price feed is current, so loans and liquidations use an up to date price.' }
    : st.oracle === 'Aging'
      ? { tone: 'warning' as const, label: 'Aging', body: 'The price feed is getting old. Once it goes stale, new loans and liquidations wait for a fresh price.' }
      : { tone: 'danger' as const, label: 'Stale', body: 'The price feed is stale, so new loans and liquidations are waiting for a fresh price.' }

  return (
    <LcStoryBand
      eyebrow="What this means for you"
      title={<>{m.collateralSymbol} / {m.loanSymbol} in plain words</>}
      aside={
        <div className="lc-dark-inset" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 14 }}>
            <ShieldCheck size={16} /> Risk summary
          </div>
          {[
            { icon: <Drop size={15} />, k: 'Price feed', v: oracle },
            { icon: <ChartLineUp size={15} />, k: 'Utilization', v: util },
            { icon: <Vault size={15} />, k: 'Safety cushion', v: cushion },
          ].map((row, i) => (
            <motion.div
              key={row.k}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '12px 0', borderTop: i ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#FFFFFF' }}>{row.icon}{row.k}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
                  background: row.v.tone === 'positive' ? 'rgba(124,200,150,0.16)' : row.v.tone === 'warning' ? 'rgba(232,170,80,0.18)' : 'rgba(230,110,100,0.2)',
                  color: row.v.tone === 'positive' ? '#9FD3B4' : row.v.tone === 'warning' ? '#F0C27A' : '#F2A49C',
                }}>
                  {row.v.label}
                </span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--band-muted)' }}>{row.v.body}</div>
            </motion.div>
          ))}
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
        <div className="lc-dark-inset" style={{ padding: '16px 18px', display: 'flex', gap: 14 }}>
          <HandCoins size={20} style={{ color: '#9FD3B4', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--band-muted)' }}>
            <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>If you lend.</strong>{' '}
            At today&apos;s rate, every 1,000 {m.loanSymbol} you supply earns about {formatNumber(perThousand)} {m.loanSymbol} over a year. The rate moves with demand, and you can withdraw whatever is not lent out at that moment.
          </div>
        </div>
        <div className="lc-dark-inset" style={{ padding: '16px 18px', display: 'flex', gap: 14 }}>
          <Vault size={20} style={{ color: '#9FD3B4', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--band-muted)' }}>
            <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>If you borrow.</strong>{' '}
            Every $100 of {m.collateralSymbol} you post supports up to ${formatNumber(borrowPerHundred, 0)} of debt before the loan can be closed. Borrow half of that and {m.collateralSymbol} can fall about {halfwayDrop}% before you are at risk.
          </div>
        </div>
        <div className="lc-dark-inset" style={{ padding: '16px 18px', display: 'flex', gap: 14 }}>
          <ShieldCheck size={20} style={{ color: '#9FD3B4', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--band-muted)' }}>
            <strong style={{ color: '#FFFFFF', fontWeight: 600 }}>If it goes wrong.</strong>{' '}
            A liquidator repays the loan and takes the collateral plus a {formatPercent(m.liquidationBonus * 100, 0)} bonus. Whatever happens here stays here, other markets are never touched.
          </div>
        </div>
      </div>
    </LcStoryBand>
  )
}
