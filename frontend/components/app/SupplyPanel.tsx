'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useData } from '@/providers/provider'
import type { MarketView } from '@/providers/types'
import { useAsync } from '@/lib/use-async'
import { TokenPair } from '@/components/ui/TokenLogo'
import { formatUSD, formatPercent } from '@/lib/formatting'
import { AmountField, ConnectWalletButton, Segmented, SummaryRows, panel, useWallet, useWalletUsdc } from './AppUi'
import { AppTxButton } from './AppTxButton'

type Tab = 'supply' | 'withdraw'

/** Supply or withdraw the loan asset of one market. */
export function SupplyPanel({ m, onChanged, initialTab = 'supply' }: { m: MarketView; onChanged?: () => void; initialTab?: Tab }) {
  const data = useData()
  const account = useWallet()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [amount, setAmount] = useState('')
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([])), [account, data])
  const pos = positions.data?.find((p) => p.slug === m.slug)
  const wallet = useWalletUsdc(account)

  const supplied = pos?.supplied ?? 0
  const liquidity = Math.max(0, m.totalSupplied - m.totalBorrowed)
  const value = Number(amount)
  const valid = Number.isFinite(value) && value > 0
  const after = tab === 'supply' ? supplied + (valid ? value : 0) : Math.max(0, supplied - (valid ? value : 0))
  const withdrawable = Math.min(supplied, liquidity)
  const max = tab === 'supply' ? wallet : withdrawable
  const tooMuchWithdraw = tab === 'withdraw' && valid && value > withdrawable + 1e-9
  const tooMuchSupply = tab === 'supply' && valid && wallet !== null && value > wallet + 1e-9

  function done() { setAmount(''); positions.reload(); onChanged?.() }

  return (
    <div style={{ ...panel, padding: 22, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={30} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{m.collateralSymbol} / {m.loanSymbol}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Earn on {m.loanSymbol} lent in this market</div>
        </div>
        {account && supplied > 0 && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className="lc-label">Your supply</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatUSD(supplied)}</div>
          </div>
        )}
      </div>

      <Segmented id={`supply-${m.slug}`} value={tab} onChange={(t) => { setTab(t); setAmount('') }}
        options={[{ value: 'supply', label: 'Supply' }, { value: 'withdraw', label: 'Withdraw' }]} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, minWidth: 0 }}>
          <AmountField id={`amt-${tab}-${m.slug}`} label={tab === 'supply' ? 'You supply' : 'You withdraw'} symbol={m.loanSymbol}
            value={amount} onChange={setAmount} max={account ? max : null} maxLabel={tab === 'supply' ? 'Wallet' : 'Available'} />

          <SummaryRows rows={[
            { label: 'Supply APY', value: formatPercent(m.supplyAPY, 2), tone: 'positive' },
            { label: 'Your supply after', value: formatUSD(after) },
            { label: 'Projected yearly earnings', value: formatUSD(after * (m.supplyAPY / 100)) },
            ...(tab === 'withdraw' ? [{ label: 'Free liquidity in market', value: formatUSD(liquidity) }] : []),
          ]} />

          {tooMuchWithdraw && (
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>
              That is more than you can withdraw right now. The rest is lent out and frees up as borrowers repay.
            </p>
          )}
          {tooMuchSupply && (
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>Your wallet does not hold that much {m.loanSymbol}.</p>
          )}
          {tab === 'withdraw' && account && supplied === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>You have nothing supplied in this market yet.</p>
          )}

          {!account ? <ConnectWalletButton /> : tab === 'supply' ? (
            <AppTxButton label={valid ? `Supply ${value.toLocaleString()} ${m.loanSymbol}` : 'Enter an amount'} disabled={!valid || tooMuchSupply}
              run={() => data.supply(m.slug, value, account)} onDone={done} />
          ) : (
            <AppTxButton label={valid ? `Withdraw ${value.toLocaleString()} ${m.loanSymbol}` : 'Enter an amount'} disabled={!valid || tooMuchWithdraw || supplied === 0}
              run={() => data.withdraw(m.slug, value, account)} onDone={done} />
          )}
        </motion.div>
      </AnimatePresence>

      <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--text-3)', margin: 0 }}>
        Your {m.loanSymbol} is only lent against {m.collateralSymbol} in this market. If a borrower here is not liquidated in time, any shortfall is shared by this market alone.
      </p>
    </div>
  )
}
