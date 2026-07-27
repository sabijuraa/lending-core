'use client'
import { ClipReveal } from '@/components/ui/ClipReveal'

export default function TermsPage() {
  const sections = [
    {
      title: 'No warranty',
      content: 'lending-core is experimental software. Use at your own risk.',
    },
    {
      title: 'No custodian',
      content: 'We never hold your funds. The protocol contracts hold your funds. We cannot access, freeze, or recover them.',
    },
    {
      title: 'No insurance',
      content: 'Smart contract risk is real. Oracle manipulation is real. No insurance fund protects depositors.',
    },
    {
      title: 'No governance',
      content: 'Protocol parameters are fixed at deployment. We cannot change them. No vote can change them.',
    },
    {
      title: 'Jurisdiction',
      content: 'These contracts operate at the protocol layer. They have no knowledge of geography or regulation. You are responsible for compliance with applicable law.',
    },
    {
      title: 'Updates',
      content: 'These terms cannot be updated because there is nothing to update — the contracts cannot be changed.',
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
              Terms of Use
            </h1>
          </ClipReveal>
          <ClipReveal type="fade" delay={0.2}>
            <p style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 520 }}>
              Read this before using the protocol.
            </p>
          </ClipReveal>
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 48px' }}>
        {sections.map((section, i) => (
          <ClipReveal key={section.title} type="fade" delay={i * 0.08}>
            <div className="card-base" style={{ padding: 32, marginBottom: 24 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-1)',
                marginBottom: 16,
                letterSpacing: '-0.02em',
              }}>
                {section.title}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8, margin: 0 }}>
                {section.content}
              </p>
            </div>
          </ClipReveal>
        ))}

        {/* Final note */}
        <ClipReveal type="fade" delay={0.5}>
          <div style={{
            padding: 40,
            background: 'linear-gradient(145deg, rgba(0,229,204,0.04) 0%, rgba(124,58,237,0.02) 100%)',
            border: '0.5px solid var(--accent-border)',
            borderRadius: 'var(--r-xl)',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: 16,
              color: 'var(--text-1)',
              lineHeight: 1.8,
              fontWeight: 500,
              margin: 0,
            }}>
              If you&apos;ve read this and you understand the risks, the protocol is ready for you.
              <br />
              If you haven&apos;t, please read it again.
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
