'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowSquareOut,
  BookOpen,
  Code,
  Cube,
  Plus,
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
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal'

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
  faq: 'learn',
  glossary: 'learn',
}

/* ─── Page ───────────────────────────────────────────────── */

function DocsHub() {
  const router = useRouter()
  const reduce = useReducedMotion()
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
    <div className="section-container" style={{ maxWidth: 1160, padding: '48px 24px 96px', overflowX: 'hidden' }}>
      <header style={{ marginBottom: 28 }}>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="page-heading"
          style={{ fontSize: 'clamp(30px, 4vw, 40px)', marginBottom: 10 }}
        >
          Learn &amp; Docs
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="page-subtitle"
          style={{ maxWidth: 580 }}
        >
          Everything you need to use lending-core with confidence, from your first deposit to how the risks really work.
        </motion.p>
      </header>

      <UnderlineTabs tabs={TABS} active={tab} onChange={id => go(id)} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'learn' && <LearnTab go={go} />}
          {tab === 'risk' && <RiskTab />}
          {tab === 'developers' && <DevelopersTab />}
        </motion.div>
      </AnimatePresence>
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

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Do I have to sell my crypto to borrow?',
    a: 'No. You deposit it as collateral and keep owning it. If its price goes up while you borrow, that gain is still yours.',
  },
  {
    q: 'What happens if the price of my collateral falls?',
    a: 'Your health factor drops. While it stays above 1 nothing happens. If it reaches 1, your position can be liquidated, so add collateral or repay part of the loan before then.',
  },
  {
    q: 'How do lenders earn?',
    a: 'Borrowers pay interest, and all of it goes to the lenders in that market. There is no protocol fee. Your balance grows on its own and there is nothing to claim.',
  },
  {
    q: 'Can I withdraw at any time?',
    a: 'Yes, as long as the money is not currently lent out. When a market is very busy, rates rise sharply, which brings in new lenders and encourages borrowers to repay so liquidity comes back.',
  },
  {
    q: 'What if another market gets hit by a bad price or a crash?',
    a: 'It stays there. Every market has its own collateral, its own price feed and its own rules, so a problem in one market cannot drain another.',
  },
  {
    q: 'Is this live with real money?',
    a: 'Not yet. lending-core runs on the Base Sepolia testnet and the contracts have not been externally audited. Use test tokens and treat it as a preview.',
  },
]

const GLOSSARY: [string, string][] = [
  ['Collateral', 'What you deposit to secure a loan. It stays yours unless the position is liquidated.'],
  ['Health factor', 'A single number showing how safe your loan is. Above 1 is safe, and higher means more room.'],
  ['LLTV', 'The share of your collateral value you can owe before liquidation becomes possible. At 80%, $100 of collateral supports up to $80 of debt.'],
  ['Utilization', 'How much of the money lenders supplied is currently borrowed. It drives the interest rate.'],
  ['Liquidation', 'When a loan runs out of room, anyone can repay it and receive the collateral plus a small bonus.'],
  ['Price feed', 'The oracle that tells a market what its collateral is worth. Each market has exactly one.'],
]

function LearnTab({ go }: { go: (t: Tab, section?: string) => void }) {
  return (
    <>
      <div
        className="learn-hub-grid"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 20, alignItems: 'stretch' }}
      >
        <Stagger className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <StaggerItem style={{ display: 'flex' }}>
            <TopicCard
              icon={<BookOpen size={20} />}
              title="How Lending Works"
              desc="The whole journey in plain words, from your first deposit to closing your loan."
              href="/how-it-works"
            />
          </StaggerItem>
          <StaggerItem style={{ display: 'flex' }}>
            <TopicCard
              icon={<Cube size={20} />}
              title="Isolated Markets"
              desc="Why keeping every market separate means other people's risk never becomes yours."
              onClick={() => go('learn', 'isolated-markets')}
            />
          </StaggerItem>
          <StaggerItem style={{ display: 'flex' }}>
            <TopicCard
              icon={<ShieldCheck size={20} />}
              title="Risk Management"
              desc="Your health factor, liquidation and price feeds, so you always know where you stand."
              onClick={() => go('risk')}
            />
          </StaggerItem>
          <StaggerItem style={{ display: 'flex' }}>
            <TopicCard
              icon={<Code size={20} />}
              title="Developer Documentation"
              desc="Contracts, interfaces, integration guides and examples."
              onClick={() => go('developers')}
            />
          </StaggerItem>
        </Stagger>

        <Reveal from="right" delay={0.15} style={{ display: 'flex' }}>
          <BuildCard onDocs={() => go('developers')} />
        </Reveal>
      </div>

      <TwoCol
        nav={[
          { id: 'how-it-works', label: 'The big idea' },
          { id: 'who-its-for', label: 'Who it is for' },
          { id: 'what-it-doesnt-do', label: 'What we left out' },
          { id: 'isolated-markets', label: 'Isolated markets' },
          { id: 'market-parameters', label: 'Reading a market' },
          { id: 'depositing', label: 'Lending' },
          { id: 'share-accounting', label: 'How earnings grow' },
          { id: 'withdrawing', label: 'Withdrawing' },
          { id: 'collateral', label: 'Borrowing' },
          { id: 'faq', label: 'Questions' },
          { id: 'glossary', label: 'Glossary' },
        ]}
        title="Guides"
      >
        <DocSection id="how-it-works" eyebrow="Start here" title="The big idea">
          <p>Most lending apps put everyone&apos;s money in one shared pool. That is efficient right up until one asset or one price feed goes wrong, and then everybody in the pool shares the damage.</p>
          <p>lending-core does it differently. Every market is its own sealed room with one asset to borrow, one asset to deposit and one price feed. What happens in one room stays in that room.</p>
          <ol>
            <li>You choose a market you understand</li>
            <li>You deposit collateral and borrow against it, or you lend and earn</li>
            <li>Interest builds up automatically while the position is open</li>
            <li>If a loan runs out of room, it gets closed out so lenders are always repaid</li>
          </ol>
          <p>
            You only ever take on the risk of the markets you pick.{' '}
            <Link href="/how-it-works" style={{ color: 'var(--accent)', fontWeight: 600 }}>Follow the full walkthrough</Link>
          </p>
        </DocSection>

        <DocSection id="who-its-for" eyebrow="Start here" title="Who it is for">
          <h4>Lenders</h4>
          <p>You have stablecoins or other assets sitting idle and want them to earn. You deposit, your balance grows, and you withdraw whenever you need it.</p>
          <h4>Borrowers</h4>
          <p>You hold assets you believe in and do not want to sell, but you need cash today. You post them as collateral, borrow, and keep all the upside.</p>
          <h4>Liquidators</h4>
          <p>You watch for loans that have run out of room. Closing them out earns you a bonus and keeps every market solvent for its lenders.</p>
        </DocSection>

        <DocSection id="what-it-doesnt-do" eyebrow="Start here" title="What we left out, on purpose">
          <p>lending-core is deliberately small. Every feature we skipped is one less thing that can go wrong with your money.</p>
          <ul>
            <li><strong>No shared pool.</strong> It is a little less capital efficient. That is the price of keeping you safe from other markets.</li>
            <li><strong>No governance votes.</strong> A market&apos;s rules are set when it is created and can never be changed under you.</li>
            <li><strong>No upgrades or admin keys.</strong> Nobody can pause your market, change the code or move your funds.</li>
            <li><strong>No protocol fees.</strong> Every bit of interest borrowers pay goes to lenders.</li>
            <li><strong>No token.</strong> There is nothing to farm, stake or speculate on.</li>
          </ul>
        </DocSection>

        <DocSection id="isolated-markets" eyebrow="Markets" title="Isolated markets">
          <p>A market is a fixed recipe. One asset you can borrow, one asset you can deposit, one price feed, one interest rate curve and one liquidation limit. Once a market exists, that recipe is locked forever.</p>
          <p>Anyone can open a new market without asking permission. That freedom is safe because a market with a poor price feed or a risky asset can only ever hurt the people who chose to use it. Every other market keeps running as normal.</p>
        </DocSection>

        <DocSection id="market-parameters" eyebrow="Markets" title="Reading a market before you use it">
          <h4>LLTV</h4>
          <p>How much you can owe compared to your collateral before liquidation becomes possible. At 80%, every $100 of collateral supports up to $80 of debt. Lower numbers are more forgiving.</p>
          <h4>Liquidation bonus</h4>
          <p>The reward a liquidator receives for closing out a loan that ran out of room. It is capped at 20%, and most markets use far less.</p>
          <h4>Price freshness</h4>
          <p>How old a price may be before the market refuses to use it. If the feed goes quiet, the market waits rather than acting on stale information.</p>
          <h4>Interest rate</h4>
          <p>Rates follow demand. They stay low while plenty of money is available and rise steeply once a market is nearly fully borrowed, which brings new lenders in and keeps withdrawals possible.</p>
        </DocSection>

        <DocSection id="depositing" eyebrow="For lenders" title="Lending">
          <p>Pick a market, deposit the asset it lends out and start earning straight away. Borrowers in that market pay you interest for as long as your deposit is there.</p>
          <p>Before you lend, look at the market&apos;s collateral and price feed. They decide how safe your deposit is, so choose markets you are comfortable with.</p>
        </DocSection>

        <DocSection id="share-accounting" eyebrow="For lenders" title="How your earnings grow">
          <p>When you lend you receive a share of the market. As borrowers pay interest, each share becomes worth a little more. You never have to claim or compound anything.</p>
          <ul>
            <li>You lend 1,000 USDC</li>
            <li>Borrowers pay interest over the following months</li>
            <li>Your share of the market grows in value</li>
            <li>When you withdraw, you get your 1,000 USDC plus everything it earned</li>
          </ul>
          <p>Every calculation rounds in favour of the market, so it can never end up owing more than it holds.</p>
        </DocSection>

        <DocSection id="withdrawing" eyebrow="For lenders" title="Withdrawing">
          <p>Take out your deposit and its earnings whenever you like, as long as that money is not lent out at that moment.</p>
          <p>If a market is 80% borrowed, 20% of the deposits are free to withdraw right now. When a market gets that busy, its rate climbs quickly, which pulls in new lenders and encourages borrowers to repay, so liquidity returns.</p>
        </DocSection>

        <DocSection id="collateral" eyebrow="For borrowers" title="Borrowing">
          <p>Deposit collateral into a market, then borrow up to the limit it allows. The app shows your health factor and liquidation price before you confirm, so you can choose how much cushion to leave.</p>
          <p>You can add collateral or repay at any time. You can take collateral back out whenever the loan would still be healthy afterwards.</p>
        </DocSection>

        <DocSection id="faq" eyebrow="Questions" title="Frequently asked questions">
          <Faq items={FAQ} />
        </DocSection>

        <DocSection id="glossary" eyebrow="Words we use" title="Glossary">
          <div className="learn-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {GLOSSARY.map(([t, d]) => (
              <div key={t} className="lift-card" style={{ padding: 16, border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--surface-2)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </DocSection>
      </TwoCol>
    </>
  )
}

function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div style={{ marginBottom: 16, borderTop: '1px solid var(--border-subtle)' }}>
      {items.map((it, i) => {
        const on = open === i
        return (
          <div key={it.q} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                padding: '16px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
                fontSize: 14.5,
                fontWeight: 600,
                color: 'var(--text-1)',
              }}
            >
              {it.q}
              <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'inline-flex', color: 'var(--accent)', flexShrink: 0 }}>
                <Plus size={16} weight="bold" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ paddingBottom: 4 }}>{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
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
        width: '100%',
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
        { id: 'economic-incentives', label: 'Why liquidators show up' },
        { id: 'bad-debt', label: 'Bad debt' },
        { id: 'oracle-risk', label: 'Price feed risk' },
        { id: 'liquidation-risk', label: 'Liquidation risk' },
        { id: 'rate-model', label: 'Rate risk' },
        { id: 'smart-contract-risk', label: 'Smart contract risk' },
      ]}
    >
      <DocSection id="health-factor" eyebrow="Borrowers" title="Health factor">
        <p>Your health factor is the one number to watch when you borrow. It compares what your collateral can support with what you owe.</p>
        <CodeBlock>health factor = (collateral value × LLTV) ÷ debt</CodeBlock>
        <ul>
          <li><strong>Above 1</strong> your loan is safe, and the higher the better</li>
          <li><strong>At 1</strong> your loan is right at the edge</li>
          <li><strong>Below 1</strong> anyone can liquidate it</li>
        </ul>
        <p>It falls when your collateral price drops or as interest adds to your debt. It rises when you add collateral or repay.</p>
      </DocSection>

      <DocSection id="liquidation-price" eyebrow="Borrowers" title="Liquidation price">
        <p>This is the collateral price at which your loan would become liquidatable. Knowing it tells you exactly how far prices can move before you need to act.</p>
        <CodeBlock>liquidation price = debt ÷ (collateral amount × LLTV)</CodeBlock>
        <p>For example, with $100 of collateral, $60 of debt and a 75% LLTV, the loan becomes liquidatable once the collateral is worth $80, a 20% fall from today.</p>
      </DocSection>

      <DocSection id="liquidations" eyebrow="Liquidation" title="How liquidation works">
        <p>Liquidation is how lenders are protected. When a loan runs out of room, anyone can close it out in a single step.</p>
        <ol>
          <li>The market brings interest up to date and checks a fresh price</li>
          <li>If the loan has recovered and is healthy again, nothing happens</li>
          <li>Otherwise the liquidator repays the whole loan</li>
          <li>The liquidator receives collateral worth the loan plus the market&apos;s bonus, and the borrower keeps whatever collateral is left</li>
        </ol>
      </DocSection>

      <DocSection id="economic-incentives" eyebrow="Liquidation" title="Why liquidators show up">
        <p>The bonus is what makes closing loans worth someone&apos;s time. With a 5% bonus, a liquidator who repays $100 of debt receives $105 of collateral.</p>
        <p>It needs to be big enough to cover their costs in a fast market, and small enough not to punish borrowers more than necessary. The contract caps it at 20%.</p>
      </DocSection>

      <DocSection id="bad-debt" eyebrow="Liquidation" title="Bad debt">
        <p>In a very sharp crash, collateral can end up worth less than the loan it backs. The liquidator then takes all the remaining collateral and the rest of the loan can never be repaid.</p>
        <p>lending-core is honest about that loss straight away. It is shared by the lenders of that one market in proportion to their deposits and recorded publicly on chain. No other market is touched.</p>
      </DocSection>

      <DocSection id="oracle-risk" eyebrow="Price feeds" title="Price feed risk">
        <p>Every loan and every liquidation depends on the market&apos;s price feed. A wrong price could let someone borrow too much or close out a healthy loan.</p>
        <h4>When in doubt, wait</h4>
        <p>A price of zero, a price from the future or a price older than the market allows is refused. The market acts only on a price it can trust, or it does not act at all.</p>
        <h4>The tradeoff</h4>
        <p>While a feed is stale, both borrowing and liquidations pause. In a fast crash a loan can slip underwater during that pause, which is why a conservative LLTV matters.</p>
        <p>Isolation limits the damage. A bad feed only affects the market that chose it.</p>
      </DocSection>

      <DocSection id="liquidation-risk" eyebrow="Borrowers" title="Liquidation risk">
        <p>If you borrow, you can be liquidated. It happens when your collateral price falls, when interest pushes your debt up, or when you do not add collateral or repay in time.</p>
        <p>Liquidation closes the whole loan. You lose collateral equal to your debt plus the bonus, and keep the rest.</p>
      </DocSection>

      <DocSection id="rate-model" eyebrow="Rates" title="Rate risk">
        <p>Rates are cheap while a market has plenty of spare money and rise steeply once it is nearly fully borrowed. That steep part protects lenders by bringing liquidity back.</p>
        <p>For borrowers it means a busy week can raise your rate quickly. Keep an eye on how full the markets you borrow from are.</p>
      </DocSection>

      <DocSection id="smart-contract-risk" eyebrow="Protocol" title="Smart contract risk">
        <p>All software can have bugs, and smart contracts are no exception. Today lending-core is</p>
        <ul>
          <li>Not yet externally audited</li>
          <li>Covered by unit, fuzz and invariant tests</li>
          <li>Immutable, with no upgrade path and no admin key</li>
        </ul>
        <p>Treat it as testnet software. <Link href="/security" style={{ color: 'var(--accent)', fontWeight: 600 }}>Read the security and risk disclosures</Link></p>
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
                height: '100%',
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
        <Reveal>
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
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Ready to put it into practice? Every market shows its risk up front.</span>
          <Link
            href="/markets"
            className="btn"
            style={{ background: '#FFFFFF', color: DARK, borderColor: '#FFFFFF', gap: 6 }}
          >
            Explore markets <ArrowRight size={13} />
          </Link>
        </div>
        </Reveal>
      </div>
    </div>
  )
}
