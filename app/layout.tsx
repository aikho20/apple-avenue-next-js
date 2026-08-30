import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/providers/auth-provider'
import Header from '@/components/shared/header'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import StoreProvider from '@/providers/store-provider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { X } from 'lucide-react'
import SellerAccount from '@/components/shared/seller-account'
import MobileControls from '@/components/shared/mobile-controls'
import { ToastProvider } from '@radix-ui/react-toast'
import Footer from '@/components/shared/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Apple Avenue | Premium Apple Marketplace — iPhone, iPad, Mac & More',
  description:
    'Apple Avenue is a premium, curated marketplace for authentic Apple devices. Discover iPhone, iPad, Mac, Apple Watch, AirPods and accessories — certified, warranty-backed and delivered flawlessly.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>
            <SellerAccount />
            <Header />
            <div>{children}</div>
            <Footer />
            <MobileControls />
          </AuthProvider>
          <Toaster position='top-center' />
        </StoreProvider>
      </body>
    </html>
  )
}
