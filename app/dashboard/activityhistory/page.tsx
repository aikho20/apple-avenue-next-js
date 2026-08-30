'use client'
import { Card } from '@/components/ui/card'
import { Clock, Package, ShoppingCart, Trash2, Pencil, Plus } from 'lucide-react'
import { useGetActivityQuery } from '@/store/action/activityAction'

type Activity = { _id: string; action: string; detail: string; createdAt: string }

const iconMap: Record<string, any> = {
  product_created: Plus,
  product_updated: Pencil,
  product_deleted: Trash2,
  order_placed: ShoppingCart,
  order_status_updated: Package,
}

export default function ActivityHistoryPage() {
  const { data, isLoading: loading } = useGetActivityQuery({})
  const activities: Activity[] = data?.activities || []

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight text-[#1F2937]">Activity History</h1>
        <p className="text-[13px] text-[#6B7280]">Track recent store activity</p>
      </div>

      <Card className="divide-y divide-gray-50">
        {loading ? (
          <div className="p-10 text-center text-[13px] text-[#6B7280]">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#111111]" />
            </div>
            <p className="text-[13px] font-medium text-[#6B7280]">No activity yet</p>
            <p className="text-[12px] text-[#9CA3AF]">Your recent actions will appear here</p>
          </div>
        ) : (
          activities.map((a) => {
            const Icon = iconMap[a.action] || Clock
            return (
              <div key={a._id} className="flex gap-3 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="h-9 w-9 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[#111111]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1F2937] capitalize">{a.action.replace(/_/g, ' ')}</p>
                  <p className="text-[12px] text-[#6B7280] truncate">{a.detail}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
