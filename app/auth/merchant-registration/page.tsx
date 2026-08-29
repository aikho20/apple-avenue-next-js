'use client'
import { FaApple } from 'react-icons/fa'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function MerchantRegistration() {
  // Apple Avenue is single-merchant (admin-only). Public merchant registration is disabled.
  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#F5F5F7] via-[#F5F5F7]/60 to-[#FCFCFC] flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-[520px] rounded-[14px] border border-gray-100 bg-white p-7 lg:p-8 shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#111111]">
            <FaApple className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Apple Avenue is Invite-Only</h1>
          <p className="text-[13px] leading-[1.6] text-[#6E6E73] max-w-[420px]">
            Apple Avenue is a <span className="font-semibold text-[#1D1D1F]">single-merchant</span> premium marketplace operated by the admin.
            Public seller registration is disabled. Only the admin (Apple Avenue) can list and manage products.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] font-medium text-[#424245]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0071E3]" /> Official Store • Single Merchant
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/store" className="inline-flex h-[40px] items-center justify-center rounded-[9px] bg-[#111111] px-6 text-[13px] font-semibold text-white hover:bg-black">
            Shop Collection
          </Link>
          <Link href="/auth/login" className="inline-flex h-[40px] items-center justify-center rounded-[9px] border border-[#D2D2D7] bg-white px-6 text-[13px] font-semibold text-[#111111] hover:bg-[#F5F5F7]">
            Admin Sign In
          </Link>
        </div>
        <p className="text-[11px] text-[#86868b]">Sellers by invitation — contact the administrator.</p>
      </div>
    </div>
  )
}
