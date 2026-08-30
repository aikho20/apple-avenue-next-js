'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetInventoryHistoryQuery, useGetPriceHistoryQuery } from '@/store/action/inventoryAction'
import { Clock, TrendingUp, Package, ArrowRight, Calendar } from 'lucide-react'

const FILTERS = ['All', 'Inventory', 'Price', 'Adjustments', 'SALE', 'RETURN'] as const

export function ProductHistory({ productId }: { productId: string }) {
  const [filter, setFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const invFilter = filter === 'Price' ? 'none' : filter === 'All' ? 'All' : filter
  const { data: invData, isLoading: invLoading } = useGetInventoryHistoryQuery(
    { productId, type: invFilter, page, limit: 20 },
    { skip: !productId || filter === 'Price' }
  )
  const { data: priceData, isLoading: priceLoading } = useGetPriceHistoryQuery(
    { productId, page, limit: 20 },
    { skip: !productId || (filter !== 'All' && filter !== 'Price') }
  )

  const isLoading = invLoading || priceLoading

  if (!productId) {
    return (
      <Card className="p-10 text-center text-[13px] text-[#6E6E73]">Select a product to view history</Card>
    )
  }

  // Merge timelines when All
  let combined: any[] = []
  if (filter === 'All') {
    const inv = (invData?.history || []).map((h: any) => ({ ...h, _kind: 'inventory', _date: new Date(h.createdAt) }))
    const pr = (priceData?.history || []).map((h: any) => ({ ...h, _kind: 'price', _date: new Date(h.createdAt) }))
    combined = [...inv, ...pr].sort((a, b) => b._date.getTime() - a._date.getTime())
  } else if (filter === 'Price') {
    combined = (priceData?.history || []).map((h: any) => ({ ...h, _kind: 'price', _date: new Date(h.createdAt) }))
  } else {
    combined = (invData?.history || []).map((h: any) => ({ ...h, _kind: 'inventory', _date: new Date(h.createdAt) }))
  }

  // Group by date
  const groups: Record<string, any[]> = {}
  combined.forEach((item) => {
    const key = item._date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold border transition-colors ${filter === f ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#424245] border-gray-200 hover:bg-gray-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      ) : combined.length === 0 ? (
        <Card className="p-10 flex flex-col items-center gap-2 text-center">
          <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Clock className="h-5 w-5 text-[#111111]" />
          </div>
          <p className="text-[13px] font-medium text-[#6E6E73]">No history yet</p>
          <p className="text-[12px] text-[#9CA3AF]">Inventory and price changes will appear here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([date, items]) => (
            <div key={date} className="space-y-2">
              <p className="text-[12px] font-semibold text-[#6E6E73] flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{date}</p>
              <div className="space-y-2">
                {items.map((it: any) => (
                  <Card key={it._id} className="p-4 hover:shadow-md transition-shadow">
                    {it._kind === 'inventory' ? (
                      <div className="flex gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${it.quantityChange > 0 ? 'bg-[#ECFDF5] text-[#059669]' : it.quantityChange < 0 ? 'bg-red-50 text-red-600' : 'bg-[#F5F5F7] text-[#111111]'}`}>
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold text-[#1F2937]">{it.type?.replace(/_/g, ' ')}</p>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${it.quantityChange > 0 ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : it.quantityChange < 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50'}`}>
                              {it.quantityChange > 0 ? `+${it.quantityChange}` : it.quantityChange} units
                            </span>
                            <span className="text-[11px] text-[#6E6E73] flex items-center gap-1">
                              {it.quantityBefore} <ArrowRight className="h-3 w-3" /> {it.quantityAfter}
                            </span>
                          </div>
                          {it.reason && <p className="text-[12px] text-[#6E6E73] mt-1">Reason: {it.reason}</p>}
                          {it.referenceId && <p className="text-[11px] text-[#9CA3AF]">Ref: {it.referenceId}</p>}
                          <p className="text-[11px] text-[#9CA3AF] mt-1">By {it.createdByName || it.createdBy} • {new Date(it.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1F2937]">Price Updated</p>
                          <p className="text-[12px] text-[#1D1D1F]">
                            <span className="font-semibold">₱{Number(it.previousPrice).toLocaleString()}</span> <ArrowRight className="h-3 w-3 inline" /> <span className="font-bold">₱{Number(it.newPrice).toLocaleString()}</span>
                            <span className={`ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full border ${Number(it.newPrice) - Number(it.previousPrice) >= 0 ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              {Number(it.newPrice) - Number(it.previousPrice) >= 0 ? '+' : ''}₱{(Number(it.newPrice) - Number(it.previousPrice)).toLocaleString()}
                            </span>
                          </p>
                          {it.reason && <p className="text-[12px] text-[#6E6E73] mt-1">Reason: {it.reason}</p>}
                          <p className="text-[11px] text-[#9CA3AF] mt-1">By {it.updatedByName || it.updatedBy} • {new Date(it.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
