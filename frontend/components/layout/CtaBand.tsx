'use client'
import Link from 'next/link'
import { ArrowRight, GithubLogo, BookOpen, ChatCircleDots } from '@phosphor-icons/react'
import { Reveal } from '@/components/ui/Reveal'
import s from './cta-band.module.css'

const REPO = 'https://github.com/sabijuraa/lending-core'

/** Dark pre footer band with a closing call to action and real ways to reach the team. */
export function CtaBand({
  title = 'Lend with confidence. Borrow without contagion.',
  body = 'Every market stands on its own, so the risk you take is the risk you chose. Try it on the Base Sepolia testnet with test tokens.',
}: {
  title?: string
  body?: string
}) {
  return (
    <section className={s.band}>
      <div className={s.mark} aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <div className={`section-container ${s.inner}`}>
        <Reveal from="left">
          <h2 className={s.title}>{title}</h2>
          <p className={s.body}>{body}</p>
          <div className={s.buttons}>
            <Link href="/dashboard" className={s.primary}>
              Launch app <ArrowRight size={14} weight="bold" />
            </Link>
            <Link href="/how-it-works" className={s.secondary}>
              How it works
            </Link>
          </div>
        </Reveal>

        <Reveal from="right" delay={0.12} className={s.card}>
          <h3 className={s.cardTitle}>Get in touch</h3>
          <p className={s.cardBody}>
            Questions, ideas or a bug to report? lending-core is built in the open, so the conversation happens there too.
          </p>
          <div className={s.links}>
            <a href={`${REPO}/issues/new`} target="_blank" rel="noopener noreferrer" className={s.link}>
              <ChatCircleDots size={18} weight="duotone" />
              <span>
                <strong>Open an issue</strong>
                <em>Report a bug or suggest a feature</em>
              </span>
              <ArrowRight size={13} className={s.linkArrow} />
            </a>
            <Link href="/docs" className={s.link}>
              <BookOpen size={18} weight="duotone" />
              <span>
                <strong>Read the docs</strong>
                <em>Guides for savers, borrowers and builders</em>
              </span>
              <ArrowRight size={13} className={s.linkArrow} />
            </Link>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className={s.link}>
              <GithubLogo size={18} weight="duotone" />
              <span>
                <strong>Browse the source</strong>
                <em>Every contract, test and decision</em>
              </span>
              <ArrowRight size={13} className={s.linkArrow} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
