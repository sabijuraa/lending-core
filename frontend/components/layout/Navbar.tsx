'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { List, X, Wallet } from '@phosphor-icons/react'
import { truncateAddress } from '@/lib/formatting'

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/markets', label: 'Markets' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/liquidations', label: 'Liquidations' },
  { href: '/docs', label: 'Learn & Docs' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/docs') return pathname.startsWith('/docs') || pathname === '/how-it-works'
  return pathname === href || pathname.startsWith(href + '/')
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const connectWallet = () => connect({ connector: injected() }, { onSuccess: () => router.push('/dashboard') })
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className="lc-nav"
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
          transition: 'background 300ms ease, border-color 300ms ease',
          background: scrolled ? 'rgba(245,244,238,0.9)' : 'var(--canvas)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          lending-core
        </Link>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32, marginLeft: 56, height: '100%' }}>
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="lc-navlink"
                data-active={active}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {isConnected && address ? (
            <button onClick={() => disconnect()} className="btn btn-secondary lc-nav-btn" title="Disconnect">
              <span className="lc-dot" style={{ color: 'var(--positive)' }} />
              {truncateAddress(address)}
            </button>
          ) : (
            <button onClick={connectWallet} className="btn btn-primary lc-nav-btn">
              Connect Wallet
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-btn"
            aria-label="Menu"
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: 4 }}
          >
            {mobileOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </nav>

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
              background: 'rgba(245,244,238,0.98)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 92,
              paddingLeft: 24,
              paddingRight: 24,
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
                    padding: '18px 0',
                    fontSize: 24,
                    fontWeight: 600,
                    color: isActive(pathname, link.href) ? 'var(--positive)' : 'var(--text-1)',
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
              style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
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
                  onClick={() => { connectWallet(); setMobileOpen(false) }}
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

      <style jsx global>{`
        .lc-navlink {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-2);
          text-decoration: none;
          transition: color 150ms ease;
        }
        .lc-navlink:hover { color: var(--text-1); }
        .lc-navlink[data-active='true'] { color: var(--primary); font-weight: 600; }
        .lc-navlink[data-active='true']::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 14px;
          height: 2px;
          border-radius: 1px;
          background: var(--positive);
        }
        .lc-nav-btn { padding: 9px 18px; font-size: 13px; }
        @media (max-width: 1024px) {
          .lc-nav { padding: 0 24px !important; }
          .nav-links { gap: 20px !important; margin-left: 32px !important; }
        }
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .mobile-btn { display: block !important; }
        }
        @media (max-width: 480px) {
          .lc-nav { padding: 0 16px !important; }
          .lc-nav-btn { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>
    </>
  )
}
