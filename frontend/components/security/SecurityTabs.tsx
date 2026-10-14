'use client'
import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Stagger, StaggerItem } from '@/components/ui/Reveal'
import {
  Warning,
  CheckCircle,
  Circle,
  ShieldWarning,
  Eye,
  ChartLineDown,
  Lightning,
} from '@phosphor-icons/react'

const REPO = 'https://github.com/sabijuraa/lending-core'

type Tab = 'audit' | 'methodology' | 'disclosures'

const TABS: { id: Tab; label: string; hash: string }[] = [
  { id: 'audit', label: 'Audit Status', hash: '#audit-status' },
  { id: 'methodology', label: 'Risk Methodology', hash: '#risk-methodology' },
  { id: 'disclosures', label: 'Risk Disclosures', hash: '#risk-disclosures' },
]

const checks = [
  ['Unit and fuzz tests', 'Every action you can take is tested, including with thousands of random amounts and jumps forward in time.'],
  ['Invariant tests', 'Random sequences of deposits, loans, repayments, crashes and liquidations run over and over, and after every step we check that the market can still pay everyone back.'],
  ['Deploy rehearsal', 'The exact production deployment is rehearsed in the tests, then a full lend, borrow and liquidate journey is run against it.'],
  ['Threat model', 'A public document lists who has to be trusted, which attacks are defended against and which risks are accepted.'],
]

const model = [
  ['No admin', 'Markets cannot be changed once created. No key can alter the rules, pause a market or move your funds.'],
  ['Price feeds are checked, not trusted', 'A price must make sense and be recent enough, or the market refuses to act on it.'],
  ['Protected from share tricks', 'The way deposits are counted blocks a known attack where someone manipulates a brand new, empty market.'],
  ['Rounding never works against the market', 'Every calculation rounds so the market keeps the tiny remainder, which means it can never owe more than it holds.'],
  ['Losses are recorded honestly', 'If a crash leaves a loan underwater, the loss is written off inside that market straight away, never hidden.'],
]

const knownRisks = [
  { icon: ShieldWarning, color: 'var(--danger)', bg: 'var(--danger-dim)', t: 'Smart contract risk', d: 'Unaudited code can contain bugs that lead to a loss of funds.' },
  { icon: Eye, color: 'var(--warning)', bg: 'var(--warning-dim)', t: 'Oracle dependency', d: 'Each market trusts one price feed. A wrong or stale price affects that market.' },
  { icon: ChartLineDown, color: 'var(--accent)', bg: 'var(--accent-dim)', t: 'Market volatility', d: 'Fast collateral price drops can push positions below the liquidation threshold.' },
  { icon: Lightning, color: 'var(--text-2)', bg: 'var(--surface-2)', t: 'Liquidation risk', d: 'Positions with a health factor below 1 can be liquidated by anyone at a bonus.' },
]

const disclosures = [
  ['New software', 'lending-core is young software. Do not use it with funds you cannot afford to lose.'],
  ['No external audit', 'The contracts have been tested internally but no third party has reviewed them.'],
  ['No insurance', 'There is no insurance fund. Losses in a market are carried by the lenders of that market.'],
  ['Isolated losses only', 'Bad debt in one market never touches another market, but it is fully realized inside the market where it happens.'],
  ['Oracle choice is yours', 'Anyone can create a market with any oracle. Check the oracle of a market before you supply to it.'],
  ['Displayed values are estimates', 'Rates, health factors and outcomes in the interface are computed from current state and can change before a transaction is mined.'],
]

const stack = ['Solidity 0.8.26', 'Foundry', 'Solady', 'Base', 'Next.js', 'wagmi and viem', 'Ponder']

function subscribeHash(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

const cardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }

export function SecurityTabs() {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => '')
  const [chosen, setChosen] = useState<Tab | null>(null)
  const reduce = useReducedMotion()
  const tab: Tab = chosen ?? TABS.find(t => t.hash === hash)?.id ?? 'audit'

  const select = (t: Tab) => {
    setChosen(t)
    const h = TABS.find(x => x.id === t)!.hash
    window.history.replaceState(null, '', h)
  }

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--border-default)', margin: '28px 0 28px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            style={{
              position: 'relative',
              padding: '0 0 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: tab === t.id ? 600 : 500,
              color: tab === t.id ? 'var(--text-1)' : 'var(--text-3)',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
            {tab === t.id && (
              <motion.span layoutId="security-tab" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: 'var(--accent)', borderRadius: 2 }} />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'audit' && <AuditStatus onDisclosures={() => select('disclosures')} />}
          {tab === 'methodology' && <Methodology />}
          {tab === 'disclosures' && <Disclosures />}
        </motion.div>
      </AnimatePresence>
      <style>{`
        .sec-card { transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease; }
        .sec-card:hover { border-color: var(--accent-border); box-shadow: 0 10px 28px rgba(16,43,39,0.08); transform: translateY(-3px); }
        @media (prefers-reduced-motion: reduce) { .sec-card:hover { transform: none; } }
      `}</style>
    </div>
  )
}

function AuditStatus({ onDisclosures }: { onDisclosures: () => void }) {
  const verified: { t: string; d: React.ReactNode; done: boolean }[] = [
    { t: 'Smart contracts tested', d: `${checks.length} of ${checks.length} internal checks complete`, done: true },
    {
      t: 'Source code',
      d: <a href={REPO} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>GitHub</a>,
      done: true,
    },
    { t: 'Deployment addresses', d: 'Listed here once the contracts are deployed', done: false },
  ]

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20, marginBottom: 36 }}>
        {/* Audit card */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--danger-dim)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Warning size={18} weight="fill" style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>Audit Status</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>Not yet audited</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                No outside firm has reviewed the contracts yet. They are thoroughly tested in house, but please read the disclosures below and only use test funds for now.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
              <span>Internal review</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{checks.length} / {checks.length}</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} style={{ height: '100%', background: 'var(--positive)', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 8 }}>External audit not started</div>
          </div>
        </div>

        {/* Verified information */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ ...cardTitle, marginBottom: 18 }}>Verified Information</div>
          <div style={{ display: 'grid', gap: 18 }}>
            {verified.map(v => (
              <div key={v.t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {v.done
                  ? <CheckCircle size={20} weight="fill" style={{ color: 'var(--positive)', flexShrink: 0 }} />
                  : <Circle size={20} style={{ color: 'var(--text-4)', flexShrink: 0 }} />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{v.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{v.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What is tested */}
      <h2 style={{ ...cardTitle, fontSize: 17, marginBottom: 14 }}>What is tested</h2>
      <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 36 }}>
        {checks.map(([t, d]) => (
          <StaggerItem key={t}>
          <div className="card sec-card" style={{ padding: 18, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle size={16} weight="fill" style={{ color: 'var(--positive)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>{t}</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{d}</p>
          </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Known risks */}
      <h2 style={{ ...cardTitle, fontSize: 17, marginBottom: 14 }}>Known Risks</h2>
      <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14, marginBottom: 20 }}>
        {knownRisks.map(r => (
          <StaggerItem key={r.t}>
          <div className="card sec-card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', height: '100%' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: r.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <r.icon size={17} weight="duotone" style={{ color: r.color }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{r.t}</div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{r.d}</p>
            </div>
          </div>
          </StaggerItem>
        ))}
      </Stagger>
      <button
        onClick={onDisclosures}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        View full risk disclosure
      </button>
    </>
  )
}

function Methodology() {
  return (
    <>
      <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 720, marginBottom: 24 }}>
        Every market is a fixed recipe of one asset to borrow, one asset to deposit, one price feed and one set of rules. Whatever risk a market carries stays inside it. These are the protections that apply everywhere.
      </p>
      <Stagger style={{ display: 'grid', gap: 12, marginBottom: 36 }}>
        {model.map(([t, d]) => (
          <StaggerItem key={t}>
            <div className="card sec-card" style={{ padding: '16px 20px', borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{t}</div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{d}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <h2 style={{ ...cardTitle, fontSize: 17, marginBottom: 12 }}>Built on</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {stack.map(s => <span key={s} className="pill">{s}</span>)}
      </div>
      <Link href="/how-it-works" className="btn btn-ghost">How the protocol works</Link>
    </>
  )
}

function Disclosures() {
  return (
    <>
      <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 14, marginBottom: 28 }}>
        {disclosures.map(([t, d]) => (
          <StaggerItem key={t}>
          <div className="card sec-card" style={{ padding: 20, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Warning size={15} weight="fill" style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>{t}</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{d}</p>
          </div>
          </StaggerItem>
        ))}
      </Stagger>
      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 720 }}>
        The source is on <a href={REPO} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>GitHub</a> and the threat model is in <a href={`${REPO}/blob/main/THREAT_MODEL.md`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>THREAT_MODEL.md</a>. See the <Link href="/terms" style={{ color: 'var(--accent)' }}>terms of use</Link> for the full legal text.
      </p>
    </>
  )
}
