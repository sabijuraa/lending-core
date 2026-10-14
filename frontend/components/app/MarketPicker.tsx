'use client'
import type { MarketView } from '@/providers/types'
import { TokenPair } from '@/components/ui/TokenLogo'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { formatUSD, formatPercent } from '@/lib/formatting'
import { Stagger, StaggerItem } from '@/components/ui/Reveal'
import s from './app.module.css'

/** Selectable list of markets, showing the rate that matters for the current flow. */
export function MarketPicker({ markets, selected, onSelect, side }: {
  markets: MarketView[]
  selected: string | undefined
  onSelect: (slug: string) => void
  side: 'supply' | 'borrow'
}) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className={s.marketRow} style={{ cursor: 'default', background: 'transparent', border: 'none', padding: '0 18px', fontSize: 12, color: 'var(--text-3)' }} aria-hidden>
        <span>Market</span>
        <span>{side === 'supply' ? 'Supply APY' : 'Borrow APY'}</span>
        <span className={s.hideSm}>{side === 'supply' ? 'Liquidity' : 'Max LTV'}</span>
        <span className={s.hideSm}>Utilization</span>
      </div>
      <Stagger style={{ display: 'grid', gap: 10 }}>
        {markets.map((m) => {
          const active = m.slug === selected
          const util = m.totalSupplied > 0 ? m.totalBorrowed / m.totalSupplied : 0
          return (
            <StaggerItem key={m.slug}>
              <button type="button" onClick={() => onSelect(m.slug)} aria-pressed={active}
                className={`${s.marketRow} ${active ? s.marketRowActive : ''}`}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={28} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{m.collateralSymbol} / {m.loanSymbol}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)' }}>
                      {side === 'supply' ? `Lend ${m.loanSymbol}` : `Post ${m.collateralSymbol}`}
                    </span>
                  </span>
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: side === 'supply' ? 'var(--positive)' : 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatPercent(side === 'supply' ? m.supplyAPY : m.borrowAPY, 2)}
                </span>
                <span className={s.hideSm} style={{ fontSize: 14, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                  {side === 'supply' ? formatUSD(Math.max(0, m.totalSupplied - m.totalBorrowed), true) : formatPercent(m.lltv * 100, 0)}
                </span>
                <span className={s.hideSm}><UtilizationBar utilization={util} height={5} showLabel={false} /></span>
              </button>
            </StaggerItem>
          )
        })}
      </Stagger>
    </div>
  )
}
