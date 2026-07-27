'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CaretDown, Info, Wallet, TrendUp } from '@phosphor-icons/react'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { DEMO_MARKETS } from '@/lib/contracts'
import { formatUSD, formatPercent } from '@/lib/formatting'

type Tab = 'supply' | 'withdraw'

export default function EarnPage() {
  const [selectedMarket, setSelectedMarket] = useState(DEMO_MARKETS[0])
  const [tab, setTab] = useState<Tab>('supply')
  const [amount, setAmount] = useState('')
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false)

  const userBalance = 10000
  const userSupplied = 2500

  const projectedEarnings = useMemo(() => {
    const amt = parseFloat(amount) || 0
    const daily = amt * (selectedMarket.supplyAPY / 100) / 365
    const monthly = daily * 30
    const yearly = amt * (selectedMarket.supplyAPY / 100)
    return { daily, monthly, yearly }
  }, [amount, selectedMarket.supplyAPY])

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Earn Yield
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 480 }}>
            Supply assets to isolated markets and earn yield. No lock-ups. Withdraw when liquidity allows.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
              {(['supply', 'withdraw'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: tab === t ? 'var(--accent)' : 'var(--text-2)',
                    background: tab === t ? 'var(--accent-dim)' : 'transparent',
                    border: 'none',
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ padding: 32 }}>
              {/* Market Selector */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
                  Select Market
                </label>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMarketDropdownOpen(!marketDropdownOpen)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--bg-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {selectedMarket.loanSymbol.slice(0, 2)}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>
                          {selectedMarket.collateralSymbol} / {selectedMarket.loanSymbol}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--positive)' }}>
                          {formatPercent(selectedMarket.supplyAPY)} APY
                        </div>
                      </div>
                    </div>
                    <CaretDown size={16} style={{ color: 'var(--text-3)', transform: marketDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                  </button>

                  <AnimatePresence>
                    {marketDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          right: 0,
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--r-md)',
                          overflow: 'hidden',
                          zIndex: 10,
                          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                        }}
                      >
                        {DEMO_MARKETS.map(market => (
                          <button
                            key={market.id}
                            onClick={() => { setSelectedMarket(market); setMarketDropdownOpen(false); }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 20px',
                              background: selectedMarket.id === market.id ? 'var(--accent-dim)' : 'transparent',
                              border: 'none',
                              borderBottom: '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'var(--bg-3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 600,
                                color: 'var(--accent)',
                              }}>
                                {market.loanSymbol.slice(0, 2)}
                              </div>
                              <span style={{ fontSize: 14, color: 'var(--text-1)' }}>{market.collateralSymbol} / {market.loanSymbol}</span>
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>
                              {formatPercent(market.supplyAPY)}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Amount Input */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                    {tab === 'supply' ? 'Amount to Supply' : 'Amount to Withdraw'}
                  </label>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {tab === 'supply' ? `Balance: ${formatUSD(userBalance)}` : `Supplied: ${formatUSD(userSupplied)}`}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-md)',
                  padding: '4px 4px 4px 20px',
                }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 24,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-1)',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setAmount(tab === 'supply' ? userBalance.toString() : userSupplied.toString())}
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        background: 'var(--accent-dim)',
                        border: '1px solid var(--accent-border)',
                        borderRadius: 'var(--r-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      MAX
                    </button>
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--bg-3)',
                      borderRadius: 'var(--r-sm)',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-1)',
                    }}>
                      {selectedMarket.loanSymbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Projected Earnings (Supply only) */}
              {tab === 'supply' && parseFloat(amount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    padding: 20,
                    background: 'var(--positive-dim)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 'var(--r-md)',
                    marginBottom: 28,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <TrendUp size={16} style={{ color: 'var(--positive)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--positive)' }}>Projected Earnings</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Daily</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
                        +{formatUSD(projectedEarnings.daily)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Monthly</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
                        +{formatUSD(projectedEarnings.monthly)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Yearly</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>
                        +{formatUSD(projectedEarnings.yearly)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                disabled={!amount || parseFloat(amount) <= 0}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: 15,
                  opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1,
                  cursor: !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {tab === 'supply' ? 'Supply' : 'Withdraw'} {selectedMarket.loanSymbol}
              </button>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Market Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Market Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Total Supplied</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatUSD(selectedMarket.totalSupplied, true)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Total Borrowed</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatUSD(selectedMarket.totalBorrowed, true)}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Utilization</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatPercent(selectedMarket.utilization)}</span>
                  </div>
                  <UtilizationBar utilization={selectedMarket.utilization} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Supply APY</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--positive)' }}>{formatPercent(selectedMarket.supplyAPY)}</span>
                </div>
              </div>
            </motion.div>

            {/* Your Position */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
              style={{ padding: 24 }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Your Position</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Supplied</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatUSD(userSupplied)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Earnings (All Time)</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--positive)' }}>+$42.50</span>
                </div>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                padding: 20,
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Info size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)', marginBottom: 4 }}>Isolated Markets</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Each market is completely isolated. Your funds in this market cannot be affected by issues in other markets.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
