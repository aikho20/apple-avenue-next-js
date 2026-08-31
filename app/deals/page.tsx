'use client'
import Link from 'next/link'
import { Timer, Tag, Gift, Truck, Percent, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useGetDealsQuery } from '@/store/action/dealAction'
import { useBranch } from '@/hooks/useBranch'
import { CurrentBranchBanner } from '@/components/branch/branch-selector'

type Deal = { _id: string; code: string; type: string; value: number; active: boolean; expiresAt?: string }
type DealProduct = { _id: string; productName: string; category: string; price: number; images: any; description: string }

export default function DealsPage() {
  const { currentId: branchId, currentBranch } = useBranch()
  const { data, isLoading: loading } = useGetDealsQuery(branchId ? { branchId } : {})
  const deals: Deal[] = data?.deals || []
  const dealProducts: DealProduct[] = data?.dealProducts || []

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <CurrentBranchBanner />
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Deals — from Admin Dashboard</h1>
            <p className="text-[12.5px] text-[#6E6E73]">
              {currentBranch ? (
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#FF6A00]" /> {currentBranch.name} • {currentBranch.address} — deals & coupons filtered to this branch</span>
              ) : (
                'All deals & coupons are created by the admin in Dashboard → Discounts. No fake urgency — real expiration only. Select a branch for accurate deals.'
              )}
            </p>
          </div>
          <Link href="/dashboard/discounts" className="hidden sm:inline-flex text-[12px] font-semibold text-[#6E6E73] rounded-full bg-white border border-gray-100 px-3 py-1">Manage in Dashboard →</Link>
        </div>

        {loading ? (
          <p className="mt-6 text-[13px] text-[#6E6E73]">Loading deals…</p>
        ) : (
          <>
            {/* Coupon / discount codes from admin */}
            <div className="mt-6">
              <h2 className="text-[13px] font-semibold text-[#1D1D1F] flex items-center gap-2"><Tag className="h-4 w-4" /> Coupon codes</h2>
              {deals.length === 0 ? (
                <div className="mt-3 rounded-[14px] border border-dashed border-gray-200 bg-white p-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7]"><Percent className="h-5 w-5 text-[#111111]" /></div>
                  <p className="mt-2 text-[13px] font-medium text-[#1D1D1F]">No active deals yet</p>
                  <p className="text-[12px] text-[#6E6E73]">Admin creates coupons in Dashboard → Discounts (e.g. APPLE10). They appear here automatically.</p>
                  <Link href="/store" className="mt-3 inline-flex text-[12px] font-semibold text-[#0071E3]">Browse collection →</Link>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deals.map((d) => (
                    <div key={d._id} className="rounded-[14px] border border-gray-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7]"><Tag className="h-4 w-4 text-[#111111]" /></div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${d.active ? 'bg-[#111111] text-white' : 'bg-gray-100 text-[#6E6E73]'}`}>{d.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <h3 className="mt-3 text-[13px] font-bold tracking-widest text-[#1D1D1F]">{d.code}</h3>
                      <p className="text-[12px] text-[#6E6E73]">{d.type === 'percentage' ? `${d.value}% off` : `₱${d.value} off`} {d.expiresAt ? `• expires ${new Date(d.expiresAt).toLocaleDateString()}` : '• no expiry'}</p>
                      <Link href="/store" className="mt-3 inline-flex text-[12px] font-semibold text-[#0071E3]">Shop deal →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deal products (isDeal flag) from admin Products */}
            <div className="mt-8">
              <h2 className="text-[13px] font-semibold text-[#1D1D1F] flex items-center gap-2"><Gift className="h-4 w-4" /> Deal products • flagged in Dashboard → Products (Deal)</h2>
              {dealProducts.length === 0 ? (
                <div className="mt-3 rounded-[14px] border border-dashed border-gray-200 bg-white p-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7]"><Gift className="h-5 w-5 text-[#111111]" /></div>
                  <p className="mt-2 text-[13px] font-medium text-[#1D1D1F]">No deal products yet</p>
                  <p className="text-[12px] text-[#6E6E73]">Admin flags products as Deal in the product form (checkbox). They appear here as promo tiles.</p>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dealProducts.map((p) => {
                    const img = Array.isArray(p.images) ? p.images[0] : (p.images as any)
                    return (
                      <Link key={p._id} href={`/product/${p._id}`} className="group rounded-[14px] border border-gray-100 bg-white overflow-hidden shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 transition">
                        <div className="relative h-[160px] bg-[#F5F5F7] overflow-hidden">
                          <Image src={img || '/placeholder.jpg'} alt={p.productName} fill className="object-cover group-hover:scale-[1.02] transition" />
                          <span className="absolute top-2 left-2 rounded-full bg-[#111111] text-white px-2.5 py-1 text-[11px] font-bold">Deal</span>
                        </div>
                        <div className="p-4">
                          <p className="text-[12px] text-[#0071E3] font-bold uppercase tracking-wide">{p.category}</p>
                          <h3 className="text-[13px] font-semibold text-[#1D1D1F] line-clamp-1">{p.productName}</h3>
                          <p className="text-[13px] font-bold text-[#1D1D1F]">₱{p.price.toLocaleString()}</p>
                          <span className="mt-2 inline-flex text-[12px] font-semibold text-[#0071E3]">View deal →</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Fallback info */}
            <div className="mt-8 rounded-[14px] border border-gray-100 bg-white p-4 flex flex-wrap gap-2 text-[11px] text-[#86868b]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1"><Timer className="h-3.5 w-3.5" /> Flash sale timers only when real expiry</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1"><Truck className="h-3.5 w-3.5" /> Free insured shipping when configured</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
