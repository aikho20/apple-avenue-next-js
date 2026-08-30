'use client'
import { DASHBOARD_MENU } from '@/utils/data'
import { LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
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
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Sidebar — reduced width: 220px on lg, 240px on xl */}
        <div className="hidden lg:block shrink-0 w-[220px] xl:w-[240px]">
          <div className="sticky top-[80px] rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50 flex items-center gap-2">
              <Image src="/icon.png" alt="Apple Avenue" width={120} height={28} className="h-7 w-auto object-contain" unoptimized />
            </div>
            <nav className="p-2.5 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium transition-colors ${
                  pathname === '/dashboard' ? 'bg-[#F5F5F7] text-[#111111]' : 'text-[#424245] hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${pathname === '/dashboard' ? 'text-[#111111]' : 'text-[#6E6E73]'}`} />
                Dashboard
              </Link>
              {DASHBOARD_MENU.map((menu, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="px-3 text-[10.5px] font-bold tracking-[0.08em] text-[#9CA3AF] uppercase">
                    {menu.title}
                  </span>
                  {menu.items.map((items, idx) => {
                    const Icon = items.icon
                    const active = pathname === items.route
                    return (
                      <Link
                        href={items.route}
                        key={idx}
                        className={`flex items-center gap-2 rounded-[9px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          active ? 'bg-[#F5F5F7] text-[#111111]' : 'text-[#424245] hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-[16px] w-[16px] ${active ? 'text-[#111111]' : 'text-[#6E6E73]'}`} />
                        {items.title}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile top scroll nav */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 pb-2 w-max">
            <Link href="/dashboard" className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold border ${pathname === '/dashboard' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#424245] border-gray-200'}`}>Dashboard</Link>
            {DASHBOARD_MENU.flatMap((m) => m.items).map((it) => {
              const Icon = it.icon
              const active = pathname === it.route
              return (
                <Link key={it.route} href={it.route} className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium border ${active ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#424245] border-gray-200'}`}>
                  <Icon className="h-3.5 w-3.5" /> {it.title}
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
