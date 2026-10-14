'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

export const DARK = '#102B27'
export const DARK_2 = '#0B201C'

/* ─── Underline tabs ─────────────────────────────────────── */

export function UnderlineTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 28,
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 32,
        overflowX: 'auto',
      }}
    >
      {tabs.map(tab => {
        const on = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: on ? 600 : 500,
              color: on ? 'var(--accent)' : 'var(--text-3)',
              padding: '0 0 12px',
              position: 'relative',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease',
            }}
          >
            {tab.label}
            {on && (
              <motion.span
                layoutId="learn-tab-underline"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -1,
                  height: 2,
                  borderRadius: 2,
                  background: 'var(--accent)',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Icon tile ──────────────────────────────────────────── */

export function IconTile({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: dark ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border-default)',
        background: dark ? 'rgba(255,255,255,0.06)' : 'var(--surface-2)',
        color: dark ? '#DDE8D9' : 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

/* ─── White topic card ───────────────────────────────────── */

export function TopicCard({
  icon,
  title,
  desc,
  href,
  onClick,
}: {
  icon: ReactNode
  title: string
  desc: string
  href?: string
  onClick?: () => void
}) {
  const body = (
    <>
      <IconTile>{icon}</IconTile>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', margin: '20px 0 8px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{desc}</p>
      <span
        className="topic-card-more"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}
      >
        Read more
      </span>
    </>
  )
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    textDecoration: 'none',
    color: 'inherit',
    padding: 24,
    background: 'var(--surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
    width: '100%',
    font: 'inherit',
  }
  if (href) {
    return <Link href={href} className="topic-card" style={style}>{body}</Link>
  }
  return <button type="button" onClick={onClick} className="topic-card" style={style}>{body}</button>
}

/* ─── Section card for long form content ─────────────────── */

export function DocSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow?: string
  title: string
  children: ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      id={id}
      className="learn-doc"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
        padding: '28px 28px 12px',
        scrollMarginTop: 96,
      }}
    >
      {eyebrow && (
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 8 }}>
          {eyebrow}
        </div>
      )}
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.015em', marginBottom: 14 }}>
        {title}
      </h3>
      {children}
    </motion.section>
  )
}

/* ─── Dark code block ────────────────────────────────────── */

export function CodeBlock({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'inset' }) {
  return (
    <pre
      style={{
        margin: '0 0 16px',
        background: tone === 'inset' ? 'rgba(0,0,0,0.28)' : DARK_2,
        border: tone === 'inset' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #1C3A34',
        borderRadius: 10,
        padding: '16px 18px',
        fontFamily: 'var(--font-mono)',
        fontSize: tone === 'inset' ? 11.5 : 12.5,
        lineHeight: 1.75,
        color: '#CFE3D8',
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}
    >
      {children}
    </pre>
  )
}

export const K = ({ children }: { children: ReactNode }) => <span style={{ color: '#E5B567' }}>{children}</span>
export const S = ({ children }: { children: ReactNode }) => <span style={{ color: '#9FD3B5' }}>{children}</span>
export const C = ({ children }: { children: ReactNode }) => <span style={{ color: '#6E8F84' }}>{children}</span>

/* ─── Wireframe globe (static SVG, theme green) ──────────── */

export function WireGlobe({ size = 360, opacity = 0.5 }: { size?: number; opacity?: number }) {
  const r = 100
  const lat = [-75, -55, -35, -15, 5, 25, 45, 65]
  const lon = [0, 25, 50, 75, 100, 125, 150, 175]
  const tilt = 0.32
  const q = (v: number) => Math.round(v * 100) / 100
  const nodes: [number, number][] = []
  for (const la of [-60, -30, 0, 30, 60]) {
    for (const lo of [10, 55, 100, 145, 190, 235, 280, 325]) {
      const a = (la * Math.PI) / 180
      const b = (lo * Math.PI) / 180
      const x = r * Math.cos(a) * Math.sin(b)
      const z = r * Math.cos(a) * Math.cos(b)
      const y = r * Math.sin(a) * Math.cos(tilt) - z * Math.sin(tilt)
      const zz = r * Math.sin(a) * Math.sin(tilt) + z * Math.cos(tilt)
      if (zz > -10) nodes.push([Math.round(x * 10) / 10, Math.round(-y * 10) / 10])
    }
  }
  return (
    <svg width={size} height={size} viewBox="-110 -110 220 220" aria-hidden="true" style={{ opacity, display: 'block' }}>
      <g fill="none" stroke="#7FB59B" strokeWidth={0.5}>
        <circle r={r} strokeWidth={0.8} />
        {lat.map(la => {
          const a = (la * Math.PI) / 180
          const ry = r * Math.cos(a) * Math.sin(tilt)
          const rx = r * Math.cos(a)
          const cy = -r * Math.sin(a) * Math.cos(tilt)
          return <ellipse key={la} cx={0} cy={q(cy)} rx={q(rx)} ry={q(Math.abs(ry))} />
        })}
        {lon.map(lo => {
          const b = (lo * Math.PI) / 180
          return <ellipse key={lo} cx={0} cy={0} rx={q(Math.abs(r * Math.sin(b)))} ry={r} transform={`rotate(${q(tilt * 20)})`} />
        })}
        {nodes.map(([x, y], i) => {
          const n = nodes[(i * 7 + 3) % nodes.length]
          return <line key={`l${i}`} x1={x} y1={y} x2={n[0]} y2={n[1]} strokeOpacity={0.35} />
        })}
      </g>
      <g fill="#A9D9C0">
        {nodes.map(([x, y], i) => <circle key={`n${i}`} cx={x} cy={y} r={1.4} />)}
      </g>
    </svg>
  )
}

/* ─── Dark band with four numbered steps ─────────────────── */

export const LENDING_STEPS = ['Deposit collateral', 'Borrow', 'Monitor health factor', 'Repay or liquidate']

export function StepsBand({
  title,
  subtitle,
  linkHref,
  linkLabel,
  steps = LENDING_STEPS,
}: {
  title: string
  subtitle: string
  linkHref?: string
  linkLabel?: string
  steps?: string[]
}) {
  const reduce = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setActiveIndex(i => (i + 1) % steps.length), 2400)
    return () => clearInterval(id)
  }, [reduce, steps.length])

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(120% 140% at 85% 30%, #1A4A3F 0%, ${DARK} 55%, ${DARK_2} 100%)`,
        color: '#FFFFFF',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(28px, 4vw, 48px)',
      }}
    >
      <motion.div
        style={{ position: 'absolute', right: -40, top: -60, pointerEvents: 'none' }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <WireGlobe size={420} opacity={0.45} />
      </motion.div>
      <div style={{ position: 'relative', maxWidth: 520 }}>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 12 }}>
          {title}
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.65 }}>{subtitle}</p>
        {linkHref && (
          <Link
            href={linkHref}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#FFFFFF', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: 2 }}
          >
            {linkLabel ?? 'Learn more'}
          </Link>
        )}
      </div>
      <motion.ol
        className="steps-band-row"
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
        style={{
          position: 'relative',
          listStyle: 'none',
          margin: '36px 0 0',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {steps.map((s, i) => (
          <motion.li
            key={s}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
            onMouseEnter={() => setActiveIndex(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 20px',
              borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                color: '#FFFFFF',
                background: i === activeIndex ? 'rgba(127,181,155,0.25)' : 'rgba(255,255,255,0.08)',
                border: i === activeIndex ? '1.5px solid #7FB59B' : '1px solid rgba(255,255,255,0.22)',
                boxShadow: i === activeIndex ? '0 0 0 6px rgba(127,181,155,0.12)' : 'none',
                transition: 'background 400ms ease, border-color 400ms ease, box-shadow 400ms ease',
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontSize: 13,
                color: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
                lineHeight: 1.35,
                transition: 'color 400ms ease',
              }}
            >
              {s}
            </span>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}

/* ─── Section heading ────────────────────────────────────── */

export function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div style={{ marginBottom: 24, maxWidth: 640 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--positive)', marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 'clamp(22px, 2.6vw, 28px)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)', lineHeight: 1.2 }}>{title}</h2>
      {body && <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65, marginTop: 10 }}>{body}</p>}
    </div>
  )
}

/* ─── Shared styles for long form prose ──────────────────── */

export function LearnStyles() {
  return (
    <style>{`
      .topic-card:hover, .lift-card:hover { border-color: var(--accent-border) !important; box-shadow: 0 10px 28px rgba(16,43,39,0.08); transform: translateY(-3px); }
      .lift-card { transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease; }
      @media (prefers-reduced-motion: reduce) { .topic-card:hover, .lift-card:hover { transform: none; } }
      .topic-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      .learn-doc p { font-size: 14px; color: var(--text-2); line-height: 1.75; margin-bottom: 16px; }
      .learn-doc h4 { font-size: 14px; font-weight: 600; color: var(--text-1); margin: 20px 0 8px; }
      .learn-doc ul, .learn-doc ol { margin: 0 0 16px; padding-left: 20px; color: var(--text-2); font-size: 14px; line-height: 1.75; }
      .learn-doc ul { list-style: disc; }
      .learn-doc ol { list-style: decimal; }
      .learn-doc li { margin-bottom: 6px; }
      .learn-doc code { font-family: var(--font-mono); font-size: 12.5px; background: var(--surface-2); border: 1px solid var(--border-subtle); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
      .learn-doc strong { color: var(--text-1); font-weight: 600; }
      @media (max-width: 900px) {
        .learn-hub-grid { grid-template-columns: 1fr !important; }
        .learn-two-col { grid-template-columns: 1fr !important; }
        .learn-side-nav { display: none !important; }
      }
      @media (max-width: 760px) {
        .steps-band-row { grid-template-columns: 1fr 1fr !important; }
        .steps-band-row li:nth-child(3) { border-left: none !important; }
        .steps-band-row li:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,0.1); }
      }
      @media (max-width: 560px) {
        .learn-card-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  )
}
