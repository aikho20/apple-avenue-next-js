'use client'
import { ShieldCheck, Calendar, Smartphone, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { useGetWarrantiesQuery } from '@/store/action/warrantyAction'

type Warranty = {
  _id: string
  product: string
  productName: string
  imei: string
  serialNumber: string
  orderId: string
  purchaseDate: string
  warrantyStart: string
  warrantyExpiration: string
  status: string
}

export default function WarrantyPage() {
  const { data: session, status } = useSession()
  const { data, isLoading: loading } = useGetWarrantiesQuery({}, { skip: status !== 'authenticated' })
  const warranties: Warranty[] = data?.warranties || []

  if (status === 'loading') return <div className="w-full min-h-[50vh] flex items-center justify-center"><p className="text-[13px] text-[#6E6E73]">Loading...</p></div>
  if (status === 'unauthenticated') return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <Card className="p-8 text-center max-w-[420px]"><ShieldCheck className="h-8 w-8 mx-auto text-[#111111]" /><p className="mt-2 text-[14px] font-semibold">Please login to view warranty</p><p className="text-[12px] text-[#6E6E73]">Warranty is managed by admin and tied to your orders.</p></Card>
    </div>
  )

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1000px] px-6 py-8 flex flex-col gap-6">
        <div className="rounded-[14px] border border-gray-100 bg-white p-6 lg:p-8 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <h1 className="text-[18px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Warranty — Registered by Admin</h1>
          <p className="text-[12.5px] text-[#6E6E73]">Your device warranties are <span className="font-semibold">registered by Apple Avenue admin</span> after purchase. They are tied to your actual order/product and show here automatically.</p>
          <div className="mt-4 rounded-[12px] bg-[#F5F5F7] p-4">
            <p className="text-[12px] font-semibold text-[#1D1D1F]">How it works</p>
            <p className="text-[12px] text-[#6E6E73]">Admin registers your device after you purchase (using your order, IMEI, serial, purchase date). Warranty is 1 year from purchase, status auto-calculated (Active/Expired). Contact support if you need a device registered.</p>
          </div>
        </div>

        <div className="rounded-[14px] border border-gray-100 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <h2 className="text-[14px] font-semibold text-[#1D1D1F] flex items-center gap-2"><Smartphone className="h-4 w-4" /> My Warranties ({warranties.length}) — Admin Managed</h2>
          <p className="text-[11px] text-[#86868b]">Only admin can create or modify warranties via Dashboard → Warranty. You can view status and expiration here.</p>
          {loading ? <p className="text-[13px] text-[#6E6E73] mt-3">Loading...</p> : warranties.length === 0 ? (
            <div className="mt-4 rounded-[12px] bg-[#F5F5F7] p-6 text-center">
              <p className="text-[13px] font-medium text-[#1D1D1F]">No warranties yet</p>
              <p className="text-[12px] text-[#6E6E73]">Admin will register your device after purchase. Warranty appears here with status and expiration.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {warranties.map((w) => {
                const expired = new Date(w.warrantyExpiration) < new Date()
                return (
                  <div key={w._id} className="rounded-[12px] border border-gray-100 p-4 flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{w.productName}</p>
                      <p className="text-[11px] text-[#6E6E73]">IMEI: {w.imei} • SN: {w.serialNumber} • Order: {w.orderId ? w.orderId.slice(0, 8) : '—'}</p>
                      <p className="text-[11px] text-[#6E6E73] flex items-center gap-1"><Calendar className="h-3 w-3" /> Purchase: {new Date(w.purchaseDate).toLocaleDateString()} • Expires: {new Date(w.warrantyExpiration).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${w.status === 'Active' && !expired ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-red-50 text-red-600 border-red-200'}`}>{expired ? 'Expired' : w.status}</span>
                      <div className="rounded-[8px] bg-[#F5F5F7] px-2 py-1 text-[11px] text-[#424245]">
                        <p className="font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Warranty Status: {expired ? 'Expired' : w.status}</p>
                        <p>Expires: {new Date(w.warrantyExpiration).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
