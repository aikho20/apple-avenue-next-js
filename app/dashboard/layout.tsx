import DashboardLayout from '@/components/shared/dashboard-layout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout toggle={false}>{children}</DashboardLayout>
}
