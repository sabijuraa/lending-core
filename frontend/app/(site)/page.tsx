'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import {
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
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { HeroVisual } from '@/components/home/HeroVisual'
import { WireGlobe } from '@/components/home/WireGlobe'
import { CountUp } from '@/components/home/CountUp'
import { ActionCards } from '@/components/home/ActionCards'
import { IsolationStory } from '@/components/home/IsolationStory'
import { PositionShowcase } from '@/components/home/PositionShowcase'
import { Personas } from '@/components/home/Personas'
import { Faq } from '@/components/home/Faq'
import { CtaBand } from '@/components/layout/CtaBand'
import type { MarketView, ProtocolStats } from '@/providers/types'
import { formatUSD, formatPercent, getOracleStatus } from '@/lib/formatting'
import s from '@/components/home/home.module.css'

const REPO = 'https://github.com/sabijuraa/lending-core'
const ease = [0.16, 1, 0.3, 1] as const
const usdCompact = (n: number) => formatUSD(n, true)
const whole = (n: number) => String(Math.round(n))

const heroList: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }
const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

export default function HomePage() {
  const data = useData()
  const [stats, setStats] = useState<ProtocolStats | null>(null)
  const [markets, setMarkets] = useState<MarketView[]>([])

  useEffect(() => {
    data.getStats().then(setStats)
    data.getMarkets().then(setMarkets)
  }, [data])

  return (
    <>
      <Hero stats={stats} markets={markets} />
      <ActionCards supplySlug={markets[0]?.slug ?? 'weth'} />
      <FeaturedMarkets markets={markets} />
      <HowLendingWorks />
      <IsolationStory />
      <PositionShowcase />
      <Personas />
      <SecurityStrip />
      <Faq />
      <CtaBand />
    </>
  )
}

/* ─── Hero ───────────────────────────────────────────────── */

function Hero({ stats, markets }: { stats: ProtocolStats | null; markets: MarketView[] }) {
  const pairs = markets.map(m => ({ collateral: m.collateralSymbol, loan: m.loanSymbol }))
  const available = stats ? stats.totalSupplied - stats.totalBorrowed : 0

  return (
    <section className={s.hero}>
      <div className="section-container">
        <div className={s.heroGrid}>
          <motion.div variants={heroList} initial="hidden" animate="show">
            <motion.p variants={heroItem} className={s.eyebrow}>Isolated lending on Base</motion.p>
            <motion.h1 variants={heroItem} className={s.headline}>Every market has its own risk.</motion.h1>
            <motion.p variants={heroItem} className={s.sub}>
              Lend and borrow in markets that stand on their own. Each one pairs a single loan asset with a single collateral, its own price feed and its own rate, so trouble in one never spills into yours.
            </motion.p>
            <motion.div variants={heroItem} className={s.ctaRow}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Launch app
              </Link>
              <Link href="/markets" className="btn btn-ghost btn-lg">
                Explore markets
              </Link>
            </motion.div>
            <motion.div variants={heroItem}>
              <Link href="/how-it-works" className={s.heroLink}>
                Understand market isolation
              </Link>
            </motion.div>
          </motion.div>

          <div className={s.visual} aria-hidden="true">
            <HeroVisual pairs={pairs} />
            <motion.p className={s.caption} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
              Isolated markets.
              <br />
              Independent risk.
            </motion.p>
          </div>
        </div>

        <motion.div
          className={s.stats}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease }}
        >
          <Stat icon={<CurrencyCircleDollar size={16} />} label="Total Supplied" value={stats ? <CountUp value={stats.totalSupplied} format={usdCompact} /> : '...'} note="Across all markets" />
          <Stat icon={<HandCoins size={16} />} label="Total Borrowed" value={stats ? <CountUp value={stats.totalBorrowed} format={usdCompact} /> : '...'} note="Outstanding loans" />
          <Stat icon={<SquaresFour size={16} />} label="Active Markets" value={stats ? <CountUp value={stats.marketsLive} format={whole} /> : '...'} note="Each one isolated" />
          <Stat icon={<Pulse size={16} />} label="Available Liquidity" value={stats ? <CountUp value={available} format={usdCompact} /> : '...'} note="Ready to borrow or withdraw" />
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: React.ReactNode; note: string }) {
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
    <section style={{ padding: '24px 0 96px' }}>
      <div className="section-container">
        <Reveal className={s.sectionHead}>
          <h2 className={s.sectionTitle}>Featured markets</h2>
          <Link href="/markets" className={s.textLink}>
            View all markets
          </Link>
        </Reveal>

        <Reveal delay={0.08} className={s.tableCard}>
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
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.15 + i * 0.07, ease }}
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
        </Reveal>
      </div>
    </section>
  )
}

/* ─── How lending works band ─────────────────────────────── */

const steps = ['Deposit collateral', 'Borrow', 'Monitor health factor', 'Repay or liquidate']

function HowLendingWorks() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const globeY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const globeRotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setActive(a => (a + 1) % steps.length), 2200)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <section ref={ref} className={s.band}>
      <motion.div className={s.bandGlobe} style={reduce ? undefined : { y: globeY, rotate: globeRotate }}>
        <WireGlobe className={s.fill} />
      </motion.div>
      <div className="section-container">
        <Reveal>
          <p className={s.bandEyebrow}>How lending works</p>
          <h2 className={s.bandTitle}>From deposit to repayment in four steps.</h2>
          <p className={s.bandSub}>
            Put collateral down, borrow what you need, keep an eye on one number and close out when you are ready. That is the whole loop.
          </p>
          <Link href="/how-it-works" className={s.bandLink}>
            <span>Learn more</span>
          </Link>
        </Reveal>

        <Stagger className={s.steps}>
          {steps.map((label, i) => (
            <StaggerItem key={label} className={s.step}>
              <motion.span
                className={`${s.stepNum} ${i === active ? s.stepNumActive : ''}`}
                animate={i === active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {i + 1}
              </motion.span>
              <span style={{ opacity: i === active ? 1 : 0.75, transition: 'opacity 0.3s ease' }}>{label}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ─── Security strip ─────────────────────────────────────── */

function SecurityStrip() {
  return (
    <section className={s.security}>
      <div className="section-container">
        <Reveal>
          <h2 className={s.sectionTitle}>Security, transparency and open source</h2>
        </Reveal>
        <Reveal delay={0.08} className={s.securityCard}>
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
              Explore markets
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
