'use client'
import Link from 'next/link'
import { AlertTriangle, Ban, Clock, Package, CreditCard, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NeedsAttention({
  lowStock,
  outOfStock,
  pendingOrders,
  processing,
  cancelled,
}: {
  lowStock: number
  outOfStock: number
  pendingOrders: number
  processing: number
  cancelled: number
}) {
  const items = [
    { label: `${outOfStock} products out of stock`, tone: 'red', icon: Ban, show: outOfStock > 0, href: '/dashboard/inventory' },
    { label: `${lowStock} products low stock`, tone: 'amber', icon: AlertTriangle, show: lowStock > 0, href: '/dashboard/inventory' },
    { label: `${pendingOrders} pending orders`, tone: 'amber', icon: Clock, show: pendingOrders > 0, href: '/dashboard/orders' },
    { label: `${processing} orders processing`, tone: 'blue', icon: Truck, show: processing > 0, href: '/dashboard/orders' },
    { label: `${cancelled} cancelled orders`, tone: 'red', icon: CreditCard, show: cancelled > 0, href: '/dashboard/orders' },
  ].filter(i => i.show)

  return (
    <Card>
      <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between py-4">
        <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Needs Attention
        </CardTitle>
        <span className="text-[11px] text-[#86868b]">{items.length ? `${items.length} items` : 'All clear'}</span>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {items.length ? (
          items.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-[12px] font-medium transition-colors ${
                  item.tone === 'red'
                    ? 'border-red-100 bg-red-50/60 text-red-800 hover:bg-red-50'
                    : item.tone === 'amber'
                      ? 'border-amber-100 bg-amber-50/60 text-amber-900 hover:bg-amber-50'
                      : 'border-blue-100 bg-blue-50/60 text-blue-900 hover:bg-blue-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="text-[11px] opacity-70">View →</span>
              </Link>
            )
          })
        ) : (
          <div className="rounded-[10px] bg-emerald-50 border border-emerald-100 px-3 py-3 text-[12px] text-emerald-800 flex gap-2">
            <Package className="h-4 w-4" /> All systems healthy — no urgent actions.
          </div>
        )}
        <div className="rounded-[10px] bg-[#F5F5F7] p-2.5 text-[11px] text-[#86868b] leading-relaxed">
          Tip: Restock low items, ship pending orders, and review cancelled payments to reduce loss.
        </div>
      </CardContent>
    </Card>
  )
}
