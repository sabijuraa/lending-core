import type { Metadata } from 'next'
import Link from 'next/link'
import { Callout, LegalPage, type LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of use | lending-core',
  description: 'The plain English terms for using lending-core, a non-custodial lending protocol on Base.',
}

const sections: LegalSection[] = [
  {
    id: 'what-this-is',
    title: 'What lending-core is',
    body: (
      <>
        <p>
          lending-core is open source software. It is a set of smart contracts on the Base network and this
          website, which helps you talk to those contracts from your own wallet.
        </p>
        <p>
          By using the website or the contracts you agree to these terms. If you do not agree, please do not use them.
        </p>
      </>
    ),
  },
  {
    id: 'your-assets',
    title: 'Your assets and your transactions',
    body: (
      <>
        <p>
          The assets you supply, borrow or post as collateral are real tokens held by public smart contracts. Every action
          is a transaction you sign in your own wallet, and once it is confirmed on chain it cannot be reversed by us or
          anyone else.
        </p>
        <Callout tone="info" title="Check before you sign">
          Always confirm the network, the token and the amount in your wallet before approving a transaction. Tokens sent to
          the wrong address cannot be recovered.
        </Callout>
      </>
    ),
  },
  {
    id: 'your-wallet',
    title: 'You stay in control of your funds',
    body: (
      <>
        <p>
          lending-core is non-custodial. We never hold your funds. Your assets sit in the protocol contracts, and only
          you can move them with your wallet.
        </p>
        <ul>
          <li>We cannot access, freeze or recover your funds.</li>
          <li>We cannot reverse a transaction once it is confirmed on chain.</li>
          <li>If you lose access to your wallet, nobody can restore it for you.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'no-warranty',
    title: 'No warranty',
    body: (
      <>
        <p>
          lending-core is experimental software provided as is. There is no promise that it works without errors, that the
          website is always online, or that the numbers it shows are always accurate. You use it at your own risk.
        </p>
        <Callout title="Not audited">
          The contracts have not been reviewed by an external security auditor. Read the{' '}
          <Link href="/risk">risk disclosure</Link> before you use them.
        </Callout>
      </>
    ),
  },
  {
    id: 'no-insurance',
    title: 'No insurance',
    body: (
      <p>
        Smart contract bugs are possible. Price oracles can fail or be manipulated. There is no insurance fund and no
        backstop that protects suppliers or borrowers if something goes wrong.
      </p>
    ),
  },
  {
    id: 'fixed-rules',
    title: 'Rules that do not change',
    body: (
      <>
        <p>
          Each market sets its parameters once, when it is created. After that, nobody can change them. There is no
          governance vote, no admin key and no upgrade path for the contracts.
        </p>
        <p>
          That means we cannot step in to change a market on your behalf, even if we wanted to.
        </p>
      </>
    ),
  },
  {
    id: 'your-responsibilities',
    title: 'Your responsibilities',
    body: (
      <>
        <p>The contracts have no knowledge of where you are or which laws apply to you. You are responsible for</p>
        <ul>
          <li>following the laws and regulations that apply where you live,</li>
          <li>keeping your wallet and recovery phrase safe,</li>
          <li>checking every transaction in your wallet before you sign it,</li>
          <li>understanding the risks of lending, borrowing and liquidation.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        The deployed contracts cannot be changed, so the rules they enforce stay the same. We may update this page to make
        it clearer. When we do, the date at the top changes.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="Please read this before you use lending-core. It explains what the protocol is, what it is not, and who is responsible for what."
      updated="14 October 2026"
      readMinutes={3}
      current="/terms"
      summary={[
        'Every action is a transaction you sign and it cannot be reversed.',
        'It is non-custodial. Only your wallet can move your funds.',
        'The software is experimental, unaudited and comes with no warranty.',
        'Market rules are fixed at creation and nobody can change them.',
      ]}
      sections={sections}
    />
  )
}
