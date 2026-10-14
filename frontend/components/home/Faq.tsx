'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from '@phosphor-icons/react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import s from './home.module.css'

const FAQS = [
  {
    q: 'What is lending-core?',
    a: 'A lending app where every market is its own self contained pool. You can supply assets to earn interest or borrow against crypto you hold, and each market carries only its own risk.',
  },
  {
    q: 'How do I earn interest?',
    a: 'Supply the loan asset, usually a stablecoin, to a market. Borrowers pay interest into that market and it flows to suppliers automatically. There is nothing to claim.',
  },
  {
    q: 'What happens if the price of my collateral falls?',
    a: 'Your health factor goes down. If it drops below one, anyone can repay your loan and claim your collateral at a discount. Adding collateral or repaying part of the loan keeps you safe.',
  },
  {
    q: 'Why does isolation matter for me?',
    a: 'Because a failure in a market you never used cannot reach your money. Each market has its own price source and its own limits, so you only take the risk you chose.',
  },
  {
    q: 'Is it live with real funds?',
    a: 'Not yet. lending-core runs on the Base Sepolia test network with test tokens, and the contracts have not been externally audited. Treat everything here as a preview.',
  },
  {
    q: 'Who controls the protocol?',
    a: 'No one can change a market once it is created. There is no admin key, no upgrade switch and no protocol fee. The rules you see are the rules that run.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className={s.blockAlt}>
      <div className="section-container">
        <div className={s.faqGrid}>
          <Reveal from="left">
            <p className={s.eyebrow}>Questions</p>
            <h2 className={s.blockTitle}>The short answers.</h2>
            <p className={s.blockSub}>Everything a first time user tends to ask. The docs go deeper when you are ready.</p>
          </Reveal>

          <Stagger className={s.faqList}>
            {FAQS.map((f, i) => {
              const isOpen = open === i
              return (
                <StaggerItem key={f.q} className={s.faqItem}>
                  <button className={s.faqQ} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                    {f.q}
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className={s.faqIcon}>
                      <Plus size={16} weight="bold" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className={s.faqA}>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
