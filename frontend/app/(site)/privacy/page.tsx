import type { Metadata } from 'next'
import { Callout, LegalPage, type LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy policy | lending-core',
  description: 'What lending-core does and does not collect when you use the site and the protocol.',
}

const sections: LegalSection[] = [
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <p>
          Nothing that identifies you. There are no accounts, no sign up forms and no email lists. The website does not
          include analytics, tracking pixels or advertising scripts.
        </p>
        <p>You connect with a wallet, and a wallet address is all the app ever sees.</p>
      </>
    ),
  },
  {
    id: 'on-chain',
    title: 'Blockchain data is public',
    body: (
      <>
        <p>
          When you supply, borrow, repay or liquidate, your wallet sends a transaction to the Base Sepolia network. That
          transaction, your address and your positions become public and permanent on the blockchain.
        </p>
        <Callout tone="info" title="Anyone can read it">
          Public blockchain data can be viewed by anyone with a block explorer. We cannot hide or delete it.
        </Callout>
      </>
    ),
  },
  {
    id: 'your-browser',
    title: 'What stays in your browser',
    body: (
      <p>
        To remember that your wallet is connected, the site saves a small amount of connection state in your
        browser&apos;s local storage. It never leaves your device, and clearing your site data removes it.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: <p>The app does not set tracking or advertising cookies.</p>,
  },
  {
    id: 'third-parties',
    title: 'Services you touch along the way',
    body: (
      <>
        <p>Using the site means talking to a few other services. Each has its own privacy policy.</p>
        <ul>
          <li>
            <strong>Vercel</strong> hosts the website and may keep standard server logs, such as IP address and request
            time.
          </li>
          <li>
            <strong>The Base Sepolia public RPC</strong> receives the read requests and transactions your browser sends
            to the network.
          </li>
          <li>
            <strong>Your wallet provider</strong>, for example a browser extension, handles signing and may have its own
            data practices.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        If the way the site handles data ever changes, this page will be updated first and the date at the top will
        change with it.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="lending-core is built so that we do not need to know who you are. Here is exactly what is and is not collected."
      updated="14 October 2026"
      readMinutes={2}
      current="/privacy"
      summary={[
        'No accounts, no emails and no personal data.',
        'No analytics, tracking pixels or ad cookies.',
        'Your transactions are public on the blockchain.',
        'Wallet connection state stays in your own browser.',
      ]}
      sections={sections}
    />
  )
}
