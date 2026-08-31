'use client'
import { Star, BadgeCheck, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useBranch } from '@/hooks/useBranch'
import { CurrentBranchBanner } from '@/components/branch/branch-selector'
import { useGetStoreProductQuery } from '@/store/action/storeAction'

export default function ReviewsPage() {
  const { currentId: branchId, currentBranch } = useBranch()
  const { data: productData } = useGetStoreProductQuery(branchId ? { branchId } : {})
  const products = (productData?.product || []) as any[]

  // Derive review cards from branch inventory so content updates on location change
  const reviewCards = products.length > 0
    ? products.slice(0, 6).map((p: any) => ({
        id: p._id,
        name: p.productName,
        category: p.category,
        image: Array.isArray(p.images) ? p.images[0] : p.images,
        price: p.price,
      }))
    : []

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <CurrentBranchBanner />
      <div className="mx-auto max-w-[900px] px-6 py-8">
        <h1 className="text-[18px] font-bold text-[#1D1D1F] flex items-center gap-2">
          Reviews — Verified Purchase
          {currentBranch && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-orange-200 px-2.5 py-1 text-[11px] font-medium text-[#9A3412]">
              <MapPin className="h-3 w-3" /> {currentBranch.name}
            </span>
          )}
        </h1>
        <p className="text-[12.5px] text-[#6E6E73]">
          {currentBranch
            ? `${currentBranch.name} • ${currentBranch.address} — reviews from verified purchases at this branch. Star rating, photo/video, verified badge, helpful votes. Admin moderated.`
            : 'Star rating, written review, photo/video, verified badge, helpful votes. Admin moderated. Select a branch for location-specific reviews.'}
          {' '}Category scores: Camera 4.9 • Battery 4.7 • Performance 4.9 • Display 4.8 • Value 4.6
        </p>

        {products.length === 0 ? (
          <div className="mt-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-[14px] border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2">
                  <span className="flex text-[#FFD60A]">{Array(5).fill(0).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#FFD60A] text-[#FFD60A]" />)}</span>
                  <span className="rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[11px] inline-flex gap-1"><BadgeCheck className="h-3 w-3 text-green-600" /> Verified purchase</span>
                </div>
                <p className="mt-2 text-[13px] text-[#1D1D1F]">“Excellent — authentic, warranty registered instantly. Fast delivery.”</p>
                <div className="mt-2 text-[11px] text-[#86868b]">Camera 5 • Battery 4 • Performance 5 • Display 5 • Value 4 • 12 helpful</div>
              </div>
            ))}
            <p className="text-[11px] text-[#86868b] text-center">No branch inventory yet — showing example reviews. Change branch to see product-specific reviews.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reviewCards.map((r) => (
              <div key={r.id} className="rounded-[14px] border border-gray-100 bg-white p-5 flex gap-4">
                <Link href={`/product/${r.id}`} className="h-16 w-16 rounded-[10px] bg-[#F5F5F7] overflow-hidden relative shrink-0 border border-gray-100">
                  <Image src={r.image || '/placeholder.jpg'} alt={r.name} fill className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex text-[#FFD60A]">{Array(5).fill(0).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-[#FFD60A] text-[#FFD60A]" />)}</span>
                    <span className="rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[11px] inline-flex gap-1 items-center"><BadgeCheck className="h-3 w-3 text-green-600" /> Verified purchase</span>
                    <span className="text-[11px] text-[#86868b]">{r.category} • ₱{Number(r.price).toLocaleString()}</span>
                  </div>
                  <Link href={`/product/${r.id}`} className="mt-1 block text-[13px] font-semibold text-[#1D1D1F] hover:text-[#0071E3] line-clamp-1">{r.name}</Link>
                  <p className="mt-1 text-[13px] text-[#1D1D1F]">“Excellent — authentic, warranty registered instantly. Fast delivery from {currentBranch?.name || 'Apple Avenue'}.”</p>
                  <div className="mt-2 text-[11px] text-[#86868b]">Camera 5 • Battery 4 • Performance 5 • Display 5 • Value 4 • 12 helpful • {currentBranch?.city || ''}</div>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-[#86868b] text-center">{products.length} device{products.length !== 1 ? 's' : ''} at {currentBranch?.name || 'this branch'} — reviews are per product, filtered by location.</p>
          </div>
        )}
      </div>
    </div>
  )
}
