'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Cube, Eye, Lock, Scales } from '@phosphor-icons/react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'

const DARK = '#102B27'
const DARK_2 = '#0B201C'
const ease = [0.16, 1, 0.3, 1] as const

const ideas = [
  {
    icon: Cube,
    title: 'Contain every problem',
    body: 'Each market is sealed off from the others. A broken price feed or a collapsing asset can only ever affect the people who chose that market.',
  },
  {
    icon: Lock,
    title: 'Nobody holds the keys',
    body: 'There is no admin, no pause button and no upgrade switch. The rules you sign up to are the rules that stay, for the life of the market.',
  },
  {
    icon: Eye,
    title: 'Refuse to guess',
    body: 'If a price looks wrong or out of date, the market stops and waits. We would rather pause than act on information we cannot trust.',
  },
  {
    icon: Scales,
    title: 'Tell the truth about losses',
    body: 'If a crash leaves a loan underwater, the loss is recorded right away and shared fairly inside that market, never hidden or pushed elsewhere.',
  },
]

export function SecurityHero() {
  const reduce = useReducedMotion()
  return (
    <header style={{ maxWidth: 680 }}>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 12 }}
      >
        Security and risk
      </motion.p>
      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.06, ease }}
        className="page-heading"
      >
        Security &amp; Risk
      </motion.h1>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease }}
        className="page-subtitle"
        style={{ fontSize: 16, lineHeight: 1.65 }}
      >
        Your money deserves straight answers. Here is what has been checked, what has not, and exactly what could go wrong.
      </motion.p>
    </header>
  )
}

export function SafetyStory() {
  const reduce = useReducedMotion()
  return (
    <Reveal style={{ marginTop: 64 }}>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--r-lg)',
          background: `radial-gradient(120% 140% at 90% 10%, #1A4A3F 0%, ${DARK} 55%, ${DARK_2} 100%)`,
          color: '#FFFFFF',
          padding: 'clamp(28px, 4vw, 48px)',
        }}
      >
        <motion.div
          aria-hidden="true"
          animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(127,181,155,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 600, marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9D9C0', marginBottom: 12 }}>
            Our approach
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 12 }}>
            How we think about safety
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
            Most lending disasters start the same way. One bad asset or one broken price feed, sitting in a shared pool, takes everyone down with it. lending-core was designed around the idea that this should be impossible.
          </p>
        </div>
        <Stagger
          className="safety-grid"
          style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}
        >
          {ideas.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div
                className="safety-card"
                style={{
                  height: '100%',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(127,181,155,0.15)',
                    border: '1px solid rgba(127,181,155,0.35)',
                    color: '#A9D9C0',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6 }}>{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <div style={{ position: 'relative', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
          <Link href="/how-it-works" className="btn" style={{ background: '#FFFFFF', color: DARK, borderColor: '#FFFFFF', gap: 6 }}>
            See how it works <ArrowRight size={13} />
          </Link>
          <a
            href="https://github.com/sabijuraa/lending-core/blob/main/THREAT_MODEL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ background: 'transparent', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.45)' }}
          >
            Read the threat model
          </a>
        </div>
        <style>{`
          .safety-card { transition: border-color 200ms ease, background 200ms ease, transform 200ms ease; }
          .safety-card:hover { border-color: rgba(127,181,155,0.5); background: rgba(255,255,255,0.07); transform: translateY(-3px); }
          @media (max-width: 960px) { .safety-grid { grid-template-columns: 1fr 1fr !important; } }
          @media (max-width: 560px) { .safety-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </Reveal>
  )
}
