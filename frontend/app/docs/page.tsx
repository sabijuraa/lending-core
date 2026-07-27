'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowSquareOut, ArrowRight, CaretRight } from '@phosphor-icons/react'

const SECTIONS = {
  overview: {
    title: 'Overview',
    items: [
      { id: 'how-it-works', title: 'How it works' },
      { id: 'who-its-for', title: 'Who it\'s for' },
      { id: 'what-it-doesnt-do', title: 'What it doesn\'t do' },
    ],
  },
  markets: {
    title: 'Markets',
    items: [
      { id: 'creating-a-market', title: 'Creating a market' },
      { id: 'market-parameters', title: 'Market parameters' },
      { id: 'oracle-requirements', title: 'Oracle requirements' },
    ],
  },
  suppliers: {
    title: 'For Suppliers',
    items: [
      { id: 'depositing', title: 'Depositing' },
      { id: 'share-accounting', title: 'Share accounting' },
      { id: 'withdrawing', title: 'Withdrawing' },
    ],
  },
  borrowers: {
    title: 'For Borrowers',
    items: [
      { id: 'collateral', title: 'Collateral' },
      { id: 'health-factor', title: 'Health factor' },
      { id: 'liquidation-price', title: 'Liquidation price' },
    ],
  },
  liquidators: {
    title: 'For Liquidators',
    items: [
      { id: 'finding-positions', title: 'Finding positions' },
      { id: 'running-a-liquidation', title: 'Running a liquidation' },
      { id: 'economic-incentives', title: 'Economic incentives' },
    ],
  },
  risk: {
    title: 'Risk',
    items: [
      { id: 'oracle-risk', title: 'Oracle risk' },
      { id: 'liquidation-risk', title: 'Liquidation risk' },
      { id: 'smart-contract-risk', title: 'Smart contract risk' },
    ],
  },
  adrs: {
    title: 'ADRs',
    items: [
      { id: 'adr-1', title: 'ADR-1: Isolated markets' },
      { id: 'adr-2', title: 'ADR-2: Share math' },
      { id: 'adr-3', title: 'ADR-3: Oracle fail-closed' },
    ],
  },
}

const CONTENT: Record<string, { title: string; content: React.ReactNode }> = {
  'how-it-works': {
    title: 'How it works',
    content: (
      <>
        <p>Every other lending protocol connects markets together. When one oracle fails, the damage spreads everywhere connected to it.</p>
        <p>lending-core keeps every market completely separate — each one has its own oracle, its own collateral, its own rules. A problem in one market stays in that market.</p>
        <h3>The core mechanism</h3>
        <ol>
          <li>You deposit collateral into a specific market</li>
          <li>You can borrow against that collateral up to the market&apos;s LLTV limit</li>
          <li>Interest accrues to your position automatically</li>
          <li>If your position becomes unhealthy, anyone can liquidate it</li>
        </ol>
        <p>Each market has exactly one collateral asset, one loan asset, and one oracle. No sharing, no pooling, no cross-contamination.</p>
      </>
    ),
  },
  'who-its-for': {
    title: 'Who it\'s for',
    content: (
      <>
        <p>lending-core is for three types of users:</p>
        <h3>Suppliers</h3>
        <p>You have assets sitting idle. You want yield without active management. You deposit, you earn, you withdraw when you need liquidity.</p>
        <h3>Borrowers</h3>
        <p>You hold assets you don&apos;t want to sell. You want capital to deploy elsewhere. You post collateral, take a loan, and keep your exposure to the underlying asset.</p>
        <h3>Liquidators</h3>
        <p>You run bots that monitor the protocol for unhealthy positions. When you find one, you repay the debt and profit from the liquidation bonus.</p>
      </>
    ),
  },
  'what-it-doesnt-do': {
    title: 'What it doesn\'t do',
    content: (
      <>
        <p>lending-core is deliberately minimal. Here&apos;s what we chose not to build:</p>
        <ul>
          <li><strong>No pooled liquidity.</strong> Capital efficiency is lower than pooled protocols. This is the tradeoff for isolation.</li>
          <li><strong>No governance.</strong> Parameters are set at market creation and never change.</li>
          <li><strong>No upgrades.</strong> The contracts are immutable.</li>
          <li><strong>No interest rate governance.</strong> The kinked rate model is deterministic.</li>
          <li><strong>No protocol fees.</strong> All interest goes to suppliers.</li>
          <li><strong>No token.</strong> There is no protocol token.</li>
        </ul>
      </>
    ),
  },
  'creating-a-market': {
    title: 'Creating a market',
    content: (
      <>
        <p>Anyone can create a market. No governance vote required.</p>
        <h3>Required parameters</h3>
        <div className="code-block">
          <span className="keyword">function</span> <span className="function">createMarket</span>(<br />
          &nbsp;&nbsp;<span className="keyword">address</span> collateralToken,<br />
          &nbsp;&nbsp;<span className="keyword">address</span> loanToken,<br />
          &nbsp;&nbsp;<span className="keyword">address</span> oracle,<br />
          &nbsp;&nbsp;<span className="keyword">uint256</span> lltv,<br />
          &nbsp;&nbsp;<span className="keyword">uint256</span> liquidationBonus<br />
          )
        </div>
        <h3>Constraints</h3>
        <ul>
          <li>LLTV must be between 1% and 98%</li>
          <li>Liquidation bonus must be at least 1%</li>
          <li>Oracle must implement the IOracle interface</li>
          <li>Tokens must be ERC-20 compliant</li>
        </ul>
      </>
    ),
  },
  'market-parameters': {
    title: 'Market parameters',
    content: (
      <>
        <h3>LLTV (Liquidation Loan-to-Value)</h3>
        <p>The maximum ratio of debt to collateral. At 80% LLTV, you can borrow up to $80 for every $100 of collateral.</p>
        <h3>Liquidation bonus</h3>
        <p>The discount liquidators receive on collateral. At 5% bonus, liquidators pay $95 for $100 of collateral.</p>
        <h3>Rate model parameters</h3>
        <ul>
          <li><strong>Base rate:</strong> 2% — the rate at 0% utilization</li>
          <li><strong>Kink:</strong> 80% — the utilization inflection point</li>
          <li><strong>Kink rate:</strong> 10% — the rate at the kink</li>
          <li><strong>Max rate:</strong> 150% — the rate at 100% utilization</li>
        </ul>
      </>
    ),
  },
  'oracle-requirements': {
    title: 'Oracle requirements',
    content: (
      <>
        <p>Oracles must implement a single function:</p>
        <div className="code-block">
          <span className="keyword">function</span> <span className="function">price</span>() <span className="keyword">external</span> <span className="keyword">view</span> <span className="keyword">returns</span> (<span className="keyword">uint256</span>);
        </div>
        <h3>Fail-closed behavior</h3>
        <p>If the oracle returns 0 or reverts, all operations on that market halt. This is intentional — it&apos;s better to pause than to operate on bad data.</p>
        <h3>Staleness</h3>
        <p>The protocol does not enforce staleness internally. Market creators should use wrapper oracles that check for staleness.</p>
      </>
    ),
  },
  'depositing': {
    title: 'Depositing',
    content: (
      <>
        <p>To earn yield, deposit the loan asset into a market.</p>
        <div className="code-block">
          <span className="keyword">function</span> <span className="function">supply</span>(<br />
          &nbsp;&nbsp;<span className="keyword">bytes32</span> marketId,<br />
          &nbsp;&nbsp;<span className="keyword">uint256</span> amount,<br />
          &nbsp;&nbsp;<span className="keyword">address</span> onBehalfOf<br />
          ) <span className="keyword">external</span> <span className="keyword">returns</span> (<span className="keyword">uint256</span> shares);
        </div>
        <p>You receive shares proportional to your deposit. These shares increase in value as borrowers pay interest.</p>
      </>
    ),
  },
  'share-accounting': {
    title: 'Share accounting',
    content: (
      <>
        <p>Your position is tracked in shares, not amounts. The share-to-asset exchange rate increases over time as interest accrues.</p>
        <h3>Example</h3>
        <ul>
          <li>You deposit 1000 USDC when 1 share = 1 USDC</li>
          <li>You receive 1000 shares</li>
          <li>After interest accrues, 1 share = 1.05 USDC</li>
          <li>Your 1000 shares are now worth 1050 USDC</li>
        </ul>
        <p>No claiming, no loops, no gas. Your position just grows.</p>
      </>
    ),
  },
  'withdrawing': {
    title: 'Withdrawing',
    content: (
      <>
        <p>Withdraw your assets plus accrued yield at any time, subject to available liquidity.</p>
        <div className="code-block">
          <span className="keyword">function</span> <span className="function">withdraw</span>(<br />
          &nbsp;&nbsp;<span className="keyword">bytes32</span> marketId,<br />
          &nbsp;&nbsp;<span className="keyword">uint256</span> shares,<br />
          &nbsp;&nbsp;<span className="keyword">address</span> receiver<br />
          ) <span className="keyword">external</span> <span className="keyword">returns</span> (<span className="keyword">uint256</span> amount);
        </div>
        <h3>Liquidity constraints</h3>
        <p>You can only withdraw what&apos;s not currently borrowed. If utilization is 80%, only 20% of assets are available for withdrawal.</p>
      </>
    ),
  },
  'collateral': {
    title: 'Collateral',
    content: (
      <>
        <p>To borrow, you must first deposit collateral.</p>
        <div className="code-block">
          <span className="keyword">function</span> <span className="function">supplyCollateral</span>(<br />
          &nbsp;&nbsp;<span className="keyword">bytes32</span> marketId,<br />
          &nbsp;&nbsp;<span className="keyword">uint256</span> amount,<br />
          &nbsp;&nbsp;<span className="keyword">address</span> onBehalfOf<br />
          ) <span className="keyword">external</span>;
        </div>
        <p>Collateral is held in the market contract and is at risk of liquidation if your position becomes unhealthy.</p>
      </>
    ),
  },
  'health-factor': {
    title: 'Health factor',
    content: (
      <>
        <p>Your health factor measures how close you are to liquidation.</p>
        <div className="code-block">
          healthFactor = (collateralValue x LLTV) / debtValue
        </div>
        <ul>
          <li><strong>&gt; 1.0:</strong> Position is healthy</li>
          <li><strong>= 1.0:</strong> Position is at liquidation threshold</li>
          <li><strong>&lt; 1.0:</strong> Position can be liquidated</li>
        </ul>
        <p>Monitor your health factor. If the collateral price drops or debt increases, your health factor decreases.</p>
      </>
    ),
  },
  'liquidation-price': {
    title: 'Liquidation price',
    content: (
      <>
        <p>The liquidation price is the collateral price at which your position becomes liquidatable.</p>
        <div className="code-block">
          liquidationPrice = (debtValue / collateralAmount) / LLTV
        </div>
        <p>Example: You have $100 of ETH collateral and $60 of debt in a market with 75% LLTV. Your liquidation price is:</p>
        <div className="code-block">
          ($60 / $100) / 0.75 = $0.80 per current ETH price
        </div>
        <p>If ETH drops to 80% of its current price, you can be liquidated.</p>
      </>
    ),
  },
  'finding-positions': {
    title: 'Finding positions',
    content: (
      <>
        <p>Liquidators need to monitor all borrowing positions for health factor drops.</p>
        <h3>Events to watch</h3>
        <ul>
          <li><code>Borrow</code> — new position created</li>
          <li><code>Repay</code> — position reduced</li>
          <li><code>Liquidate</code> — position liquidated</li>
        </ul>
        <p>Index these events and recalculate health factors whenever oracle prices update.</p>
      </>
    ),
  },
  'running-a-liquidation': {
    title: 'Running a liquidation',
    content: (
      <>
        <p>To liquidate a position:</p>
        <div className="code-block">
          <span className="keyword">function</span> <span className="function">liquidate</span>(<br />
          &nbsp;&nbsp;<span className="keyword">bytes32</span> marketId,<br />
          &nbsp;&nbsp;<span className="keyword">address</span> borrower,<br />
          &nbsp;&nbsp;<span className="keyword">uint256</span> seizedCollateral<br />
          ) <span className="keyword">external</span>;
        </div>
        <ol>
          <li>Check that the position is liquidatable (health factor &lt; 1)</li>
          <li>Choose how much collateral to seize</li>
          <li>Call liquidate with the loan tokens to repay</li>
          <li>Receive the collateral minus the liquidation bonus</li>
        </ol>
      </>
    ),
  },
  'economic-incentives': {
    title: 'Economic incentives',
    content: (
      <>
        <p>Liquidators are guaranteed a profit on every healthy liquidation.</p>
        <h3>The math</h3>
        <ul>
          <li>You repay $100 of debt</li>
          <li>You receive $105 of collateral (5% bonus)</li>
          <li>Your profit is $5</li>
        </ul>
        <p>This incentive ensures liquidators are always motivated to keep the protocol healthy.</p>
      </>
    ),
  },
  'oracle-risk': {
    title: 'Oracle risk',
    content: (
      <>
        <p>The protocol depends entirely on oracle accuracy. If an oracle is manipulated:</p>
        <ul>
          <li>Attackers could drain collateral by inflating its value</li>
          <li>Legitimate borrowers could be wrongly liquidated</li>
          <li>The market could become insolvent</li>
        </ul>
        <h3>Mitigations</h3>
        <p>lending-core&apos;s isolation model limits the blast radius. A manipulated oracle only affects its own market — other markets continue operating normally.</p>
      </>
    ),
  },
  'liquidation-risk': {
    title: 'Liquidation risk',
    content: (
      <>
        <p>If you borrow, you can be liquidated. This happens when:</p>
        <ul>
          <li>Collateral price drops significantly</li>
          <li>You fail to repay or add collateral in time</li>
          <li>A liquidator sees your unhealthy position</li>
        </ul>
        <h3>What you lose</h3>
        <p>The collateral seized plus the liquidation bonus. In a full liquidation, you lose your entire position.</p>
      </>
    ),
  },
  'smart-contract-risk': {
    title: 'Smart contract risk',
    content: (
      <>
        <p>All smart contracts carry risk. lending-core is:</p>
        <ul>
          <li>Audited by Trail of Bits</li>
          <li>Covered by invariant-based fuzz testing</li>
          <li>Immutable (no upgrades)</li>
        </ul>
        <p>However, no audit guarantees safety. Use at your own risk.</p>
      </>
    ),
  },
  'adr-1': {
    title: 'ADR-1: Isolated markets',
    content: (
      <>
        <h3>Context</h3>
        <p>Most lending protocols pool assets across markets for capital efficiency. This creates systemic risk — one bad oracle can drain multiple markets.</p>
        <h3>Decision</h3>
        <p>Every market in lending-core is completely isolated. Markets share no state, no liquidity, no oracles.</p>
        <h3>Consequences</h3>
        <ul>
          <li>Lower capital efficiency than pooled protocols</li>
          <li>Completely contained blast radius for any single failure</li>
          <li>Simpler security analysis per market</li>
        </ul>
      </>
    ),
  },
  'adr-2': {
    title: 'ADR-2: Share math',
    content: (
      <>
        <h3>Context</h3>
        <p>Tracking user positions in absolute amounts requires constant updates as interest accrues.</p>
        <h3>Decision</h3>
        <p>Track positions in shares. The share-to-asset exchange rate increases as interest accrues. Rounding always favors the protocol.</p>
        <h3>Consequences</h3>
        <ul>
          <li>No per-user updates needed for interest accrual</li>
          <li>Tiny dust amounts lost to rounding</li>
          <li>Protocol is never undercollateralized due to rounding</li>
        </ul>
      </>
    ),
  },
  'adr-3': {
    title: 'ADR-3: Oracle fail-closed',
    content: (
      <>
        <h3>Context</h3>
        <p>Oracles can return stale data, zero prices, or revert entirely.</p>
        <h3>Decision</h3>
        <p>If an oracle returns 0 or reverts, all operations on that market halt. No borrows, no liquidations, no withdrawals of collateral.</p>
        <h3>Consequences</h3>
        <ul>
          <li>Market pauses during oracle failures</li>
          <li>No operations proceed on bad data</li>
          <li>Users may be temporarily unable to exit positions</li>
        </ul>
      </>
    ),
  },
}

function getInitialCategory(section: string | null): string | null {
  if (!section || !CONTENT[section]) return null
  for (const [key, cat] of Object.entries(SECTIONS)) {
    if (cat.items.some(item => item.id === section)) return key
  }
  return null
}

function DocsContent() {
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get('section')
  const initialSection = sectionParam && CONTENT[sectionParam] ? sectionParam : 'how-it-works'
  const initialCategory = getInitialCategory(sectionParam)

  const [activeSection, setActiveSection] = useState(initialSection)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => ({
    overview: true,
    markets: false,
    suppliers: false,
    borrowers: false,
    liquidators: false,
    risk: false,
    adrs: false,
    ...(initialCategory ? { [initialCategory]: true } : {}),
  }))

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const content = CONTENT[activeSection]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--bg-0)',
        borderRight: '0.5px solid var(--border-default)',
        padding: '32px 0',
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 24px 24px', borderBottom: '0.5px solid var(--border-default)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>Documentation</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>lending-core protocol</p>
        </div>

        <nav style={{ padding: '16px 0' }}>
          {Object.entries(SECTIONS).map(([key, section]) => (
            <div key={key}>
              <button
                onClick={() => toggleCategory(key)}
                style={{
                  width: '100%',
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  textAlign: 'left',
                }}
              >
                {section.title}
                <CaretRight
                  size={12}
                  style={{
                    color: 'var(--text-3)',
                    transform: openCategories[key] ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                />
              </button>

              {openCategories[key] && (
                <div style={{ paddingBottom: 8 }}>
                  {section.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      style={{
                        width: '100%',
                        padding: '8px 24px 8px 40px',
                        background: activeSection === item.id ? 'var(--accent-dim)' : 'none',
                        border: 'none',
                        borderLeft: activeSection === item.id ? '2px solid var(--accent)' : '2px solid transparent',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: activeSection === item.id ? 'var(--accent)' : 'var(--text-2)',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '0.5px solid var(--border-default)', marginTop: 16 }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark"
            style={{ width: '100%', fontSize: 13, justifyContent: 'center' }}
          >
            View on GitHub
            <ArrowSquareOut size={13} />
          </a>
        </div>
      </aside>

      {/* Content */}
      <main style={{ padding: '48px 64px', maxWidth: 800 }}>
        {content && (
          <>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-1)',
              marginBottom: 32,
            }}>
              {content.title}
            </h1>
            <div className="docs-content">
              {content.content}
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 64,
          paddingTop: 32,
          borderTop: '0.5px solid var(--border-default)',
        }}>
          <Link href="/markets" className="btn btn-primary" style={{ fontSize: 14 }}>
            Open a position
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
          <div className="skeleton" style={{ width: 200, height: 20, borderRadius: 4 }} />
        </div>
      }>
        <DocsContent />
      </Suspense>

      <style jsx global>{`
        .docs-content p {
          font-size: 15px;
          color: var(--text-2);
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .docs-content h3 {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          color: var(--text-1);
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .docs-content ul, .docs-content ol {
          margin: 0 0 16px 0;
          padding-left: 24px;
          color: var(--text-2);
          font-size: 15px;
          line-height: 1.8;
        }
        .docs-content li {
          margin-bottom: 8px;
        }
        .docs-content code {
          font-family: var(--font-mono);
          font-size: 13px;
          background: var(--bg-2);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--accent);
        }
        .docs-content strong {
          color: var(--text-1);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
