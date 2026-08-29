'use client'
import { MapPin, Clock, Phone } from 'lucide-react'

export default function StoreLocatorPage() {
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Store Locator</h1>
        <p className="text-[12.5px] text-[#6E6E73]">Apple Avenue official store — single merchant. Pickup available, directions & per-location inventory.</p>
        <div className="mt-6 rounded-[14px] border border-gray-100 bg-white p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Apple Avenue — Flagship</h3>
            <p className="text-[12.5px] text-[#6E6E73] flex gap-2"><MapPin className="h-4 w-4 text-[#0071E3]" /> 1 Apple Avenue, BGC, Taguig — National shipping & pickup</p>
            <p className="text-[12.5px] text-[#6E6E73] flex gap-2"><Clock className="h-4 w-4 text-[#0071E3]" /> Mon–Sun 10:00–21:00</p>
            <p className="text-[12.5px] text-[#6E6E73] flex gap-2"><Phone className="h-4 w-4 text-[#0071E3]" /> +63 917 000 0000</p>
            <div className="rounded-[10px] bg-[#F5F5F7] p-3 text-[12px]"><span className="font-semibold">Inventory:</span> iPhone 15 Pro — In Stock (12) • MacBook Air M3 — Low Stock (4)</div>
          </div>
          <div className="flex-1 h-[220px] rounded-[10px] bg-[#F5F5F7] flex items-center justify-center text-[12px] text-[#86868b]">Map — Directions placeholder</div>
        </div>
      </div>
    </div>
  )
}
