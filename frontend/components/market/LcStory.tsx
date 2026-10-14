'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'

/** Story and motion building blocks shared by the app pages (markets, portfolio, liquidations, analytics). */

const EASE = [0.16, 1, 0.3, 1] as const

/** Counts up from zero to `value` the first time it scrolls into view. */
export function CountUp({ value, format, duration = 1.1, style }: {
  value: number
  format: (n: number) => string
  duration?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setN(v),
      onComplete: () => { from.current = value },
    })
    return () => controls.stop()
  }, [inView, value, duration, reduce])

  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{format(reduce ? value : n)}</span>
}

/** Rows that fade and rise in one after another. Use inside a tbody. */
export function LcRow({ index, children, onClick, className, style, selected }: {
  index: number
  children: ReactNode
  onClick?: () => void
  className?: string
  style?: CSSProperties
  selected?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <motion.tr
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 12) * 0.05, ease: EASE }}
      onClick={onClick}
      className={className}
      data-selected={selected ? 'true' : undefined}
      style={style}
    >
      {children}
    </motion.tr>
  )
}

/**
 * Dark forest band for the story moments on app pages. Faint grid lines and a soft glow
 * echo the home page band without competing with the data around it.
 */
export function LcStoryBand({ eyebrow, title, body, aside, children }: {
  eyebrow?: string
  title: ReactNode
  body?: ReactNode
  aside?: ReactNode
  children?: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      className="lc-dark-card lc-story"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(28px, 4vw, 44px)' }}
    >
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        maskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 85% 20%, black 0%, transparent 70%)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', width: 360, height: 360, right: -120, top: -160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,180,150,0.18), transparent 65%)', pointerEvents: 'none',
      }} />
      <div className="lc-story-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: aside ? 'minmax(0, 1.1fr) minmax(0, 1fr)' : '1fr', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'center' }}>
        <div>
          {eyebrow && (
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9FD3B4', marginBottom: 14 }}>
              {eyebrow}
            </div>
          )}
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15, color: '#FFFFFF', marginBottom: body ? 14 : 0 }}>
            {title}
          </h2>
          {body && <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--band-muted)', maxWidth: 560 }}>{body}</div>}
          {children}
        </div>
        {aside && <div>{aside}</div>}
      </div>
      <style jsx global>{`
        @media (max-width: 860px) {
          .lc-story-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.section>
  )
}

/** Numbered step on a dark band, used for short sequences like "spot, repay, collect". */
export function LcBandStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="lc-dark-inset" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span className="lc-step-num" style={{ flexShrink: 0 }}>{n}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--band-muted)' }}>{body}</div>
      </div>
    </div>
  )
}

/** Light helper card with an icon tile, lifts slightly on hover. */
export function LcHelpCard({ icon, title, children, tone = 'default' }: {
  icon: ReactNode
  title: string
  children: ReactNode
  tone?: 'default' | 'positive' | 'warning' | 'danger'
}) {
  const tint = tone === 'positive' ? { background: 'var(--positive-dim)', color: 'var(--positive)' }
    : tone === 'warning' ? { background: 'var(--warning-dim)', color: 'var(--warning)' }
      : tone === 'danger' ? { background: 'var(--danger-dim)', color: 'var(--danger)' }
        : undefined
  return (
    <div className="lc-card lc-help-card" style={{ padding: 22, height: '100%' }}>
      <span className="lc-icon-tile" style={{ marginBottom: 14, ...tint }}>{icon}</span>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-3)' }}>{children}</div>
      <style jsx global>{`
        .lc-help-card { transition: transform 200ms var(--ease-expo), box-shadow 200ms ease, border-color 200ms ease; }
        .lc-help-card:hover { transform: translateY(-3px); border-color: var(--border-strong); box-shadow: 0 10px 28px -16px rgba(16,43,39,0.35); }
        @media (prefers-reduced-motion: reduce) { .lc-help-card:hover { transform: none; } }
      `}</style>
    </div>
  )
}

/** Section heading used between blocks on app pages. */
export function LcSectionHead({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div style={{ marginBottom: 20, maxWidth: 640 }}>
      {eyebrow && <div className="lc-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)', marginBottom: body ? 6 : 0 }}>{title}</h2>
      {body && <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-3)' }}>{body}</p>}
    </div>
  )
}
