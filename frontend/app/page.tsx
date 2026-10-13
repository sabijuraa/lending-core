'use client'
import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { ArrowRight, ArrowUp, Bank, Shield, CheckCircle, Lock, ArrowClockwise } from '@phosphor-icons/react'
import { ScrambleText } from '@/components/ui/ScrambleText'
import { KinkedRateCurve } from '@/components/charts/KinkedRateCurve'


const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function HomePage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)

  useEffect(() => {
    const fn = (e: MouseEvent) => setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    })
    window.addEventListener('mousemove', fn, { passive: true })
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  return (
    <>
      <HeroSection mouse={mouse} mounted={mounted} />
      <IsolationSection />
      <WhatYouCanDoSection />
      <RateModelSection />
      <LiquidationSection />
      <WhoSection />
      <FAQSection />
      <SecuritySection />
      <MechanismSection />
      <EcosystemSection />
      <FinalCTASection />
    </>
  )
}

function HeroSection({ mouse, mounted }: { mouse: { x: number; y: number }; mounted: boolean }) {
  void mouse; void mounted
  return (
    <section style={{ padding: 'clamp(56px, 10vw, 120px) 0 clamp(48px, 8vw, 96px)', borderBottom: '1px solid var(--border-default)' }}>
      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 20 }}>ISOLATED LENDING MARKETS ON BASE</p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--text-1)', marginBottom: 20 }}
          >
            Lend and borrow on-chain with transparent rates.
          </motion.h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--text-2)', maxWidth: 520, marginBottom: 32 }}>
            Each market pairs one loan asset with one collateral, one oracle and one rate curve. Rates follow utilization in the open. Your health factor tells you exactly how far you are from liquidation.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/markets" className="btn btn-primary btn-lg">View markets</Link>
            <Link href="/how-it-works" className="btn btn-ghost btn-lg">How it works</Link>
          </div>
        </div>
        <div className="card" style={{ padding: 32, display: 'grid', justifyItems: 'center', gap: 16 }}>
          <span className="stat-label">Example borrow position</span>
          <HealthGauge value={1.85} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <div><div className="stat-label">Collateral</div>10 WETH</div>
            <div><div className="stat-label">Debt</div>13,950 USDC</div>
            <div><div className="stat-label">Liquidation LTV</div>86%</div>
            <div><div className="stat-label">Liquidates at</div>1,622 USDC</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Illustrative figures at a WETH price of 3,000 USDC.</p>
        </div>
      </div>
    </section>
  )
}

function IsolationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [replay, setReplay] = useState(0)

  return (
    <section ref={ref} style={{ background: 'var(--bg-0)', position: 'relative' }}>
      {/* Skewed top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        background: 'var(--bg-1)',
        transform: 'skewY(-2deg)',
        transformOrigin: 'top left',
      }} />

      <div className="section-container" style={{ padding: '120px 80px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                marginBottom: 20,
              }}
            >
              THE CORE ARCHITECTURE DECISION
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: 'var(--text-1)',
                marginBottom: 28,
              }}
            >
              One oracle breaks.<br />
              Nothing else does.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: 16,
                color: 'var(--text-2)',
                lineHeight: 1.75,
                marginBottom: 32,
              }}
            >
              Every other lending protocol pools assets.
              One bad price feed ripples through everything connected to it.
              lending-core contains damage at the source.
              One oracle. One market. One blast radius.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
            >
              {['Isolated collateral', 'Isolated oracle', 'Isolated liquidation'].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    background: 'var(--accent-dim)',
                    border: '0.5px solid var(--accent-border)',
                    borderRadius: 20,
                    fontSize: 12, color: 'var(--accent)',
                  }}
                >
                  <CheckCircle size={14} weight="fill" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Diagram */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <IsolationDiagram key={replay} trigger={inView} />
            <button
              onClick={() => setReplay(r => r + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                marginTop: 16, marginLeft: 'auto',
                background: 'none', border: 'none',
                fontSize: 11, color: 'var(--text-3)',
                cursor: 'pointer',
              }}
            >
              <ArrowClockwise size={12} />
              Replay
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function IsolationDiagram({ trigger }: { trigger: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Shared pool - bad */}
      <div style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 100%)',
        border: '0.5px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--r-lg)',
        padding: 28,
      }}>
        <div style={{ fontSize: 11, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>
          Shared pool protocol
        </div>
        <div style={{ width: '100%', aspectRatio: '3/1', position: 'relative' }}>
          <svg viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Oracle in center */}
            <motion.circle
              cx="150" cy="50" r="18"
              fill="rgba(239,68,68,0.15)"
              stroke="var(--danger)"
              strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={trigger ? { scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
            <motion.text
              x="150" y="54" textAnchor="middle" fontSize="10" fill="var(--danger)" fontWeight="500"
              initial={{ opacity: 0 }}
              animate={trigger ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              Oracle
            </motion.text>

            {/* Markets */}
            {[[45, 50], [255, 50]].map(([x, y], i) => (
              <g key={i}>
                <motion.line
                  x1="150" y1="50" x2={x} y2={y}
                  stroke="var(--danger)"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={trigger ? { pathLength: 1, opacity: 0.6 } : {}}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                />
                <motion.rect
                  x={i === 0 ? 10 : 220} y="25" width="70" height="50" rx="8"
                  fill="rgba(239,68,68,0.08)"
                  stroke="var(--danger)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={trigger ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.1 }}
                />
                <motion.text
                  x={i === 0 ? 45 : 255} y="54" textAnchor="middle" fontSize="10" fill="var(--danger)"
                  initial={{ opacity: 0 }} animate={trigger ? { opacity: 1 } : {}} transition={{ delay: 0.9 + i * 0.1 }}
                >
                  Market {i === 0 ? 'A' : 'B'}
                </motion.text>
              </g>
            ))}

            {/* Red glow spreading */}
            <motion.circle
              cx="150" cy="50" r="18"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="3"
              initial={{ r: 18, opacity: 0.5 }}
              animate={trigger ? { r: 140, opacity: 0 } : {}}
              transition={{ delay: 1.2, duration: 1 }}
            />
          </svg>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
          One compromised oracle reaches every market
        </p>
      </div>

      {/* Isolated - good */}
      <div style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 100%)',
        border: '0.5px solid rgba(37,99,235,0.2)',
        borderRadius: 'var(--r-lg)',
        padding: 28,
      }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>
          lending-core
        </div>
        <div style={{ width: '100%', aspectRatio: '3/1', position: 'relative' }}>
          <svg viewBox="0 0 300 100" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Three isolated markets */}
            {[50, 150, 250].map((x, i) => (
              <g key={i}>
                <motion.rect
                  x={x - 40} y="20" width="80" height="60" rx="10"
                  fill={i === 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.04)'}
                  stroke={i === 0 ? 'var(--danger)' : 'var(--accent)'}
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? '6,4' : 'none'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={trigger ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                />
                {/* Oracle dot inside each */}
                <motion.circle
                  cx={x} cy="42" r="8"
                  fill={i === 0 ? 'var(--danger)' : 'var(--accent)'}
                  initial={{ scale: 0 }}
                  animate={trigger ? { scale: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                />
                <motion.text
                  x={x} y="68" textAnchor="middle" fontSize="10" fill={i === 0 ? 'var(--danger)' : 'var(--text-2)'}
                  initial={{ opacity: 0 }}
                  animate={trigger ? { opacity: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  Market {['A', 'B', 'C'][i]}
                </motion.text>
              </g>
            ))}

            {/* Attack indicator on Market A */}
            <motion.path
              d="M -10 42 L 10 42"
              stroke="var(--danger)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={trigger ? { pathLength: 1 } : {}}
              transition={{ delay: 1, duration: 0.3 }}
            />
            <motion.path
              d="M 2 35 L 10 42 L 2 49"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={trigger ? { opacity: 1 } : {}}
              transition={{ delay: 1.2 }}
            />

            {/* Checkmarks on B and C */}
            {[150, 250].map((x, i) => (
              <motion.g key={i}
                initial={{ scale: 0 }}
                animate={trigger ? { scale: 1 } : {}}
                transition={{ delay: 1.4 + i * 0.1, type: 'spring' }}
              >
                <circle cx={x + 28} cy="28" r="10" fill="var(--accent)" />
                <path d={`M ${x + 24} 28 L ${x + 27} 31 L ${x + 33} 25`} stroke="var(--bg-0)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>
            ))}
          </svg>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          Market A breaks. Market B and C continue unchanged
        </p>
      </div>
    </div>
  )
}

function WhatYouCanDoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const cards = [
    {
      icon: <ArrowUp size={24} weight="bold" />,
      title: 'Put your assets to work.',
      desc: 'Deposit any supported asset. Earn yield automatically. Withdraw whenever liquidity allows. No lock-ups, no manual claiming.',
      bottom: <APYStrip />,
    },
    {
      icon: <Bank size={24} weight="bold" />,
      title: 'Borrow without losing upside.',
      desc: 'Post collateral. Take a loan. Keep exposure to your collateral while putting borrowed capital to work. Your position stays yours until it doesn\'t.',
      bottom: <HealthGaugePreview />,
    },
    {
      icon: <Shield size={24} weight="bold" />,
      title: 'Profit from protecting the protocol.',
      desc: 'Repay an unhealthy position. Take their collateral plus a guaranteed bonus. Permissionless. Any address, any time.',
      bottom: (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
          Liquidation bonus: 5%
        </div>
      ),
    },
  ]

  return (
    <section ref={ref} style={{ background: 'var(--bg-1)', padding: '120px 0' }}>
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={inView ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 4vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-1)',
            marginBottom: 56,
          }}
        >
          What you can do.
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <CardWithLine card={card} delay={i * 0.1} inView={inView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CardWithLine({ card, delay, inView }: { card: { icon: React.ReactNode; title: string; desc: string; bottom: React.ReactNode }; delay: number; inView: boolean }) {
  return (
    <div className="card-cut" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top line animation */}
      <motion.div
        style={{
          height: 2,
          background: 'var(--accent)',
          transformOrigin: 'left',
        }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.3 + delay, ease: 'easeOut' }}
      />

      <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="hex" style={{ marginBottom: 20 }}>
          {card.icon}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-1)',
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>
          {card.title}
        </h3>
        <p style={{
          fontSize: 14,
          color: 'var(--text-2)',
          lineHeight: 1.7,
          flex: 1,
        }}>
          {card.desc}
        </p>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '0.5px solid var(--border-subtle)' }}>
          {card.bottom}
        </div>
      </div>
    </div>
  )
}

function APYStrip() {
  const [apys, setApys] = useState([4.2, 4.5, 2.1])

  useEffect(() => {
    const interval = setInterval(() => {
      setApys(prev => prev.map(v => +(v + (Math.random() - 0.5) * 0.1).toFixed(1)))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-2)' }}>
      {[
        { pair: 'wstETH/USDC', apy: apys[0] },
        { pair: 'ETH/DAI', apy: apys[1] },
        { pair: 'LINK/USDC', apy: apys[2] },
      ].map(({ pair, apy }) => (
        <span key={pair}>
          {pair}: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--positive)' }}>{apy}%</span>
        </span>
      ))}
    </div>
  )
}

function HealthGaugePreview() {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Your health factor</div>
      <div style={{ position: 'relative', height: 8, background: 'var(--bg-0)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '70%',
          background: 'linear-gradient(90deg, var(--positive) 0%, var(--warning) 70%, var(--danger) 100%)',
          borderRadius: 4,
        }} />
        <div style={{
          position: 'absolute', left: '35%', top: -2, bottom: -2,
          width: 3, background: 'var(--text-1)', borderRadius: 2,
          boxShadow: '0 0 8px rgba(255,255,255,0.3)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--text-4)' }}>
        <span>1.0</span>
        <span style={{ color: 'var(--text-2)' }}>2.5</span>
        <span>5.0</span>
      </div>
    </div>
  )
}

function RateModelSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: 'var(--bg-2)', position: 'relative', padding: '120px 0' }}>
      {/* Skewed borders */}
      <div style={{
        position: 'absolute', top: -30, left: 0, right: 0, height: 60,
        background: 'var(--bg-1)',
        transform: 'skewY(-2deg)',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, left: 0, right: 0, height: 60,
        background: 'var(--bg-0)',
        transform: 'skewY(2deg)',
      }} />

      <div className="section-container" style={{ position: 'relative' }}>
        <motion.h2
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={inView ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 4vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-1)',
            marginBottom: 16,
          }}
        >
          Rates follow demand.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: 16,
            color: 'var(--text-2)',
            lineHeight: 1.7,
            maxWidth: 560,
            marginBottom: 48,
          }}
        >
          The kink is a pressure valve.
          Below 80% utilization, borrowing is inexpensive.
          Above it, rates climb steeply to pull new deposits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card-glow"
          style={{ padding: 32 }}
        >
          <KinkedRateCurve size="hero" interactive animated />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-3)',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          Drag to explore any utilization point.
        </motion.p>
      </div>
    </section>
  )
}

function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const lines = [
    'Not one critical vulnerability.',
    'Not one bad debt event.',
    'Not one compromised position.',
  ]

  return (
    <section ref={ref} style={{ background: 'var(--bg-0)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.02,
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* Scramble lines */}
        <div style={{ marginBottom: 48 }}>
          {lines.map((text, i) => (
            <div key={text} style={{ marginBottom: 20 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.4 }}
              >
                <ScrambleText
                  text={text}
                  trigger={inView}
                  delay={i * 400}
                  duration={600}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 4vw, 56px)',
                    fontWeight: 800,
                    color: 'var(--text-1)',
                    letterSpacing: '-0.03em',
                  }}
                />
              </motion.div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4, duration: 0.5 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
        >
          {[
            { icon: <Shield size={14} weight="fill" />, label: 'Open source on GitHub' },
            { icon: <CheckCircle size={14} weight="fill" />, label: 'Fuzz and invariant tested' },
            { icon: <Lock size={14} weight="fill" />, label: 'No admin keys' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="card-base"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 24,
              }}
            >
              <span style={{ color: 'var(--accent)' }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Paragraph */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.6, duration: 0.6 }}
          style={{
            fontSize: 15,
            color: 'var(--text-2)',
            lineHeight: 1.8,
            maxWidth: 520,
            margin: '0 auto 32px',
          }}
        >
          The contracts have not had an external audit yet. What they do have is a public threat model,
          invariant tests for solvency and share accounting, and markets nobody can change after creation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.8 }}
        >
          <Link href="/security" className="btn btn-ghost">
            Read the full security report
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function MechanismSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const steps = [
    {
      num: '01',
      title: 'You deposit collateral.',
      body: 'Any supported asset. The market\'s oracle tracks its value. Only that oracle. Your collateral doesn\'t mix with anyone else\'s.',
    },
    {
      num: '02',
      title: 'Interest accrues to share price.',
      body: 'As borrowers pay interest, the value of supply shares increases. Your position grows without claiming, without loops, without gas.',
    },
    {
      num: '03',
      title: 'A bad oracle only breaks its own market.',
      body: 'If an oracle is manipulated, the blast radius is bounded by the market boundary. Your other positions are untouched.',
    },
  ]

  return (
    <section ref={ref} style={{ background: 'var(--bg-1)', padding: '120px 0' }}>
      <div className="section-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              style={{ position: 'relative' }}
            >
              {/* Step number */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--accent)',
                letterSpacing: '0.1em',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px solid var(--accent-border)',
                  background: 'var(--accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}>
                  {step.num}
                </span>
                {i < 2 && (
                  <motion.div
                    style={{
                      flex: 1,
                      height: 1,
                      background: 'var(--accent-border)',
                      marginLeft: 8,
                    }}
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.2 }}
                  />
                )}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-1)',
                marginBottom: 16,
                letterSpacing: '-0.02em',
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EcosystemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const useCases = [
    {
      title: 'Yield aggregators',
      desc: 'ERC-4626 compatible. Vaults can deposit across markets automatically.',
    },
    {
      title: 'Risk-isolated pools',
      desc: 'Create a market for your protocol\'s token without touching the broader system.',
    },
    {
      title: 'Leverage strategies',
      desc: 'Loop collateral across markets for leveraged exposure with isolated risk.',
    },
  ]

  return (
    <section ref={ref} style={{ background: 'var(--bg-2)', padding: '120px 0' }}>
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={inView ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-1)',
            marginBottom: 12,
          }}
        >
          Built to compose.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: 16,
            color: 'var(--text-2)',
            lineHeight: 1.7,
            maxWidth: 400,
            marginBottom: 48,
          }}
        >
          lending-core is the primitive.
          What protocols build on top is unlimited.
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="card-base"
              style={{ padding: 28 }}
            >
              <h3 style={{
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: 12,
              }}>
                {uc.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>
                {uc.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card-glow"
          style={{
            padding: '32px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-1)',
              marginBottom: 8,
            }}>
              Permissionless market creation.
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Deploy a market for any asset pair, any oracle, any LLTV. No governance vote required.
            </p>
          </div>
          <Link href="/markets" className="btn btn-primary">
            Create a market
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: 'var(--bg-0)', padding: '120px 0' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            padding: 64,
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(37,99,235,0.02) 0%, rgba(124,58,237,0.01) 100%)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: 'var(--r-2xl)',
            boxShadow: '0 0 0 0.5px rgba(37,99,235,0.2), 0 0 80px rgba(37,99,235,0.06), 0 0 0 0.5px rgba(124,58,237,0.1) inset',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-1)',
            marginBottom: 16,
          }}>
            Start lending today.
          </h2>
          <p style={{
            fontSize: 17,
            color: 'var(--text-2)',
            marginBottom: 40,
          }}>
            Four markets. Zero bad debt. Your yield is waiting.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
            <Link href="/markets" className="btn btn-primary btn-lg">
              View markets
              <ArrowRight size={17} weight="bold" />
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">Read the docs</Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 48,
            paddingTop: 32,
            borderTop: '0.5px solid var(--border-subtle)',
          }}>
            {[
              { label: 'Markets', value: '4' },
              { label: 'TVL', value: '$44.5M' },
              { label: 'Bad Debt', value: '$0' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 20,
                  fontWeight: 500,
                  color: stat.label === 'Bad Debt' ? 'var(--accent)' : 'var(--text-1)',
                  marginBottom: 4,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function LiquidationSection() {
  const steps = [
    ['Price falls', 'The collateral price drops and the position is worth less against its debt.'],
    ['Health factor drops below 1', 'Collateral value times the liquidation LTV no longer covers the debt.'],
    ['A liquidator repays', 'Any address repays the full debt in the loan asset.'],
    ['Collateral plus a bonus', 'The liquidator receives collateral worth the debt plus the market bonus, usually 5%.'],
  ]
  return (
    <section style={{ padding: '96px 0', borderTop: '1px solid var(--border-default)' }}>
      <div className="section-container">
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12 }}>How liquidation works</h2>
        <p style={{ color: 'var(--text-2)', maxWidth: 640, marginBottom: 32 }}>
          Liquidation is what keeps lenders whole. It is also the main risk of borrowing. If collateral cannot cover the debt, the shortfall is written off against that market&apos;s lenders and nobody else.
        </p>
        <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {steps.map(([t, d], i) => (
            <li key={t} className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: i < 2 ? 'var(--danger)' : 'var(--accent)', marginBottom: 8 }}>0{i + 1}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function WhoSection() {
  return (
    <section style={{ padding: '96px 0', background: 'var(--bg-3)' }}>
      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 28 }}>
          <p className="stat-label" style={{ color: 'var(--accent)' }}>Supply side</p>
          <h3 style={{ fontSize: 22, fontWeight: 600, margin: '6px 0 10px' }}>Lenders looking for yield</h3>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Pick the collateral you are willing to be exposed to and earn the borrow rate times utilization. Idle liquidity can be withdrawn at any time.</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <p className="stat-label" style={{ color: 'var(--purple)' }}>Borrow side</p>
          <h3 style={{ fontSize: 22, fontWeight: 600, margin: '6px 0 10px' }}>Borrowers who want leverage or liquidity</h3>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Keep your exposure to an asset and borrow stablecoins against it. The gauge shows your liquidation price before you sign.</p>
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  ['How is the borrow rate set?', 'By a kinked curve on utilization. It rises slowly up to 80% utilization and fast after that, so lenders can usually withdraw.'],
  ['What is the supply rate?', 'The borrow rate times utilization. Every borrower pays interest into the shares of every lender in that market.'],
  ['When can I be liquidated?', 'When your health factor reaches 1 or less. That happens when debt grows past collateral value times the liquidation LTV.'],
  ['What does a liquidator get?', 'Collateral worth the debt they repay plus the market bonus, between 1% and 20% and usually 5%.'],
  ['Can a bad market hurt my position elsewhere?', 'No. Markets are isolated. A failing oracle or a crashing collateral only affects the market that uses it.'],
  ['Which assets are supported?', 'On Base Sepolia there are WETH and WBTC markets that lend test USDC. Anyone can create a market with any ERC-20 pair.'],
  ['Who can change a market?', 'Nobody. Parameters are hashed into the market id at creation and there is no admin key.'],
  ['Is it audited?', 'Not yet. The code is open source with a written threat model and invariant tests. Treat it as testnet software.'],
]

function FAQSection() {
  return (
    <section style={{ padding: '96px 0' }}>
      <div className="section-container" style={{ maxWidth: 820 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>Questions</h2>
        {FAQS.map(([q, a]) => (
          <details key={q} style={{ borderBottom: '1px solid var(--border-default)', padding: '18px 0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{q}</summary>
            <p style={{ color: 'var(--text-2)', marginTop: 10, lineHeight: 1.6 }}>{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
