import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coin Feedly - Crypto News RSS Feed',
  description: 'Stay updated with the latest cryptocurrency news from top sources. Real-time crypto prices, filtered news by category, and comprehensive market coverage.',
  keywords: 'crypto news, bitcoin news, cryptocurrency, blockchain, trading, altcoins, defi, macro',
  authors: [{ name: 'Coin Feedly' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Coin Feedly - Crypto News RSS Feed',
    description: 'Stay updated with the latest cryptocurrency news from top sources.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coin Feedly - Crypto News RSS Feed',
    description: 'Stay updated with the latest cryptocurrency news from top sources.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
