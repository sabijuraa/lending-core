import Link from 'next/link'
import { GithubLogo } from '@phosphor-icons/react/dist/ssr'

const REPO = 'https://github.com/sabijuraa/lending-core'

type FooterLink = { label: string; href: string; ext?: boolean }

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Protocol',
    links: [
      { label: 'Markets', href: '/markets' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Liquidations', href: '/liquidations' },
      { label: 'Overview', href: '/' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Market isolation', href: '/docs' },
      { label: 'Risk methodology', href: '/security' },
      { label: 'FAQ', href: '/docs' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Contract deployments', href: '/docs' },
      { label: 'Source repository', href: REPO, ext: true },
      { label: 'Integration guides', href: '/docs' },
    ],
  },
  {
    title: 'Trust & Policies',
    links: [
      { label: 'Security & audits', href: '/security' },
      { label: 'Risk disclosures', href: '/security' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="lc-footer">
      <div className="section-container">
        <div className="lc-footer-card">
          <div className="lc-footer-top">
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                lending-core
              </div>
              <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--text-3)' }}>
                Isolated lending markets on Base.
                <br />
                Understand the market. Understand the risk.
              </p>
            </div>
            <div className="lc-footer-network">
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)' }}>
                Network
              </div>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                Base Sepolia · Testnet
              </div>
            </div>
          </div>

          <div className="lc-footer-cols">
            {cols.map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>{col.title}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.ext ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="lc-footer-link">{l.label}</a>
                      ) : (
                        <Link href={l.href} className="lc-footer-link">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="lc-footer-note">
            Smart contract interactions involve risk. Review market parameters
            <br className="hide-mobile" /> and transaction details before signing.
          </p>

          <div className="lc-footer-bottom">
            <span>© 2026 lending-core</span>
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="lc-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <GithubLogo size={15} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
