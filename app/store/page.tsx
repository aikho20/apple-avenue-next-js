'use client'

import ProductCard from '@/components/ui/product-card'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import {
  useAddToCartMutation,
  useGetStoreCartQuery,
  useGetStoreProductQuery,
} from '@/store/action/storeAction'
import CartItem from '@/components/ui/cart-item'
import { Button } from '@/components/ui/button'
import { ChevronUp, FileIcon, ShoppingCart } from 'lucide-react'
import { CartItemProps, ProductCardProps, ProductCartProps, StoreProps } from '@/types/type'
import { DRAFT, OUT_OF_STOCK, POSTED } from '@/utils/data'
import { Skeleton } from '@/components/ui/skeleton'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useToggle } from '@/hooks/useToggle'
import { Separator } from '@/components/ui/separator'
import { useSession } from 'next-auth/react'
import { useBranch } from '@/hooks/useBranch'
import { BranchSelector, CurrentBranchBanner } from '@/components/branch/branch-selector'

export default function Store({ searchParams: { storeId } }: StoreProps) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const query = (searchParamsHook.get('search') || '').toLowerCase()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [value, toggle, setValue] = useToggle()
  const [addToCart] = useAddToCartMutation()
  // Apple Avenue is single-merchant — storeId is legacy; fallback to singleton via API when undefined
  const resolvedStoreId = storeId ?? undefined
  const { currentId: branchId, currentBranch } = useBranch()
  const { data: session } = useSession()
  const { data: cartItems, isLoading: isFetchingCart } = useGetStoreCartQuery(
    branchId ? { branchId } : resolvedStoreId ? { merchantId: resolvedStoreId } : {},
    { skip: !session?.user }
  )
  const { data: productData, isLoading: isFetchingProduct } = useGetStoreProductQuery(
    branchId ? { branchId } : resolvedStoreId ? { merchantId: resolvedStoreId } : {}
  )

  const userCart = useMemo(
    () =>
      isFetchingProduct
        ? { total: 0, cart: Array(cartItems?.cart?.length || 3).fill({}) }
        : cartItems,
    [isFetchingProduct, cartItems?.cart, cartItems]
  )

  const product = useMemo(
    () => (isFetchingProduct ? Array(5).fill({ status: POSTED }) : productData?.product),
    [isFetchingProduct, productData?.product]
  )

  const filteredProducts = useMemo(() => {
    if (!product) return []
    let list = product.filter((datum: ProductCardProps) => datum?.status === POSTED)
    if (activeCategory) {
      list = list.filter((p: ProductCardProps) => p.category?.toLowerCase() === activeCategory.toLowerCase())
    }
    if (query) {
      list = list.filter(
        (p: ProductCardProps) =>
          p.productName?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
      )
    }
    return list
  }, [product, activeCategory, query])

  const handleAddClick = useCallback(
    async (cartItem: CartItemProps) => {
      const branchMerchant = (currentBranch as any)?.manager?.toString() || (currentBranch as any)?.manager || ''
      await addToCart({
        merchant: branchMerchant || (resolvedStoreId as string) || '',
        item: [cartItem],
      })
    },
    [addToCart, resolvedStoreId, currentBranch]
  )

  const cartLayout = () => (
    <div className="w-full">
      <div className="w-full">
        {userCart?.cart?.length ? (
          userCart?.cart?.map((item: ProductCartProps, index: number) => (
            <div className="px-2 py-1" key={index}>
              <CartItem
                title={item?.productName || ''}
                price={item?.price || 0}
                _id={item?._id || ''}
                isLoading={isFetchingCart}
                status={item?.status || ''}
                image={item?.images?.[0] || ''}
                value={item?.value || 0}
                onButtonAddClick={() => {
                  let v = userCart?.cart?.find((list: any) => list?._id === item?._id)?.value || 0
                  handleAddClick({ ...item, value: v + 1 })
                }}
                onButtonMinusClick={() => {
                  let v = userCart?.cart?.find((list: any) => list?._id === item?._id)?.value || 0
                  handleAddClick({ ...item, value: v - 1 })
                }}
              />
              <Separator className="my-2 bg-gray-50" />
            </div>
          ))
        ) : (
          <div className="flex flex-col h-[40vh] items-center justify-center py-10 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
              <ShoppingCart className="h-5 w-5 text-[#111111]" />
            </div>
            <p className="text-[13px] text-[#6B7280]">No items in your cart.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 border-t border-gray-50 mt-2">
        <div className="flex flex-row justify-between items-center">
          {isFetchingCart || !userCart?.total ? (
            <>
              <Skeleton className="h-5 w-[60px]" />
              <Skeleton className="h-5 w-[80px]" />
            </>
          ) : (
            <>
              <span className="text-[13px] font-semibold text-[#6B7280]">Total</span>
              <span className="text-[16px] font-bold text-[#1F2937]">₱{userCart?.total}</span>
            </>
          )}
        </div>
        <Button
          className="w-full"
          disabled={
            !userCart?.cart?.length ||
            isFetchingCart ||
            userCart?.cart?.filter(
              (items: ProductCartProps) => items.status == OUT_OF_STOCK || items.status === DRAFT
            )?.length > 0
          }
          onClick={() => router.push(`/store/checkout?id=${userCart.cartId}`)}
        >
          Check Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <CurrentBranchBanner />
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-6">
          {/* Main — Single merchant Apple Avenue, no store profile/banner needed per spec */}
          <div className="lg:col-span-5 col-span-1 flex flex-col gap-4 sm:gap-5 min-w-0">
            <div className="rounded-[14px] border border-gray-100 bg-white px-5 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-[18px] font-bold tracking-tight text-[#1D1D1F]">Apple Avenue — All Devices</h1>
                  <p className="text-[12.5px] text-[#6E6E73]">{currentBranch ? `${currentBranch.name} • ${currentBranch.address}` : 'Select branch to see accurate stock • Authentic, warranty-backed'}</p>
                </div>
                <BranchSelector />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
              {/* Filters */}
              <div className="col-span-2 hidden xl:block">
                <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden sticky top-[80px]">
                  <div className="flex justify-center py-3 border-b border-gray-50">
                    <span className="text-[13px] font-semibold text-[#1F2937]">Filters</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <button
                      onClick={() => setActiveCategory(null)}
                      className={`text-left text-[13px] rounded-[8px] px-2.5 py-1.5 transition-colors ${!activeCategory ? 'bg-[#F5F5F7] text-[#111111] font-medium' : 'text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F7]'}`}
                    >
                      All
                    </button>
                    {['iPhone', 'iPad', 'Mac', 'Watch', 'AirPods', 'Accessories'].map((items, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveCategory(activeCategory === items ? null : items)}
                        className={`text-left text-[13px] rounded-[8px] px-2.5 py-1.5 transition-colors ${activeCategory === items ? 'bg-[#F5F5F7] text-[#111111] font-medium' : 'text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F7]'}`}
                      >
                        {items}
                      </button>
                    ))}
                    {query && (
                      <span className="text-[11px] text-[#9CA3AF] px-2.5 pt-2">Search: &quot;{query}&quot;</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="col-span-12 xl:col-span-10">
                {filteredProducts?.length > 0 ? (
                  <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-4 lg:gap-5">
                    {filteredProducts.map((item: ProductCardProps, index: number) => (
                      <div key={index} className="w-full h-full">
                        <ProductCard
                          _id={item._id}
                          productName={item?.productName}
                          value={userCart?.cart?.find((list: any) => list._id === item._id)?.value || 0}
                          isLoading={isFetchingProduct}
                          description={item?.description}
                          images={item?.images?.[0]}
                          price={item?.price}
                          onButtonAddClick={() => {
                            let v = userCart?.cart?.find((list: any) => list._id === item._id)?.value || 0
                            handleAddClick({ ...item, value: v + 1 })
                          }}
                          onButtonMinusClick={() => {
                            let v = userCart?.cart?.find((list: any) => list._id === item._id)?.value || 0
                            handleAddClick({ ...item, value: v - 1 })
                          }}
                          status={item.status}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center min-h-[30vh] w-full rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] p-10 gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
                      <FileIcon className="h-5 w-5 text-[#111111]" />
                    </div>
                    <p className="text-[13px] text-[#6B7280]">
                      {query ? `No items found for "${query}"` : activeCategory ? `No ${activeCategory} found` : 'No items found...'}
                    </p>
                    {(query || activeCategory) && (
                      <button
                        onClick={() => {
                          setActiveCategory(null)
                          router.push(`/store`)
                        }}
                        className="text-[13px] font-medium text-[#111111] hover:text-[#000000]"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop cart */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden sticky top-[80px]">
              <div className="flex justify-center py-3 border-b border-gray-50">
                <span className="text-[13px] font-semibold text-[#1F2937]">Your Cart</span>
              </div>
              {cartLayout()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile cart bottom */}
      <div className="fixed bottom-0 w-full bg-white z-40 rounded-t-[14px] border-t border-gray-100 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] md:hidden">
        <div className="flex flex-col items-center p-3 gap-2 max-w-[1200px] mx-auto">
          <button
            onClick={() => toggle()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm -mt-6"
          >
            <ChevronUp className="h-4 w-4 text-[#111111]" />
          </button>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              {isFetchingCart ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 text-[#374151]" />
                  <span className="text-[13px] font-semibold text-[#1F2937]">
                    {userCart?.cart?.length || 0}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isFetchingCart ? (
                <>
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </>
              ) : (
                <>
                  <span className="text-[13px] font-medium text-[#6B7280]">Total:</span>
                  <span className="text-[15px] font-bold text-[#1F2937]">₱{userCart?.total || 0}</span>
                </>
              )}
            </div>
          </div>
          <Button
            className="w-full"
            disabled={
              !userCart?.cart?.length ||
              isFetchingCart ||
              userCart?.cart?.filter(
                (items: ProductCartProps) => items.status == OUT_OF_STOCK || items.status === DRAFT
              )?.length > 0
            }
            onClick={() => router.push(`/store/checkout?id=${userCart.cartId}`)}
          >
            Check Out
          </Button>
        </div>
      </div>

      <Drawer open={value} onOpenChange={setValue}>
        <DrawerContent className="rounded-t-[14px] max-h-[85vh]">
          <div className="mx-auto w-full flex flex-col">
            <div className="py-3 text-center border-b border-gray-50">
              <span className="text-[14px] font-semibold text-[#1F2937]">Your Cart</span>
            </div>
            <div className="overflow-auto max-h-[65vh]">{cartLayout()}</div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
