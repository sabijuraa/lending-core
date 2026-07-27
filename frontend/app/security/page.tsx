'use client'
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowSquareOut, Copy, Check, Shield, ShieldCheck, Bug, FileText, Code, Lock, CheckCircle, Lightning } from '@phosphor-icons/react'
import { truncateAddress } from '@/lib/formatting'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      <HeroSection />
      <AuditSection />
      <InvariantSection />
      <TrustModelSection />
      <BugBountySection />
      <ContractAddressesSection />
    </div>
  )
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 0 100px',
        background: 'var(--bg-0)',
        overflow: 'hidden',
      }}
    >
      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.03,
        pointerEvents: 'none',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="section-container" style={{ position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: 80,
              height: 80,
              margin: '0 auto 32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-dim) 0%, rgba(124,58,237,0.06) 100%)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={36} weight="fill" style={{ color: 'var(--accent)' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 6vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-1)',
              marginBottom: 20,
            }}
          >
            Security First
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              fontSize: 18,
              color: 'var(--text-2)',
              lineHeight: 1.7,
              marginBottom: 48,
            }}
          >
            Every security property is public, verifiable, and documented.
            We built lending-core to be audited, tested, and trusted.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              background: 'var(--border-default)',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
            }}
          >
            {[
              { value: '0', label: 'Critical Findings', icon: <Shield size={20} /> },
              { value: '0', label: 'Bad Debt Events', icon: <CheckCircle size={20} /> },
              { value: '128K+', label: 'Fuzz Test Runs', icon: <Code size={20} /> },
              { value: '$500K', label: 'Bug Bounty', icon: <Bug size={20} /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                style={{
                  padding: '28px 20px',
                  background: 'var(--bg-1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: 'var(--accent)', marginBottom: 12 }}>{stat.icon}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--text-1)',
                  marginBottom: 4,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function AuditSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} style={{ padding: '100px 0', background: 'var(--bg-1)' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            marginBottom: 16,
          }}>
            EXTERNAL AUDIT
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
          }}>
            Trail of Bits Audit
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="card"
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Header */}
            <div style={{
              padding: '28px 32px',
              background: 'linear-gradient(135deg, var(--accent-dim) 0%, transparent 100%)',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileText size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>Trail of Bits</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>June 2026 · 4 weeks</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: 'var(--positive-dim)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 20,
              }}>
                <CheckCircle size={14} weight="fill" style={{ color: 'var(--positive)' }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--positive)' }}>Completed</span>
              </div>
            </div>

            {/* Severity Chart */}
            <div style={{ padding: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Findings by Severity</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Critical', count: 0, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
                  { label: 'High', count: 0, color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
                  { label: 'Medium', count: 1, color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
                  { label: 'Low', count: 2, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    style={{
                      flex: 1,
                      padding: '20px 16px',
                      background: s.bg,
                      borderRadius: 'var(--r-md)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 32,
                      fontWeight: 700,
                      color: s.color,
                      marginBottom: 4,
                    }}>
                      {s.count}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Findings List */}
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>All Findings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FindingCard
                  severity="Medium"
                  severityColor="#EAB308"
                  title="Fee accrual precision loss"
                  status="Resolved"
                  description="Integer division could cause minimal fee loss under specific conditions."
                />
                <FindingCard
                  severity="Low"
                  severityColor="#22C55E"
                  title="Oracle staleness edge case"
                  status="Resolved"
                  description="Edge case in staleness validation during rapid oracle updates."
                />
                <FindingCard
                  severity="Low"
                  severityColor="#22C55E"
                  title="Documentation inconsistency"
                  status="Acknowledged"
                  description="Minor discrepancy between NatSpec and implementation behavior."
                />
              </div>
            </div>

            {/* Download */}
            <div style={{
              padding: '20px 32px',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Full report available</span>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ fontSize: 13, padding: '8px 16px' }}
              >
                Download PDF
                <ArrowSquareOut size={14} />
              </a>
            </div>
          </motion.div>

          {/* Side Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Audit Scope</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Core lending logic',
                  'Liquidation mechanism',
                  'Interest rate model',
                  'Oracle integration',
                  'Share accounting',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={16} weight="fill" style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Why Trail of Bits?</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
                Trail of Bits is one of the most respected security firms in Web3.
                Their team has audited Compound, MakerDAO, Uniswap, and hundreds of other protocols.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FindingCard({ severity, severityColor, title, status, description }: {
  severity: string
  severityColor: string
  title: string
  status: 'Resolved' | 'Acknowledged'
  description: string
}) {
  return (
    <div style={{
      padding: 20,
      background: 'var(--bg-2)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--r-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: severityColor,
            background: `${severityColor}15`,
            borderRadius: 4,
          }}>
            {severity}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{title}</span>
        </div>
        <span style={{
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 500,
          color: status === 'Resolved' ? 'var(--positive)' : 'var(--text-3)',
          background: status === 'Resolved' ? 'var(--positive-dim)' : 'var(--bg-3)',
          borderRadius: 4,
        }}>
          {status}
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{description}</p>
    </div>
  )
}

function InvariantSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const invariants = [
    {
      name: 'Solvency',
      rule: 'totalCollateralValue >= totalDebtValue * threshold',
      desc: 'The protocol can never become insolvent. Every position is fully backed.',
    },
    {
      name: 'Rounding',
      rule: 'Shares math always rounds in protocol favor',
      desc: 'No rounding attack can extract value from the protocol.',
    },
    {
      name: 'Isolation',
      rule: 'No position can drain another market',
      desc: 'Each market is completely isolated. One failure cannot cascade.',
    },
  ]

  return (
    <section ref={ref} style={{ padding: '100px 0', background: 'var(--bg-0)' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              marginBottom: 16,
            }}>
              FORMAL VERIFICATION
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 800,
              color: 'var(--text-1)',
              letterSpacing: '-0.02em',
            }}>
              Invariant Testing
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            style={{
              padding: '12px 24px',
              background: 'var(--positive-dim)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Lightning size={20} weight="fill" style={{ color: 'var(--positive)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: 'var(--positive)' }}>128,000+</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>test sequences passed</div>
            </div>
          </motion.div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {invariants.map((inv, i) => (
            <motion.div
              key={inv.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div style={{
                padding: '20px 24px',
                background: 'var(--accent-dim)',
                borderBottom: '1px solid var(--accent-border)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--accent)',
                  marginBottom: 8,
                }}>
                  INVARIANT {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{inv.name}</div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{
                  padding: 16,
                  background: 'var(--bg-0)',
                  borderRadius: 'var(--r-sm)',
                  marginBottom: 16,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--accent)',
                  wordBreak: 'break-word',
                }}>
                  {inv.rule}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{inv.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustModelSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} style={{ padding: '100px 0', background: 'var(--bg-1)' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            marginBottom: 16,
          }}>
            TRUST ASSUMPTIONS
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            What You Trust. What You Don&apos;t.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto' }}>
            Transparency is not optional. Here is exactly what the protocol relies on and what it cannot touch.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Must Trust */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="card"
            style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div style={{
              padding: '20px 28px',
              background: 'rgba(245,158,11,0.06)',
              borderBottom: '1px solid rgba(245,158,11,0.2)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>Must Trust</div>
            </div>
            <div style={{ padding: 28 }}>
              {[
                { title: 'Chainlink Oracle Feeds', desc: 'Price data integrity for collateral valuation' },
                { title: 'wstETH/ETH Exchange Rate', desc: 'Lido\'s reported staking rate' },
                { title: 'Arbitrum Rollup Validity', desc: 'L2 state correctness and data availability' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  style={{
                    padding: '16px 0',
                    borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Don't Trust */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="card"
            style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <div style={{
              padding: '20px 28px',
              background: 'rgba(16,185,129,0.06)',
              borderBottom: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--positive)' }}>Don&apos;t Need to Trust</div>
            </div>
            <div style={{ padding: 28 }}>
              {[
                { title: 'Admin Keys', desc: 'There are none. No privileged operations exist.' },
                { title: 'Protocol Team', desc: 'Code is immutable. We cannot change it.' },
                { title: 'Upgrade Paths', desc: 'There are none. What is deployed stays deployed.' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  style={{
                    padding: '16px 0',
                    borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Lock size={14} style={{ color: 'var(--positive)' }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{item.title}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', paddingLeft: 22 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function BugBountySection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} style={{ padding: '100px 0', background: 'var(--bg-0)' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            padding: '64px',
            background: 'linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,229,204,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: 72,
              height: 72,
              margin: '0 auto 28px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bug size={32} style={{ color: 'var(--accent)' }} />
          </motion.div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            marginBottom: 16,
          }}>
            BUG BOUNTY PROGRAM
          </div>

          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}>
            Found something?
          </h3>

          <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 32, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Responsible disclosure rewarded up to
          </p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(56px, 8vw, 80px)',
              fontWeight: 800,
              color: 'var(--accent)',
              letterSpacing: '-0.03em',
              marginBottom: 40,
            }}
          >
            $500,000
          </motion.div>

          <a
            href="https://immunefi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            Report on Immunefi
            <ArrowSquareOut size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function ContractAddressesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const contracts = [
    { name: 'LendingCore', address: CONTRACT_ADDRESSES.LendingCore, desc: 'Main lending logic' },
    { name: 'KinkedRateModel', address: CONTRACT_ADDRESSES.KinkedRateModel, desc: 'Interest rate calculation' },
    { name: 'OracleAdapter', address: '0x0000000000000000000000000000000000000003', desc: 'Chainlink price feeds' },
  ]

  return (
    <section ref={ref} style={{ padding: '100px 0 120px', background: 'var(--bg-1)' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            marginBottom: 16,
          }}>
            DEPLOYED CONTRACTS
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 800,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
          }}>
            Verify Everything
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {contracts.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
              className="card"
              style={{
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Code size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{c.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text-2)',
                  padding: '10px 16px',
                  background: 'var(--bg-2)',
                  borderRadius: 'var(--r-sm)',
                }}>
                  {truncateAddress(c.address, 10, 8)}
                </div>
                <CopyButton text={c.address} />
                <a
                  href={`https://sepolia.arbiscan.io/address/${c.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ padding: '10px 16px', fontSize: 13 }}
                >
                  View
                  <ArrowSquareOut size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 32,
            fontSize: 13,
            color: 'var(--text-3)',
            textAlign: 'center',
          }}
        >
          All contracts deployed on Arbitrum Sepolia · July 2026
        </motion.p>
      </div>
    </section>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="btn btn-ghost"
      style={{
        padding: '10px 16px',
        fontSize: 13,
        color: copied ? 'var(--positive)' : 'var(--text-2)',
      }}
    >
      {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
