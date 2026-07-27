import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import '@/styles/globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'lending-core — Lend anything. Risk nothing else.',
  description: 'Isolated-market lending on Arbitrum. Each market is completely separate. Your position is never touched by someone else\'s bad oracle.',
  openGraph: {
    title: 'lending-core',
    description: 'Lend anything. Risk nothing else.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: 64 }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
