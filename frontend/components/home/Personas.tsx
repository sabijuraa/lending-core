'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'
import { Reveal } from '@/components/ui/Reveal'
import { WireGlobe } from './WireGlobe'
import s from './home.module.css'

const PERSONAS = [
  {
    key: 'savers',
    label: 'Savers',
    title: 'Earn on cash that would otherwise sit still.',
    body: 'Supply stablecoins to the markets you trust and collect interest every block. You choose which collateral backs your deposit, so you always know what you are exposed to.',
    points: ['Withdraw whenever liquidity is available', 'Rates rise automatically when demand is high', 'Pick markets by collateral, not by a black box'],
    cta: 'Compare yields',
    href: '/earn',
  },
  {
    key: 'borrowers',
    label: 'Borrowers',
    title: 'Get liquidity and keep your upside.',
    body: 'Post the crypto you already hold and borrow against it at a rate set by open market demand. Your loan lives in one market, so events elsewhere cannot touch it.',
    points: ['No need to sell what you believe in', 'Clear liquidation limit for every market', 'Repay any time, in part or in full'],
    cta: 'Open a loan',
    href: '/borrow',
  },
  {
    key: 'liquidators',
    label: 'Liquidators',
    title: 'Keep markets safe and get paid for it.',
    body: 'When a loan slips below its safety line, anyone can step in, repay it and receive the collateral at a discount. Every opportunity is public and listed in real time.',
    points: ['Open to everyone, no whitelist', 'Bonus set per market and known upfront', 'Clear numbers before you act'],
    cta: 'See opportunities',
    href: '/liquidations',
  },
]

export function Personas() {
  const [active, setActive] = useState(0)
  const p = PERSONAS[active]

  return (
    <section className={s.band}>
      <WireGlobe className={s.personaGlobe} />
      <div className="section-container" style={{ position: 'relative' }}>
        <Reveal>
          <p className={s.bandEyebrow}>Built for</p>
          <h2 className={s.bandTitle}>One protocol, three ways to take part.</h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={s.personaTabs} role="tablist">
            {PERSONAS.map((x, i) => (
              <button
                key={x.key}
                role="tab"
                aria-selected={i === active}
                className={s.personaTab}
                data-active={i === active ? 'true' : undefined}
                onClick={() => setActive(i)}
              >
                {x.label}
                {i === active && <motion.span layoutId="persona-underline" className={s.personaUnderline} />}
              </button>
            ))}
          </div>
        </Reveal>

        <div className={s.personaBody}>
          <AnimatePresence mode="wait">
            <motion.div
              key={p.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={s.personaGrid}
            >
              <div>
                <h3 className={s.personaTitle}>{p.title}</h3>
                <p className={s.bandSub} style={{ maxWidth: 480 }}>{p.body}</p>
                <Link href={p.href} className="btn btn-on-dark">
                  {p.cta}
                </Link>
              </div>
              <ul className={s.personaList}>
                {p.points.map((pt, i) => (
                  <motion.li
                    key={pt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                  >
                    <CheckCircle size={18} weight="duotone" />
                    {pt}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
