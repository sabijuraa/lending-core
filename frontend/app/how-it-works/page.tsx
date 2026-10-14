'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowsLeftRight,
  BookOpen,
  ChartLineUp,
  Code,
  Heartbeat,
  Lightning,
  MagnifyingGlass,
  Shield,
  Vault,
} from '@phosphor-icons/react'
import { DARK, IconTile, LearnStyles, StepsBand, TopicCard } from '@/components/learn/ui'

const steps = [
  {
    icon: <Vault size={20} />,
    title: 'Deposit collateral',
    body: 'Choose an isolated market and deposit your collateral. Each market is a self contained unit with one collateral, one loan token, one oracle and one interest rate curve.',
  },
  {
    icon: <ArrowsLeftRight size={20} />,
    title: 'Borrow',
    body: 'Draw the loan asset against your collateral at transparent on chain rates. Interest accrues every time the market is touched, before any balance changes.',
  },
  {
    icon: <Heartbeat size={20} />,
    title: 'Monitor health factor',
    body: 'Track your health factor on the portfolio page. Your risk is contained to the markets you choose. One market crashing never touches another.',
  },
  {
    icon: <Lightning size={20} />,
    title: 'Repay or liquidate',
    body: 'Repay your debt to free your collateral, or liquidate unhealthy positions to earn the liquidation bonus. Every liquidation is visible on chain.',
  },
]

const concepts = [
  {
    icon: <Shield size={20} />,
    h: 'Isolated markets',
    p: 'A market is a fixed pair of loan asset and collateral with one oracle, one rate model, one LLTV and one liquidation bonus. Its id is the hash of those parameters, so nobody can change them after creation. A bad oracle or a crashing collateral can only hurt the market that chose it.',
  },
  {
    icon: <ChartLineUp size={20} />,
    h: 'The interest rate model',
    p: 'The borrow rate follows a kinked curve. It climbs gently until 80% of supplied assets are lent out, then climbs fast. Lenders earn the borrow rate times utilization. Interest accrues every time the market is touched, before any balance changes.',
  },
  {
    icon: <Heartbeat size={20} />,
    h: 'The health factor',
    p: 'Health factor is collateral value times the LLTV, divided by debt. Above 1 the position is safe. At 1 or below it can be liquidated. The gauge on each borrow screen shows how a new borrow would move it before you sign.',
  },
  {
    icon: <Lightning size={20} />,
    h: 'Liquidation',
    p: 'A liquidator repays the full debt of an unhealthy position and receives collateral worth that debt plus the market bonus. If the collateral is not enough to cover it, the shortfall is written off against that market’s lenders as bad debt and an event records it.',
  },
  {
    icon: <MagnifyingGlass size={20} />,
    h: 'Oracles',
    p: 'Every price read checks that the price is above zero and newer than the market’s staleness limit. If it fails, the market pauses rather than act on bad data. On Base Sepolia the oracles are owner set test feeds.',
  },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <LearnStyles />
      <div className="section-container" style={{ maxWidth: 1160, padding: '40px 24px 96px' }}>
        {/* Breadcrumb */}
        <Link
          href="/docs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', marginBottom: 28, textDecoration: 'none' }}
        >
          <ArrowLeft size={13} /> Learn &amp; Docs
        </Link>

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          style={{ maxWidth: 640, marginBottom: 40 }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--positive)',
              marginBottom: 14,
            }}
          >
            Getting started
          </p>
          <h1 className="page-heading" style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.08, marginBottom: 14 }}>
            How lending works
          </h1>
          <p className="page-subtitle" style={{ fontSize: 16, lineHeight: 1.65 }}>
            From collateral to liquidation. Understand the mechanics and the risk behind every position before you open one.
          </p>
        </motion.header>

        {/* Dark band */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease }}>
          <StepsBand
            title="Four steps, one market at a time"
            subtitle="Every position lives inside a single isolated market. Its collateral, oracle and rate curve never touch any other market."
            linkHref="/markets"
            linkLabel="Explore markets"
          />
        </motion.div>

        {/* Step details */}
        <section style={{ marginTop: 56 }}>
          <SectionHead eyebrow="Step by step" title="What happens at each stage" />
          <div
            className="learn-card-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}
          >
            {steps.map((s, i) => (
              <motion.article
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06, ease }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)',
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <IconTile>{s.icon}</IconTile>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: '1px solid var(--accent-border)',
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>{s.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Concepts */}
        <section style={{ marginTop: 64 }}>
          <SectionHead eyebrow="Core concepts" title="The mechanics behind every position" />
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
            }}
          >
            {concepts.map((c, i) => (
              <div
                key={c.h}
                className="learn-two-col"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '260px minmax(0, 1fr)',
                  gap: 24,
                  padding: '24px 28px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <IconTile>{c.icon}</IconTile>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{c.h}</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{c.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Keep learning */}
        <section style={{ marginTop: 64 }}>
          <SectionHead eyebrow="Keep learning" title="Go deeper" />
          <div className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            <TopicCard icon={<BookOpen size={20} />} title="Isolated Markets" desc="Why isolation reduces contagion risk and how it works." href="/docs?tab=learn&section=isolated-markets" />
            <TopicCard icon={<Shield size={20} />} title="Risk Methodology" desc="Health factor, liquidation price, oracle failure and bad debt." href="/docs?tab=risk" />
            <TopicCard icon={<Code size={20} />} title="Developer Documentation" desc="Contracts, interfaces, events and integration examples." href="/docs?tab=developers" />
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            marginTop: 64,
            borderRadius: 'var(--r-lg)',
            background: DARK,
            color: '#FFFFFF',
            padding: 'clamp(28px, 4vw, 40px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Ready to open a position?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
              Pick a market, check its oracle and LLTV, then supply or borrow with the risk visible before you sign.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/markets" className="btn" style={{ background: '#FFFFFF', color: DARK, borderColor: '#FFFFFF', gap: 6 }}>
              Explore markets <ArrowRight size={13} />
            </Link>
            <Link
              href="/docs?tab=risk"
              className="btn"
              style={{ background: 'transparent', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.45)' }}
            >
              Read the risk methodology
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 6 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>{title}</h2>
    </div>
  )
}
