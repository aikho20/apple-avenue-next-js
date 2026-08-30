'use client'

import AccountMenu from './account-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ACCOUNT_MENU } from '@/utils/data'

interface ProviderProps {
  children: React.ReactNode
  toggle: boolean
}
export default function AccountLayout({ children, toggle }: ProviderProps) {
  const pathname = usePathname()
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Sidebar — reduced: 220px lg, 240px xl */}
        <div className="hidden lg:block shrink-0 w-[220px] xl:w-[240px]">
          <div className="sticky top-[80px] rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h2 className="text-[12.5px] font-semibold text-[#1F2937]">My Account</h2>
              <p className="text-[11px] text-[#6B7280]">Manage profile & orders</p>
            </div>
            <AccountMenu />
          </div>
        </div>

        {/* Mobile scroll pills */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 pb-2 w-max">
            {ACCOUNT_MENU.map((m) => {
              const Icon = m.icon
              const active = pathname === m.path
              return (
                <Link key={m.path} href={m.path} className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium border ${active ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#424245] border-gray-200'}`}>
                  <Icon className="h-3.5 w-3.5" /> {m.title}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
