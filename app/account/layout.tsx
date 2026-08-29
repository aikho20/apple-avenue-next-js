import type { Metadata } from 'next'

import AccountLayout from '@/components/shared/account-layout'

export const metadata: Metadata = {
  title: 'My Account — Apple Avenue',
  description: 'Manage your orders, wishlist, addresses and warranty registrations at Apple Avenue.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AccountLayout toggle={true}>{children}</AccountLayout>
}
