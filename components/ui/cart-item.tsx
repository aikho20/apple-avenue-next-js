import { Skeleton } from './skeleton'
import { Minus, Plus, Trash2Icon } from 'lucide-react'
import { CartCardProps } from '@/types/type'
import { DRAFT, OUT_OF_STOCK } from '@/utils/data'
import Image from 'next/image'

export default function CartItem({
  _id,
  title,
  price,
  image,
  isLoading,
  status,
  value,
  onButtonAddClick,
  onButtonMinusClick,
}: CartCardProps) {
  return (
    <div className="flex flex-row items-center gap-3 rounded-[10px] border border-transparent hover:border-gray-50 hover:bg-gray-50/50 p-2 transition-colors">
      <div className="shrink-0">
        {isLoading || !image ? (
          <Skeleton className="w-[52px] h-[52px] rounded-[8px]" />
        ) : (
          <div className="relative h-[52px] w-[52px] overflow-hidden rounded-[8px] border border-gray-100 bg-white">
            <Image src={image} alt={title || 'cart-item'} fill className="object-cover" sizes="52px" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        {isLoading ? (
          <Skeleton className="w-[120px] h-3" />
        ) : (
          <p className="text-[13px] font-semibold text-[#1F2937] truncate">{title}</p>
        )}
        {isLoading ? (
          <Skeleton className="w-[60px] h-3" />
        ) : (
          <span className="text-[12px] text-[#6B7280]">₱{price}</span>
        )}
        {(status == OUT_OF_STOCK || status == DRAFT) && (
          <span className="text-[11px] font-medium text-[#111111]">Unavailable</span>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.06)] px-2 py-1 shrink-0">
        {isLoading ? null : (
          <>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
              onClick={() => onButtonAddClick()}
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5 text-[#374151]" />
            </button>
            <span className="text-[12px] font-semibold text-[#1F2937] min-w-[16px] text-center">{value}</span>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
              onClick={() => onButtonMinusClick()}
              aria-label="Decrease"
            >
              {value <= 1 ? (
                <Trash2Icon className="h-3.5 w-3.5 text-[#111111]" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-[#374151]" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
