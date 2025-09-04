import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vials - AI NFT Derivatives',
  description: 'Generate AI-powered derivatives of your NFTs and trade them on the marketplace',
  keywords: ['NFT', 'AI', 'Derivatives', 'Arbitrum', 'Web3', 'Marketplace'],
  authors: [{ name: 'Vials Team' }],
  openGraph: {
    title: 'Vials - AI NFT Derivatives',
    description: 'Generate AI-powered derivatives of your NFTs and trade them on the marketplace',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vials - AI NFT Derivatives',
    description: 'Generate AI-powered derivatives of your NFTs and trade them on the marketplace',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#00ff41',
                border: '1px solid #00ff41',
                borderRadius: '0.25rem',
                fontSize: '14px',
                fontFamily: 'VT323, monospace',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
