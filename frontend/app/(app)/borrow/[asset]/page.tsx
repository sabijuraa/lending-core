'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useData } from '@/providers/provider'
import { healthFactor } from '@/providers/types'
import { useAsync } from '@/lib/use-async'
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States'
import { LcHealthArc } from '@/components/portfolio/LcHealthArc'
import { Reveal } from '@/components/ui/Reveal'
import { AppHeader, FactsCard, StepsCard, panel, useWallet } from '@/components/app/AppUi'
import { BorrowPanel } from '@/components/app/BorrowPanel'
import { formatUSD, formatPercent } from '@/lib/formatting'
import s from '@/components/app/app.module.css'

export default function BorrowAssetPage() {
  const { asset } = useParams<{ asset: string }>()
  const tabParam = useSearchParams().get('tab')
  const initialTab = tabParam === 'repay' || tabParam === 'collateral' ? tabParam : 'borrow'
  const data = useData()
  const account = useWallet()
  const market = useAsync(() => data.getMarket(asset), [asset, data])
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([])), [account, data])
  const m = market.data
  const pos = positions.data?.find((p) => p.slug === asset)
  const hf = m ? healthFactor(pos?.collateral ?? 0, m.oraclePrice, m.lltv, pos?.borrowed ?? 0) : Infinity

  function refresh() { market.reload(); positions.reload() }

  return (
    <div className={s.page}>
      {market.loading && <LoadingBlock />}
      {market.error && <ErrorBlock message={market.error} onRetry={market.reload} />}
      {!market.loading && !market.error && !m && <EmptyBlock title="Market not found" body="Pick a market from the list." href="/borrow" cta="See where to borrow" />}
      {m && (
        <>
          <AppHeader back={{ href: `/markets/${m.slug}`, label: `${m.collateralSymbol} / ${m.loanSymbol} market` }}
            title={`Borrow ${m.loanSymbol} against ${m.collateralSymbol}`}
            subtitle={`Add ${m.collateralSymbol} and borrow up to ${formatPercent(m.lltv * 100, 0)} of its value at ${formatPercent(m.borrowAPY, 2)} APY. You keep the upside of your ${m.collateralSymbol}.`} />
          <div className={`${s.split} ${s.splitWide}`}>
            <div style={{ display: 'grid', gap: 16 }}>
              <Reveal>
                <div style={{ ...panel, padding: 22 }} className={s.hfCard}>
                  <LcHealthArc value={hf} />
                  <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
                    <h2 className="lc-section-title" style={{ fontSize: 15, margin: 0 }}>Your position here</h2>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
                      Collateral <strong style={{ color: 'var(--text-1)' }}>{(pos?.collateral ?? 0).toLocaleString()} {m.collateralSymbol}</strong>
                      <span style={{ color: 'var(--text-4)' }}> ({formatUSD((pos?.collateral ?? 0) * m.oraclePrice)})</span><br />
                      Borrowed <strong style={{ color: 'var(--text-1)' }}>{formatUSD(pos?.borrowed ?? 0)}</strong>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)', margin: 0 }}>
                      {(pos?.borrowed ?? 0) > 0 ? 'Keep your health factor well above 1. Add collateral or repay if it starts to slide.' : account ? 'You have no debt here yet, so nothing can be liquidated.' : 'Connect your wallet to see your position in this market.'}
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <FactsCard title="Market at a glance" rows={[
                  { label: 'Borrow APY', value: formatPercent(m.borrowAPY, 2) },
                  { label: `${m.collateralSymbol} price`, value: formatUSD(m.oraclePrice) },
                  { label: 'Max loan to value', value: formatPercent(m.lltv * 100, 0) },
                  { label: 'Liquidation bonus', value: formatPercent(m.liquidationBonus * 100, 0) },
                  { label: 'Available to borrow', value: formatUSD(Math.max(0, m.totalSupplied - m.totalBorrowed)) },
                ]} />
              </Reveal>
              <Reveal delay={0.1}>
                <StepsCard title="How borrowing works" steps={[
                  { title: `Add ${m.collateralSymbol}`, body: 'Your collateral sets how much you can borrow. More collateral means more room.' },
                  { title: `Borrow ${m.loanSymbol}`, body: 'Funds arrive in your wallet. Interest starts accruing on what you owe.' },
                  { title: 'Repay on your schedule', body: 'There is no fixed term. Repay any time to lower your debt and free your collateral.' },
                ]} />
              </Reveal>
            </div>
            <Reveal delay={0.1} className={s.sticky}>
              <BorrowPanel m={m} pos={pos} onChanged={refresh} initialTab={initialTab} initialColMode={tabParam === 'collateral' && (pos?.collateral ?? 0) > 0 ? 'withdraw' : 'add'} />
            </Reveal>
          </div>
        </>
      )}
    </div>
  )
}
