'use client'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Vault,
  ArrowsLeftRight,
  Heartbeat,
  ArrowRight,
  ChartLineUp,
  Shield,
  Lightning,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { FloatingMarketCard } from '@/components/ui/FloatingMarketCard'

const steps = [
  {
    num: '01',
    icon: <Vault size={24} weight="duotone" />,
    title: 'Deposit collateral',
    body: 'Choose an isolated market and deposit your collateral. Each market is a self-contained unit with one collateral, one loan token, one oracle, and one interest rate curve.',
  },
  {
    num: '02',
    icon: <ArrowsLeftRight size={24} weight="duotone" />,
    title: 'Borrow',
    body: 'Draw the loan asset against your collateral at transparent, on-chain rates. Interest accrues every time the market is touched, before any balance changes.',
  },
  {
    num: '03',
    icon: <Heartbeat size={24} weight="duotone" />,
    title: 'Monitor health factor',
    body: 'Track your health factor in real time on the portfolio page. Your risk is contained to the individual markets you choose. One market crashing never touches another.',
  },
  {
    num: '04',
    icon: <Lightning size={24} weight="duotone" />,
    title: 'Repay or liquidate',
    body: 'Repay your debt to free your collateral, or liquidate unhealthy positions to earn the liquidation bonus. Every liquidation is visible on-chain.',
  },
]

const concepts = [
  {
    icon: <Shield size={20} weight="duotone" />,
    h: 'Isolated markets',
    p: 'A market is a fixed pair of loan asset and collateral with one oracle, one rate model, one LTV and one liquidation bonus. Its id is the hash of those parameters, so nobody can change them after creation. A bad oracle or a crashing collateral can only hurt the market that chose it.',
  },
  {
    icon: <ChartLineUp size={20} weight="duotone" />,
    h: 'The interest rate model',
    p: 'The borrow rate follows a kinked curve. It climbs gently until 80% of supplied assets are lent out, then climbs fast. Lenders earn the borrow rate times utilization. Interest accrues every time the market is touched, before any balance changes.',
  },
  {
    icon: <Heartbeat size={20} weight="duotone" />,
    h: 'The health factor',
    p: 'Health factor is collateral value times the liquidation LTV, divided by debt. Above 1 the position is safe. At 1 or below it can be liquidated. The gauge on each borrow screen shows how a new borrow would move it before you sign.',
  },
  {
    icon: <Lightning size={20} weight="duotone" />,
    h: 'Liquidation',
    p: 'A liquidator repays the full debt of an unhealthy position and receives collateral worth that debt plus the market bonus. If the collateral is not enough to cover it, the shortfall is written off against that market\'s lenders as bad debt and an event records it.',
  },
  {
    icon: <MagnifyingGlass size={20} weight="duotone" />,
    h: 'Oracles',
    p: 'Every price read checks that the price is above zero and newer than the market\'s staleness limit. If it fails, the market pauses rather than act on bad data. On Base Sepolia the oracles are owner-set test feeds.',
  },
]

export default function HowItWorksPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const conceptsRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const stepsInView = useInView(stepsRef, { once: true, margin: '-60px' })
  const conceptsInView = useInView(conceptsRef, { once: true, margin: '-60px' })

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section ref={heroRef} style={{ padding: '64px 0 0', overflow: 'hidden' }}>
        <div className="section-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 48,
            alignItems: 'center',
            minHeight: 360,
          }}>
            <div style={{ maxWidth: 520 }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  marginBottom: 14,
                }}
              >
                Getting started
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: 'var(--text-1)',
                  marginBottom: 14,
                }}
              >
                How lending-core works
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{
                  fontSize: 16,
                  color: 'var(--text-3)',
                  lineHeight: 1.65,
                  maxWidth: 440,
                }}
              >
                Supply to earn. Borrow against collateral. Every market stands alone. Four steps from wallet to yield.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hide-mobile"
              style={{ position: 'relative' }}
            >
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 340,
                height: 340,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(23,77,64,0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <FloatingMarketCard scale={0.88} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 }}
                style={{
                  textAlign: 'center',
                  marginTop: 16,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-3)',
                }}
              >
                Isolated markets. Independent risk.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section ref={stepsRef} style={{
        padding: '72px 0 80px',
        marginTop: 40,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="section-container">
          {/* Connecting line */}
          <div style={{ position: 'relative' }}>
            <div className="hide-mobile" style={{
              position: 'absolute',
              top: 40,
              left: 'calc(12.5% + 24px)',
              right: 'calc(12.5% + 24px)',
              height: 2,
              background: 'var(--border-subtle)',
              zIndex: 0,
            }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={stepsInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  background: 'var(--accent)',
                  transformOrigin: 'left',
                  opacity: 0.3,
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
              position: 'relative',
              zIndex: 1,
            }}>
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--accent)' : 'var(--canvas)',
                    border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border-default)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: i === 0 ? '#FFFFFF' : 'var(--accent)',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}>
                    Step {step.num}
                  </div>
                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: 8,
                    letterSpacing: '-0.01em',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: 'var(--text-3)',
                    lineHeight: 1.6,
                    maxWidth: 260,
                    margin: '0 auto',
                  }}>
                    {step.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Concepts deep dive */}
      <section ref={conceptsRef} style={{ padding: '80px 0 96px' }}>
        <div className="section-container" style={{ maxWidth: 860 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={conceptsInView ? { opacity: 1, y: 0 } : {}}
            style={{ marginBottom: 48 }}
          >
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 14,
            }}>
              Core concepts
            </p>
            <h2 style={{
              fontSize: 'clamp(26px, 3.5vw, 34px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: 'var(--text-1)',
            }}>
              Understand the mechanics
            </h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {concepts.map((c, i) => (
              <motion.div
                key={c.h}
                initial={{ opacity: 0, y: 12 }}
                animate={conceptsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                className="card"
                style={{ padding: '24px 28px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}>
                    {c.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)' }}>{c.h}</h3>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, paddingLeft: 50 }}>{c.p}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={conceptsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 40 }}
          >
            <Link href="/markets" className="btn btn-primary btn-lg">
              View markets
              <ArrowRight size={15} weight="bold" />
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">Read the docs</Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
