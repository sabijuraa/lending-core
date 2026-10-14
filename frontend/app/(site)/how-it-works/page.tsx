'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowsLeftRight,
  BookOpen,
  ChartLineUp,
  Code,
  Coins,
  Door,
  Heartbeat,
  MagnifyingGlass,
  Plus,
  Shield,
  Vault,
} from '@phosphor-icons/react'
import { DARK, DARK_2, IconTile, LearnStyles, SectionHead, StepsBand, TopicCard } from '@/components/learn/ui'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'

const journey = [
  {
    icon: <Vault size={20} />,
    title: 'You deposit',
    body: 'Pick a market you understand, say ETH backing USDC loans, and deposit your ETH. It stays yours. It simply sits in that one market as security for anything you borrow.',
  },
  {
    icon: <ArrowsLeftRight size={20} />,
    title: 'You borrow',
    body: 'Take out stablecoins against your deposit without selling it. You see the rate, your borrow limit and how safe the position is before you confirm anything.',
  },
  {
    icon: <Heartbeat size={20} />,
    title: 'You stay safe',
    body: 'Your health factor tells you how much room you have. If prices move against you, add collateral or pay a little back and the number climbs again.',
  },
  {
    icon: <Door size={20} />,
    title: 'You exit',
    body: 'Repay what you borrowed plus interest and take your full deposit back whenever you like. No lockups, no exit fees, no waiting period.',
  },
]

const concepts = [
  {
    icon: <Shield size={20} />,
    h: 'Every market stands alone',
    p: 'Each market pairs one asset you can borrow with one asset you can deposit, and it has its own price feed and its own rules. If something goes wrong in a market you are not using, it cannot reach you. That is the whole idea behind lending-core.',
  },
  {
    icon: <ChartLineUp size={20} />,
    h: 'Rates that respond to demand',
    p: 'When few people are borrowing, rates are low. As a market gets busier the rate rises, gently at first and then quickly once most of the money is lent out. That steep part pulls in new lenders and nudges borrowers to repay, so lenders can always get their money back out.',
  },
  {
    icon: <Coins size={20} />,
    h: 'Lenders earn automatically',
    p: 'Everything borrowers pay in interest goes to the lenders of that market. There is no protocol fee taking a cut and nothing to claim. Your balance simply grows over time.',
  },
  {
    icon: <Heartbeat size={20} />,
    h: 'Liquidation keeps markets solvent',
    p: 'If a borrower runs out of room, anyone can step in, repay the loan and receive collateral worth that loan plus a small bonus. It is not a penalty system. It is what makes sure lenders are always paid back.',
  },
  {
    icon: <MagnifyingGlass size={20} />,
    h: 'Prices are checked every time',
    p: 'Before anyone borrows or gets liquidated, the market checks that its price is fresh and makes sense. If the price looks wrong or out of date, the market waits instead of acting on bad information.',
  },
]

/* Example numbers for the walkthrough. Not live market data. */
const SAM = {
  eth: 2,
  price: 3000,
  lltv: 0.8,
  borrow: 3000,
}
const hf = (eth: number, price: number) => (eth * price * SAM.lltv) / SAM.borrow
const liqPrice = (eth: number) => SAM.borrow / (eth * SAM.lltv)
const usd = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const samChapters = [
  {
    tag: 'Day 1',
    title: 'Sam deposits 2 ETH',
    body: `With ETH at ${usd(SAM.price)}, the deposit is worth ${usd(SAM.eth * SAM.price)}. The market Sam picks lets borrowers use up to 80% of their collateral value.`,
    stat: { label: 'Collateral', value: usd(SAM.eth * SAM.price) },
  },
  {
    tag: 'Day 1',
    title: `Sam borrows ${SAM.borrow.toLocaleString('en-US')} USDC`,
    body: `That is half of the deposit value, well under the limit. Sam keeps all the upside on the ETH and now has stablecoins to use elsewhere. ETH would have to fall to about ${usd(liqPrice(SAM.eth))} before the position could be liquidated.`,
    stat: { label: 'Health factor', value: hf(SAM.eth, SAM.price).toFixed(2) },
  },
  {
    tag: 'Week 3',
    title: 'ETH drops to $2,250',
    body: 'The deposit is now worth $4,500 and the health factor falls. Still safe, but the cushion is thinner and the app shows it clearly.',
    stat: { label: 'Health factor', value: hf(SAM.eth, 2250).toFixed(2) },
  },
  {
    tag: 'Week 3',
    title: 'Sam tops up with 0.5 ETH',
    body: `One small deposit pushes the health factor back up and moves the liquidation price down to about ${usd(liqPrice(SAM.eth + 0.5))}. Sam can sleep again.`,
    stat: { label: 'Health factor', value: hf(SAM.eth + 0.5, 2250).toFixed(2) },
  },
  {
    tag: 'Month 2',
    title: 'Sam repays and walks away',
    body: 'Sam repays the USDC plus the interest it earned lenders, and withdraws all 2.5 ETH. The loan is closed and nothing else is owed.',
    stat: { label: 'Collateral returned', value: '2.5 ETH' },
  },
]

const scale = [
  { at: 'Below 1.0', label: 'Can be liquidated', color: 'var(--danger)', body: 'Anyone may repay your loan and take collateral worth that loan plus a bonus. Act before you get here.' },
  { at: '1.0 to 1.25', label: 'Danger zone', color: 'var(--warning)', body: 'A normal price swing could tip you over. Add collateral or repay part of the loan now.' },
  { at: '1.25 to 1.5', label: 'Keep an eye on it', color: '#7FA35B', body: 'Comfortable for calm markets. Check in when prices start moving fast.' },
  { at: 'Above 1.5', label: 'Plenty of room', color: 'var(--positive)', body: 'Prices can move a long way before your position is at risk.' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function HowItWorksPage() {
  const reduce = useReducedMotion()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)', overflowX: 'hidden' }}>
      <LearnStyles />
      <div className="section-container" style={{ maxWidth: 1160, padding: '40px 24px 96px' }}>
        {/* Breadcrumb */}
        <Link
          href="/docs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', marginBottom: 28, textDecoration: 'none' }}
        >
          Learn &amp; Docs
        </Link>

        {/* Hero */}
        <header style={{ maxWidth: 680, marginBottom: 40 }}>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 14 }}
          >
            Getting started
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease }}
            className="page-heading"
            style={{ fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.06, marginBottom: 16 }}
          >
            Borrow against what you own. Keep what you believe in.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease }}
            className="page-subtitle"
            style={{ fontSize: 17, lineHeight: 1.65 }}
          >
            lending-core lets you unlock cash from your crypto without selling it, or earn steady interest by lending to people who do. Here is the whole journey, start to finish.
          </motion.p>
        </header>

        {/* Dark band */}
        <Reveal delay={0.1}>
          <StepsBand
            title="Four moments, one market at a time"
            subtitle="Every position you open lives inside a single market with its own price feed and its own rules. Nothing that happens elsewhere can touch it."
            linkHref="/markets"
            linkLabel="Explore markets"
            steps={['You deposit', 'You borrow', 'You stay safe', 'You exit']}
          />
        </Reveal>

        {/* Journey */}
        <section style={{ marginTop: 72 }}>
          <Reveal>
            <SectionHead
              eyebrow="The journey"
              title="What it feels like to use lending-core"
              body="No jargon required. These are the four things you actually do."
            />
          </Reveal>
          <Stagger className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {journey.map((s, i) => (
              <StaggerItem key={s.title}>
                <article
                  className="lift-card"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 24, height: '100%' }}
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
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.65 }}>{s.body}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Meet Sam */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <SectionHead
              eyebrow="A worked example"
              title="Meet Sam, borrowing against ETH"
              body="Sam believes in ETH long term but needs some stablecoins today. Here is how two months with lending-core could play out."
            />
          </Reveal>
          <div
            className="learn-two-col"
            style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}
          >
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.4, ease }}
                style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: 'var(--accent-border)', transformOrigin: 'top' }}
              />
              {samChapters.map((c, i) => (
                <Reveal key={c.title} from="left" delay={i * 0.06} style={{ position: 'relative', paddingLeft: 48, paddingBottom: i === samChapters.length - 1 ? 0 : 18 }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 6,
                      top: 18,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      border: '2px solid var(--accent)',
                    }}
                  />
                  <div
                    className="lift-card sam-card"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--r-md)',
                      padding: '18px 20px',
                      display: 'flex',
                      gap: 20,
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 4 }}>{c.tag}</div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>{c.title}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{c.body}</p>
                    </div>
                    <div className="sam-stat" style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 2, whiteSpace: 'nowrap' }}>{c.stat.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{c.stat.value}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal from="right" delay={0.1}>
              <aside
                style={{
                  position: 'sticky',
                  top: 96,
                  background: `linear-gradient(165deg, #17423A 0%, ${DARK} 50%, ${DARK_2} 100%)`,
                  color: '#FFFFFF',
                  borderRadius: 'var(--r-lg)',
                  padding: 28,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A9D9C0', marginBottom: 12 }}>
                  What Sam got out of it
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
                  {[
                    'Stablecoins to use for two months without selling any ETH',
                    'Full upside if ETH recovered, because Sam still owned it',
                    'A clear warning when the cushion got thin, and time to act',
                    'Every bit of collateral back after repaying',
                  ].map(t => (
                    <li key={t} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
                      <Plus size={14} weight="bold" style={{ color: '#7FB59B', marginTop: 4, flexShrink: 0 }} />
                      {t}
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 22, lineHeight: 1.6 }}>
                  This is an example scenario. Real prices and rates move, and nothing here is a promise of any outcome.
                </p>
              </aside>
            </Reveal>
          </div>
        </section>

        {/* Staying safe */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <SectionHead
              eyebrow="Staying safe"
              title="Your health factor, in plain words"
              body="One number tells you how much room your loan has. Higher is safer. The app shows it before and after every action so you are never guessing."
            />
          </Reveal>
          <Reveal>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: 'clamp(20px, 3vw, 32px)' }}>
              <div style={{ position: 'relative', marginBottom: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: 12, borderRadius: 99, overflow: 'hidden' }}>
                  {scale.map((z, i) => (
                    <motion.div
                      key={z.at}
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.15, ease }}
                      style={{ background: z.color, transformOrigin: 'left' }}
                    />
                  ))}
                </div>
                <motion.div
                  aria-hidden="true"
                  initial={reduce ? false : { left: '6%' }}
                  whileInView={{ left: '82%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, delay: 0.5, ease }}
                  style={{ position: 'absolute', top: -6, width: 24, height: 24, marginLeft: -12, borderRadius: '50%', background: 'var(--surface)', border: '3px solid var(--accent)', boxShadow: '0 4px 12px rgba(16,43,39,0.2)' }}
                />
              </div>
              <Stagger className="learn-card-grid health-scale-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                {scale.map(z => (
                  <StaggerItem key={z.at}>
                    <div style={{ borderTop: `3px solid ${z.color}`, paddingTop: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>{z.at}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: z.color, margin: '2px 0 8px' }}>{z.label}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{z.body}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Reveal>
          <Reveal>
            <div
              className="learn-card-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}
            >
              {[
                ['Add collateral', 'The fastest way to raise your health factor. Even a small top up moves your liquidation price further away.'],
                ['Repay a little', 'Paying back part of the loan lowers your debt and gives the position more room straight away.'],
                ['Borrow less to begin with', 'Leaving a generous cushion on day one is the simplest way to never think about liquidation.'],
              ].map(([t, d]) => (
                <div key={t} className="lift-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>{t}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Concepts */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <SectionHead eyebrow="Under the hood" title="Five ideas that keep it working" />
          </Reveal>
          <Reveal>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              {concepts.map((c, i) => (
                <motion.div
                  key={c.h}
                  className="learn-two-col"
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '280px minmax(0, 1fr)',
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
                </motion.div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Keep learning */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <SectionHead eyebrow="Keep learning" title="Go deeper" />
          </Reveal>
          <Stagger className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            <StaggerItem>
              <TopicCard icon={<BookOpen size={20} />} title="Why isolation matters" desc="How keeping markets apart protects you from other people's risk." href="/docs?tab=learn&section=isolated-markets" />
            </StaggerItem>
            <StaggerItem>
              <TopicCard icon={<Shield size={20} />} title="Understanding risk" desc="Liquidation, price feeds and what can go wrong, explained honestly." href="/docs?tab=risk" />
            </StaggerItem>
            <StaggerItem>
              <TopicCard icon={<Code size={20} />} title="For builders" desc="Contracts, events and integration examples for developers." href="/docs?tab=developers" />
            </StaggerItem>
          </Stagger>
        </section>

        {/* CTA */}
        <Reveal>
          <section
            style={{
              marginTop: 80,
              borderRadius: 'var(--r-lg)',
              background: `radial-gradient(120% 160% at 90% 0%, #1A4A3F 0%, ${DARK} 55%, ${DARK_2} 100%)`,
              color: '#FFFFFF',
              padding: 'clamp(28px, 4vw, 44px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 540 }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Ready to try it?</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                Open the app, pick a market and start small. Every step shows you what will happen before you confirm.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/markets" className="btn" style={{ background: '#FFFFFF', color: DARK, borderColor: '#FFFFFF', gap: 6 }}>
                Explore markets
              </Link>
              <Link href="/docs?tab=risk" className="btn" style={{ background: 'transparent', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.45)' }}>
                Understand the risks
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .health-scale-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .health-scale-grid { grid-template-columns: 1fr !important; }
          .sam-card { flex-direction: column; gap: 10px !important; }
          .sam-stat { text-align: left !important; }
        }
      `}</style>
    </div>
  )
}
