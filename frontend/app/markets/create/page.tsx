'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Info, Warning } from '@phosphor-icons/react'

const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', icon: 'E' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: 'B' },
  { symbol: 'USDC', name: 'USD Coin', icon: 'U' },
  { symbol: 'DAI', name: 'Dai Stablecoin', icon: 'D' },
  { symbol: 'LINK', name: 'Chainlink', icon: 'L' },
  { symbol: 'wstETH', name: 'Wrapped stETH', icon: 'W' },
]

const ORACLE_OPTIONS = [
  { id: 'chainlink', name: 'Chainlink', desc: 'Industry standard price feeds' },
  { id: 'pyth', name: 'Pyth Network', desc: 'High-frequency price updates' },
  { id: 'custom', name: 'Custom Oracle', desc: 'Bring your own oracle contract' },
]

export default function CreateMarketPage() {
  const [collateral, setCollateral] = useState('')
  const [loan, setLoan] = useState('')
  const [oracle, setOracle] = useState('chainlink')
  const [lltv, setLltv] = useState(80)
  const [liquidationBonus, setLiquidationBonus] = useState(5)

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container" style={{ maxWidth: 720 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <Link
            href="/markets"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-2)',
              textDecoration: 'none',
              marginBottom: 24,
            }}
          >
            <ArrowLeft size={14} />
            Back to markets
          </Link>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Create a Market
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 480 }}>
            Deploy a new isolated lending market. Once created, the market is immutable and permissionless.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
          style={{ padding: 32 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Collateral Token */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: 12,
              }}>
                Collateral Token
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {SUPPORTED_TOKENS.map(token => (
                  <button
                    key={token.symbol}
                    onClick={() => setCollateral(token.symbol)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '14px 16px',
                      background: collateral === token.symbol ? 'var(--accent-dim)' : 'var(--bg-2)',
                      border: `1px solid ${collateral === token.symbol ? 'var(--accent)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span style={{
                      width: 32,
                      height: 32,
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
                      {token.icon}
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{token.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{token.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Token */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: 12,
              }}>
                Loan Token
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {SUPPORTED_TOKENS.filter(t => t.symbol !== collateral).map(token => (
                  <button
                    key={token.symbol}
                    onClick={() => setLoan(token.symbol)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '14px 16px',
                      background: loan === token.symbol ? 'var(--accent-dim)' : 'var(--bg-2)',
                      border: `1px solid ${loan === token.symbol ? 'var(--accent)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span style={{
                      width: 32,
                      height: 32,
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
                      {token.icon}
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{token.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{token.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Oracle Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-1)',
                marginBottom: 12,
              }}>
                Price Oracle
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ORACLE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOracle(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: oracle === opt.id ? 'var(--accent-dim)' : 'var(--bg-2)',
                      border: `1px solid ${oracle === opt.id ? 'var(--accent)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{opt.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{opt.desc}</div>
                    </div>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${oracle === opt.id ? 'var(--accent)' : 'var(--border-strong)'}`,
                      background: oracle === opt.id ? 'var(--accent)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {oracle === opt.id && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg-0)' }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* LLTV Slider */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Liquidation LTV (LLTV)
                  <Info size={14} style={{ color: 'var(--text-3)' }} />
                </label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)' }}>{lltv}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={lltv}
                onChange={e => setLltv(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(lltv - 50) / 45 * 100}%, var(--bg-3) ${(lltv - 50) / 45 * 100}%, var(--bg-3) 100%)`,
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-4)' }}>
                <span>50% (Safe)</span>
                <span>95% (Risky)</span>
              </div>
            </div>

            {/* Liquidation Bonus */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Liquidation Bonus</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--warning)' }}>{liquidationBonus}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={liquidationBonus}
                onChange={e => setLiquidationBonus(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  background: `linear-gradient(to right, var(--warning) 0%, var(--warning) ${(liquidationBonus - 1) / 14 * 100}%, var(--bg-3) ${(liquidationBonus - 1) / 14 * 100}%, var(--bg-3) 100%)`,
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Warning */}
            {lltv > 85 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 16,
                  background: 'var(--warning-dim)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <Warning size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--warning)', marginBottom: 4 }}>High LLTV Warning</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Markets with LLTV above 85% carry higher liquidation risk. Ensure borrowers understand the risk profile.
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary */}
            {collateral && loan && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: 20,
                  background: 'var(--bg-3)',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Pair</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{collateral} / {loan}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Oracle</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{ORACLE_OPTIONS.find(o => o.id === oracle)?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>LLTV</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{lltv}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Liq. Bonus</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{liquidationBonus}%</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              disabled={!collateral || !loan}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: 15,
                opacity: !collateral || !loan ? 0.5 : 1,
                cursor: !collateral || !loan ? 'not-allowed' : 'pointer',
              }}
            >
              Create Market
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
              Gas estimate: ~0.015 ETH. Market creation is irreversible.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
