'use client'
import { useState, useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { motion } from 'framer-motion'
import { Wallet, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'
import { TokenPair } from '@/components/ui/TokenLogo'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { useData } from '@/providers/provider'
import type { PositionView, MarketView } from '@/providers/types'
import { formatUSD, formatPercent, getHealthStatus } from '@/lib/formatting'

export default function PortfolioPage() {
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()
  const data = useData()
  const [positions, setPositions] = useState<PositionView[]>([])
  const [markets, setMarkets] = useState<MarketView[]>([])

  useEffect(() => {
    if (address) {
      data.getPositions(address).then(setPositions)
    }
    data.getMarkets().then(setMarkets)
  }, [data, address])

  const getMarket = (slug: string) => markets.find(m => m.slug === slug)

  if (!isConnected) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Wallet size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Connect your wallet
          </h2>
          <p style={{ color: 'var(--text-3)', maxWidth: 320, fontSize: 14 }}>
            View and manage your positions across all isolated markets.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => connect({ connector: injected() })}>
          <Wallet size={14} /> Connect wallet
        </button>
      </div>
    )
  }

  const supplied = positions.filter(p => p.supplied > 0)
  const borrowed = positions.filter(p => p.borrowed > 0)
  const totalSupplied = supplied.reduce((s, p) => s + p.supplied, 0)
  const totalBorrowed = borrowed.reduce((s, p) => s + p.borrowed, 0)
  const lowestHealth = borrowed.length > 0
    ? Math.min(...borrowed.map(p => p.healthFactor))
    : Infinity
  const healthStatus = getHealthStatus(lowestHealth)

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0 96px' }}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28 }}
        >
          <h1 className="page-heading">Portfolio</h1>
          <p className="page-subtitle">Your positions across all isolated markets.</p>
        </motion.div>

        {/* Summary strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            marginBottom: 32,
          }}
        >
          {[
            { label: 'Net supplied', value: formatUSD(totalSupplied, true) },
            { label: 'Net borrowed', value: formatUSD(totalBorrowed, true) },
            { label: 'Net value', value: formatUSD(totalSupplied - totalBorrowed, true) },
            { label: 'Health', value: lowestHealth === Infinity ? 'Safe' : lowestHealth.toFixed(2), color: healthStatus === 'safe' ? 'var(--positive)' : healthStatus === 'warning' ? 'var(--warning)' : 'var(--danger)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--surface)', padding: '20px 24px' }}>
              <div className="stat-label">{item.label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 20,
                fontWeight: 500,
                color: item.color || 'var(--text-1)',
                marginTop: 4,
                fontVariantNumeric: 'tabular-nums',
              }}>{item.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Positions empty state */}
        {positions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ padding: '48px 24px', textAlign: 'center' }}
          >
            <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 16 }}>
              You have no active positions yet.
            </p>
            <Link href="/markets" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Explore markets <ArrowRight size={14} weight="bold" />
            </Link>
          </motion.div>
        )}

        {/* Supplied positions */}
        {supplied.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: 32 }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>Earning</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supplied.map((pos, i) => {
                const mkt = getMarket(pos.slug)
                return (
                  <motion.div
                    key={pos.slug + '-supply'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="card"
                    style={{ padding: '18px 24px' }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                      alignItems: 'center',
                      gap: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <TokenPair
                          collateral={mkt?.collateralSymbol || pos.slug.split('-')[0] || '??'}
                          loan={mkt?.loanSymbol || pos.slug.split('-')[1] || '??'}
                          size={34}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
                            {mkt ? `${mkt.collateralSymbol}/${mkt.loanSymbol}` : pos.slug}
                          </div>
                          <span className="pill" style={{ fontSize: 10, marginTop: 2 }}>Supplying</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supplied</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-1)' }}>{formatUSD(pos.supplied)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>APY</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--positive)' }}>{mkt ? formatPercent(mkt.supplyAPY, 2) : 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Value</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-1)' }}>{formatUSD(pos.supplied)}</div>
                      </div>
                      <Link
                        href={`/markets/${pos.slug}`}
                        className="btn"
                        style={{ fontSize: 13, gap: 4, whiteSpace: 'nowrap' }}
                      >
                        Manage <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Borrowed positions */}
        {borrowed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>Borrowing</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {borrowed.map((pos, i) => {
                const mkt = getMarket(pos.slug)
                const status = getHealthStatus(pos.healthFactor)
                const hfColor = status === 'safe' ? 'var(--positive)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)'
                return (
                  <motion.div
                    key={pos.slug + '-borrow'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                    className="card"
                    style={{ padding: '18px 24px', borderLeft: `2px solid ${hfColor}` }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                      alignItems: 'center',
                      gap: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <HealthGauge value={pos.healthFactor} size="sm" showLabel={false} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
                            {mkt ? `${mkt.collateralSymbol}/${mkt.loanSymbol}` : pos.slug}
                          </div>
                          <span className="pill" style={{ fontSize: 10, marginTop: 2, color: hfColor }}>HF {pos.healthFactor === Infinity ? '∞' : pos.healthFactor.toFixed(2)}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Borrowed</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-1)' }}>{formatUSD(pos.borrowed)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Collateral</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-1)' }}>{formatUSD(pos.collateral)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Borrow APY</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--warning)' }}>{mkt ? formatPercent(mkt.borrowAPY, 2) : 'N/A'}</div>
                      </div>
                      <Link
                        href={`/markets/${pos.slug}`}
                        className="btn"
                        style={{ fontSize: 13, gap: 4, whiteSpace: 'nowrap' }}
                      >
                        Manage <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
