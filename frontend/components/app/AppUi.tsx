'use client'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useReadContract } from 'wagmi'
import { formatUnits, type Address } from 'viem'
import { ArrowLeft } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { ADDRESSES, isDeployed } from '@/lib/addresses'
import TestTokenAbi from '@/lib/abi/TestToken.json'
import { getHealthStatus } from '@/lib/formatting'
import { Reveal } from '@/components/ui/Reveal'

/** Shared building blocks for the dashboard, earn, borrow and supply flows. */

export const panel: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--r-lg)',
}

const erc20 = TestTokenAbi as never

/** Wallet USDC balance on Base Sepolia, null when it cannot be read (demo mode or no wallet). */
export function useWalletUsdc(account: string | null) {
  const data = useData()
  const read = useReadContract({
    address: ADDRESSES.USDC as Address,
    abi: erc20,
    functionName: 'balanceOf',
    args: [account as Address],
    query: { enabled: isDeployed && data.source === 'chain' && !!account && account.startsWith('0x') },
  })
  const raw: unknown = (read as { data?: unknown }).data
  return typeof raw === 'bigint' ? Number(formatUnits(raw, 6)) : null
}

export function AppHeader({ eyebrow, title, subtitle, back, right }: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  back?: { href: string; label: string }
  right?: ReactNode
}) {
  return (
    <Reveal style={{ marginBottom: 28 }}>
      {back && (
        <Link href={back.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', marginBottom: 18, textDecoration: 'none' }}>
          <ArrowLeft size={13} /> {back.label}
        </Link>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          {eyebrow && <div className="lc-eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</div>}
          <h1 className="page-heading" style={{ margin: 0 }}>{title}</h1>
          {subtitle && <p className="page-subtitle" style={{ marginTop: 8, maxWidth: 620 }}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </Reveal>
  )
}

/** Segmented control with a sliding active background. */
export function Segmented<T extends string>({ value, onChange, options, id }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  id: string
}) {
  return (
    <div role="tablist" style={{ display: 'flex', padding: 4, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button key={o.value} role="tab" aria-selected={active} onClick={() => onChange(o.value)}
            style={{ position: 'relative', flex: 1, padding: '9px 12px', fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--text-1)' : 'var(--text-3)', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>
            {active && (
              <motion.span layoutId={`seg-${id}`} transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 7, boxShadow: '0 1px 2px rgba(16,43,39,0.08), 0 0 0 1px var(--border-subtle)' }} />
            )}
            <span style={{ position: 'relative' }}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Amount input with token label, max shortcut and percent chips. */
export function AmountField({ label, symbol, value, onChange, max, maxLabel, id }: {
  label: string
  symbol: string
  value: string
  onChange: (v: string) => void
  max: number | null
  maxLabel: string
  id: string
}) {
  const fill = (pct: number) => {
    if (max === null || max <= 0) return
    const v = (max * pct) / 100
    onChange(String(Math.floor(v * 1e6) / 1e6))
  }
  const disabled = max === null || max <= 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <label htmlFor={id} className="lc-label">{label}</label>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {maxLabel} {max === null ? 'not available' : max.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 4px 14px', border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--surface)' }}
        className="lc-amount">
        <input id={id} inputMode="decimal" autoComplete="off" value={value} placeholder="0.00"
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 24, fontWeight: 500, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums', padding: '8px 0', fontFamily: 'inherit' }} />
        <button type="button" onClick={() => fill(100)} disabled={disabled}
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: disabled ? 'var(--text-4)' : 'var(--accent)', background: 'transparent', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: '4px 6px', fontFamily: 'inherit' }}>
          MAX
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>{symbol}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[25, 50, 75, 100].map((p) => (
          <button key={p} type="button" onClick={() => fill(p)} disabled={disabled} className="lc-chip"
            style={{ padding: '6px 0', fontSize: 12, fontWeight: 500, color: disabled ? 'var(--text-4)' : 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border-default)', borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'border-color 150ms ease, color 150ms ease' }}>
            {p}%
          </button>
        ))}
      </div>
    </div>
  )
}

export function SummaryRows({ rows }: { rows: { label: string; value: ReactNode; tone?: 'danger' | 'warning' | 'positive' }[] }) {
  return (
    <dl style={{ display: 'grid', gap: 10, margin: 0, padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
          <dt style={{ color: 'var(--text-3)' }}>{r.label}</dt>
          <dd style={{ margin: 0, fontWeight: 500, fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: r.tone ? `var(--${r.tone})` : 'var(--text-1)' }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function hfLabel(v: number) {
  return Number.isFinite(v) ? v.toFixed(2) : 'No debt'
}

export function hfTone(v: number): 'positive' | 'warning' | 'danger' {
  const s = getHealthStatus(v)
  return s === 'safe' ? 'positive' : s === 'warning' ? 'warning' : 'danger'
}

/** Numbered "what happens next" list used beside each flow. */
export function StepsCard({ title, steps }: { title: string; steps: { title: string; body: string }[] }) {
  return (
    <div style={{ ...panel, padding: 22 }}>
      <h2 className="lc-section-title" style={{ fontSize: 15, marginBottom: 16 }}>{title}</h2>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 16 }}>
        {steps.map((s, i) => (
          <li key={s.title} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'var(--accent-tint)' }}>{i + 1}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{s.title}</div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-3)', margin: 0 }}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function FactsCard({ title, rows }: { title: string; rows: { label: string; value: ReactNode }[] }) {
  return (
    <div style={{ ...panel, padding: 22 }}>
      <h2 className="lc-section-title" style={{ fontSize: 15, marginBottom: 14 }}>{title}</h2>
      <dl style={{ margin: 0, display: 'grid' }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none', fontSize: 13 }}>
            <dt style={{ color: 'var(--text-3)' }}>{r.label}</dt>
            <dd style={{ margin: 0, fontWeight: 500, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function DemoBanner() {
  const data = useData()
  if (data.source === 'chain') return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 24, fontSize: 13, color: 'var(--text-2)', background: 'var(--accent-tint)', border: '1px solid var(--accent-border)', borderRadius: 10 }}>
      <span className="lc-dot" style={{ color: 'var(--positive)' }} />
      You are using a demo account. Balances are illustrative and reset when you reload, so feel free to try every flow.
    </div>
  )
}
