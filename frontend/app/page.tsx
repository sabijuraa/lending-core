'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CurrencyCircleDollar,
  HandCoins,
  SquaresFour,
  Pulse,
  ShieldCheck,
  FileCode,
  GithubLogo,
} from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { HeroVisual } from '@/components/home/HeroVisual'
import { WireGlobe } from '@/components/home/WireGlobe'
import type { MarketView, ProtocolStats } from '@/providers/types'
import { formatUSD, formatPercent, getOracleStatus } from '@/lib/formatting'
import s from '@/components/home/home.module.css'

const REPO = 'https://github.com/sabijuraa/lending-core'
const ease = [0.16, 1, 0.3, 1] as const

export default function HomePage() {
  const data = useData()
  const [stats, setStats] = useState<ProtocolStats | null>(null)
  const [markets, setMarkets] = useState<MarketView[]>([])

  useEffect(() => {
    data.getStats().then(setStats)
    data.getMarkets().then(setMarkets)
  }, [data])

  const note = data.source === 'mock' ? 'Illustrative' : 'Live on Base Sepolia'

  return (
    <>
      <Hero stats={stats} markets={markets} note={note} />
      <FeaturedMarkets markets={markets} />
      <HowLendingWorks />
      <SecurityStrip />
    </>
  )
}

/* ─── Hero ───────────────────────────────────────────────── */

function Hero({ stats, markets, note }: { stats: ProtocolStats | null; markets: MarketView[]; note: string }) {
  const pairs = markets.map(m => ({ collateral: m.collateralSymbol, loan: m.loanSymbol }))

  return (
    <section className={s.hero}>
      <div className="section-container">
        <div className={s.heroGrid}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className={s.eyebrow}>Isolated lending on Base</p>
            <h1 className={s.headline}>Every market has its own risk.</h1>
            <p className={s.sub}>
              Each market pairs one loan asset with one collateral asset, its own oracle, and its own interest rate curve.
            </p>
            <div className={s.ctaRow}>
              <Link href="/markets" className="btn btn-primary btn-lg">
                Explore markets
                <ArrowRight size={15} weight="bold" />
              </Link>
              <Link href="/how-it-works" className="btn btn-ghost btn-lg">
                Understand market isolation
              </Link>
            </div>
          </motion.div>

          <div className={s.visual} aria-hidden="true">
            <HeroVisual pairs={pairs} />
            <p className={s.caption}>
              Isolated markets.
              <br />
              Independent risk.
            </p>
          </div>
        </div>

        <motion.div
          className={s.stats}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Stat icon={<CurrencyCircleDollar size={16} />} label="Total Supplied" value={stats ? formatUSD(stats.totalSupplied, true) : '...'} note={note} />
          <Stat icon={<HandCoins size={16} />} label="Total Borrowed" value={stats ? formatUSD(stats.totalBorrowed, true) : '...'} note={note} />
          <Stat icon={<SquaresFour size={16} />} label="Active Markets" value={stats ? String(stats.marketsLive) : '...'} note={note} />
          <Stat icon={<Pulse size={16} />} label="Protocol Status" value="Testnet" note="Base Sepolia" />
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <div className={s.stat}>
      <div className={s.statIcon}>{icon}</div>
      <div>
        <div className={s.statLabel}>{label}</div>
        <div className={s.statValue}>{value}</div>
        <div className={s.statNote}>{note}</div>
      </div>
    </div>
  )
}

/* ─── Featured markets ───────────────────────────────────── */

const oracleLabel = { fresh: 'Fresh', warning: 'Aging', stale: 'Stale' } as const
const oracleColor = { fresh: 'var(--positive)', warning: 'var(--warning)', stale: 'var(--danger)' } as const

function FeaturedMarkets({ markets }: { markets: MarketView[] }) {
  const top = markets.slice(0, 4)

  return (
    <section style={{ padding: '48px 0 64px' }}>
      <div className="section-container">
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>Featured markets</h2>
          <Link href="/markets" className={s.textLink}>
            View all markets <ArrowRight size={13} />
          </Link>
        </div>

        <div className={s.tableCard}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Market</th>
                <th>Supply APY</th>
                <th>Borrow APY</th>
                <th>Utilization</th>
                <th>Liquidity</th>
                <th>Oracle</th>
              </tr>
            </thead>
            <tbody>
              {top.map((m, i) => {
                const status = getOracleStatus(m.oracleLastUpdate, m.maxStaleness)
                return (
                  <motion.tr
                    key={m.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <td>
                      <Link href={`/markets/${m.slug}`} className={s.marketCell}>
                        <TokenLogo symbol={m.collateralSymbol} size={34} />
                        <div>
                          <div className={s.pairName}>{m.collateralSymbol} / {m.loanSymbol}</div>
                          <span className={s.activePill}>Active</span>
                        </div>
                      </Link>
                    </td>
                    <td>{formatPercent(m.supplyAPY)}</td>
                    <td>{formatPercent(m.borrowAPY)}</td>
                    <td>{formatPercent(m.utilization * 100, 0)}</td>
                    <td>{formatUSD(Math.max(m.totalSupplied - m.totalBorrowed, 0), true)}</td>
                    <td>
                      <span className={s.oracle}>
                        <span className={s.dot} style={{ background: oracleColor[status] }} />
                        {oracleLabel[status]}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ─── How lending works band ─────────────────────────────── */

const steps = ['Deposit collateral', 'Borrow', 'Monitor health factor', 'Repay or liquidate']

function HowLendingWorks() {
  return (
    <section className={s.band}>
      <WireGlobe className={s.bandGlobe} />
      <div className="section-container">
        <h2 className={s.bandTitle}>How lending works</h2>
        <p className={s.bandSub}>
          From collateral to liquidation, understand the mechanics and the risk behind every position.
        </p>
        <Link href="/how-it-works" className={s.bandLink}>
          <span>Learn more</span> <ArrowRight size={13} />
        </Link>

        <div className={s.steps}>
          {steps.map((label, i) => (
            <div key={label} className={s.step}>
              <span className={`${s.stepNum} ${i === 1 ? s.stepNumActive : ''}`}>{i + 1}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Security strip ─────────────────────────────────────── */

function SecurityStrip() {
  return (
    <section className={s.security}>
      <div className="section-container">
        <h2 className={s.sectionTitle}>Security, transparency and open source</h2>
        <div className={s.securityCard}>
          <Link href="/security" className={s.secItem}>
            <ShieldCheck size={24} weight="duotone" className={s.secIcon} />
            <div>
              <div className={s.secTitle}>Audit status</div>
              <div className={s.secNote}>Not yet audited</div>
            </div>
          </Link>
          <a href={`${REPO}/tree/main/src`} target="_blank" rel="noopener noreferrer" className={s.secItem}>
            <FileCode size={24} weight="duotone" className={s.secIcon} />
            <div>
              <div className={s.secTitle}>Smart contracts</div>
              <div className={s.secNote}>Source on GitHub</div>
            </div>
          </a>
          <a href={REPO} target="_blank" rel="noopener noreferrer" className={s.secItem}>
            <GithubLogo size={24} weight="duotone" className={s.secIcon} />
            <div>
              <div className={s.secTitle}>Source code</div>
              <div className={s.secNote}>GitHub</div>
            </div>
          </a>
          <div className={s.secCta}>
            <Link href="/markets" className="btn btn-primary">
              Explore markets <ArrowRight size={13} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
