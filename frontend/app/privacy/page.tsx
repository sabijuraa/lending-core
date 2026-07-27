'use client'
import { ClipReveal } from '@/components/ui/ClipReveal'

export default function PrivacyPage() {
  const sections = [
    {
      title: 'What we collect',
      items: [
        'We do not collect any personal data.',
        'The protocol is fully on-chain.',
        'The frontend analytics (if any) are anonymous.',
        'Wallet addresses are pseudonymous, not personal data.',
      ],
    },
    {
      title: 'What we store',
      items: [
        'Nothing on our servers.',
        'All state lives on Arbitrum.',
        'Your wallet connection is stored only in your browser\'s localStorage.',
      ],
    },
    {
      title: 'Cookies',
      items: [
        'We do not use tracking cookies.',
        'We do not use advertising cookies.',
        'We use one localStorage key for wallet connection state.',
      ],
    },
    {
      title: 'Third parties',
      items: [
        'Chainlink oracle feeds (read the Chainlink privacy policy).',
        'Alchemy or Infura for RPC (read their privacy policy).',
        'Vercel for hosting (read the Vercel privacy policy).',
      ],
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)' }}>
      {/* Header */}
      <section style={{ padding: '80px 0 64px', background: 'var(--bg-0)', borderBottom: '0.5px solid var(--border-default)' }}>
        <div className="section-container">
          <ClipReveal type="clip">
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-1)',
              marginBottom: 16,
            }}>
              Privacy Policy
            </h1>
          </ClipReveal>
          <ClipReveal type="fade" delay={0.2}>
            <p style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 520 }}>
              We take privacy as seriously as security.
            </p>
          </ClipReveal>
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 48px' }}>
        {sections.map((section, i) => (
          <ClipReveal key={section.title} type="fade" delay={i * 0.1}>
            <div className="card-base" style={{ padding: 32, marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-1)',
                marginBottom: 20,
                letterSpacing: '-0.02em',
              }}>
                {section.title}
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {section.items.map((item, j) => (
                  <li
                    key={j}
                    style={{
                      fontSize: 15,
                      color: 'var(--text-2)',
                      lineHeight: 1.8,
                      padding: '8px 0',
                      borderBottom: j < section.items.length - 1 ? '0.5px solid var(--border-subtle)' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <span style={{ color: 'var(--accent)', marginTop: 4 }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ClipReveal>
        ))}

        {/* Contact */}
        <ClipReveal type="fade" delay={0.4}>
          <div style={{
            padding: 32,
            background: 'var(--bg-0)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--r-lg)',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-1)',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}>
              Contact
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8 }}>
              Questions? Open an issue on{' '}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </ClipReveal>

        {/* Last updated */}
        <div style={{ textAlign: 'center', marginTop: 48, fontSize: 13, color: 'var(--text-4)' }}>
          Last updated: July 2026
        </div>
      </div>
    </div>
  )
}
