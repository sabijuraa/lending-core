'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ArrowSquareOut } from '@phosphor-icons/react'
import { truncateAddress } from '@/lib/formatting'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

function CopyRow({ label, address }: { label: string; address: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--text-3)', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
        {truncateAddress(address, 8, 6)}
      </span>
      <button
        onClick={copy}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: copied ? 'var(--positive)' : 'var(--text-3)',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          transition: 'color 200ms ease'
        }}
      >
        {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
      </button>
    </div>
  )
}

const cols = [
  {
    title: 'Protocol',
    links: [
      { label: 'Markets', href: '/markets' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Liquidations', href: '/liquidations' },
      { label: 'Analytics', href: '/analytics' },
    ]
  },
  {
    title: 'Learn',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Security', href: '/security' },
      { label: 'About', href: '/about' },
    ]
  },
  {
    title: 'Developers',
    links: [
      { label: 'GitHub', href: 'https://github.com/sabijuraa/lending-core', ext: true },
      { label: 'Smart Contracts', href: '/docs' },
      { label: 'MIT License', href: 'https://opensource.org/licenses/MIT', ext: true },
    ]
  },
  {
    title: 'Trust & Policies',
    links: [
      { label: 'Terms of use', href: '/terms' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Risk disclosure', href: '/security' },
    ]
  },
]

export function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="section-container" style={{ padding: '56px 80px 28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
          gap: 56,
          marginBottom: 48
        }}>
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <polygon
                  points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                  stroke="var(--accent)"
                  strokeWidth="1.2"
                  fill="none"
                />
                <polygon
                  points="12,5 18,8.5 18,15.5 12,19 6,15.5 6,8.5"
                  stroke="var(--accent)"
                  strokeWidth="0.6"
                  fill="rgba(23,77,64,0.06)"
                  transform="rotate(15 12 12)"
                />
              </svg>
              <span style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-1)',
                letterSpacing: '-0.02em'
              }}>
                lending-core
              </span>
            </div>
            <p style={{
              fontSize: 14,
              color: 'var(--text-3)',
              lineHeight: 1.7,
              marginBottom: 20,
              maxWidth: 260
            }}>
              Isolated-market lending on Base. Each market stands alone, transparent rates, no shared risk.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href="https://github.com/sabijuraa/lending-core"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-3)',
                  transition: 'color 150ms ease, border-color 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent)'
                  e.currentTarget.style.borderColor = 'var(--accent-border)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-3)'
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-3)',
                marginBottom: 18
              }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {col.links.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    target={(link as { ext?: boolean }).ext ? '_blank' : undefined}
                    rel={(link as { ext?: boolean }).ext ? 'noopener noreferrer' : undefined}
                    style={{
                      fontSize: 14,
                      color: 'var(--text-2)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'color 150ms ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
                  >
                    {link.label}
                    {(link as { ext?: boolean }).ext && <ArrowSquareOut size={12} />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-4)' }}>
            Built on Base Sepolia. Engineered by Fizan Ali
          </span>
          <div>
            <CopyRow label="LendingCore" address={CONTRACT_ADDRESSES.LendingCore} />
            <CopyRow label="KinkedRateModel" address={CONTRACT_ADDRESSES.KinkedRateModel} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-4)' }}>
            MIT License
          </span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 640px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  )
}
