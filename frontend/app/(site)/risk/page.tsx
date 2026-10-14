import type { Metadata } from 'next'
import Link from 'next/link'
import { Callout, LegalPage, type LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Risk disclosure | lending-core',
  description: 'The risks of supplying, borrowing and liquidating on lending-core, explained in plain English.',
}

const sections: LegalSection[] = [
  {
    id: 'your-funds',
    title: 'You can lose what you deposit',
    body: (
      <p>
        lending-core is non custodial software. The assets you supply or post as collateral sit in public smart contracts,
        not with a company, and nobody can reverse a transaction once it is confirmed. Only deposit what you can afford
        to lose, and start with small amounts while you learn how a market behaves.
      </p>
    ),
  },
  {
    id: 'smart-contract',
    title: 'Smart contract risk',
    body: (
      <>
        <p>
          Your funds are held by smart contracts. A bug in that code could lock funds or let someone take them. The
          contracts are tested with unit, fuzz and invariant tests, but testing cannot prove the absence of bugs.
        </p>
        <Callout title="No external audit yet">
          No independent security firm has audited the contracts. You can follow the current status on the{' '}
          <Link href="/security">security page</Link>.
        </Callout>
      </>
    ),
  },
  {
    id: 'oracle',
    title: 'Price oracle risk',
    body: (
      <>
        <p>
          Every market relies on one price feed to value its collateral. If that feed reports a wrong price, healthy
          positions can be liquidated, or unhealthy ones can be left open.
        </p>
        <p>
          Each market refuses prices older than its staleness limit, which protects against a frozen feed. It does not
          protect against a feed that is live but wrong.
        </p>
      </>
    ),
  },
  {
    id: 'liquidation',
    title: 'Liquidation risk',
    body: (
      <>
        <p>
          When you borrow, your position has a health factor. If the value of your collateral falls far enough that the
          health factor drops below 1, anyone can liquidate you.
        </p>
        <ul>
          <li>The liquidator repays your debt and receives your collateral plus a bonus.</li>
          <li>That bonus comes out of your collateral, so liquidation always costs you more than repaying yourself.</li>
          <li>Prices can move quickly. Keep a buffer above the liquidation line and watch your position.</li>
        </ul>
        <Callout title="Watch your health factor">
          A health factor close to 1 means a small price move can trigger liquidation. Adding collateral or repaying debt
          moves it back up.
        </Callout>
      </>
    ),
  },
  {
    id: 'liquidity',
    title: 'Interest rate and withdrawal risk',
    body: (
      <>
        <p>
          Rates change with demand. When most of a market is borrowed, borrow rates rise steeply to bring utilization back
          down.
        </p>
        <p>
          Suppliers can only withdraw what is not currently lent out. In a busy market you may have to wait for borrowers
          to repay before you can take everything out.
        </p>
      </>
    ),
  },
  {
    id: 'bad-debt',
    title: 'Bad debt',
    body: (
      <p>
        If collateral loses value so fast that a liquidation cannot cover the full debt, the shortfall is shared by the
        suppliers of that one market. Isolation keeps it from spreading to other markets, but suppliers in the affected
        market can lose part of what they put in.
      </p>
    ),
  },
  {
    id: 'no-rescue',
    title: 'Nobody can step in',
    body: (
      <p>
        There is no admin key, no pause button and no upgrade path. That protects you from anyone changing the rules
        after you join. It also means nobody can rescue funds or fix a market if something goes wrong.
      </p>
    ),
  },
  {
    id: 'your-security',
    title: 'Your own security',
    body: (
      <ul>
        <li>Never share your recovery phrase. No real support person will ask for it.</li>
        <li>Check the site address before you connect your wallet.</li>
        <li>Read every transaction in your wallet before you sign it.</li>
      </ul>
    ),
  },
]

export default function RiskPage() {
  return (
    <LegalPage
      title="Risk disclosure"
      intro="Lending and borrowing on chain carries real risk. Here is what can go wrong and how each market is designed to limit it."
      updated="14 October 2026"
      readMinutes={4}
      current="/risk"
      summary={[
        'The contracts are unaudited and could contain bugs.',
        'A wrong price feed can cause unfair liquidations.',
        'If your health factor drops below 1, you can be liquidated.',
        'Problems in one market stay in that market, but its suppliers can lose funds.',
      ]}
      sections={sections}
    />
  )
}
