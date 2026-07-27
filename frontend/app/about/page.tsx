'use client'
import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { ClipReveal } from '@/components/ui/ClipReveal'

export default function AboutPage() {
  const tradeoffs = [
    { chose: 'Risk isolation', sacrificed: 'Capital efficiency' },
    { chose: 'Immutability', sacrificed: 'Upgradeability' },
    { chose: 'Simplicity', sacrificed: 'Feature breadth' },
    { chose: 'Correctness', sacrificed: 'Speed to market' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      {/* Header */}
      <section style={{ padding: '80px 0 64px', background: 'var(--bg-0)', borderBottom: '0.5px solid var(--border-default)' }}>
        <div className="section-container">
          <ClipReveal type="clip">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-1)',
              marginBottom: 16,
            }}>
              A protocol, not a company.
            </h1>
          </ClipReveal>
          <ClipReveal type="fade" delay={0.2}>
            <p style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 520 }}>
              This is how we think about lending.
            </p>
          </ClipReveal>
        </div>
      </section>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 48px' }}>
        {/* Why we built this */}
        <ClipReveal type="fade">
          <section style={{ marginBottom: 80 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-1)',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}>
              Why we built this
            </h2>
            <div className="card-base" style={{ padding: 32 }}>
              <p style={{
                fontSize: 16,
                color: 'var(--text-2)',
                lineHeight: 1.9,
                margin: 0,
              }}>
                DeFi&apos;s biggest unsolved problem is risk isolation.
                Shared pools are efficient but fragile.
                When one asset goes bad, everything connected to it bleeds.
                lending-core is a different answer:
                complete isolation, even at the cost of some capital efficiency.
              </p>
            </div>
          </section>
        </ClipReveal>

        {/* What we optimized for */}
        <ClipReveal type="fade" delay={0.1}>
          <section style={{ marginBottom: 80 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-1)',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}>
              What we optimized for
            </h2>

            <div className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: 'var(--bg-0)',
                borderBottom: '0.5px solid var(--border-default)',
              }}>
                <div style={{
                  padding: '16px 24px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--positive)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Optimized for
                </div>
                <div style={{
                  padding: '16px 24px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderLeft: '0.5px solid var(--border-default)',
                }}>
                  Deliberately sacrificed
                </div>
              </div>

              {tradeoffs.map((row, i) => (
                <div
                  key={row.chose}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    borderBottom: i < tradeoffs.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      background: 'var(--positive-dim)',
                      border: '0.5px solid rgba(16,185,129,0.3)',
                      borderRadius: 20,
                      fontSize: 13,
                      color: 'var(--positive)',
                    }}>
                      {row.chose}
                    </span>
                  </div>
                  <div style={{
                    padding: '16px 24px',
                    borderLeft: '0.5px solid var(--border-default)',
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      background: 'var(--bg-3)',
                      border: '0.5px solid var(--border-default)',
                      borderRadius: 20,
                      fontSize: 13,
                      color: 'var(--text-3)',
                      textDecoration: 'line-through',
                    }}>
                      {row.sacrificed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ClipReveal>

        {/* How to evaluate it */}
        <ClipReveal type="fade" delay={0.2}>
          <section style={{ marginBottom: 64 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-1)',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}>
              How to evaluate it
            </h2>

            <div style={{
              padding: 40,
              background: 'linear-gradient(145deg, rgba(0,229,204,0.04) 0%, rgba(124,58,237,0.02) 100%)',
              border: '0.5px solid var(--accent-border)',
              borderRadius: 'var(--r-xl)',
            }}>
              <p style={{
                fontSize: 16,
                color: 'var(--text-2)',
                lineHeight: 1.9,
                marginBottom: 24,
              }}>
                Don&apos;t read our documentation. Read the contracts.
              </p>
              <p style={{
                fontSize: 16,
                color: 'var(--text-2)',
                lineHeight: 1.9,
                marginBottom: 24,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>LendingCore.sol</span> is under 400 lines.
                An engineer can read it in an afternoon.
                The ADRs explain every decision.
                The invariant tests prove every property.
              </p>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: 14 }}
              >
                Read the code on GitHub
                <ArrowSquareOut size={14} />
              </a>
            </div>
          </section>
        </ClipReveal>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          paddingTop: 32,
          borderTop: '0.5px solid var(--border-default)',
        }}>
          <Link href="/security" className="btn btn-ghost">
            View security
          </Link>
          <Link href="/docs" className="btn btn-dark">
            Read the docs
          </Link>
        </div>
      </div>
    </div>
  )
}
