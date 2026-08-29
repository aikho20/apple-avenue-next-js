import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from './skeleton'
import { Minus, Plus, Trash2Icon, Heart, GitCompare } from 'lucide-react'
import Image from 'next/image'
import { Label } from './label'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductCardProps } from '@/types/type'
import { useWishlist } from '@/hooks/useWishlist'
import { useCompare } from '@/hooks/useCompare'
import toast from 'react-hot-toast'

export default function ProductCard({
  _id,
  productName,
  cost,
  description,
  price,
  images,
  isLoading,
  value,
  onButtonAddClick,
  onButtonMinusClick,
}: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isWishlisted, toggle: toggleWishlist } = useWishlist()
  const { isCompared, toggle: toggleCompare, count: compareCount, max: compareMax } = useCompare()
  const wishlisted = !isLoading && isWishlisted(_id)
  const compared = !isLoading && isCompared(_id)
  return (
    <Card className="flex flex-col h-full overflow-hidden p-0 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5">
      <CardHeader className="relative p-0">
        {isLoading ? (
          <Skeleton className="w-full h-[160px] rounded-t-[14px]" />
        ) : (
          <div className="relative w-full h-[160px] overflow-hidden bg-gray-50 border-b border-gray-100">
            <Image
              src={images || '/placeholder.jpg'}
              alt={productName || 'Product Image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 280px"
            />
            {/* Wishlist & Compare top buttons */}
            <div className="absolute top-2 left-2 right-2 flex justify-between">
              <button
                aria-label="Compare"
                onClick={async (e) => {
                  e.preventDefault()
                  if (compared) { toggleCompare(_id); toast.success('Removed from compare') }
                  else {
                    if (compareCount >= compareMax) { toast.error(`Compare max ${compareMax} phones`); return }
                    toggleCompare(_id); toast.success('Added to compare — view in Compare (2-4)')
                  }
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm backdrop-blur bg-white/90 ${compared ? 'border-[#111111] bg-[#111111] text-white' : 'border-gray-100 text-[#6B7280] hover:bg-white'}`}
              >
                <GitCompare className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="Wishlist"
                onClick={async (e) => {
                  e.preventDefault()
                  await toggleWishlist(_id)
                  toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm backdrop-blur ${wishlisted ? 'bg-[#111111] border-[#111111] text-white' : 'bg-white/90 border-gray-100 text-[#6B7280] hover:bg-white'}`}
              >
                <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {value > 0 ? (
          <div className="flex absolute bottom-3 left-0 right-0 items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white border border-gray-100 shadow-[0_4px_18px_rgba(15,23,42,0.08)] px-3 py-1.5">
              <button
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (!session) router.push('/auth/login')
                  else onButtonMinusClick()
                }}
              >
                {value <= 1 ? (
                  <Trash2Icon className="h-4 w-4 text-[#111111]" />
                ) : (
                  <Minus className="h-4 w-4 text-[#374151]" />
                )}
              </button>
              <span className="text-[13px] font-semibold text-[#1F2937] min-w-[18px] text-center">
                {value}
              </span>
              <button
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (!session) router.push('/auth/login')
                  else onButtonAddClick()
                }}
              >
                <Plus className="h-4 w-4 text-[#374151]" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {!isLoading && (
              <button
                aria-label="Add to cart"
                className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-100 shadow-[0_4px_18px_rgba(15,23,42,0.08)] hover:bg-[#F5F5F7] hover:border-[#D2D2D7] transition-colors"
                onClick={() => {
                  if (!session) router.push('/auth/login')
                  else onButtonAddClick()
                }}
              >
                <Plus className="h-4 w-4 text-[#374151]" />
              </button>
            )}
          </>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 p-4">
        {!isLoading ? (
          <Link href={`/product/${_id}`} className="text-[13px] font-semibold text-[#1D1D1F] leading-tight line-clamp-1 hover:text-[#0071E3] hover:underline">
            {productName}
          </Link>
        ) : (
          <Skeleton className="w-full h-4" />
        )}

        {!isLoading ? (
          <p className="text-[12px] leading-[1.5] text-[#6B7280] line-clamp-2 min-h-[36px]">
            {description}
          </p>
        ) : (
          <Skeleton className="w-[85%] h-4" />
        )}

        {!isLoading ? (
          <span className="text-[13px] font-bold text-[#1F2937] pt-1">₱{price}</span>
        ) : (
          <Skeleton className="w-16 h-4" />
        )}
      </CardContent>
    </Card>
  )
}
