'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { List, X, CaretDown, Globe, Wallet } from '@phosphor-icons/react'
import { truncateAddress } from '@/lib/formatting'

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/markets', label: 'Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/liquidations', label: 'Liquidations' },
  { href: '/docs', label: 'Learn & Docs' },
]

const NETWORKS = [
  { id: 84532, name: 'Base Sepolia', color: '#0052FF' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [networkOpen, setNetworkOpen] = useState(false)
  const networkRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (networkRef.current && !networkRef.current.contains(e.target as Node)) {
        setNetworkOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentNetwork = NETWORKS.find(n => n.id === chainId) || NETWORKS[0]

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 68,
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px',
          transition: 'background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
          background: scrolled ? 'rgba(244,243,237,0.88)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em'
          }}>
            lending-core
          </span>
        </Link>

        {/* Center links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          className="nav-links"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(link.href + '/')
              }
            />
          ))}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Network selector */}
          <div ref={networkRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNetworkOpen(!networkOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-2)',
                background: 'var(--surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
              className="hide-mobile"
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: currentNetwork.color,
                flexShrink: 0,
              }} />
              {currentNetwork.name}
              <CaretDown size={12} style={{
                transition: 'transform 150ms ease',
                transform: networkOpen ? 'rotate(180deg)' : 'none',
              }} />
            </button>

            <AnimatePresence>
              {networkOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--r-md)',
                    padding: 4,
                    minWidth: 180,
                    boxShadow: '0 8px 24px rgba(20,42,37,0.08)',
                  }}
                >
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => setNetworkOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontWeight: 500,
                        color: chainId === net.id ? 'var(--accent)' : 'var(--text-2)',
                        background: chainId === net.id ? 'var(--accent-dim)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--r-sm)',
                        cursor: 'pointer',
                        transition: 'background 100ms ease',
                      }}
                    >
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: net.color,
                      }} />
                      {net.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wallet */}
          {isConnected && address ? (
            <button
              onClick={() => disconnect()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-1)',
                background: 'var(--surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--positive)',
                animation: 'pulse-dot 2s ease-in-out infinite'
              }} />
              {truncateAddress(address)}
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            >
              <Wallet size={14} weight="bold" />
              Connect
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-2)',
              cursor: 'pointer',
              padding: 4
            }}
            className="mobile-btn"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'rgba(244,243,237,0.97)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 100,
              paddingLeft: 32,
              paddingRight: 32,
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '20px 0',
                    fontSize: 26,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    color: pathname === link.href ? 'var(--accent)' : 'var(--text-1)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                fontSize: 14,
                color: 'var(--text-2)',
                background: 'var(--surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-sm)',
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: currentNetwork.color,
                }} />
                {currentNetwork.name}
              </div>

              {isConnected && address ? (
                <button
                  onClick={() => { disconnect(); setMobileOpen(false) }}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: 15, padding: '14px 24px' }}
                >
                  Disconnect {truncateAddress(address)}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => { connect({ connector: injected() }); setMobileOpen(false) }}
                  style={{ width: '100%', fontSize: 15, padding: '14px 24px' }}
                >
                  <Wallet size={16} weight="bold" />
                  Connect Wallet
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .mobile-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      style={{
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : hovered ? 'var(--text-1)' : 'var(--text-2)',
        textDecoration: 'none',
        transition: 'color 150ms ease',
        position: 'relative',
        paddingBottom: 2,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      {active && (
        <span style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 16,
          height: 2,
          borderRadius: 1,
          background: 'var(--accent)',
        }} />
      )}
    </Link>
  )
}
