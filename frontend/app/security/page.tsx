import Link from 'next/link'

export const metadata = { title: 'Security | lending-core' }

const REPO = 'https://github.com/sabijuraa/lending-core'

const checks = [
  ['Unit and fuzz tests', 'Every external function of LendingCore, the rate model, the oracle adapter and the math libraries, with fuzzed amounts and time jumps.'],
  ['Invariant tests', 'A handler drives supply, borrow, repay, withdraw, liquidation, price crashes and time warps while solvency, collateral accounting and share consistency are checked after every call.'],
  ['Deploy rehearsal', 'The Base Sepolia deploy script runs inside the test suite and a full supply, borrow and liquidation flow is driven through what it deploys.'],
  ['Threat model', 'THREAT_MODEL.md lists who is trusted, which attacks are defended against and which are out of scope.'],
]

const model = [
  ['No admin', 'Markets are immutable. No key can change parameters, pause a market or move funds.'],
  ['Untrusted oracles', 'Prices must be above zero and newer than the market staleness limit, or the call reverts.'],
  ['Inflation resistant shares', 'Virtual shares and assets on every conversion stop the empty market donation attack.'],
  ['Rounding favours the protocol', 'Each conversion rounds so the market keeps the remainder.'],
  ['Bad debt is realized', 'If a liquidation leaves debt without collateral, it is written off against that market at once.'],
]

const stack = ['Solidity 0.8.26', 'Foundry', 'Solady', 'Base', 'Next.js', 'wagmi and viem', 'Ponder']

export default function SecurityPage() {
  return (
    <div style={{ padding: '56px 0 96px' }}>
      <div className="section-container" style={{ maxWidth: 900 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12 }}>Security</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 17, lineHeight: 1.6, marginBottom: 12 }}>
          lending-core has not had an external audit. This page lists what has been done instead so you can judge the risk yourself.
        </p>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 40 }}>Treat the Base Sepolia deployment as testnet software.</p>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>What is tested</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
          {checks.map(([t, d]) => (
            <div key={t} className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{t}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{d}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Security model</h2>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 12, marginBottom: 48 }}>
          {model.map(([t, d]) => (
            <li key={t} style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 16 }}>
              <strong>{t}.</strong> <span style={{ color: 'var(--text-2)' }}>{d}</span>
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Contracts</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 48 }}>
          The Base Sepolia deployment is scripted and rehearsed but not broadcast yet. Addresses will be listed here with Basescan links once it is. The source is on <a href={REPO} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>GitHub</a> and the threat model is in <a href={`${REPO}/blob/main/THREAT_MODEL.md`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>THREAT_MODEL.md</a>.
        </p>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Built on</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
          {stack.map((s) => <span key={s} className="pill">{s}</span>)}
        </div>
        <Link href="/how-it-works" className="btn btn-ghost">How the protocol works</Link>
      </div>
    </div>
  )
}
