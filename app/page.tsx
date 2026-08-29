'use client'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import ProductCard from '@/components/ui/product-card'
import { useAddToCartMutation, useGetStoreCartQuery } from '@/store/action/storeAction'
import { ArrowRight, Smartphone, ShieldCheck, Truck, BadgeCheck, Sparkles, Award } from 'lucide-react'
import { useSession } from 'next-auth/react'
import BannerSlider from '@/components/ui/banner-slider'
import { useEffect, useState } from 'react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Authentic Devices',
    description: 'Every iPhone, iPad, Mac, Watch & AirPods is certified authentic with verified serial & warranty.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Protection',
    description: 'Full warranty coverage and hassle-free claims — your Apple devices, fully protected.',
  },
  {
    icon: Truck,
    title: 'Flawless Delivery',
    description: 'Insured, tracked delivery nationwide — from our avenue to your door, fast and safe.',
  },
  {
    icon: Award,
    title: 'Premium Service',
    description: 'Expert curation, price-match promise and secure payments for a worry-free Apple experience.',
  },
]

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = (searchParams.get('search') || '').toLowerCase()
  // Apple Avenue single-merchant: fetch singleton products (no merchantId needed)
  const { data: productData, isLoading: isFetchingProducts } = useGetStoreProductQuery({})
  const { data: session } = useSession()
  const { data: cartData } = useGetStoreCartQuery({}, { skip: !session?.user })
  const [addToCart] = useAddToCartMutation()

  const products = useMemo(() => {
    const list = (productData?.product || []) as any[]
    if (query) {
      return list.filter((p: any) => p?.productName?.toLowerCase().includes(query) || p?.description?.toLowerCase().includes(query) || p?.category?.toLowerCase().includes(query))
    }
    // Featured Collection is driven by admin dashboard — ONLY flagged isFeatured products appear (strict)
    return list.filter((p: any) => p.isFeatured)
  }, [productData?.product, query])
  const featuredForBanner = useMemo(() => {
    const list = (productData?.product || []) as any[]
    return list.filter((p: any) => p.isFeatured).slice(0, 2)
  }, [productData?.product])
  const allProductsForFallback = useMemo(() => (productData?.product || []) as any[], [productData?.product])

  const [collections, setCollections] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((d) => setCollections((d.collections || []).filter((c: any) => c.products && c.products.length > 0)))
      .catch(() => {})
  }, [])

  return (
    <div className="w-full bg-white">
      {/* HERO SECTION — Apple Avenue premium */}
      <section className="w-full bg-gradient-to-b from-[#F5F5F7] via-[#F5F5F7]/60 to-white border-b border-gray-100">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-6 py-10 lg:py-16">
            {/* Left content */}
            <div className="flex w-full lg:w-[52%] flex-col items-start gap-4 order-1">
              {/* Eyebrow */}
              <div className="inline-flex items-center rounded-full bg-[#111111] px-3.5 py-1.5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                  Premium Apple • Certified • Warranty-backed
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.05] tracking-tight">
                <span className="text-[#1D1D1F] block">Premium Apple.</span>
                <span className="text-[#1D1D1F] block">Perfected.</span>
              </h1>

              {/* Description */}
              <p className="max-w-[480px] text-[13.5px] leading-[1.75] text-[#6E6E73] font-normal">
                Welcome to <span className="font-semibold text-[#1D1D1F]">Apple Avenue</span> — a curated avenue for iPhone, iPad, Mac, Apple Watch, AirPods & accessories.
                Authentic devices, expert guidance, and flawless delivery. Your Apple experience, elevated.
              </p>

              {/* CTAs */}
              <div className="flex flex-row items-center gap-3 pt-1">
                <button
                  onClick={() => router.push('/store')}
                  className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-[9px] bg-[#111111] px-6 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-black transition-colors"
                >
                  Shop Apple <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/store')}
                  className="inline-flex h-[40px] items-center justify-center gap-1.5 rounded-[9px] border border-[#D2D2D7] bg-white px-5 text-[13px] font-semibold text-[#111111] hover:bg-[#F5F5F7] transition-colors"
                >
                  <Smartphone className="h-4 w-4" />
                  Explore Collection
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] font-medium text-[#424245]">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#0071E3]" /> Authentic Guarantee
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] font-medium text-[#424245]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0071E3]" /> Warranty Included
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] font-medium text-[#424245]">
                  <Sparkles className="h-3.5 w-3.5 text-[#0071E3]" /> Curated Selection
                </span>
              </div>

              {/* Stats */}
              <div className="flex w-full flex-row gap-6 sm:gap-10 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#F5F5F7]">
                    <Smartphone className="h-5 w-5 text-[#111111]" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[18px] font-extrabold text-[#1D1D1F]">500+</span>
                    <span className="text-[11px] font-medium text-[#86868b] whitespace-nowrap">Premium Devices</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#F5F5F7]">
                    <BadgeCheck className="h-5 w-5 text-[#111111]" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[18px] font-extrabold text-[#1D1D1F]">10K+</span>
                    <span className="text-[11px] font-medium text-[#86868b] whitespace-nowrap">Devices Sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-[#F5F5F7]">
                    <Award className="h-5 w-5 text-[#111111]" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[18px] font-extrabold text-[#1D1D1F]">20K+</span>
                    <span className="text-[11px] font-medium text-[#86868b] whitespace-nowrap">Happy Customers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right hero — premium Apple image (changed from illustrator) */}
            <div className="flex w-full lg:w-[48%] items-center justify-center lg:justify-end order-2">
              <div className="relative w-full max-w-[560px] aspect-[1.15/0.88] lg:aspect-[1.1/0.92] rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&auto=format&fit=crop"
                  alt="Apple Avenue hero — premium iPhone, MacBook, iPad and Watch"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-[#1D1D1F] shadow">Featured • iPhone 15 Pro • MacBook Air</span>
                  <span className="hidden sm:inline-flex rounded-full bg-[#111111] text-white px-3 py-1.5 text-[11px] font-bold">1-Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="w-full bg-white py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          {/* Section header */}
          <div className="flex flex-col items-center text-center gap-2 pb-8">
            <span className="text-[11px] font-bold tracking-[0.14em] text-[#0071E3] uppercase">Why Apple Avenue?</span>
            <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight text-[#1D1D1F]">Your Apple Experience, Perfected</h2>
            <div className="mt-1 h-[3px] w-10 rounded-full bg-[#111111]" />
            <p className="max-w-[520px] text-[12.5px] leading-[1.6] text-[#6E6E73] pt-1">
              We obsess over authenticity, presentation and care — so you get only the best Apple, with warranty and flawless delivery.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center rounded-[14px] border border-gray-100 bg-white p-6 lg:p-7 shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F5F5F7] mb-4">
                    <Icon className="h-6 w-6 text-[#111111]" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-2">{f.title}</h3>
                  <p className="text-[12.5px] leading-[1.6] text-[#6E6E73] max-w-[220px]">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION SECTION */}
      <section className="w-full bg-[#FCFCFC] border-t border-gray-50 py-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          {/* Header row */}
          <div className="flex items-center justify-between gap-4 pb-5">
            <h2 className="text-[18px] lg:text-[20px] font-bold tracking-tight text-[#1D1D1F]">
              {query ? `Search results for "${query}"` : 'Featured Collection'}
            </h2>
            <button
              onClick={() => router.push('/store')}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0071E3] hover:text-[#0077ED] transition-colors"
            >
              View All Devices <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Image Slider — admin editable via Dashboard → Banners */}
          <BannerSlider
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                {featuredForBanner.length >= 2 ? (
                  featuredForBanner.map((p: any, i: number) => {
                    const img = Array.isArray(p.images) ? p.images[0] : p.images
                    const isDark = i === 0
                    return (
                      <div
                        key={p._id}
                        onClick={() => router.push(`/product/${p._id}`)}
                        className={`group relative overflow-hidden rounded-[14px] h-[200px] lg:h-[210px] cursor-pointer flex items-center p-6 border shadow-[0_4px_18px_rgba(0,0,0,0.08)] ${isDark ? 'bg-gradient-to-br from-[#1D1D1F] via-[#2C2C2E] to-black border-gray-900' : 'bg-[#F5F5F7] border-gray-100'}`}
                      >
                        <div className="relative z-10 flex flex-col gap-2 max-w-[55%]">
                          <span className={`text-[10px] font-bold tracking-[0.12em] uppercase ${isDark ? 'text-[#86868b]' : 'text-[#0071E3]'}`}>{p.category} • Featured</span>
                          <h3 className={`text-[20px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{p.productName}</h3>
                          <p className={`text-[12px] line-clamp-2 ${isDark ? 'text-[#A1A1A6]' : 'text-[#6E6E73]'}`}>{p.description}</p>
                          <span className={`inline-flex mt-1 text-[12px] font-semibold ${isDark ? 'text-[#2997FF]' : 'text-[#0071E3]'}`}>Shop Now →</span>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-[45%] opacity-40">
                          <Image src={img || '/placeholder.jpg'} alt={p.productName} fill className="object-cover object-center group-hover:scale-[1.02] transition" sizes="50vw" />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <>
                    <div className="group relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#1D1D1F] via-[#2C2C2E] to-black border border-gray-900 shadow-[0_4px_18px_rgba(0,0,0,0.08)] h-[200px] lg:h-[210px] cursor-pointer flex items-center p-6">
                      <div className="relative z-10 flex flex-col gap-2">
                        <span className="text-[10px] font-bold tracking-[0.12em] text-[#86868b] uppercase">New Arrival</span>
                        <h3 className="text-[20px] font-bold tracking-tight text-white leading-none">iPhone 15 Pro</h3>
                        <p className="text-[12px] text-[#A1A1A6]">Titanium. So strong. So light. So Pro.</p>
                        <span className="inline-flex mt-1 text-[12px] font-semibold text-[#2997FF]">Shop Now →</span>
                      </div>
                      <div className="absolute right-0 top-0 h-full w-[55%] opacity-30">
                        <Image src="/Black Friday blowout!.png" alt="iPhone 15 Pro — Apple Avenue featured" fill className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300 opacity-40 mix-blend-luminosity" sizes="(max-width: 1024px) 100vw, 50vw" />
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-[14px] bg-[#F5F5F7] border border-gray-100 shadow-[0_4px_18px_rgba(15,23,42,0.05)] h-[200px] lg:h-[210px] cursor-pointer flex items-center p-6">
                      <div className="relative z-10 flex flex-col gap-2">
                        <span className="text-[10px] font-bold tracking-[0.12em] text-[#0071E3] uppercase">MacBook Air</span>
                        <h3 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] leading-none">Supercharged by M3</h3>
                        <p className="text-[12px] text-[#6E6E73]">Strikingly thin. Impressively light.</p>
                        <span className="inline-flex mt-1 text-[12px] font-semibold text-[#0071E3]">Discover →</span>
                      </div>
                      <div className="absolute right-0 top-0 h-full w-[55%] opacity-20">
                        <Image src="/Black Friday blowout! (1).png" alt="MacBook Air M3 — Apple Avenue featured" fill className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300" sizes="(max-width: 1024px) 100vw, 50vw" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            }
          />
          {featuredForBanner.length === 0 && !isFetchingProducts && allProductsForFallback.length > 0 && (
            <p className="mt-3 text-[11px] text-[#86868b]">No featured collection yet — admin: mark products as <span className="font-semibold">Featured</span> in Dashboard → Featured to show custom landing collection; add slider images in Dashboard → Banners.</p>
          )}

          {/* Featured Products — single-merchant Apple Avenue */}
          {isFetchingProducts ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 pt-6">
              {Array(8).fill({}).map((_, i) => (
                <ProductCard key={i} isLoading value={0} _id="" productName="" images="" price={0} status="Posted" onButtonAddClick={() => {}} onButtonMinusClick={() => {}} />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 pt-6">
              {products.slice(0, 8).map((item: any) => {
                const cartVal = (cartData?.cart || []).find((c: any) => c._id === item._id)?.value || 0
                return (
                  <ProductCard
                    key={item._id}
                    _id={item._id}
                    productName={item.productName}
                    description={item.description}
                    images={item.images?.[0] || item.images}
                    price={item.price}
                    status={item.status}
                    value={cartVal}
                    isLoading={false}
                    onButtonAddClick={() => addToCart({ merchant: '', item: [{ _id: item._id, value: cartVal + 1 }] })}
                    onButtonMinusClick={() => addToCart({ merchant: '', item: [{ _id: item._id, value: cartVal - 1 }] })}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-[14px] border border-gray-100 bg-white p-10 text-center">
              <p className="text-[13px] text-[#6E6E73]">{query ? `No devices found for "${query}"` : 'No Featured Collection yet — admin has not marked any products as Featured.'}</p>
              <p className="text-[12px] text-[#86868b] pt-1">{query ? 'Try searching for iPhone, Mac or iPad' : 'Admin: Dashboard → Featured to create custom landing collection; Dashboard → Products → Edit → tick Featured. All Featured/Deals are admin-driven.'}</p>
              <button onClick={() => router.push('/store')} className="mt-3 text-[13px] font-semibold text-[#0071E3] hover:text-[#0077ED]">Browse all devices →</button>
            </div>
          )}
        </div>
      </section>

      {/* COLLECTIONS — admin-created, products added via Dashboard → Collections → Manage products */}
      {!query && collections.length > 0 && (
        <section className="w-full bg-white border-t border-gray-50 py-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1200px] px-6">
            <div className="flex items-center justify-between gap-4 pb-5">
              <div>
                <h2 className="text-[18px] lg:text-[20px] font-bold tracking-tight text-[#1D1D1F]">Collections — Curated by Apple Avenue</h2>
                <p className="text-[12.5px] text-[#6E6E73]">Create collections and add products in Dashboard → Collections. They appear here automatically.</p>
              </div>
              <button onClick={() => router.push('/store')} className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-[#0071E3] hover:text-[#0077ED]">Shop All <ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-col gap-8">
              {collections.map((col: any) => (
                <div key={col._id} className="rounded-[14px] border border-gray-100 bg-[#FCFCFC] p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 items-center">
                      {col.image ? <div className="h-12 w-12 rounded-[8px] overflow-hidden bg-white border border-gray-100 relative shrink-0"><Image src={col.image} alt={col.name} fill className="object-cover" /></div> : <div className="h-12 w-12 rounded-[8px] bg-[#111111] flex items-center justify-center shrink-0"><span className="text-white font-bold text-[11px]">{col.name.slice(0,2).toUpperCase()}</span></div>}
                      <div>
                        <h3 className="text-[14px] font-semibold text-[#1D1D1F]">{col.name}</h3>
                        <p className="text-[12px] text-[#6E6E73] max-w-[500px] line-clamp-1">{col.description || 'Curated collection'}</p>
                        <p className="text-[11px] text-[#86868b]">{col.products.length} products</p>
                      </div>
                    </div>
                    <button onClick={() => router.push('/store')} className="hidden sm:inline-flex text-[12px] font-semibold text-[#0071E3] hover:text-[#0077ED]">View all →</button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {col.products.slice(0, 4).map((item: any) => {
                      const cartVal = (cartData?.cart || []).find((c: any) => c._id === item._id)?.value || 0
                      return (
                        <ProductCard
                          key={item._id}
                          _id={item._id}
                          productName={item.productName}
                          description={item.description}
                          images={Array.isArray(item.images) ? item.images[0] : item.images}
                          price={item.price}
                          status={item.status}
                          value={cartVal}
                          isLoading={false}
                          onButtonAddClick={() => addToCart({ merchant: '', item: [{ _id: item._id, value: cartVal + 1 }] })}
                          onButtonMinusClick={() => addToCart({ merchant: '', item: [{ _id: item._id, value: cartVal - 1 }] })}
                        />
                      )
                    })}
                  </div>
                  {col.products.length > 4 && <p className="mt-3 text-[11px] text-[#86868b] text-center">+ {col.products.length - 4} more in this collection — view in Store</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
