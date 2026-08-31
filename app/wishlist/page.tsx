'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, GitCompare, Bell, Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/hooks/useWishlist'
import { useGetStoreProductQuery, useAddToCartMutation, useGetStoreCartQuery } from '@/store/action/storeAction'
import { useSession } from 'next-auth/react'
import { useCompare } from '@/hooks/useCompare'
import toast from 'react-hot-toast'
import { useBranch } from '@/hooks/useBranch'
import { CurrentBranchBanner } from '@/components/branch/branch-selector'

export default function WishlistPage() {
  const { wishlistIds, wishlistProducts, isWishlisted, toggle, isAuthed } = useWishlist()
  const { currentId: branchId, currentBranch } = useBranch()
  const { data: productData } = useGetStoreProductQuery(branchId ? { branchId } : {})
  const { data: session } = useSession()
  const { data: cartData } = useGetStoreCartQuery(branchId ? { branchId } : {}, { skip: !session?.user })
  const [addToCart] = useAddToCartMutation()
  const { toggle: toggleCompare, isCompared } = useCompare()

  // For guest, wishlistProducts is empty (ids only), so resolve via productData (already branch-filtered)
  const allProducts = (productData?.product || []) as any[]
  // Branch-filter wishlist: intersect wishlistIds/wishlistProducts with currently available branch products
  const branchProductIds = new Set(allProducts.map((p: any) => p._id))
  const rawDisplay: any[] = isAuthed
    ? wishlistProducts
    : allProducts.filter((p) => wishlistIds.includes(p._id))
  // When authed, filter wishlistProducts to only those available at this branch
  const displayProducts: any[] = isAuthed
    ? rawDisplay.filter((p: any) => branchProductIds.has(p._id))
    : rawDisplay
  const hiddenCount = (isAuthed ? wishlistProducts.length : wishlistIds.length) - displayProducts.length

  const handleAddToCart = async (p: any) => {
    if (!session?.user) { toast.error('Please login to add to cart'); return }
    const cartVal = (cartData?.cart || []).find((c: any) => c._id === p._id)?.value || 0
    // Branch-aware merchant for cart
    const branchMerchant = (currentBranch as any)?.manager?.toString() || (currentBranch as any)?.manager || ''
    await addToCart({ merchant: branchMerchant, item: [{ _id: p._id, value: cartVal + 1 }] }).unwrap()
    toast.success('Added to cart')
  }

  if (displayProducts.length === 0) {
    return (
      <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
        <CurrentBranchBanner />
        <div className="mx-auto max-w-[1200px] px-6 py-10">
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">Wishlist {currentBranch && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-orange-200 px-2.5 py-1 text-[11px] font-medium text-[#9A3412]"><MapPin className="h-3 w-3" /> {currentBranch.name}</span>}</h1>
          <p className="text-[12px] text-[#6E6E73]">{currentBranch ? `${currentBranch.name} • ${currentBranch.address} — showing favorites available at this branch.` : 'Save products you love — guest wishlist supported, synced after login. Select a branch to see location-specific availability.'} {hiddenCount > 0 ? `${hiddenCount} item(s) hidden — not stocked at this branch.` : 'Price-drop & back-in-stock notifications enabled.'}</p>
          <div className="mt-8 rounded-[14px] border border-gray-100 bg-white p-10 text-center shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]"><Heart className="h-5 w-5 text-[#111111]" /></div>
            <h3 className="mt-3 text-[14px] font-semibold text-[#1D1D1F]">{hiddenCount > 0 ? 'No favorites at this branch' : 'Your wishlist is empty'}</h3>
            <p className="mx-auto max-w-[360px] text-[12.5px] text-[#6E6E73]">{hiddenCount > 0 ? `You have ${hiddenCount} favorite(s) at other branches — change location to view them.` : 'Save products you love and find them here later. Get price-drop and back-in-stock notifications.'}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/store"><Button className="bg-[#111111] hover:bg-black">Browse Apple</Button></Link>
              <Link href="/phone-finder"><Button variant="outline">Phone Finder</Button></Link>
            </div>
            <div className="mt-6 flex justify-center gap-2 text-[11px] text-[#86868b]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1"><Bell className="h-3.5 w-3.5" /> Price-drop alerts</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1"><GitCompare className="h-3.5 w-3.5" /> Compare wishlist</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <CurrentBranchBanner />
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><Heart className="h-5 w-5 fill-[#111111] text-[#111111]" /> Wishlist • {displayProducts.length} {isAuthed ? '' : '(guest)'} {currentBranch && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-orange-200 px-2.5 py-1 text-[11px] font-medium text-[#9A3412]"><MapPin className="h-3 w-3" /> {currentBranch.name}</span>}</h1>
            <p className="text-[12px] text-[#6E6E73]">{currentBranch ? `${currentBranch.name} • ${currentBranch.address} — favorites filtered to this branch.` : 'Select a branch to filter favorites. '}Compare wishlist products, get notifications. {isAuthed ? '' : 'Login to sync & save permanently.'} {hiddenCount > 0 ? `${hiddenCount} hidden at other branches.` : ''}</p>
          </div>
          <Link href="/compare" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#111111] text-white px-4 py-2 text-[12px] font-semibold hover:bg-black"><GitCompare className="h-3.5 w-3.5" /> Compare ({displayProducts.length} → up to 4)</Link>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayProducts.map((p: any) => {
            const img = Array.isArray(p.images) ? p.images[0] : p.images
            const inCompare = isCompared(p._id)
            return (
              <div key={p._id} className="rounded-[14px] border border-gray-100 bg-white overflow-hidden shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col">
                <Link href={`/product/${p._id}`} className="relative h-[160px] bg-[#F5F5F7] overflow-hidden">
                  <Image src={img || '/placeholder.jpg'} alt={p.productName} fill className="object-cover" />
                  {p.isFeatured && <span className="absolute top-2 left-2 rounded-full bg-[#111111] text-white px-2 py-1 text-[10px] font-bold">Featured</span>}
                </Link>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <Link href={`/product/${p._id}`} className="text-[13px] font-semibold text-[#1D1D1F] line-clamp-1 hover:text-[#0071E3]">{p.productName}</Link>
                  <p className="text-[12px] text-[#6E6E73] line-clamp-2">{p.description}</p>
                  <p className="text-[14px] font-bold text-[#1D1D1F]">₱{Number(p.price).toLocaleString()}</p>
                  <div className="mt-auto flex gap-2">
                    <Button size="sm" className="flex-1 bg-[#111111] hover:bg-black" onClick={() => handleAddToCart(p)}><ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add</Button>
                    <Button size="sm" variant={inCompare ? 'default' : 'outline'} className={inCompare ? 'bg-[#111111] text-white' : ''} onClick={() => { toggleCompare(p._id); toast.success(inCompare ? 'Removed from compare' : 'Added to compare') }}><GitCompare className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => toggle(p._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-[14px] border border-gray-100 bg-white p-4 text-center">
          <p className="text-[11px] text-[#86868b]">Wishlist syncs after login • Price-drop & back-in-stock notifications are simulated (check back or enable notifications in Account).</p>
          <Link href="/store" className="mt-3 inline-block text-[12px] font-semibold text-[#0071E3]">Continue shopping →</Link>
        </div>
      </div>
    </div>
  )
}
