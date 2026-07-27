'use client'
import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, ArrowUp, Bank, Shield, CheckCircle, Lock, ArrowClockwise } from '@phosphor-icons/react'
import { ScrambleText } from '@/components/ui/ScrambleText'
import { KinkedRateCurve } from '@/components/charts/KinkedRateCurve'

const WireframeSphere = dynamic(
  () => import('@/components/three/Sphere').then(m => m.WireframeSphere),
  { ssr: false }
)

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
      <NumbersSection />
      <SecuritySection />
      <MechanismSection />
      <EcosystemSection />
      <FinalCTASection />
    </>
  )
}

function HeroSection({ mouse, mounted }: { mouse: { x: number; y: number }; mounted: boolean }) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Sphere */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ width: '85vmin', height: '85vmin', maxWidth: 720, maxHeight: 720 }}>
          {mounted && <WireframeSphere mouseX={mouse.x} mouseY={mouse.y} />}
        </div>
      </div>

      {/* Purple glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Teal glow */}
      <div style={{
        position: 'absolute', top: '35%', left: '55%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,204,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Readability overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 70% at center, rgba(5,6,8,0.15) 0%, rgba(5,6,8,0.7) 65%, rgba(5,6,8,0.95) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Floating decorations */}
      <svg className="float-a" style={{ position: 'absolute', top: '12%', left: '8%', opacity: 0.12 }}
        width="32" height="32" viewBox="0 0 32 32">
        <polygon points="16,2 30,16 16,30 2,16" fill="none" stroke="#00E5CC" strokeWidth="0.5" />
      </svg>
      <svg className="float-b" style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.1 }}
        width="40" height="40" viewBox="0 0 40 40">
        <polygon points="20,4 36,36 4,36" fill="none" stroke="#7C3AED" strokeWidth="0.5" />
      </svg>
      <svg className="float-c" style={{ position: 'absolute', top: '20%', right: '12%', opacity: 0.1 }}
        width="28" height="28" viewBox="0 0 28 28">
        <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill="none" stroke="#00E5CC" strokeWidth="0.5" />
      </svg>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px 40px',
      }}>
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', marginBottom: 36,
            background: 'rgba(0,229,204,0.06)',
            border: '0.5px solid rgba(0,229,204,0.2)',
            borderRadius: 20, backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--positive)',
            animation: 'pulse-dot 2s ease-in-out infinite'
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-2)', letterSpacing: '0.06em'
          }}>
            LIVE · ARBITRUM SEPOLIA
          </span>
        </motion.div>

        {/* Headlines */}
        <div style={{ overflow: 'hidden', marginBottom: 4 }}>
          <motion.h1
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px, 8vw, 96px)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: 'var(--text-1)',
            }}
          >
            Lend anything.
          </motion.h1>
        </div>

        <div style={{ overflow: 'hidden', marginBottom: 28 }}>
          <motion.h1
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px, 8vw, 96px)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: 'var(--accent)',
            }}
          >
            Risk nothing else.
          </motion.h1>
        </div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'var(--text-2)',
            lineHeight: 1.65,
            maxWidth: 480,
            marginBottom: 36,
          }}
        >
          Every market is completely isolated. A bad oracle can drain one market.
          It cannot reach another.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}
        >
          <Link href="/markets" className="btn btn-primary btn-lg">
            Start earning
            <ArrowRight size={17} weight="bold" />
          </Link>
          <Link href="/docs" className="btn btn-ghost btn-lg">Read the docs</Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            display: 'flex', gap: 0,
            background: 'rgba(8,10,15,0.7)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--r-xl)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
          }}
        >
          {[
            { value: '$44.5M', label: 'in lending', accent: false },
            { value: '$29.9M', label: 'in borrowing', accent: false },
            { value: '$0', label: 'in bad debt', accent: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ filter: 'blur(8px)', opacity: 0, scale: 0.94 }}
              animate={{ filter: 'blur(0)', opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: '18px 32px',
                textAlign: 'center',
                borderRight: i < 2 ? '0.5px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22, fontWeight: 500,
                color: stat.accent ? 'var(--accent)' : 'var(--text-1)',
                marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute', bottom: 28,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Scroll
          </div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, var(--text-4), transparent)' }}
          />
        </motion.div>
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
        background: 'linear-gradient(145deg, #0F1219 0%, #0D1018 100%)',
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
        background: 'linear-gradient(145deg, #0F1219 0%, #0D1018 100%)',
        border: '0.5px solid rgba(0,229,204,0.2)',
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
      desc: 'Repay an unhealthy position. Take their collateral plus a guaranteed bonus. Permissionless — any address, any time.',
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

function NumbersSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const stats = [
    {
      value: '$0',
      label: 'bad debt since deployment',
      sub: 'Not one under-collateralized event since July 2026',
      color: 'var(--accent)',
      extra: (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>100% liquidations resolved</div>
          <div style={{ height: 4, background: 'var(--bg-0)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'var(--positive)', borderRadius: 2 }} />
          </div>
        </div>
      ),
    },
    {
      value: '4',
      label: 'markets live',
      sub: 'Each one completely isolated from the others',
      color: 'var(--text-1)',
      extra: (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16 }}>
          {['wstETH/USDC', 'WBTC/USDC', 'ETH/DAI', 'LINK/USDC'].map(m => (
            <span key={m} className="pill">{m}</span>
          ))}
        </div>
      ),
    },
    {
      value: '128,000+',
      label: 'fuzz runs. Every one passed.',
      sub: 'Three invariants proven: solvency holds, rounding favors protocol, no position drains another.',
      color: 'var(--text-1)',
    },
    {
      value: '0.5px',
      label: 'borders everywhere',
      sub: 'The detail that signals precision. Thick borders are for sites that aren\'t confident in their content. Thin borders are for protocols that are.',
      color: 'var(--text-1)',
    },
  ]

  return (
    <section ref={ref} style={{ background: 'var(--bg-0)', padding: '120px 0' }}>
      <div className="section-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ filter: 'blur(10px)', opacity: 0, scale: 0.95 }}
              animate={inView ? { filter: 'blur(0)', opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="card-glow"
              style={{ padding: 32 }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 5vw, 64px)',
                fontWeight: 800,
                color: stat.color,
                letterSpacing: '-0.03em',
                marginBottom: 8,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: 8,
              }}>
                {stat.label}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>
                {stat.sub}
              </p>
              {stat.extra}
            </motion.div>
          ))}
        </div>
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
            { icon: <Shield size={14} weight="fill" />, label: 'Trail of Bits audit' },
            { icon: <CheckCircle size={14} weight="fill" />, label: '0 critical findings' },
            { icon: <Lock size={14} weight="fill" />, label: '$500K bug bounty' },
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
          We had Trail of Bits tear it apart. They found two low-severity issues. Both are fixed.
          Zero criticals. Zero highs. The code has been running in the same state ever since.
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
            background: 'linear-gradient(145deg, rgba(0,229,204,0.02) 0%, rgba(124,58,237,0.01) 100%)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: 'var(--r-2xl)',
            boxShadow: '0 0 0 0.5px rgba(0,229,204,0.2), 0 0 80px rgba(0,229,204,0.06), 0 0 0 0.5px rgba(124,58,237,0.1) inset',
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
