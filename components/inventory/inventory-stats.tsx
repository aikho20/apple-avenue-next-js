'use client'
import { Card } from '@/components/ui/card'
import { Package, AlertTriangle, Ban, Wallet } from 'lucide-react'

export function InventoryStats({ stats, isLoading }: { stats: any; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[96px] rounded-[14px] bg-white border border-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }
  const items = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, sub: 'SKU tracked' },
    { label: 'Total Stock', value: stats?.totalStock ?? 0, icon: Wallet, sub: 'Units in warehouse' },
    { label: 'Low Stock', value: stats?.lowStock ?? 0, icon: AlertTriangle, sub: 'At/below threshold', tone: 'amber' },
    { label: 'Out of Stock', value: stats?.outOfStock ?? 0, icon: Ban, sub: 'Zero available', tone: 'red' },
    { label: 'Inventory Value', value: `₱${Number(stats?.inventoryValue ?? 0).toLocaleString()}`, icon: Wallet, sub: 'Cost * qty' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((s) => {
        const Icon = s.icon
        const toneClass =
          (s as any).tone === 'amber'
            ? 'bg-amber-50 border-amber-100'
            : (s as any).tone === 'red'
              ? 'bg-red-50 border-red-100'
              : 'bg-white border-gray-100'
        return (
          <div key={s.label} className={`rounded-[14px] border p-4 shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col gap-1 ${toneClass}`}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase">{s.label}</p>
              <Icon className={`h-4 w-4 ${ (s as any).tone === 'amber' ? 'text-amber-600' : (s as any).tone==='red' ? 'text-red-600' : 'text-[#111111]'}`} />
            </div>
            <p className="text-[20px] font-extrabold tracking-tight text-[#1D1D1F]">{s.value}</p>
            <p className="text-[11px] text-[#6E6E73]">{s.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
