'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { List, X } from '@phosphor-icons/react'
import { Logo } from '@/components/ui/Logo'

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/markets', label: 'Markets' },
  { href: '/docs', label: 'Learn & Docs' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

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
        <Logo />

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
          <Link href="/dashboard" className="btn btn-primary lc-nav-btn hide-mobile-sm">
            Launch app
          </Link>

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
              <Link
                href="/dashboard"
                className="btn btn-primary"
                onClick={() => setMobileOpen(false)}
                style={{ width: '100%', fontSize: 15, padding: '14px 24px' }}
              >
                Launch app
              </Link>
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
        @media (max-width: 1100px) {
          .nav-links { gap: 22px !important; margin-left: 36px !important; }
        }
        @media (max-width: 480px) {
          .lc-nav { padding: 0 16px !important; }
          .hide-mobile-sm { display: none !important; }
          .lc-nav-btn { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>
    </>
  )
}
