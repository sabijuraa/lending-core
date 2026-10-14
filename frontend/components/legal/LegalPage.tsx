'use client'
import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, ArrowUpRight, CheckCircle, GithubLogo, Info, Warning } from '@phosphor-icons/react'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import styles from './legal.module.css'

export type LegalSection = {
  id: string
  title: string
  body: ReactNode
}

const RELATED = [
  { href: '/terms', label: 'Terms of use' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/risk', label: 'Risk disclosure' },
]

export function Callout({ tone = 'risk', title, children }: { tone?: 'risk' | 'info'; title: string; children: ReactNode }) {
  const Icon = tone === 'risk' ? Warning : Info
  return (
    <div className={`${styles.callout} ${tone === 'risk' ? styles.calloutRisk : styles.calloutInfo}`}>
      <Icon size={18} weight="bold" className={styles.calloutIcon} />
      <div>
        <div className={styles.calloutTitle}>{title}</div>
        <div className={styles.calloutBody}>{children}</div>
      </div>
    </div>
  )
}

export function LegalPage({
  eyebrow = 'Legal',
  title,
  intro,
  updated,
  readMinutes,
  summary,
  sections,
  current,
}: {
  eyebrow?: string
  title: string
  intro: string
  updated: string
  readMinutes: number
  summary: string[]
  sections: LegalSection[]
  current: string
}) {
  const [active, setActive] = useState(sections[0]?.id)
  const [showTop, setShowTop] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -60% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [sections])

  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior })
    history.replaceState(null, '', `#${id}`)
    setActive(id)
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className="section-container">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.intro}>{intro}</p>
            <div className={styles.meta}>
              <span>Last updated {updated}</span>
              <span className={styles.metaDot} aria-hidden />
              <span>{readMinutes} min read</span>
            </div>
            <nav className={styles.related} aria-label="Policies">
              {RELATED.map((r) => (
                <Link key={r.href} href={r.href} className={styles.relatedLink} data-active={r.href === current}>
                  {r.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </div>
      </section>

      <div className={`section-container ${styles.body}`}>
        <Reveal>
          <div className={styles.summary}>
            <div className={styles.summaryHead}>
              <span className={styles.summaryLabel}>The short version</span>
              <p className={styles.summaryNote}>The full text below is what counts. This is the gist in plain words.</p>
            </div>
            <Stagger className={styles.summaryList}>
              {summary.map((line) => (
                <StaggerItem key={line} className={styles.summaryItem}>
                  <CheckCircle size={18} weight="fill" className={styles.summaryCheck} />
                  <span>{line}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>

        <div className={styles.layout}>
          <aside className={styles.toc}>
            <div className={styles.tocInner}>
              <div className={styles.tocLabel}>On this page</div>
              <ol className={styles.tocList}>
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} onClick={jump(s.id)} className={styles.tocLink} data-active={active === s.id}>
                      <span className={styles.tocNum}>{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className={styles.sections}>
            {sections.map((s, i) => (
              <Reveal key={s.id}>
                <section id={s.id} className={styles.section}>
                  <div className={styles.sectionNum}>{String(i + 1).padStart(2, '0')}</div>
                  <div className={styles.sectionMain}>
                    <h2 className={styles.sectionTitle}>{s.title}</h2>
                    <div className={styles.prose}>{s.body}</div>
                  </div>
                </section>
              </Reveal>
            ))}

            <Reveal>
              <div className={styles.contact}>
                <div>
                  <div className={styles.contactTitle}>Still have questions?</div>
                  <p className={styles.contactText}>
                    Open an issue on GitHub and ask in public. Answers there help the next person too.
                  </p>
                </div>
                <a
                  href="https://github.com/sabijuraa/lending-core/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactBtn}
                >
                  <GithubLogo size={16} weight="bold" />
                  Ask on GitHub
                  <ArrowUpRight size={14} weight="bold" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.toTop}
        data-show={showTop}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior })}
      >
        <ArrowUp size={16} weight="bold" />
      </button>
    </div>
  )
}
