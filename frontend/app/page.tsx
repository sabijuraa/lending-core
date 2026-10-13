'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ArrowRight, ArrowUpRight, Shield, ChartLineUp, Vault, Lightning, CheckCircle, Info } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { KinkedRateCurve } from '@/components/charts/KinkedRateCurve'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import type { MarketView, ProtocolStats, PositionView } from '@/providers/types'
import { formatUSD, formatPercent, getHealthStatus } from '@/lib/formatting'

export default function HomePage() {
  const data = useData()
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState<ProtocolStats | null>(null)
  const [markets, setMarkets] = useState<MarketView[]>([])
  const [positions, setPositions] = useState<PositionView[]>([])

  useEffect(() => {
    data.getStats().then(setStats)
    data.getMarkets().then(setMarkets)
  }, [data])

  useEffect(() => {
    if (isConnected && address) {
      data.getPositions(address).then(setPositions)
    } else {
      setPositions([])
    }
  }, [data, isConnected, address])

  return (
    <>
      <HeroSection stats={stats} />
      {isConnected && positions.length > 0 && (
        <PositionSummary positions={positions} />
      )}
      <MarketsPreview markets={markets} />
      <IsolationSection />
      <RateModelSection />
      <SecuritySection />
      <CTASection connected={isConnected ?? false} />
    </>
  )
}

/* ─── Protocol Metrics Hero ──────────────────────────────── */

function HeroSection({ stats }: { stats: ProtocolStats | null }) {
  return (
    <section style={{ padding: '64px 0 0' }}>
      <div className="section-container">
        {/* Headline */}
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 16,
            }}
          >
            Isolated lending markets on Base
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: 'var(--text-1)',
              marginBottom: 16,
            }}
          >
            Lend and borrow with transparent rates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: 'var(--text-3)',
              maxWidth: 480,
              marginBottom: 28,
            }}
          >
            Each market pairs one loan asset with one collateral, one oracle, and one rate curve. Your position is never touched by someone else's bad oracle.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
          >
            <Link href="/markets" className="btn btn-primary btn-lg">
              View markets
              <ArrowRight size={15} weight="bold" />
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost btn-lg">How it works</Link>
          </motion.div>
        </div>

        {/* Metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            marginBottom: 0,
          }}
        >
          <MetricCard label="Total Supplied" value={stats ? formatUSD(stats.totalSupplied, true) : '...'} />
          <MetricCard label="Total Borrowed" value={stats ? formatUSD(stats.totalBorrowed, true) : '...'} />
          <MetricCard label="TVL" value={stats ? formatUSD(stats.totalSupplied - stats.totalBorrowed, true) : '...'} />
          <MetricCard label="Active Markets" value={stats ? String(stats.marketsLive) : '...'} />
        </motion.div>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      padding: '24px 28px',
    }}>
      <div className="stat-label">{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 22,
        fontWeight: 500,
        color: 'var(--text-1)',
        marginTop: 6,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  )
}

/* ─── Connected User Position Summary ────────────────────── */

function PositionSummary({ positions }: { positions: PositionView[] }) {
  const minHealth = positions.reduce((min, p) => {
    const h = p.healthFactor
    return (h !== Infinity && h < min) ? h : min
  }, Infinity)
  const status = minHealth === Infinity ? 'safe' : getHealthStatus(minHealth)
  const statusColor = status === 'safe' ? 'var(--positive)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)'

  return (
    <section style={{ paddingTop: 32 }}>
      <div className="section-container">
        <div className="card" style={{ padding: '28px 32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}>
            <div>
              <div className="stat-label">Your positions</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 20,
                  fontWeight: 500,
                  color: 'var(--text-1)',
                }}>
                  {positions.length} active market{positions.length !== 1 ? 's' : ''}
                </span>
                <span className="pill" style={{
                  background: status === 'safe' ? 'var(--positive-dim)' : status === 'warning' ? 'var(--warning-dim)' : 'var(--danger-dim)',
                  borderColor: statusColor,
                  color: statusColor,
                }}>
                  {minHealth === Infinity ? 'No debt' : `HF ${minHealth.toFixed(2)}`}
                </span>
              </div>
            </div>
            <Link href="/portfolio" className="btn btn-ghost" style={{ fontSize: 13 }}>
              View portfolio
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Markets Preview ────────────────────────────────────── */

function MarketsPreview({ markets }: { markets: MarketView[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const top = markets.slice(0, 4)

  return (
    <section ref={ref} style={{ padding: '56px 0 64px' }}>
      <div className="section-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Markets</h2>
          <Link href="/markets" style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--accent)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            All markets <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 24, paddingTop: 16 }}>Market</th>
                <th style={{ paddingTop: 16 }}>Supply APY</th>
                <th style={{ paddingTop: 16 }}>Borrow APY</th>
                <th style={{ paddingTop: 16 }}>Utilization</th>
                <th style={{ paddingTop: 16 }}>Total Supplied</th>
                <th style={{ textAlign: 'right', paddingRight: 24, paddingTop: 16 }}>LLTV</th>
              </tr>
            </thead>
            <tbody>
              {top.map((m, i) => (
                <motion.tr
                  key={m.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <td style={{ paddingLeft: 24 }}>
                    <Link href={`/markets/${m.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--accent-dim)',
                          border: '1px solid var(--accent-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--accent)',
                        }}>
                          {m.collateralSymbol.slice(0, 2)}
                        </div>
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
                  <td style={{ minWidth: 120 }}>
                    <UtilizationBar utilization={m.utilization} height={5} showLabel={true} animated={inView} />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                      {formatUSD(m.totalSupplied, true)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 24 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                      {formatPercent(m.lltv * 100, 0)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ─── Isolation Architecture ─────────────────────────────── */

function IsolationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const features = [
    {
      icon: <Vault size={20} weight="duotone" />,
      title: 'Isolated collateral',
      desc: 'Each market has its own collateral pool. A liquidation in one market never spills into another.',
    },
    {
      icon: <ChartLineUp size={20} weight="duotone" />,
      title: 'Isolated oracle',
      desc: 'One price feed per market. A stale or manipulated oracle affects only the market it belongs to.',
    },
    {
      icon: <Lightning size={20} weight="duotone" />,
      title: 'Isolated liquidation',
      desc: 'Liquidators clear debt in a single market. No cascading liquidation across shared pools.',
    },
  ]

  return (
    <section ref={ref} style={{
      padding: '80px 0',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: 520, marginBottom: 48 }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 14,
          }}>
            Core architecture
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 36px)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--text-1)',
            marginBottom: 14,
          }}>
            One oracle breaks. Nothing else does.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65 }}>
            Every other lending protocol pools assets. One bad price feed ripples through everything connected to it. lending-core contains damage at the source.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
              className="card"
              style={{ padding: '28px 24px' }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Rate Model Explainer ───────────────────────────────── */

function RateModelSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ padding: '80px 0' }}>
      <div className="section-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 14,
            }}>
              Kinked rate model
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: 'var(--text-1)',
              marginBottom: 14,
            }}>
              Rates follow utilization in the open
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 24 }}>
              Below the kink, rates climb gently. Cross the kink, and the rate spikes to incentivize repayment and attract new lenders. Every parameter is on-chain and readable by anyone.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Base rate', '2%', 'Minimum borrowing cost at zero utilization'],
                ['Kink rate', '4%', 'Rate at the target utilization threshold'],
                ['Max rate', '100%', 'Rate ceiling when the pool is fully utilized'],
                ['Kink point', '80%', 'Target utilization where rates begin to spike'],
              ].map(([label, val, desc]) => (
                <div key={label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 8 }}>{desc}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="card"
            style={{ padding: 28 }}
          >
            <div className="stat-label" style={{ marginBottom: 16 }}>Borrow APY vs utilization</div>
            <KinkedRateCurve />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── Security Strip ─────────────────────────────────────── */

function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const items = [
    { icon: <Shield size={18} weight="duotone" />, text: 'Immutable core contracts, no admin keys' },
    { icon: <CheckCircle size={18} weight="duotone" />, text: 'Share-based accounting for interest accrual' },
    { icon: <Info size={18} weight="duotone" />, text: 'Open-source under MIT License' },
  ]

  return (
    <section ref={ref} style={{
      padding: '48px 0',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          {items.map((item) => (
            <div key={item.text} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-3)',
              fontSize: 14,
            }}>
              <span style={{ color: 'var(--accent)', display: 'flex' }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Final CTA ──────────────────────────────────────────── */

function CTASection({ connected }: { connected: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ padding: '80px 0 96px' }}>
      <div className="section-container" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
        >
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--text-1)',
            marginBottom: 14,
          }}>
            Start lending with complete isolation
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 440, margin: '0 auto 28px' }}>
            Connect your wallet, pick a market, and supply or borrow at transparent, on-chain rates.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/markets" className="btn btn-primary btn-lg">
              Explore markets
              <ArrowRight size={15} weight="bold" />
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">
              Read the docs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
