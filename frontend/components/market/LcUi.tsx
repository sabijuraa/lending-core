'use client'
import type { CSSProperties, ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { getOracleStatus } from '@/lib/formatting'

/** Shared building blocks for the markets, market detail and portfolio pages. */

export const lcPanel: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--r-lg)',
}

export const lcTh: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-3)',
  textAlign: 'left',
  padding: '12px 16px',
  background: 'var(--surface-2)',
  borderBottom: '1px solid var(--border-subtle)',
  whiteSpace: 'nowrap',
}

export const lcTd: CSSProperties = {
  padding: '16px',
  borderBottom: '1px solid var(--border-subtle)',
  fontSize: 14,
  color: 'var(--text-1)',
  verticalAlign: 'middle',
  fontVariantNumeric: 'tabular-nums',
}

export function LcCardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{children}</h2>
      {right}
    </div>
  )
}

type Tone = 'positive' | 'warning' | 'danger' | 'neutral'

const TONES: Record<Tone, CSSProperties> = {
  positive: { background: 'var(--positive-dim)', color: 'var(--positive)' },
  warning: { background: 'var(--warning-dim)', color: 'var(--warning)' },
  danger: { background: 'var(--danger-dim)', color: 'var(--danger)' },
  neutral: { background: 'var(--surface-2)', color: 'var(--text-3)' },
}

export function LcPill({ tone = 'positive', small, children }: { tone?: Tone; small?: boolean; children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: small ? 10 : 12,
      fontWeight: 500,
      lineHeight: 1,
      padding: small ? '3px 7px' : '5px 11px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
      ...TONES[tone],
    }}>
      {children}
    </span>
  )
}

/** Market status follows the oracle, a stale price pauses new borrows in practice. */
export function marketStatus(lastUpdate: number, maxStaleness: number): { label: string; tone: Tone; oracle: string } {
  const s = getOracleStatus(lastUpdate, maxStaleness)
  if (s === 'fresh') return { label: 'Active', tone: 'positive', oracle: 'Fresh' }
  if (s === 'warning') return { label: 'Active', tone: 'warning', oracle: 'Aging' }
  return { label: 'Paused', tone: 'danger', oracle: 'Stale' }
}

export function LcOracle({ lastUpdate, maxStaleness }: { lastUpdate: number; maxStaleness: number }) {
  const st = marketStatus(lastUpdate, maxStaleness)
  const color = st.oracle === 'Fresh' ? 'var(--positive)' : st.oracle === 'Aging' ? 'var(--warning)' : 'var(--danger)'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-2)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {st.oracle}
    </span>
  )
}

export function LcSelect<T extends string>({ value, onChange, options, label, minWidth = 128 }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  label: string
  minWidth?: number
}) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          minWidth,
          height: 38,
          padding: '0 32px 0 12px',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-2)',
          background: 'var(--surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-sm)',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <CaretDown size={12} style={{ position: 'absolute', right: 11, top: 13, color: 'var(--text-3)', pointerEvents: 'none' }} />
    </span>
  )
}

export function LcFootnote({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)',
      fontSize: 12,
      color: 'var(--text-3)',
    }}>
      {icon}
      <span>{children}</span>
    </div>
  )
}
