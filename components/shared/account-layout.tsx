'use client'

import AccountMenu from './account-menu'

interface ProviderProps {
  children: React.ReactNode
  toggle: boolean
}
export default function AccountLayout({ children, toggle }: ProviderProps) {
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-6 grid grid-cols-6 gap-6">
        <div className="xl:col-span-2 lg:col-span-3 hidden md:block">
          <div className="sticky top-[80px] rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-[13px] font-semibold text-[#1F2937]">My Account</h2>
            </div>
            <AccountMenu />
          </div>
        </div>
        <div className="col-span-6 md:col-span-6 lg:col-span-3 xl:col-span-4 min-w-0">{children}</div>
      </div>
    </div>
  )
}
