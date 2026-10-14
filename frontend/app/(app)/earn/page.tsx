'use client'
import { useState } from 'react'
import { Coins, ArrowsClockwise, HandCoins } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { LoadingBlock, ErrorBlock } from '@/components/ui/States'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { AppHeader, panel } from '@/components/app/AppUi'
import { MarketPicker } from '@/components/app/MarketPicker'
import { SupplyPanel } from '@/components/app/SupplyPanel'
import s from '@/components/app/app.module.css'

const HOW = [
  { icon: <Coins size={20} />, title: 'Pick a market', body: 'Each market lends one asset against one kind of collateral. Choose the collateral you are comfortable lending against.' },
  { icon: <ArrowsClockwise size={20} />, title: 'Earn every block', body: 'Borrowers pay interest into the market and your share grows with it. There is nothing to claim or restake.' },
  { icon: <HandCoins size={20} />, title: 'Withdraw any time', body: 'Take your funds out whenever there is free liquidity. When a market is busy, liquidity returns as borrowers repay.' },
]

export default function EarnPage() {
  const data = useData()
  const markets = useAsync(() => data.getMarkets(), [data])
  const [picked, setPicked] = useState<string | undefined>()
  const list = [...(markets.data ?? [])].sort((a, b) => b.supplyAPY - a.supplyAPY)
  const current = list.find((m) => m.slug === picked) ?? list[0]

  return (
    <div className={s.page}>
      <AppHeader title="Put your USDC to work"
        subtitle="Lend to borrowers in the market of your choice and earn interest every block. Your funds only back the collateral you pick." />
      {markets.loading && <LoadingBlock rows={4} />}
      {markets.error && <ErrorBlock message={markets.error} onRetry={markets.reload} />}
      {current && (
        <div className={s.split}>
          <Reveal>
            <h2 className="lc-section-title" style={{ marginBottom: 14 }}>Choose where to lend</h2>
            <MarketPicker markets={list} selected={current.slug} onSelect={setPicked} side="supply" />
          </Reveal>
          <Reveal delay={0.1} className={s.sticky}>
            <SupplyPanel key={current.slug} m={current} onChanged={markets.reload} />
          </Reveal>
        </div>
      )}

      <Reveal style={{ marginTop: 64 }}>
        <h2 className="lc-section-title" style={{ marginBottom: 16 }}>How earning works</h2>
      </Reveal>
      <Stagger className={s.grid3}>
        {HOW.map((h) => (
          <StaggerItem key={h.title}>
            <div style={{ ...panel, padding: 22, height: '100%' }}>
              <span className="lc-icon-tile" style={{ marginBottom: 14 }}>{h.icon}</span>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{h.title}</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)', margin: 0 }}>{h.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
