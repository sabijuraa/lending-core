'use client'
import { useState } from 'react'
import { ShieldCheck, Gauge, Lightning } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import type { PositionView } from '@/providers/types'
import { LoadingBlock, ErrorBlock } from '@/components/ui/States'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'
import { AppHeader, DemoBanner, panel } from '@/components/app/AppUi'
import { MarketPicker } from '@/components/app/MarketPicker'
import { BorrowPanel } from '@/components/app/BorrowPanel'
import s from '@/components/app/app.module.css'

const TIPS = [
  { icon: <ShieldCheck size={20} />, title: 'Your collateral stays yours', body: 'It sits in the market and is only touched if your position becomes unsafe. Repay and it is free to withdraw.' },
  { icon: <Gauge size={20} />, title: 'Watch your health factor', body: 'It compares what your collateral is worth to what you owe. Above 1 you are safe. Below 1 you can be liquidated.' },
  { icon: <Lightning size={20} />, title: 'Rates move with demand', body: 'When a market is busy the borrow rate climbs quickly. That pulls in new lenders and nudges borrowers to repay.' },
]

export default function BorrowPage() {
  const data = useData()
  const { account } = useAccountId()
  const markets = useAsync(() => data.getMarkets(), [data])
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([] as PositionView[])), [account, data])
  const [picked, setPicked] = useState<string | undefined>()
  const list = markets.data ?? []
  const current = list.find((m) => m.slug === picked) ?? list[0]
  const pos = positions.data?.find((p) => p.slug === current?.slug)

  return (
    <div className={s.page}>
      <div className="section-container">
        <AppHeader eyebrow="Borrow" title="Borrow without selling"
          subtitle="Keep your crypto and unlock USDC against it. Pick the collateral you hold, add it, and borrow up to the market limit." />
        <DemoBanner />
        {markets.loading && <LoadingBlock rows={4} />}
        {markets.error && <ErrorBlock message={markets.error} onRetry={markets.reload} />}
        {current && (
          <div className={s.split}>
            <Reveal>
              <h2 className="lc-section-title" style={{ marginBottom: 14 }}>Choose your collateral</h2>
              <MarketPicker markets={list} selected={current.slug} onSelect={setPicked} side="borrow" />
            </Reveal>
            <Reveal delay={0.1} className={s.sticky}>
              <BorrowPanel key={current.slug} m={current} pos={pos} onChanged={() => { markets.reload(); positions.reload() }} />
            </Reveal>
          </div>
        )}

        <Reveal style={{ marginTop: 64 }}>
          <h2 className="lc-section-title" style={{ marginBottom: 16 }}>Before you borrow</h2>
        </Reveal>
        <Stagger className={s.grid3}>
          {TIPS.map((h) => (
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
    </div>
  )
}
