'use client'

import AccountMenu from '@/components/shared/account-menu'

function Account() {
  return (
    <div className="w-full">
      <div className="md:hidden rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
        <AccountMenu />
      </div>
      <div className="hidden md:flex rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] items-center justify-center py-16">
        <p className="text-[13px] text-[#6B7280]">Select an option from the menu</p>
      </div>
    </div>
  )
}

export default Account
