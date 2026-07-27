'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, Info, Warning, ShieldCheck } from '@phosphor-icons/react'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { DEMO_MARKETS } from '@/lib/contracts'
import { formatUSD, formatPercent } from '@/lib/formatting'

type Tab = 'borrow' | 'repay'

export default function BorrowPage() {
  const [selectedMarket, setSelectedMarket] = useState(DEMO_MARKETS[0])
  const [tab, setTab] = useState<Tab>('borrow')
  const [collateralAmount, setCollateralAmount] = useState('')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false)

  const userCollateralBalance = 5
  const userBorrowed = 1500
  const collateralPrice = 3500

  const healthFactor = useMemo(() => {
    const collateral = parseFloat(collateralAmount) || 0
    const borrow = parseFloat(borrowAmount) || 0
    if (borrow === 0) return 999
    const collateralValue = collateral * collateralPrice
    return (collateralValue * selectedMarket.lltv) / borrow
  }, [collateralAmount, borrowAmount, selectedMarket.lltv, collateralPrice])

  const maxBorrow = useMemo(() => {
    const collateral = parseFloat(collateralAmount) || 0
    return collateral * collateralPrice * selectedMarket.lltv * 0.95
  }, [collateralAmount, selectedMarket.lltv, collateralPrice])

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
            Borrow
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 480 }}>
            Post collateral, take a loan. Keep exposure to your collateral while accessing liquidity.
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
              {(['borrow', 'repay'] as Tab[]).map(t => (
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
                        {selectedMarket.collateralSymbol.slice(0, 2)}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>
                          {selectedMarket.collateralSymbol} / {selectedMarket.loanSymbol}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--warning)' }}>
                          {formatPercent(selectedMarket.borrowAPY)} Borrow APY
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
                                {market.collateralSymbol.slice(0, 2)}
                              </div>
                              <span style={{ fontSize: 14, color: 'var(--text-1)' }}>{market.collateralSymbol} / {market.loanSymbol}</span>
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>
                              {formatPercent(market.borrowAPY)}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {tab === 'borrow' ? (
                <>
                  {/* Collateral Amount */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                        Collateral Amount
                      </label>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        Balance: {userCollateralBalance} {selectedMarket.collateralSymbol}
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
                        value={collateralAmount}
                        onChange={e => setCollateralAmount(e.target.value)}
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
                          onClick={() => setCollateralAmount(userCollateralBalance.toString())}
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
                          {selectedMarket.collateralSymbol}
                        </div>
                      </div>
                    </div>
                    {parseFloat(collateralAmount) > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
                        = {formatUSD(parseFloat(collateralAmount) * collateralPrice)}
                      </div>
                    )}
                  </div>

                  {/* Borrow Amount */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                        Amount to Borrow
                      </label>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        Max: {formatUSD(maxBorrow)}
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
                        value={borrowAmount}
                        onChange={e => setBorrowAmount(e.target.value)}
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
                          onClick={() => setBorrowAmount(maxBorrow.toFixed(2))}
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

                  {/* Health Factor Preview */}
                  {parseFloat(borrowAmount) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        padding: 20,
                        background: healthFactor < 1.2 ? 'var(--danger-dim)' : healthFactor < 1.5 ? 'var(--warning-dim)' : 'var(--bg-3)',
                        border: `1px solid ${healthFactor < 1.2 ? 'rgba(239,68,68,0.3)' : healthFactor < 1.5 ? 'rgba(245,158,11,0.3)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--r-md)',
                        marginBottom: 28,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Health Factor</span>
                        <span style={{
                          fontSize: 20,
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: healthFactor < 1.2 ? 'var(--danger)' : healthFactor < 1.5 ? 'var(--warning)' : 'var(--positive)',
                        }}>
                          {healthFactor > 10 ? '>10' : healthFactor.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(healthFactor / 3 * 100, 100)}%`,
                          background: healthFactor < 1.2 ? 'var(--danger)' : healthFactor < 1.5 ? 'var(--warning)' : 'var(--positive)',
                          borderRadius: 3,
                          transition: 'width 300ms ease, background 300ms ease',
                        }} />
                      </div>
                      {healthFactor < 1.2 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: 'var(--danger)', fontSize: 12 }}>
                          <Warning size={14} />
                          High liquidation risk! Consider reducing borrow amount.
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              ) : (
                /* Repay Tab */
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                      Amount to Repay
                    </label>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      Borrowed: {formatUSD(userBorrowed)}
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
                      value={borrowAmount}
                      onChange={e => setBorrowAmount(e.target.value)}
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
                        onClick={() => setBorrowAmount(userBorrowed.toString())}
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
              )}

              {/* Submit Button */}
              <button
                disabled={tab === 'borrow' ? (!collateralAmount || !borrowAmount || parseFloat(borrowAmount) <= 0) : (!borrowAmount || parseFloat(borrowAmount) <= 0)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: 15,
                  opacity: (tab === 'borrow' ? (!collateralAmount || !borrowAmount || parseFloat(borrowAmount) <= 0) : (!borrowAmount || parseFloat(borrowAmount) <= 0)) ? 0.5 : 1,
                  cursor: (tab === 'borrow' ? (!collateralAmount || !borrowAmount || parseFloat(borrowAmount) <= 0) : (!borrowAmount || parseFloat(borrowAmount) <= 0)) ? 'not-allowed' : 'pointer',
                }}
              >
                {tab === 'borrow' ? 'Borrow' : 'Repay'} {selectedMarket.loanSymbol}
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
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Available Liquidity</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
                    {formatUSD(selectedMarket.totalSupplied - selectedMarket.totalBorrowed, true)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Borrow APY</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>{formatPercent(selectedMarket.borrowAPY)}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Utilization</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatPercent(selectedMarket.utilization)}</span>
                  </div>
                  <UtilizationBar utilization={selectedMarket.utilization} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>LLTV</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatPercent(selectedMarket.lltv * 100, 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Liquidation Bonus</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatPercent(selectedMarket.liquidationBonus * 100, 0)}</span>
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
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Collateral</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>0 {selectedMarket.collateralSymbol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Borrowed</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{formatUSD(userBorrowed)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Health Factor</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--positive)' }}>2.45</span>
                </div>
              </div>
            </motion.div>

            {/* Safety Info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                padding: 20,
                background: 'var(--positive-dim)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <ShieldCheck size={18} style={{ color: 'var(--positive)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--positive)', marginBottom: 4 }}>Isolated Risk</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Your collateral in this market cannot be affected by issues in other markets. Each position is isolated.
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
