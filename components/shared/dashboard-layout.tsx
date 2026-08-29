'use client'
import { DASHBOARD_MENU } from '@/utils/data'
import { LayoutDashboard } from 'lucide-react'
import { FaApple } from 'react-icons/fa'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface ProviderProps {
  children: React.ReactNode
  toggle: boolean
}
export default function DashboardLayout({ children, toggle }: ProviderProps) {
  const pathname = usePathname()
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-6 grid grid-cols-6 gap-6">
        <div className="xl:col-span-2 lg:col-span-3 hidden md:block">
          <div className="sticky top-[80px] rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#111111]">
                <FaApple className="h-4 w-4 text-white" />
              </div>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">Apple Avenue — Seller Center</span>
            </div>
            <nav className="p-3 flex flex-col gap-4">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  pathname === '/dashboard' ? 'bg-[#F5F5F7] text-[#111111]' : 'text-[#424245] hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${pathname === '/dashboard' ? 'text-[#111111]' : 'text-[#6E6E73]'}`} />
                Dashboard
              </Link>
              {DASHBOARD_MENU.map((menu, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="px-3 text-[11px] font-bold tracking-[0.08em] text-[#9CA3AF] uppercase">
                    {menu.title}
                  </span>
                  {menu.items.map((items, idx) => {
                    const Icon = items.icon
                    const active = pathname === items.route
                    return (
                      <Link
                        href={items.route}
                        key={idx}
                        className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium transition-colors ${
                          active ? 'bg-[#F5F5F7] text-[#111111]' : 'text-[#424245] hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? 'text-[#111111]' : 'text-[#6E6E73]'}`} />
                        {items.title}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
        <div className="col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-4 min-w-0">{children}</div>
      </div>
    </div>
  )
}
