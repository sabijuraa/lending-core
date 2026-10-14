'use client'
import { useParams } from 'next/navigation'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { Reveal } from '@/components/ui/Reveal'
import { AppHeader, DemoBanner, FactsCard, StepsCard, panel } from '@/components/app/AppUi'
import { SupplyPanel } from '@/components/app/SupplyPanel'
import { formatUSD, formatPercent } from '@/lib/formatting'
import s from '@/components/app/app.module.css'

export default function SupplyPage() {
  const { asset } = useParams<{ asset: string }>()
  const data = useData()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const m = market.data

  return (
    <div className={s.page}>
      <div className="section-container">
        {market.loading && <LoadingBlock />}
        {market.error && <ErrorBlock message={market.error} onRetry={market.reload} />}
        {!market.loading && !market.error && !m && <EmptyBlock title="Market not found" body="Pick a market from the list." href="/earn" cta="See where to lend" />}
        {m && (
          <>
            <AppHeader back={{ href: `/markets/${m.slug}`, label: `${m.collateralSymbol} / ${m.loanSymbol} market` }} eyebrow="Supply"
              title={`Lend ${m.loanSymbol} against ${m.collateralSymbol}`}
              subtitle={`Earn ${formatPercent(m.supplyAPY, 2)} today from borrowers who post ${m.collateralSymbol}. Withdraw whenever there is free liquidity.`} />
            <DemoBanner />
            <div className={`${s.split} ${s.splitWide}`}>
              <div style={{ display: 'grid', gap: 16 }}>
                <Reveal>
                  <div style={{ ...panel, padding: 22 }}>
                    <h2 className="lc-section-title" style={{ fontSize: 15, marginBottom: 14 }}>How busy this market is</h2>
                    <UtilizationBar utilization={m.totalSupplied > 0 ? m.totalBorrowed / m.totalSupplied : 0} height={8} />
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)', margin: '14px 0 0' }}>
                      The more of the pool is borrowed, the more you earn. Past the marker the rate rises steeply, which brings in lenders and frees up liquidity.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={0.05}>
                  <FactsCard title="Market at a glance" rows={[
                    { label: 'Supply APY', value: formatPercent(m.supplyAPY, 2) },
                    { label: 'Total supplied', value: formatUSD(m.totalSupplied) },
                    { label: 'Free liquidity', value: formatUSD(Math.max(0, m.totalSupplied - m.totalBorrowed)) },
                    { label: 'Collateral accepted', value: m.collateralSymbol },
                    { label: 'Borrowers can use up to', value: `${formatPercent(m.lltv * 100, 0)} of collateral value` },
                  ]} />
                </Reveal>
                <Reveal delay={0.1}>
                  <StepsCard title="What happens when you supply" steps={[
                    { title: 'Approve and confirm', body: 'Your wallet asks you to approve the transfer, then to confirm the supply.' },
                    { title: 'Start earning right away', body: 'Interest accrues every block and your balance grows on its own.' },
                    { title: 'Withdraw when you like', body: 'Take out your funds and earnings from the dashboard at any time.' },
                  ]} />
                </Reveal>
              </div>
              <Reveal delay={0.1} className={s.sticky}>
                <SupplyPanel m={m} onChanged={market.reload} />
              </Reveal>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
