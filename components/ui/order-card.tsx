'use client'

import { OrderCardProps, ProductCartProps } from '@/types/type'
import Image from 'next/image'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { useToggle } from '@/hooks/useToggle'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import OrderInfoLayout from '../shared/order-info-layout'
import { useRouter } from 'next/navigation'
import { Separator } from './separator'

export default function OrderCard({ data, isLoading }: OrderCardProps) {
  const [value, toggle, setValue] = useToggle()
  const router = useRouter()
  const statusColor =
    data?.orderInfo?.status === 'delivered' || data?.orderInfo?.status === 'completed'
      ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
      : data?.orderInfo?.status === 'pending'
        ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
        : 'bg-[#F5F5F7] text-[#111111] border-[#D2D2D7]'

  return (
    <div className="relative rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col overflow-hidden hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all">
      <div className="flex items-center gap-3 px-4 pt-4">
        {isLoading ? (
          <>
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-[140px] h-4" />
          </>
        ) : (
          <>
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-100 bg-[#F5F5F7] shrink-0">
              {data.profilePhoto ? (
                <Image src={data.profilePhoto} alt="merchant" fill className="object-cover" sizes="40px" />
              ) : null}
            </div>
            <p className="text-[13px] font-semibold text-[#1F2937] truncate">{data?.name}</p>
          </>
        )}
      </div>

      <Separator className="my-3 bg-gray-50" />

      <div className="flex gap-2 overflow-auto px-4 pb-2">
        {data?.orderInfo?.products?.map((items: ProductCartProps, index: number) => (
          <div key={index} className="shrink-0">
            {isLoading ? (
              <Skeleton className="w-[52px] h-[52px] rounded-[8px]" />
            ) : (
              <div className="relative h-[52px] w-[52px] overflow-hidden rounded-[8px] border border-gray-100 bg-gray-50">
                <Image src={items?.images?.[0]} alt="product" fill className="object-cover" sizes="52px" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center px-4 py-3">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <span className="text-[12px] font-medium text-[#6B7280]">Total</span>
            <span className="text-[14px] font-bold text-[#1F2937]">₱{data?.orderInfo?.total || 0.0}</span>
          </>
        )}
      </div>

      <div className="absolute top-3 right-3">
        {isLoading ? (
          <Skeleton className="h-5 w-16 rounded-full" />
        ) : (
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}>
            {data?.orderInfo?.status}
          </span>
        )}
      </div>

      <div className="flex gap-2 px-4 py-3 bg-[#FCFCFC] border-t border-gray-50">
        {isLoading ? (
          <>
            <Skeleton className="h-9 w-[110px] rounded-[9px]" />
            <Skeleton className="h-9 w-[110px] rounded-[9px]" />
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => router.push(`/store?storeId=${data?._id}`, { scroll: true })}>
              View Store
            </Button>
            <Button size="sm" variant="outline" onClick={() => toggle()}>
              Order Details
            </Button>
          </>
        )}
      </div>

      <Dialog open={value} onOpenChange={setValue}>
        <DialogContent className="max-w-[600px] max-h-[85vh] overflow-auto rounded-[14px]">
          <div className="py-2">
            <OrderInfoLayout data={data.orderInfo} isLoading={isLoading} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
