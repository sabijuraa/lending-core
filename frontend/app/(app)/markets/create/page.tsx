'use client'
import { useState } from 'react'
import { isAddress, zeroAddress } from 'viem'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { Warning, CheckCircle, LockSimple, Drop, Vault, HandCoins, Code } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { LcCardTitle, lcPanel } from '@/components/market/LcUi'
import { TxButton } from '@/components/market/TxButton'
import { ADDRESSES } from '@/lib/addresses'
import { useData } from '@/providers/provider'
import { useAccountId } from '@/lib/use-account-id'
import { LcStoryBand, LcBandStep, LcHelpCard, LcSectionHead } from '@/components/market/LcStory'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'

/** A known address, or empty when it is not configured for this network. */
const known = (a: string) => (a && a.toLowerCase() !== zeroAddress ? a : '')

const COLLATERALS = [
  { symbol: 'WETH', name: 'Wrapped Ether', address: known(ADDRESSES.WETH), oracle: known(ADDRESSES.WETHOracle) },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: known(ADDRESSES.WBTC), oracle: known(ADDRESSES.WBTCOracle) },
]

const LOANS = [
  { symbol: 'USDC', name: 'USD Coin', address: known(ADDRESSES.USDC) },
]

const CUSTOM = 'custom'

const STALENESS = [
  { value: 3600, label: '1 hour' },
  { value: 21600, label: '6 hours' },
  { value: 86400, label: '24 hours' },
]

const EASE = [0.16, 1, 0.3, 1] as const

export default function CreateMarketPage() {
  const data = useData()
  const { account } = useAccountId()
  const [collateral, setCollateral] = useState('')
  const [collateralAddr, setCollateralAddr] = useState('')
  const [loan, setLoan] = useState('')
  const [loanAddr, setLoanAddr] = useState('')
  const [oracleAddr, setOracleAddr] = useState('')
  const [irmAddr, setIrmAddr] = useState(known(ADDRESSES.KinkedRateModel))
  const [staleness, setStaleness] = useState(3600)
  const [lltv, setLltv] = useState(80)
  const [bonus, setBonus] = useState(5)
  const [reviewed, setReviewed] = useState(false)
  const [created, setCreated] = useState(false)

  const touch = <T,>(set: (v: T) => void) => (v: T) => { set(v); setReviewed(false); setCreated(false) }

  const pickCollateral = (sym: string) => {
    touch(setCollateral)(sym)
    const t = COLLATERALS.find((c) => c.symbol === sym)
    setCollateralAddr(t?.address ?? '')
    if (t) setOracleAddr(t.oracle)
  }
  const pickLoan = (sym: string) => {
    touch(setLoan)(sym)
    setLoanAddr(LOANS.find((c) => c.symbol === sym)?.address ?? '')
  }

  const valid = (a: string) => isAddress(a) && a.toLowerCase() !== zeroAddress
  const errors = {
    collateral: !collateral ? 'Choose the collateral.' : !valid(collateralAddr) ? 'Enter a valid collateral token address.' : '',
    loan: !loan ? 'Choose the loan asset.' : !valid(loanAddr) ? 'Enter a valid loan token address.' : '',
    same: valid(collateralAddr) && collateralAddr.toLowerCase() === loanAddr.toLowerCase() ? 'Collateral and loan asset must be different tokens.' : '',
    oracle: !valid(oracleAddr) ? 'Enter the price feed contract address.' : '',
    irm: !valid(irmAddr) ? 'Enter the interest rate model address.' : '',
  }
  const firstError = Object.values(errors).find(Boolean) ?? ''
  const ready = !firstError
  const collateralLabel = collateral === CUSTOM ? 'Custom token' : collateral
  const loanLabel = loan === CUSTOM ? 'Custom token' : loan

  return (
    <div style={{ padding: '8px 0 64px', overflowX: 'clip' }}>
      <div className="section-container">
        <Link href="/markets" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 20 }}>
          All markets
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} style={{ marginBottom: 32 }}>
          <div className="lc-eyebrow" style={{ marginBottom: 10 }}>Permissionless</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 46px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1.05, marginBottom: 12 }}>
            Create a market
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 600, lineHeight: 1.6 }}>
            Anyone can open a new market. You choose the pair, the price feed and how far loans may stretch. Once it is live, nobody can change those rules, including you.
          </p>
        </motion.div>

        <div className="lc-create-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            style={{ ...lcPanel, padding: 'clamp(20px, 3vw, 32px)', display: 'grid', gap: 30 }}>
            <Field step={1} label="Collateral" hint="What borrowers put up to secure their loans.">
              <div className="lc-token-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {COLLATERALS.map((t) => (
                  <TokenChoice key={t.symbol} symbol={t.symbol} name={t.name} selected={collateral === t.symbol} onClick={() => pickCollateral(t.symbol)} />
                ))}
                <TokenChoice symbol="?" name="Paste a token address" label="Other token" selected={collateral === CUSTOM} onClick={() => pickCollateral(CUSTOM)} />
              </div>
              {collateral && (
                <AddressInput label="Collateral token address" value={collateralAddr} onChange={touch(setCollateralAddr)} invalid={!!collateralAddr && !valid(collateralAddr)} />
              )}
            </Field>

            <Field step={2} label="Loan asset" hint="What lenders deposit and borrowers receive.">
              <div className="lc-token-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {LOANS.map((t) => (
                  <TokenChoice key={t.symbol} symbol={t.symbol} name={t.name} selected={loan === t.symbol} onClick={() => pickLoan(t.symbol)} />
                ))}
                <TokenChoice symbol="?" name="Paste a token address" label="Other token" selected={loan === CUSTOM} onClick={() => pickLoan(CUSTOM)} />
              </div>
              {loan && (
                <AddressInput label="Loan token address" value={loanAddr} onChange={touch(setLoanAddr)} invalid={!!loanAddr && !valid(loanAddr)} />
              )}
            </Field>

            <Field step={3} label="Price feed" hint="The one source this market trusts to value the collateral.">
              <AddressInput
                label="Price feed address"
                hint={COLLATERALS.some((c) => c.symbol === collateral && c.oracle) ? 'Prefilled with the lending-core adapter for this collateral.' : 'A contract that reports the collateral price and when it was last updated.'}
                value={oracleAddr}
                onChange={touch(setOracleAddr)}
                invalid={!!oracleAddr && !valid(oracleAddr)}
                first
              />
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Pause when the price is older than</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {STALENESS.map((s) => (
                    <button key={s.value} type="button" onClick={() => touch(setStaleness)(s.value)} className="lc-choice" data-selected={staleness === s.value}
                      style={{ padding: '9px 0', fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <Field step={4} label="Liquidation LTV" hint="How much of the collateral value a loan may reach before it can be closed.">
              <Slider value={lltv} min={50} max={95} onChange={touch(setLltv)} color="var(--accent)" left="50% careful" right="95% aggressive" />
              <AnimatePresence>
                {lltv > 86 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14, padding: '12px 14px', background: 'var(--warning-dim)', borderRadius: 'var(--r-md)', fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-2)' }}>
                      <Warning size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
                      Above 86% there is very little room between a healthy loan and one that is underwater. Only volatile collateral with deep liquidity should go this high, and lenders may stay away.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Field>

            <Field step={5} label="Liquidation bonus" hint="The reward a liquidator earns for closing a risky loan. The contract caps it at 20%.">
              <Slider value={bonus} min={1} max={20} onChange={touch(setBonus)} color="var(--warning)" left="1%" right="20% cap" />
            </Field>

            <Field step={6} label="Interest rate model" hint="The contract that sets borrow rates from utilization. Use the standard kinked rate model unless you have audited your own.">
              <AddressInput label="Rate model address" value={irmAddr} onChange={touch(setIrmAddr)} invalid={!!irmAddr && !valid(irmAddr)} first />
            </Field>

            <div style={{ display: 'grid', gap: 12 }}>
              {!reviewed ? (
                <>
                  <button type="button" className="btn btn-primary btn-lg" disabled={!ready} onClick={() => setReviewed(true)}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    Review market
                  </button>
                  {firstError && (collateral || loan) && <p style={{ fontSize: 12.5, color: 'var(--text-3)', textAlign: 'center' }}>{firstError}</p>}
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-dim)', borderRadius: 'var(--r-md)', padding: 18, display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Review and create</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      ['Collateral', `${collateralLabel} ${short(collateralAddr)}`],
                      ['Loan asset', `${loanLabel} ${short(loanAddr)}`],
                      ['Price feed', short(oracleAddr)],
                      ['Rate model', short(irmAddr)],
                      ['Liquidation LTV', `${lltv}%`],
                      ['Liquidation bonus', `${bonus}%`],
                      ['Max price age', STALENESS.find((x) => x.value === staleness)?.label ?? ''],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-3)' }}>{k}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-1)', textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>These settings are permanent once the transaction confirms.</p>
                  {created ? (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <Link href="/markets" className="btn btn-primary">View markets</Link>
                      <button type="button" className="btn btn-secondary" onClick={() => { setReviewed(false); setCreated(false) }}>Create another</button>
                    </div>
                  ) : (
                    <>
                      <TxButton
                        label="Create market"
                        disabled={!ready}
                        run={() => data.createMarket({
                          loanToken: loanAddr as `0x${string}`,
                          collateralToken: collateralAddr as `0x${string}`,
                          oracle: oracleAddr as `0x${string}`,
                          irm: irmAddr as `0x${string}`,
                          lltv: lltv / 100,
                          liquidationBonus: bonus / 100,
                          maxStaleness: staleness,
                        }, account ?? '')}
                        onDone={() => setCreated(true)}
                      />
                      <button type="button" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setReviewed(false)}>Edit settings</button>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Live preview */}
          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="lc-create-preview" style={{ position: 'sticky', top: 92, display: 'grid', gap: 16 }}>
            <div className="lc-dark-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden style={{ position: 'absolute', width: 260, height: 260, right: -90, top: -110, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,180,150,0.2), transparent 65%)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9FD3B4', marginBottom: 14 }}>Your market</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, minHeight: 40 }}>
                  <AnimatePresence mode="wait">
                    <motion.span key={collateral || 'none'} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                      {collateral && collateral !== CUSTOM ? <TokenLogo symbol={collateral} size={36} /> : <Placeholder />}
                    </motion.span>
                  </AnimatePresence>
                  <span style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    {collateralLabel || 'Collateral'} / {loanLabel || 'Loan'}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <PreviewLine icon={<Vault size={16} />}>
                    Every $100 of {collateralLabel || 'collateral'} can back up to <b>${lltv}</b> of {loanLabel || 'debt'}.
                  </PreviewLine>
                  <PreviewLine icon={<HandCoins size={16} />}>
                    Liquidators earn <b>{bonus}%</b> on top of the debt they repay.
                  </PreviewLine>
                  <PreviewLine icon={<Drop size={16} />}>
                    Trusts one price feed and pauses if the price is older than <b>{STALENESS.find((s) => s.value === staleness)?.label}</b>.
                  </PreviewLine>
                  <PreviewLine icon={<LockSimple size={16} />}>
                    These rules are locked forever the moment the market opens.
                  </PreviewLine>
                </div>
              </div>
            </div>
            <div style={{ ...lcPanel, padding: 20 }}>
              <LcCardTitle>Before you create</LcCardTitle>
              {[
                'The market id is a fingerprint of these exact settings, so a duplicate cannot be created.',
                'Lenders decide for themselves whether your settings are safe enough to deposit.',
                'The standard rate model keeps borrowing cheap until 80% utilization and steep after, which pulls lenders back in.',
              ].map((t) => (
                <div key={t} style={{ display: 'flex', gap: 10, padding: '8px 0', fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>
                  <CheckCircle size={16} weight="fill" style={{ color: 'var(--positive)', flexShrink: 0, marginTop: 2 }} />
                  {t}
                </div>
              ))}
            </div>
          </motion.aside>
        </div>

        {/* Story band */}
        <div style={{ marginTop: 64 }}>
          <LcStoryBand
            eyebrow="Why anyone can create a market"
            title="New assets should not have to wait for a vote."
            body="On pooled lending apps, every new asset needs approval because one bad listing can hurt everyone. Here a new market only puts its own lenders at risk, so there is nothing to vote on. Lenders read the rules and decide."
          >
            <div className="lc-band-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 24 }}>
              <LcBandStep n={1} title="Someone opens it" body="Pick a pair, a price feed and the safety limits, then send one transaction." />
              <LcBandStep n={2} title="Lenders weigh it" body="They see every rule upfront and only deposit if the terms look safe to them." />
              <LcBandStep n={3} title="It runs on its own" body="No admin, no upgrades, no shared pool. Its risk never leaves its borders." />
            </div>
          </LcStoryBand>
        </div>

        <div style={{ marginTop: 56 }}>
          <LcSectionHead eyebrow="Good practice" title="What makes a market people trust" />
          <Stagger className="lc-create-tips" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <StaggerItem>
              <LcHelpCard icon={<Drop size={18} />} title="A feed that keeps up">
                Pick a feed that updates often for this asset, and a staleness window that matches. Volatile collateral needs fresher prices.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<Vault size={18} />} title="A cushion that fits the asset">
                Stable, liquid collateral can carry a higher LTV. Newer or thinner tokens deserve a lower one so liquidators have time to act.
              </LcHelpCard>
            </StaggerItem>
            <StaggerItem>
              <LcHelpCard icon={<Code size={18} />} title="Settings you can explain">
                Lenders will read every number. Clear, conservative choices attract deposits faster than aggressive ones.
              </LcHelpCard>
            </StaggerItem>
          </Stagger>
          <Reveal style={{ marginTop: 20 }}>
            <Link href="/docs?tab=developers" className="btn btn-secondary" style={{ fontSize: 13, padding: '10px 18px' }}>
              Developer guide to createMarket
            </Link>
          </Reveal>
        </div>
      </div>

      <style jsx global>{`
        .lc-choice {
          background: var(--surface);
          border: 1px solid var(--border-default);
          border-radius: var(--r-md);
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
        }
        .lc-choice:hover { border-color: var(--border-strong); }
        .lc-choice:active { transform: scale(0.99); }
        .lc-choice[data-selected='true'] { background: var(--accent-dim); border-color: var(--accent); }
        .lc-range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; outline: none; cursor: pointer; }
        .lc-range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--surface); border: 2px solid var(--primary); box-shadow: 0 2px 6px rgba(16,43,39,0.2); transition: transform 150ms ease; }
        .lc-range::-webkit-slider-thumb:hover { transform: scale(1.12); }
        .lc-range::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--surface); border: 2px solid var(--primary); }
        @media (max-width: 960px) {
          .lc-create-grid { grid-template-columns: 1fr !important; }
          .lc-create-preview { position: static !important; }
          .lc-band-steps, .lc-create-tips { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .lc-token-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Field({ step, label, hint, children }: { step: number; label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>0{step}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{label}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, paddingLeft: 28 }}>{hint}</p>
      {children}
    </div>
  )
}

function short(a: string) {
  return a ? `${a.slice(0, 6)}...${a.slice(-4)}` : ''
}

function AddressInput({ label, hint, value, onChange, invalid, first }: { label: string; hint?: string; value: string; onChange: (v: string) => void; invalid: boolean; first?: boolean }) {
  return (
    <label style={{ display: 'block', marginTop: first ? 0 : 12 }}>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="0x..."
        spellCheck={false}
        className="input"
        style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13, borderColor: invalid ? 'var(--danger)' : undefined }}
      />
      {invalid && <span style={{ display: 'block', fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>That is not a valid address.</span>}
      {hint && !invalid && <span style={{ display: 'block', fontSize: 12, color: 'var(--text-4)', marginTop: 6 }}>{hint}</span>}
    </label>
  )
}

function TokenChoice({ symbol, name, label, selected, onClick }: { symbol: string; name: string; label?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="lc-choice" data-selected={selected}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textAlign: 'left' }}>
      {symbol === '?' ? <Placeholder size={30} dark={false} /> : <TokenLogo symbol={symbol} size={30} />}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{label ?? symbol}</span>
        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-3)' }}>{name}</span>
      </span>
      <Radio on={selected} />
    </button>
  )
}

function Radio({ on }: { on: boolean }) {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: `2px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`, background: on ? 'var(--accent)' : 'transparent', transition: 'all 150ms ease',
    }}>
      {on && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--surface)' }} />}
    </span>
  )
}

function Slider({ value, min, max, onChange, color, left, right }: {
  value: number; min: number; max: number; onChange: (v: number) => void; color: string; left: string; right: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Selected</span>
        <motion.span key={value} initial={{ y: -4, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }}
          style={{ fontSize: 18, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
          {value}%
        </motion.span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="lc-range"
        aria-valuetext={`${value}%`}
        style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--accent-soft) ${pct}%, var(--accent-soft) 100%)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, color: 'var(--text-4)' }}>
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  )
}

function PreviewLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="lc-dark-inset" style={{ display: 'flex', gap: 12, padding: '12px 14px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--band-muted)' }}>
      <span style={{ color: '#9FD3B4', flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <span className="lc-preview-text">{children}</span>
      <style jsx>{`
        .lc-preview-text :global(b) { color: #FFFFFF; font-weight: 600; }
      `}</style>
    </div>
  )
}

function Placeholder({ size = 36, dark = true }: { size?: number; dark?: boolean }) {
  return <span style={{ display: 'inline-block', flexShrink: 0, width: size, height: size, borderRadius: '50%', border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.3)' : 'var(--border-strong)'}` }} />
}
