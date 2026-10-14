'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, PiggyBank, HandCoins, TrendUp, Lightning } from '@phosphor-icons/react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import s from './home.module.css'

export function ActionCards({ supplySlug }: { supplySlug: string }) {
  const actions = [
    {
      icon: <PiggyBank size={22} weight="duotone" />,
      title: 'Supply',
      body: 'Put idle stablecoins to work and earn interest paid by borrowers.',
      cta: 'Start supplying',
      href: `/supply/${supplySlug}`,
    },
    {
      icon: <HandCoins size={22} weight="duotone" />,
      title: 'Borrow',
      body: 'Unlock cash against the crypto you hold, without selling it.',
      cta: 'Open a loan',
      href: '/borrow',
    },
    {
      icon: <TrendUp size={22} weight="duotone" />,
      title: 'Earn',
      body: 'Compare yields across markets and pick the risk you are comfortable with.',
      cta: 'Compare yields',
      href: '/earn',
    },
    {
      icon: <Lightning size={22} weight="duotone" />,
      title: 'Liquidate',
      body: 'Keep markets healthy by closing risky loans and collect a bonus for it.',
      cta: 'Find opportunities',
      href: '/liquidations',
    },
  ]

  return (
    <section className={s.block}>
      <div className="section-container">
        <Reveal className={s.blockHead}>
          <p className={s.eyebrow}>Use the app</p>
          <h2 className={s.blockTitle}>Everything you need, in four moves.</h2>
          <p className={s.blockSub}>
            Whether you want steady yield or quick liquidity, every action happens in a market you can see end to end.
          </p>
        </Reveal>

        <Stagger className={s.actionGrid}>
          {actions.map(a => (
            <StaggerItem key={a.title}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className={s.actionCard}>
                <div className={s.actionIcon}>{a.icon}</div>
                <h3 className={s.actionTitle}>{a.title}</h3>
                <p className={s.actionBody}>{a.body}</p>
                <Link href={a.href} className={s.actionLink}>
                  {a.cta} <ArrowRight size={13} weight="bold" />
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
