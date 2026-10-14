'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  SquaresFour,
  ChartLineUp,
  PiggyBank,
  HandCoins,
  Plant,
  Wallet,
  Lightning,
  ClockCounterClockwise,
  ChartBar,
  BookOpen,
  ShieldCheck,
  List,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { Logo } from '@/components/ui/Logo'
import { truncateAddress } from '@/lib/formatting'
import { explorer } from '@/lib/addresses'
import { useWallet } from './wallet'
import s from './app-shell.module.css'

type NavItem = { href: string; label: string; icon: Icon; match?: string }

const APP_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  { href: '/markets', label: 'Markets', icon: ChartLineUp },
  { href: '/supply/weth', label: 'Supply', icon: PiggyBank, match: '/supply' },
  { href: '/borrow', label: 'Borrow', icon: HandCoins },
  { href: '/earn', label: 'Earn', icon: Plant },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/liquidations', label: 'Liquidations', icon: Lightning },
  { href: '/transactions', label: 'Transactions', icon: ClockCounterClockwise },
  { href: '/analytics', label: 'Analytics', icon: ChartBar },
]

const LEARN_NAV: NavItem[] = [
  { href: '/docs', label: 'Learn & Docs', icon: BookOpen },
  { href: '/security', label: 'Security', icon: ShieldCheck },
]

function isActive(pathname: string, item: NavItem) {
  const base = item.match ?? item.href
  return pathname === base || pathname.startsWith(base + '/')
}

function pageTitle(pathname: string) {
  if (pathname === '/markets/create') return 'Create market'
  if (pathname.startsWith('/markets/')) return 'Market details'
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    markets: 'Markets',
    supply: 'Supply',
    borrow: 'Borrow',
    earn: 'Earn',
    portfolio: 'Portfolio',
    liquidations: 'Liquidations',
    transactions: 'Transactions',
    analytics: 'Analytics',
  }
  return map[pathname.split('/')[1] ?? ''] ?? 'lending-core'
}

/** Deterministic two tone avatar for an address. */
function Avatar({ address, size = 28 }: { address: string; size?: number }) {
  const h = parseInt(address.slice(2, 8), 16) % 360
  return (
    <span
      aria-hidden="true"
      className={s.avatar}
      style={{ width: size, height: size, background: `linear-gradient(135deg, hsl(${h} 38% 42%), hsl(${(h + 60) % 360} 45% 72%))` }}
    />
  )
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const reduce = useReducedMotion()
  const renderItem = (item: NavItem, layoutGroup: string) => {
    const active = isActive(pathname, item)
    const I = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={s.navItem}
        data-active={active}
        aria-current={active ? 'page' : undefined}
      >
        {active && (
          <motion.span
            layoutId={`${layoutGroup}-active`}
            className={s.navActiveBg}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
          />
        )}
        <I size={18} weight={active ? 'fill' : 'regular'} className={s.navIcon} />
        <span className={s.navLabel}>{item.label}</span>
      </Link>
    )
  }
  return (
    <nav aria-label="App" className={s.nav}>
      <div className={s.navGroupLabel}>App</div>
      {APP_NAV.map((i) => renderItem(i, 'nav'))}
      <div className={s.navGroupLabel} style={{ marginTop: 18 }}>Learn</div>
      {LEARN_NAV.map((i) => renderItem(i, 'nav'))}
    </nav>
  )
}

function AccountCard() {
  const w = useWallet()
  if (w.isConnected && w.address) {
    return (
      <div className={s.accountCard}>
        <Avatar address={w.address} size={32} />
        <div style={{ minWidth: 0 }}>
          <div className={s.accountAddr}>{truncateAddress(w.address)}</div>
          <div className={s.accountStatus}>
            <span className={s.statusDot} style={{ background: w.wrongNetwork ? 'var(--warning)' : 'var(--positive)' }} />
            {w.wrongNetwork ? 'Wrong network' : 'Connected'}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className={s.accountCard} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
      <p className={s.accountHint}>Connect a wallet to supply, borrow and track every position.</p>
      <button type="button" className="btn btn-primary" onClick={w.connectWallet} disabled={w.isConnecting} style={{ width: '100%', padding: '10px 16px', fontSize: 13 }}>
        {w.isConnecting ? 'Connecting' : 'Connect Wallet'}
      </button>
    </div>
  )
}

function AccountMenu() {
  const w = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!w.isConnected || !w.address) {
    return (
      <button type="button" className={`btn btn-primary ${s.topBtn}`} onClick={w.connectWallet} disabled={w.isConnecting}>
        {w.isConnecting ? 'Connecting' : 'Connect Wallet'}
      </button>
    )
  }

  const address = w.address
  const copy = async () => {
    try { await navigator.clipboard.writeText(address) } catch { /* clipboard blocked */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className={s.accountBtn} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <Avatar address={address} size={22} />
        <span>{truncateAddress(address)}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className={s.menu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
          >
            <div className={s.menuHead}>
              <Avatar address={address} size={36} />
              <div style={{ minWidth: 0 }}>
                <div className={s.menuAddr}>{truncateAddress(address, 8, 6)}</div>
                <div className={s.accountStatus}>
                  <span className={s.statusDot} style={{ background: w.wrongNetwork ? 'var(--warning)' : 'var(--positive)' }} />
                  {w.wrongNetwork ? 'Wrong network' : 'Connected'}
                </div>
              </div>
            </div>
            <button type="button" role="menuitem" className={s.menuItem} onClick={copy}>
              {copied ? 'Address copied' : 'Copy address'}
            </button>
            <a role="menuitem" className={s.menuItem} href={explorer(address)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              View on explorer
            </a>
            <Link role="menuitem" className={s.menuItem} href="/transactions" onClick={() => setOpen(false)}>
              Transaction history
            </Link>
            <button type="button" role="menuitem" className={`${s.menuItem} ${s.menuDanger}`} onClick={() => { w.disconnect(); setOpen(false) }}>
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WrongNetwork() {
  const w = useWallet()
  if (!w.wrongNetwork) return null
  return (
    <div className={s.wrongNet} role="alert">
      <span>
        <strong>Wrong network.</strong> Your wallet is connected to a different network. Switch to continue using lending-core.
      </span>
      <button type="button" className="btn btn-primary" onClick={w.switchNetwork} disabled={w.isSwitching} style={{ padding: '8px 16px', fontSize: 13 }}>
        {w.isSwitching ? 'Switching' : 'Switch network'}
      </button>
    </div>
  )
}

/** App layout with a fixed sidebar, a top bar with the wallet control and a mobile drawer. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [drawer, setDrawer] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawer])

  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.brand}><Logo /></div>
        <SidebarNav pathname={pathname} />
        <div className={s.sidebarFoot}><AccountCard /></div>
      </aside>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className={s.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className={s.drawer}
              initial={reduce ? { opacity: 0 } : { x: '-100%' }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: '-100%' }}
              transition={{ type: 'tween', duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              aria-label="App menu"
            >
              <div className={s.brand} style={{ justifyContent: 'space-between' }}>
                <Logo />
                <button type="button" className={s.iconBtn} onClick={() => setDrawer(false)} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <SidebarNav pathname={pathname} onNavigate={() => setDrawer(false)} />
              <div className={s.sidebarFoot}><AccountCard /></div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={s.main}>
        <header className={s.topbar}>
          <button type="button" className={`${s.iconBtn} ${s.menuToggle}`} onClick={() => setDrawer(true)} aria-label="Open menu">
            <List size={22} />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageTitle(pathname)}
              className={s.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {pageTitle(pathname)}
            </motion.div>
          </AnimatePresence>
          <div className={s.topRight}><AccountMenu /></div>
        </header>
        <WrongNetwork />
        <main className={s.content}>{children}</main>
      </div>
    </div>
  )
}
