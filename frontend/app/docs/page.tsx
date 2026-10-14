'use client'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  Code,
  Cube,
  ShieldCheck,
} from '@phosphor-icons/react'
import {
  C,
  CodeBlock,
  DARK,
  DARK_2,
  DocSection,
  K,
  LearnStyles,
  S,
  TopicCard,
  UnderlineTabs,
} from '@/components/learn/ui'

const REPO = 'https://github.com/sabijuraa/lending-core'

type Tab = 'learn' | 'risk' | 'developers'

const TABS: { id: Tab; label: string }[] = [
  { id: 'learn', label: 'Learn' },
  { id: 'risk', label: 'Risk Methodology' },
  { id: 'developers', label: 'Developers' },
]

/* Old sidebar anchors (?section=) still resolve to the right tab. */
const SECTION_TAB: Record<string, Tab> = {
  'how-it-works': 'learn',
  'who-its-for': 'learn',
  'what-it-doesnt-do': 'learn',
  'isolated-markets': 'learn',
  'market-parameters': 'learn',
  depositing: 'learn',
  'share-accounting': 'learn',
  withdrawing: 'learn',
  collateral: 'learn',
  'health-factor': 'risk',
  'liquidation-price': 'risk',
  'liquidations': 'risk',
  'economic-incentives': 'risk',
  'oracle-risk': 'risk',
  'liquidation-risk': 'risk',
  'bad-debt': 'risk',
  'rate-model': 'risk',
  'smart-contract-risk': 'risk',
  'contract-interface': 'developers',
  'creating-a-market': 'developers',
  'oracle-requirements': 'developers',
  'finding-positions': 'developers',
  'running-a-liquidation': 'developers',
  adrs: 'developers',
  'adr-1': 'developers',
  'adr-2': 'developers',
  'adr-3': 'developers',
}

/* ─── Page ───────────────────────────────────────────────── */

function DocsHub() {
  const router = useRouter()
  const params = useSearchParams()
  const tabParam = params.get('tab') as Tab | null
  const sectionParam = params.get('section')
  const tab: Tab =
    tabParam && TABS.some(t => t.id === tabParam)
      ? tabParam
      : (sectionParam && SECTION_TAB[sectionParam]) || 'learn'

  useEffect(() => {
    if (!sectionParam) return
    const el = document.getElementById(sectionParam)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [sectionParam, tab])

  const go = (next: Tab, section?: string) => {
    const q = new URLSearchParams({ tab: next })
    if (section) q.set('section', section)
    router.replace(`/docs?${q.toString()}`, { scroll: !section })
  }

  return (
    <div className="section-container" style={{ maxWidth: 1160, padding: '48px 24px 96px' }}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 28 }}
      >
        <h1 className="page-heading" style={{ fontSize: 'clamp(30px, 4vw, 40px)', marginBottom: 10 }}>
          Learn &amp; Docs
        </h1>
        <p className="page-subtitle" style={{ maxWidth: 560 }}>
          Understand the protocol, assess the risks and build with confidence.
        </p>
      </motion.header>

      <UnderlineTabs tabs={TABS} active={tab} onChange={id => go(id)} />

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {tab === 'learn' && <LearnTab go={go} />}
        {tab === 'risk' && <RiskTab />}
        {tab === 'developers' && <DevelopersTab />}
      </motion.div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <LearnStyles />
      <Suspense
        fallback={
          <div className="section-container" style={{ maxWidth: 1160, padding: '48px 24px' }}>
            <div className="skeleton" style={{ width: 240, height: 36, borderRadius: 6 }} />
          </div>
        }
      >
        <DocsHub />
      </Suspense>
    </div>
  )
}

/* ─── Learn tab ──────────────────────────────────────────── */

function LearnTab({ go }: { go: (t: Tab, section?: string) => void }) {
  return (
    <>
      <div
        className="learn-hub-grid"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 20, alignItems: 'stretch' }}
      >
        <div className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <TopicCard
            icon={<BookOpen size={20} />}
            title="How Lending Works"
            desc="A simple guide to supply, borrow, interest rates and liquidations."
            href="/how-it-works"
          />
          <TopicCard
            icon={<Cube size={20} />}
            title="Isolated Markets"
            desc="Why isolation reduces contagion risk and how it works."
            onClick={() => go('learn', 'isolated-markets')}
          />
          <TopicCard
            icon={<ShieldCheck size={20} />}
            title="Risk Management"
            desc="Collateral, oracles, health factor and liquidation mechanics."
            onClick={() => go('risk')}
          />
          <TopicCard
            icon={<Code size={20} />}
            title="Developer Documentation"
            desc="Contracts, interfaces, integration guides and examples."
            onClick={() => go('developers')}
          />
        </div>

        <BuildCard onDocs={() => go('developers')} />
      </div>

      <TwoCol
        nav={[
          { id: 'how-it-works', label: 'How it works' },
          { id: 'who-its-for', label: 'Who it is for' },
          { id: 'what-it-doesnt-do', label: 'What it does not do' },
          { id: 'isolated-markets', label: 'Isolated markets' },
          { id: 'market-parameters', label: 'Market parameters' },
          { id: 'depositing', label: 'Supplying' },
          { id: 'share-accounting', label: 'Share accounting' },
          { id: 'withdrawing', label: 'Withdrawing' },
          { id: 'collateral', label: 'Collateral' },
        ]}
        title="Guides"
      >
        <DocSection id="how-it-works" eyebrow="Overview" title="How it works">
          <p>Pooled lending protocols connect markets together. When one oracle fails, the damage spreads to everything connected to it.</p>
          <p>lending-core keeps every market completely separate. Each one has its own oracle, its own collateral and its own rules. A problem in one market stays in that market.</p>
          <ol>
            <li>You deposit collateral into a specific market</li>
            <li>You borrow against that collateral up to the market LLTV</li>
            <li>Interest accrues to your position automatically</li>
            <li>If your position becomes unhealthy, anyone can liquidate it</li>
          </ol>
          <p>
            Each market has exactly one collateral asset, one loan asset and one oracle. No sharing, no pooling, no cross contamination.{' '}
            <Link href="/how-it-works" style={{ color: 'var(--accent)', fontWeight: 600 }}>Read the full walkthrough</Link>
          </p>
        </DocSection>

        <DocSection id="who-its-for" eyebrow="Overview" title="Who it is for">
          <h4>Suppliers</h4>
          <p>You have assets sitting idle and want yield without active management. You deposit, you earn, you withdraw when you need liquidity.</p>
          <h4>Borrowers</h4>
          <p>You hold assets you do not want to sell and want capital to deploy elsewhere. You post collateral, take a loan and keep your exposure to the underlying asset.</p>
          <h4>Liquidators</h4>
          <p>You run bots that watch for unhealthy positions. When you find one, you repay the debt and receive the collateral plus the liquidation bonus.</p>
        </DocSection>

        <DocSection id="what-it-doesnt-do" eyebrow="Overview" title="What it does not do">
          <p>lending-core is deliberately minimal. These are the things it chose not to build.</p>
          <ul>
            <li><strong>No pooled liquidity.</strong> Capital efficiency is lower than pooled protocols. That is the tradeoff for isolation.</li>
            <li><strong>No governance.</strong> Parameters are set at market creation and never change.</li>
            <li><strong>No upgrades.</strong> There is no proxy and no admin key. The contracts are immutable.</li>
            <li><strong>No protocol fees.</strong> All interest paid by borrowers goes to suppliers.</li>
            <li><strong>No token.</strong> There is no protocol token.</li>
          </ul>
        </DocSection>

        <DocSection id="isolated-markets" eyebrow="Markets" title="Isolated markets">
          <p>A market is a fixed pair of loan asset and collateral asset with one oracle, one rate model, one LLTV, one liquidation bonus and one staleness limit. Its id is the hash of those parameters, so nobody can change them after creation.</p>
          <p>Anyone can create a market without a governance vote. A bad oracle or a crashing collateral can only hurt the market that chose it. Every other market keeps running.</p>
        </DocSection>

        <DocSection id="market-parameters" eyebrow="Markets" title="Market parameters">
          <h4>LLTV</h4>
          <p>The liquidation loan to value. It is the largest share of collateral value you can owe before the position can be liquidated. At 80% LLTV you can borrow up to $80 for every $100 of collateral.</p>
          <h4>Liquidation bonus</h4>
          <p>The extra collateral a liquidator receives on top of the debt they repay. The contract requires it to be above zero and at most 20%.</p>
          <h4>Max staleness</h4>
          <p>How old an oracle price may be before the market refuses to use it. Set per market because a stablecoin price stays valid longer than a volatile one.</p>
          <h4>Rate model</h4>
          <p>Each market points at a rate model contract. The testnet deployment uses a kinked curve with a 0% base rate, an 80% kink, about 4% APR at the kink and 100% APR at full utilization.</p>
        </DocSection>

        <DocSection id="depositing" eyebrow="For suppliers" title="Supplying">
          <p>To earn yield, supply the loan asset to a market. You receive supply shares, rounded down in favor of the market.</p>
          <CodeBlock>
            <K>function</K> supply(MarketParams params, <K>uint256</K> assets, <K>address</K> onBehalf){'\n'}
            {'    '}<K>external returns</K> (<K>uint256</K> shares);
          </CodeBlock>
          <p>Your shares grow in value as borrowers pay interest. There is nothing to claim.</p>
        </DocSection>

        <DocSection id="share-accounting" eyebrow="For suppliers" title="Share accounting">
          <p>Your position is tracked in shares, not amounts. The exchange rate between shares and assets rises as interest accrues.</p>
          <ul>
            <li>You supply 1,000 USDC when one share is worth one USDC</li>
            <li>You receive 1,000 shares</li>
            <li>After interest accrues one share is worth 1.05 USDC</li>
            <li>Your 1,000 shares are now worth 1,050 USDC</li>
          </ul>
          <p>Rounding always favors the protocol, so the market can never owe more than it holds because of rounding.</p>
        </DocSection>

        <DocSection id="withdrawing" eyebrow="For suppliers" title="Withdrawing">
          <p>Withdraw your assets plus accrued yield at any time, as long as the market has the liquidity.</p>
          <CodeBlock>
            <K>function</K> withdraw(MarketParams params, <K>uint256</K> assets, <K>address</K> onBehalf, <K>address</K> receiver){'\n'}
            {'    '}<K>external returns</K> (<K>uint256</K> shares);
          </CodeBlock>
          <p>You can only withdraw what is not currently borrowed. If utilization is 80%, only 20% of supplied assets are available. The call reverts with <code>InsufficientLiquidity</code> otherwise.</p>
        </DocSection>

        <DocSection id="collateral" eyebrow="For borrowers" title="Collateral">
          <p>To borrow you first supply collateral to the market.</p>
          <CodeBlock>
            <K>function</K> supplyCollateral(MarketParams params, <K>uint256</K> assets, <K>address</K> onBehalf) <K>external</K>;
          </CodeBlock>
          <p>Collateral sits in the LendingCore contract and can be seized if your position becomes unhealthy. Withdrawing collateral is only allowed while the position stays healthy afterwards.</p>
        </DocSection>
      </TwoCol>
    </>
  )
}

function BuildCard({ onDocs }: { onDocs: () => void }) {
  return (
    <aside
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(165deg, #17423A 0%, ${DARK} 45%, ${DARK_2} 100%)`,
        color: '#FFFFFF',
        borderRadius: 'var(--r-md)',
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 'auto -40px -60px auto',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,181,155,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>Build with Lending Core</h3>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, marginBottom: 22 }}>
        Integrate with our contracts and start building your own products.
      </p>
      <button
        type="button"
        onClick={onDocs}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid rgba(255,255,255,0.45)',
          background: 'transparent',
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: 28,
        }}
      >
        View developer docs <ArrowRight size={13} />
      </button>
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        <CodeBlock tone="inset">
          <K>import</K> {'{'} createPublicClient, http {'}'}{'\n'}
          {'  '}<K>from</K> <S>&apos;viem&apos;</S>{'\n'}
          <K>import</K> {'{'} baseSepolia {'}'} <K>from</K> <S>&apos;viem/chains&apos;</S>{'\n'}
          {'\n'}
          <K>const</K> client = createPublicClient({'{'}{'\n'}
          {'  '}chain: baseSepolia,{'\n'}
          {'  '}transport: http(),{'\n'}
          {'}'}){'\n'}
          {'\n'}
          <K>const</K> pos = <K>await</K> client.readContract({'{'}{'\n'}
          {'  '}address: LENDING_CORE,{'\n'}
          {'  '}abi: lendingCoreAbi,{'\n'}
          {'  '}functionName: <S>&apos;position&apos;</S>,{'\n'}
          {'  '}args: [marketId, account],{'\n'}
          {'}'})
        </CodeBlock>
      </div>
    </aside>
  )
}

/* ─── Risk methodology tab ───────────────────────────────── */

function RiskTab() {
  return (
    <TwoCol
      title="Risk methodology"
      nav={[
        { id: 'health-factor', label: 'Health factor' },
        { id: 'liquidation-price', label: 'Liquidation price' },
        { id: 'liquidations', label: 'Liquidations' },
        { id: 'economic-incentives', label: 'Liquidator incentives' },
        { id: 'bad-debt', label: 'Bad debt' },
        { id: 'oracle-risk', label: 'Oracle risk' },
        { id: 'liquidation-risk', label: 'Liquidation risk' },
        { id: 'rate-model', label: 'Rate model risk' },
        { id: 'smart-contract-risk', label: 'Smart contract risk' },
      ]}
    >
      <DocSection id="health-factor" eyebrow="Borrowers" title="Health factor">
        <p>Your health factor measures how close a position is to liquidation.</p>
        <CodeBlock>healthFactor = (collateralValue * LLTV) / debt</CodeBlock>
        <ul>
          <li><strong>Above 1.0</strong> the position is healthy</li>
          <li><strong>At 1.0</strong> the position sits exactly at the liquidation threshold</li>
          <li><strong>Below 1.0</strong> anyone can liquidate it</li>
        </ul>
        <p>On chain the check is simple. A position is healthy while its debt is no larger than collateral value times LLTV. If the collateral price drops or interest grows the debt, the health factor falls.</p>
      </DocSection>

      <DocSection id="liquidation-price" eyebrow="Borrowers" title="Liquidation price">
        <p>The liquidation price is the collateral price at which your position becomes liquidatable.</p>
        <CodeBlock>liquidationPrice = debt / (collateralAmount * LLTV)</CodeBlock>
        <p>For example, with $100 of collateral, $60 of debt and a 75% LLTV, the position becomes liquidatable once the collateral is worth $80, which is 80% of its current price.</p>
      </DocSection>

      <DocSection id="liquidations" eyebrow="Liquidation" title="How liquidation works">
        <p>Anyone can liquidate any unhealthy position. The whole position is closed in one call. There is no partial close factor.</p>
        <ol>
          <li>The market accrues interest and reads a fresh oracle price</li>
          <li>The call reverts with <code>PositionHealthy</code> if the position is still healthy</li>
          <li>The liquidator repays the full debt</li>
          <li>The liquidator receives collateral worth the debt plus the liquidation bonus</li>
        </ol>
      </DocSection>

      <DocSection id="economic-incentives" eyebrow="Liquidation" title="Liquidator incentives">
        <p>The bonus is what makes liquidation worth running. With a 5% bonus, a liquidator who repays $100 of debt receives $105 of collateral.</p>
        <p>The bonus has to cover gas and price risk, and stay small enough not to punish borrowers more than necessary. The contract caps it at 20%.</p>
      </DocSection>

      <DocSection id="bad-debt" eyebrow="Liquidation" title="Bad debt">
        <p>If collateral is worth less than the debt plus bonus, the liquidator takes all remaining collateral and repays only what that collateral is worth. Any debt left after that can never be repaid.</p>
        <p>The protocol writes that shortfall off immediately. Outstanding borrow shares are burned and the loss comes out of total supplied assets, shared by every supplier in that market in proportion to their shares. A <code>BadDebtRealized</code> event records it. Other markets are untouched.</p>
      </DocSection>

      <DocSection id="oracle-risk" eyebrow="Oracles" title="Oracle risk">
        <p>Every borrow and every liquidation depends on the market oracle. A manipulated oracle could let an attacker borrow against inflated collateral or wrongly liquidate healthy borrowers.</p>
        <h4>Fail closed</h4>
        <p>A price of zero, a price stamped in the future or a price older than the market staleness limit makes the call revert. The protocol acts only on a price it can trust, or it does not act.</p>
        <h4>The cost</h4>
        <p>When a feed goes stale, borrowing and liquidations stop together. In a fast crash a position can slide underwater while the market waits for a fresh price. A conservative LLTV is the cushion for that window.</p>
        <p>Isolation limits the blast radius. A bad oracle only affects the market that chose it.</p>
      </DocSection>

      <DocSection id="liquidation-risk" eyebrow="Borrowers" title="Liquidation risk">
        <p>If you borrow, you can be liquidated. That happens when the collateral price falls, when accrued interest pushes the debt up, or when you do not add collateral or repay in time.</p>
        <p>Because liquidation closes the whole position, you lose collateral equal to your debt plus the liquidation bonus. Whatever collateral remains stays yours.</p>
      </DocSection>

      <DocSection id="rate-model" eyebrow="Rates" title="Rate model risk">
        <p>Each market uses a two slope borrow rate joined at a kink. Below the kink borrowing is cheap. Above it the rate climbs fast to push borrowers to repay and pull new suppliers in, which restores withdrawable liquidity.</p>
        <p>A short spike in utilization can hit existing borrowers with a sharp rate increase they did not choose. Watch utilization on markets you borrow from.</p>
      </DocSection>

      <DocSection id="smart-contract-risk" eyebrow="Protocol" title="Smart contract risk">
        <p>All smart contracts carry risk. lending-core is</p>
        <ul>
          <li>Not yet externally audited</li>
          <li>Covered by unit, fuzz and invariant tests</li>
          <li>Immutable, with no upgrade path and no admin key</li>
        </ul>
        <p>Treat it as testnet software. <Link href="/security" style={{ color: 'var(--accent)', fontWeight: 600 }}>See security and risk disclosures</Link></p>
      </DocSection>
    </TwoCol>
  )
}

/* ─── Developers tab ─────────────────────────────────────── */

const ADRS = [
  { n: 1, file: '0001-immutable-markets.md', title: 'Markets are immutable', body: 'No proxy, no admin, no upgrade path. Parameters are fixed for the life of the market, so a bug means a new market rather than a patch.' },
  { n: 2, file: '0002-permissionless-creation-bounded-parameters.md', title: 'Permissionless creation with bounded parameters', body: 'Anyone can create a market. Users of a market with a bad oracle bear that risk alone.' },
  { n: 3, file: '0003-singleton.md', title: 'All markets live in one contract', body: 'Creating a market is a storage write, not a deployment. The tradeoff is shared fate if the core has a bug.' },
  { n: 4, file: '0004-pluggable-rate-model.md', title: 'Pluggable rate model', body: 'A market picks its rate model behind a fixed interface, so stablecoin and volatile markets can use different curves.' },
  { n: 5, file: '0005-kinked-rate-model.md', title: 'Two slope rate with a kink', body: 'Cheap borrowing below the target utilization, a steep climb above it to restore withdrawable liquidity.' },
  { n: 6, file: '0006-oracle-fail-closed.md', title: 'Oracle fails closed', body: 'Zero, future dated or stale prices revert. The protocol never acts on a price it has reason to distrust.' },
  { n: 7, file: '0007-liquidation-and-bad-debt.md', title: 'Liquidation and bad debt', body: 'Full position liquidation in one call, and immediate bad debt realization against suppliers of that market.' },
]

function DevelopersTab() {
  return (
    <TwoCol
      title="Developers"
      nav={[
        { id: 'contract-interface', label: 'Contract interface' },
        { id: 'creating-a-market', label: 'Creating a market' },
        { id: 'oracle-requirements', label: 'Oracle interface' },
        { id: 'finding-positions', label: 'Events and indexing' },
        { id: 'running-a-liquidation', label: 'Running a liquidation' },
        { id: 'adrs', label: 'Design decisions' },
      ]}
    >
      <DocSection id="contract-interface" eyebrow="Reference" title="Contract interface">
        <p>Every call takes the full <code>MarketParams</code> struct. The market id is <code>keccak256(abi.encode(params))</code>, available from <code>idOf</code>.</p>
        <CodeBlock>
          <K>struct</K> MarketParams {'{'}{'\n'}
          {'  '}<K>address</K> loanToken;{'\n'}
          {'  '}<K>address</K> collateralToken;{'\n'}
          {'  '}IOracle oracle;{'\n'}
          {'  '}IInterestRateModel irm;{'\n'}
          {'  '}<K>uint256</K> lltv;             <C>{'// 1e18 scale'}</C>{'\n'}
          {'  '}<K>uint256</K> liquidationBonus; <C>{'// 1e18 scale, 0.05e18 is 5%'}</C>{'\n'}
          {'  '}<K>uint256</K> maxStaleness;     <C>{'// seconds'}</C>{'\n'}
          {'}'}
        </CodeBlock>
        <CodeBlock>
          supply(params, assets, onBehalf) <C>{'→ shares'}</C>{'\n'}
          withdraw(params, assets, onBehalf, receiver) <C>{'→ shares'}</C>{'\n'}
          supplyCollateral(params, assets, onBehalf){'\n'}
          withdrawCollateral(params, assets, onBehalf, receiver){'\n'}
          borrow(params, assets, onBehalf, receiver) <C>{'→ shares'}</C>{'\n'}
          repay(params, assets, onBehalf) <C>{'→ shares'}</C>{'\n'}
          liquidate(params, borrower, receiver) <C>{'→ (debtRepaid, collateralSeized)'}</C>{'\n'}
          setAuthorization(operator, authorized)
        </CodeBlock>
        <p>Withdraw, withdrawCollateral and borrow need the caller to be <code>onBehalf</code> or an operator it authorized. Anyone may repay on behalf of another account.</p>
      </DocSection>

      <DocSection id="creating-a-market" eyebrow="Reference" title="Creating a market">
        <p>Anyone can create a market. No governance vote is required.</p>
        <CodeBlock>
          <K>function</K> createMarket(MarketParams params) <K>external</K>;
        </CodeBlock>
        <ul>
          <li>Loan and collateral tokens must be nonzero addresses</li>
          <li>The liquidation bonus must be above zero and at most 20%</li>
          <li>The same parameters cannot be created twice, since they hash to the same id</li>
        </ul>
        <p>Or use the <Link href="/markets/create" style={{ color: 'var(--accent)', fontWeight: 600 }}>market creation form</Link>.</p>
      </DocSection>

      <DocSection id="oracle-requirements" eyebrow="Reference" title="Oracle interface">
        <p>Oracles implement a single view function returning a 1e36 scaled price and the time it was last updated.</p>
        <CodeBlock>
          <K>interface</K> IOracle {'{'}{'\n'}
          {'  '}<K>function</K> price() <K>external view returns</K> (<K>uint256</K> price, <K>uint256</K> updatedAt);{'\n'}
          {'}'}
        </CodeBlock>
        <p>The core rejects a zero price, an <code>updatedAt</code> in the future and any price older than the market <code>maxStaleness</code>.</p>
      </DocSection>

      <DocSection id="finding-positions" eyebrow="Integration" title="Events and indexing">
        <p>Liquidators and dashboards rebuild state from events and recompute health whenever the oracle price moves.</p>
        <CodeBlock>
          CreateMarket(id, params){'\n'}
          Supply(id, onBehalf, assets, shares){'\n'}
          Withdraw(id, onBehalf, receiver, assets, shares){'\n'}
          SupplyCollateral(id, onBehalf, assets){'\n'}
          WithdrawCollateral(id, onBehalf, receiver, assets){'\n'}
          Borrow(id, onBehalf, receiver, assets, shares){'\n'}
          Repay(id, onBehalf, assets, shares){'\n'}
          Liquidate(id, liquidator, borrower, debtRepaid, collateralSeized){'\n'}
          BadDebtRealized(id, borrower, badDebt)
        </CodeBlock>
        <p>The repository ships a Ponder indexer in <code>indexer/</code> that tracks these events.</p>
      </DocSection>

      <DocSection id="running-a-liquidation" eyebrow="Integration" title="Running a liquidation">
        <CodeBlock>
          <K>function</K> liquidate(MarketParams params, <K>address</K> borrower, <K>address</K> receiver){'\n'}
          {'    '}<K>external returns</K> (<K>uint256</K> debtRepaid, <K>uint256</K> collateralSeized);
        </CodeBlock>
        <ol>
          <li>Find a position whose debt exceeds collateral value times LLTV</li>
          <li>Approve LendingCore to pull the loan token for the full debt</li>
          <li>Call liquidate and receive the collateral at <code>receiver</code></li>
        </ol>
        <p>The call reverts with <code>PositionHealthy</code> if the position recovered, and with <code>StalePrice</code> or <code>ZeroPrice</code> if the oracle cannot be trusted.</p>
      </DocSection>

      <DocSection id="adrs" eyebrow="Architecture" title="Design decisions">
        <p>Each architectural choice is recorded as an ADR in the repository.</p>
        <div className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {ADRS.map(a => (
            <a
              key={a.n}
              href={`${REPO}/blob/main/docs/adr/${a.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="topic-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                padding: 16,
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                background: 'var(--surface-2)',
                transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-4)' }}>ADR {String(a.n).padStart(4, '0')}</span>
                <ArrowSquareOut size={12} style={{ color: 'var(--text-4)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>{a.body}</div>
            </a>
          ))}
        </div>
      </DocSection>
    </TwoCol>
  )
}

/* ─── Two column layout with a sticky section nav ────────── */

function TwoCol({
  title,
  nav,
  children,
}: {
  title: string
  nav: { id: string; label: string }[]
  children: React.ReactNode
}) {
  return (
    <div
      className="learn-two-col"
      style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 32, marginTop: 40, alignItems: 'start' }}
    >
      <nav
        className="learn-side-nav"
        aria-label={`${title} sections`}
        style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)', margin: '0 0 10px 12px' }}>
          {title}
        </div>
        {nav.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', padding: '7px 12px', borderRadius: 8, borderLeft: '2px solid transparent' }}
            className="learn-nav-link"
          >
            {n.label}
          </a>
        ))}
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 18, alignSelf: 'flex-start', gap: 6 }}
        >
          View on GitHub <ArrowSquareOut size={12} />
        </a>
        <style>{`.learn-nav-link:hover { background: var(--surface); color: var(--accent) !important; }`}</style>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        {children}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            padding: '20px 24px',
            borderRadius: 'var(--r-md)',
            background: DARK,
            color: '#FFFFFF',
          }}
        >
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Ready to put it into practice?</span>
          <Link
            href="/markets"
            className="btn"
            style={{ background: '#FFFFFF', color: DARK, borderColor: '#FFFFFF', gap: 6 }}
          >
            Explore markets <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
