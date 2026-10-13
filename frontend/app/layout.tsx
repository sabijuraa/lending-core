import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'lending-core | Lend and borrow on-chain with transparent rates',
  description: 'Isolated-market lending on Base. Each market is completely separate. Your position is never touched by someone else\'s bad oracle.',
  openGraph: {
    title: 'lending-core',
    description: 'Lend anything. Risk nothing else.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
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
