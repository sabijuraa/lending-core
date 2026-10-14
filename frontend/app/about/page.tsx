'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowSquareOut,
  Cube,
  Eye,
  HandCoins,
  Lock,
  Scales,
  Sparkle,
} from '@phosphor-icons/react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { CtaBand } from '@/components/layout/CtaBand'

const DARK = '#102B27'
const DARK_2 = '#0B201C'
const REPO = 'https://github.com/sabijuraa/lending-core'
const ease = [0.16, 1, 0.3, 1] as const

const principles = [
  { icon: Cube, title: 'Your risk is your own', body: 'You only ever carry the risk of the markets you choose. Someone else’s bad bet can never reach your money.' },
  { icon: Lock, title: 'Rules that never move', body: 'Once a market exists its rules are locked. No vote, admin or upgrade can change them after you join.' },
  { icon: Eye, title: 'See it before you sign', body: 'Rates, limits and your health factor are shown before every action, so there are no surprises afterwards.' },
  { icon: HandCoins, title: 'Lenders keep the interest', body: 'There is no protocol fee and no token. Everything borrowers pay goes to the people lending to them.' },
  { icon: Scales, title: 'Honest about losses', body: 'If something goes wrong, it is recorded openly inside the market where it happened, never hidden.' },
  { icon: Sparkle, title: 'Small on purpose', body: 'Fewer features means fewer ways to fail. The core contract is about 300 lines anyone can read.' },
]

const tradeoffs = [
  { chose: 'Keeping markets apart', gave: 'Some capital efficiency' },
  { chose: 'Rules that never change', gave: 'The ability to upgrade' },
  { chose: 'Simplicity', gave: 'A long feature list' },
  { chose: 'Getting it right', gave: 'Shipping fast' },
]

const timeline: { when: string; title: string; body: string; done: boolean }[] = [
  {
    when: 'July 2026',
    title: 'The rules were written down',
    body: 'Every big decision, from locked markets to how prices are checked and how losses are handled, was recorded publicly before it was built.',
    done: true,
  },
  {
    when: 'July 2026',
    title: 'Proven under pressure',
    body: 'The contracts were hammered with more than 128,000 random sequences of deposits, loans, crashes and liquidations, checking after every step that lenders could be paid back.',
    done: true,
  },
  {
    when: 'July 2026',
    title: 'An app for everyone',
    body: 'The interface you are using now was built so anyone can see a market’s risk at a glance and act with confidence.',
    done: true,
  },
  {
    when: 'October 2026',
    title: 'Testnet rehearsal',
    body: 'The full Base Sepolia deployment was scripted and rehearsed end to end, lending, borrowing and liquidating against exactly what gets deployed.',
    done: true,
  },
  {
    when: 'Up next',
    title: 'Live on Base Sepolia',
    body: 'Contracts go live on the testnet so you can try every step with test tokens.',
    done: false,
  },
  {
    when: 'Later',
    title: 'Independent audit',
    body: 'An outside security review before any real money is involved. It has not started yet.',
    done: false,
  },
]

export default function AboutPage() {
  const reduce = useReducedMotion()

  return (
    <>
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', overflowX: 'hidden' }}>
      {/* Hero */}
      <section className="section-container" style={{ maxWidth: 1160, padding: '64px 24px 48px' }}>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 14 }}
        >
          About lending-core
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease }}
          style={{ fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.02, color: 'var(--text-1)', maxWidth: 820, marginBottom: 20 }}
        >
          Lending where one bad market can never sink the rest.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease }}
          style={{ fontSize: 18, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 620 }}
        >
          We built lending-core for people who want to borrow against their crypto or earn on their savings, without inheriting everybody else&apos;s risk.
        </motion.p>
      </section>

      {/* Story */}
      <section className="section-container" style={{ maxWidth: 1160, padding: '24px 24px 0' }}>
        <div className="about-story" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
          <Reveal from="left">
            <div style={{ height: '100%', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 'clamp(24px, 3vw, 36px)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 12 }}>The problem</div>
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)', marginBottom: 14 }}>Shared pools share the pain</h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 12 }}>
                Most lending apps put every deposit into one big pool. It works well on calm days. But when a single asset collapses or a single price feed breaks, the damage spreads to everyone in that pool, including people who never touched the asset that failed.
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>
                Lenders end up exposed to risks they never chose and often cannot even see.
              </p>
            </div>
          </Reveal>
          <Reveal from="right" delay={0.08}>
            <div
              style={{
                height: '100%',
                background: `radial-gradient(120% 140% at 90% 0%, #1A4A3F 0%, ${DARK} 55%, ${DARK_2} 100%)`,
                color: '#FFFFFF',
                borderRadius: 'var(--r-lg)',
                padding: 'clamp(24px, 3vw, 36px)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9D9C0', marginBottom: 12 }}>Our answer</div>
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 14 }}>Every market in its own room</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, marginBottom: 12 }}>
                In lending-core each market has one asset to borrow, one asset to deposit, one price feed and one set of rules. Nothing is pooled across markets, so a failure in one simply cannot reach another.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
                You pick the markets you trust, and that is the only risk you take on.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="section-container" style={{ maxWidth: 1160, padding: '88px 24px 0' }}>
        <Reveal>
          <div style={{ maxWidth: 620, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 8 }}>What we stand for</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>Six principles behind every decision</h2>
          </div>
        </Reveal>
        <Stagger className="about-principles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {principles.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="about-card" style={{ height: '100%', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--surface-2)', color: 'var(--accent)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65 }}>{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Tradeoffs */}
      <section className="section-container" style={{ maxWidth: 1160, padding: '88px 24px 0' }}>
        <Reveal>
          <div style={{ maxWidth: 620, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 8 }}>Honest tradeoffs</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text-1)', marginBottom: 10 }}>What we chose, and what we gave up</h2>
            <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65 }}>Every design has a cost. We would rather tell you ours up front.</p>
          </div>
        </Reveal>
        <Reveal>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <div style={{ padding: '14px 24px' }}>We chose</div>
              <div style={{ padding: '14px 24px', borderLeft: '1px solid var(--border-subtle)' }}>We gave up</div>
            </div>
            {tradeoffs.map((row, i) => (
              <motion.div
                key={row.chose}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}
              >
                <div style={{ padding: '18px 24px', fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>{row.chose}</div>
                <div style={{ padding: '18px 24px', fontSize: 15, color: 'var(--text-4)', textDecoration: 'line-through', borderLeft: '1px solid var(--border-subtle)' }}>{row.gave}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Timeline */}
      <section className="section-container" style={{ maxWidth: 1160, padding: '88px 24px 0' }}>
        <Reveal>
          <div style={{ maxWidth: 620, marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 8 }}>The road so far</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>What has been built, and what comes next</h2>
          </div>
        </Reveal>
        <div style={{ position: 'relative' }}>
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.6, ease }}
            style={{ position: 'absolute', left: 11, top: 6, bottom: 6, width: 2, background: 'var(--accent-border)', transformOrigin: 'top' }}
          />
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
            {timeline.map((t, i) => (
              <Reveal key={t.title} from="left" delay={i * 0.05} style={{ position: 'relative', paddingLeft: 44 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 2,
                    top: 20,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: t.done ? 'var(--accent)' : 'var(--surface)',
                    border: t.done ? '2px solid var(--accent)' : '2px dashed var(--border-strong)',
                  }}
                />
                <div
                  className="about-card about-timeline-row"
                  style={{
                    background: t.done ? 'var(--surface)' : 'transparent',
                    border: t.done ? '1px solid var(--border-subtle)' : '1px dashed var(--border-default)',
                    borderRadius: 'var(--r-md)',
                    padding: '18px 22px',
                    display: 'grid',
                    gridTemplateColumns: '140px minmax(0, 1fr)',
                    gap: 20,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.done ? 'var(--positive)' : 'var(--text-4)', letterSpacing: '0.04em', textTransform: 'uppercase', paddingTop: 2 }}>{t.when}</div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{t.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Open source band */}
      <section className="section-container" style={{ maxWidth: 1160, padding: '88px 24px 96px' }}>
        <Reveal>
          <div
            style={{
              borderRadius: 'var(--r-lg)',
              background: `radial-gradient(120% 160% at 90% 0%, #1A4A3F 0%, ${DARK} 55%, ${DARK_2} 100%)`,
              color: '#FFFFFF',
              padding: 'clamp(28px, 4vw, 48px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 28,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>Don&apos;t take our word for it</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
                Everything is open source. The core contract is about 300 lines, every design decision is written down, and the tests that check it are public. Read it, run it, question it.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={REPO} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#FFFFFF', color: DARK, borderColor: '#FFFFFF', gap: 6 }}>
                Read the code <ArrowSquareOut size={13} />
              </a>
              <Link href="/how-it-works" className="btn" style={{ background: 'transparent', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.45)', gap: 6 }}>
                How it works <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        .about-card { transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease; }
        .about-card:hover { border-color: var(--accent-border) !important; box-shadow: 0 10px 28px rgba(16,43,39,0.08); transform: translateY(-3px); }
        @media (prefers-reduced-motion: reduce) { .about-card:hover { transform: none; } }
        @media (max-width: 900px) {
          .about-story { grid-template-columns: 1fr !important; }
          .about-principles { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .about-principles { grid-template-columns: 1fr !important; }
          .about-timeline-row { grid-template-columns: 1fr !important; gap: 6px !important; }
        }
      `}</style>
    </div>
    <CtaBand />
    </>
  )
}
