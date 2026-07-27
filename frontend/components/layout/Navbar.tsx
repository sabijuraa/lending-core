'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { List, X } from '@phosphor-icons/react'
import { truncateAddress } from '@/lib/formatting'

const NAV_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/earn', label: 'Earn' },
  { href: '/borrow', label: 'Borrow' },
  { href: '/security', label: 'Security' },
  { href: '/docs', label: 'Docs' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

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

  return (
    <>
      <motion.nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 48px',
          transition: 'background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
          background: scrolled ? 'rgba(5,6,8,0.85)' : 'transparent',
          borderBottom: scrolled ? '0.5px solid var(--border-default)' : '0.5px solid transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* Outer hexagon */}
            <polygon
              points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
              stroke="var(--accent)"
              strokeWidth="1"
              fill="none"
            />
            {/* Inner hexagon, slightly rotated */}
            <polygon
              points="12,5 18,8.5 18,15.5 12,19 6,15.5 6,8.5"
              stroke="var(--accent)"
              strokeWidth="0.5"
              fill="rgba(0,229,204,0.08)"
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
            gap: 32,
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
              active={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))}
            />
          ))}
        </div>

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {isConnected && address ? (
            <button
              onClick={() => disconnect()}
              className="btn btn-dark"
              style={{ fontSize: 13, gap: 6 }}
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--positive)',
                animation: 'pulse-dot 2s ease-in-out infinite'
              }} />
              {truncateAddress(address)}
            </button>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => connect({ connector: injected() })}
              style={{ fontSize: 13 }}
            >
              Connect Wallet
            </button>
          )}

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
      </motion.nav>

      {/* Mobile menu - full screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'rgba(5,6,8,0.98)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 100,
              paddingLeft: 32,
              paddingRight: 32,
            }}
          >
            {/* Sphere visible at 20% opacity behind */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,229,204,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
              opacity: 0.2,
            }} />

            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '20px 0',
                    fontSize: 28,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    color: pathname === link.href ? 'var(--accent)' : 'var(--text-1)',
                    textDecoration: 'none',
                    borderBottom: '0.5px solid var(--border-subtle)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ marginTop: 40 }}
            >
              {isConnected && address ? (
                <button
                  onClick={() => { disconnect(); setMobileOpen(false); }}
                  className="btn btn-dark"
                  style={{ width: '100%', fontSize: 15, padding: '16px 24px' }}
                >
                  Disconnect {truncateAddress(address)}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => { connect({ connector: injected() }); setMobileOpen(false); }}
                  style={{ width: '100%', fontSize: 15, padding: '16px 24px' }}
                >
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
        fontWeight: 500,
        color: active ? 'var(--accent)' : hovered ? 'var(--text-1)' : 'var(--text-2)',
        textDecoration: 'none',
        transition: 'color 150ms ease'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  )
}
