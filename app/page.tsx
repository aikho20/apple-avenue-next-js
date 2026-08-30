'use client'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import ProductCard from '@/components/ui/product-card'
import { useAddToCartMutation, useGetStoreCartQuery } from '@/store/action/storeAction'
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Truck,
  BadgeCheck,
  Sparkles,
  Award,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import BannerSlider from '@/components/ui/banner-slider'
import { useEffect, useState } from 'react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Authentic Devices',
    description:
      'Every iPhone, iPad, Mac, Watch & AirPods is certified authentic with verified serial & warranty.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Protection',
    description:
      'Full warranty coverage and hassle-free claims — your Apple devices, fully protected.',
  },
  {
    icon: Truck,
    title: 'Flawless Delivery',
    description:
      'Insured, tracked delivery nationwide — from our avenue to your door, fast and safe.',
  },
  {
    icon: Award,
    title: 'Premium Service',
    description:
      'Expert curation, price-match promise and secure payments for a worry-free Apple experience.',
  },
]

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = (searchParams.get('search') || '').toLowerCase()
  const { data: productData, isLoading: isFetchingProducts } = useGetStoreProductQuery({})
  const { data: session } = useSession()
  const { data: cartData } = useGetStoreCartQuery({}, { skip: !session?.user })
  const [addToCart] = useAddToCartMutation()

  const products = useMemo(() => {
    const list = (productData?.product || []) as any[]
    if (query) {
      return list.filter(
        (p: any) =>
          p?.productName?.toLowerCase().includes(query) ||
          p?.description?.toLowerCase().includes(query) ||
          p?.category?.toLowerCase().includes(query),
      )
    }
    return list.filter((p: any) => p.isFeatured)
  }, [productData?.product, query])
  const featuredForBanner = useMemo(() => {
    const list = (productData?.product || []) as any[]
    return list.filter((p: any) => p.isFeatured).slice(0, 2)
  }, [productData?.product])
  const allProductsForFallback = useMemo(
    () => (productData?.product || []) as any[],
    [productData?.product],
  )

  const [collections, setCollections] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((d) =>
        setCollections(
          (d.collections || []).filter((c: any) => c.products && c.products.length > 0),
        ),
      )
      .catch(() => {})
  }, [])

  return (
    <div className='w-full bg-white'>
      {/* HERO — Apple Avenue Premium Editorial */}
      <section className='relative w-full overflow-hidden bg-[#FBFBFD] border-b border-gray-100'>
        {/* Premium mesh gradients */}
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute -top-[180px] -left-[120px] h-[520px] w-[720px] rounded-full bg-gradient-to-br from-[#FF6A00]/10 via-[#FF8533]/8 to-transparent blur-[60px]' />
          <div className='absolute -bottom-[200px] -right-[120px] h-[560px] w-[560px] rounded-full bg-gradient-to-tl from-[#111111]/[0.06] via-[#86868b]/[0.06] to-transparent blur-[50px]' />
          <div
            className='absolute inset-0 opacity-[0.035]'
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #111111 1px, transparent 0)`,
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* Top announcement — premium hairline */}
        <div className='relative w-full bg-[#111111] text-white'>
          <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
          <div className='mx-auto max-w-[1280px] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]'>
            <span className='flex items-center gap-2 font-medium tracking-wide'>
              <span className='hidden sm:inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10'>
                <Truck className='h-3 w-3' />
              </span>{' '}
              Free insured delivery nationwide{' '}
              <span className='hidden sm:inline text-white/40'>•</span>{' '}
              <span className='text-white/80'>Order by 3PM, ship today</span>
            </span>
            <span className='hidden sm:flex items-center gap-3 text-white/70'>
              <span className='flex items-center gap-1.5'>
                <ShieldCheck className='h-3.5 w-3.5 text-white' />{' '}
                <span className='text-white font-medium'>1-Year Apple Warranty</span>
              </span>
              <span className='h-3 w-px bg-white/15' />
              <span>Authentic • Certified • 7-day returns</span>
            </span>
          </div>
        </div>

        <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6'>
          <div className='flex flex-col lg:flex-row gap-8 lg:gap-10 py-8 lg:py-12'>
            {/* Left — editorial */}
            <div className='flex w-full lg:w-[54%] flex-col gap-5 order-1'>
              <div className='inline-flex w-fit items-center gap-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500' />
                </span>
                <span className='text-[10px] font-bold tracking-[0.14em] text-[#1D1D1F] uppercase'>
                  In Stock • Ready to Ship • Official Store
                </span>
                <span className='hidden sm:inline-flex ml-1 rounded-full bg-[#111111] text-white px-2 py-0.5 text-[9px] font-bold tracking-wide'>
                  APPLE AVENUE
                </span>
              </div>

              <div className='space-y-3'>
                <h1 className='text-[36px] sm:text-[48px] lg:text-[56px] font-black leading-[0.88] tracking-[-0.04em]'>
                  <span className='text-[#1D1D1F] block font-extrabold'>Premium</span>
                  <span className='text-[#1D1D1F] block font-extrabold'>Apple.</span>
                  <span className='bg-gradient-to-r from-[#FF6A00] via-[#FF8533] to-[#111111] bg-clip-text text-transparent block'>
                    Perfected.
                  </span>
                </h1>
                <div className='flex items-center gap-3'>
                  <div className='h-px w-12 bg-gradient-to-r from-[#FF6A00] to-transparent' />
                  <span className='text-[10px] font-bold tracking-[0.2em] text-[#86868b] uppercase'>
                    Curated • Certified • Coveted
                  </span>
                </div>
              </div>

              <p className='max-w-[520px] text-[14px] sm:text-[14.5px] leading-[1.8] text-[#424245] font-light'>
                Welcome to <span className='font-semibold text-[#1D1D1F]'>Apple Avenue</span> — the
                editorial avenue for iPhone, iPad, Mac, Watch & AirPods. Every device is{' '}
                <span className='font-medium text-[#1D1D1F] underline decoration-[#FF6A00]/20 underline-offset-4'>
                  authentic, sealed, and warranty-backed
                </span>{' '}
                with white-glove guidance and insured unboxing.
              </p>

              {/* Premium search */}
              <div className='w-full max-w-[520px] relative group'>
                <div className='mt-3 flex flex-wrap items-center gap-2 text-[11px]'>
                  <span className='text-[#86868b] font-medium'>Popular:</span>
                  {['iPhone 15 Pro', 'MacBook Air M3', 'iPad Pro', 'Watch Ultra'].map((s) => (
                    <button
                      key={s}
                      onClick={() => router.push(`/store?search=${encodeURIComponent(s)}`)}
                      className='rounded-full bg-white border border-gray-200/70 px-3.5 py-1.5 text-[11px] font-medium text-[#424245] shadow-sm hover:bg-[#111111] hover:text-white hover:border-[#111111] hover:shadow-md transition-all'
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                <button
                  onClick={() => router.push('/store')}
                  className='group inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-8 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:bg-black hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all'
                >
                  Shop Apple{' '}
                  <ArrowRight className='h-4 w-4 group-hover:translate-x-0.5 transition-transform' />
                </button>
                <button
                  onClick={() => router.push('/phone-finder')}
                  className='inline-flex h-[46px] items-center justify-center gap-2 rounded-[14px] bg-white/70 backdrop-blur border border-[#E8E8ED] px-7 text-[13px] font-semibold text-[#111111] hover:bg-white hover:border-[#D2D2D7] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all'
                >
                  Find my device <Sparkles className='h-3.5 w-3.5 text-[#FF6A00]' />
                </button>
                <span className='hidden lg:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6E6E73]'>
                  <span className='h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center'>
                    <ShieldCheck className='h-3 w-3 text-emerald-600' />
                  </span>{' '}
                  Price match promise
                </span>
              </div>
            </div>

            {/* Right — premium visual */}
            <div className='flex w-full lg:w-[46%] flex-col gap-3 order-2'>
              <div className='rounded-[28px] p-[1.5px] bg-gradient-to-b from-white via-gray-200 to-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]'>
                <div className='relative w-full aspect-[1.15/0.92] lg:aspect-[1.08/0.9] rounded-[26px] overflow-hidden bg-white'>
                  <Image
                    src='https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&auto=format&fit=crop'
                    alt='Apple Avenue hero — premium iPhone, MacBook, iPad and Watch'
                    fill
                    priority
                    className='object-cover object-center'
                    sizes='(max-width: 1024px) 100vw, 560px'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-black/[0.06] to-transparent' />
                  <div className='absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none' />
                  <div className='absolute top-4 left-4 flex gap-2'>
                    <span className='rounded-full bg-white/90 backdrop-blur-xl border border-white/50 px-3.5 py-2 text-[11px] font-bold text-[#1D1D1F] shadow-[0_4px_16px_rgba(0,0,0,0.12)]'>
                      New • iPhone 15 Pro Titanium
                    </span>
                    <span className='hidden sm:inline-flex rounded-full bg-[#FF6A00] text-white px-3.5 py-2 text-[11px] font-bold shadow-[0_4px_16px_rgba(255,106,0,0.35)] ring-1 ring-white/20'>
                      —12% Today
                    </span>
                  </div>
                  <div className='absolute bottom-4 left-4 right-4 flex items-center justify-between'>
                    <span className='rounded-full bg-white/90 backdrop-blur-xl border border-white/50 px-3.5 py-2 text-[11px] font-semibold text-[#1D1D1F] shadow-[0_4px_16px_rgba(0,0,0,0.12)]'>
                      Featured • 5 devices
                    </span>
                    <span className='rounded-full bg-[#111111] text-white px-3.5 py-2 text-[11px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.25)]'>
                      1-Year Warranty
                    </span>
                  </div>
                  {/* Premium floating cards */}
                  <div className='hidden lg:flex absolute -left-5 top-[22%] rounded-[16px] bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_12px_32px_rgba(0,0,0,0.14)] p-3 items-center gap-3 hover:-translate-y-1 transition-transform'>
                    <div className='h-11 w-11 rounded-[10px] bg-gradient-to-br from-[#F5F5F7] to-white border border-gray-100 relative overflow-hidden shadow-inner'>
                      <Image
                        src='https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-unselect-gallery-1-202309?wid=400&hei=400&fmt=jpeg'
                        alt='iPhone'
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='pr-1'>
                      <p className='text-[11px] font-bold leading-none tracking-tight'>iPhone 15</p>
                      <p className='text-[11px] font-black text-[#FF6A00]'>₱59,990</p>
                      <p className='text-[10px] font-medium text-emerald-600 flex items-center gap-1'>
                        <span className='h-1 w-1 rounded-full bg-emerald-500' /> In stock • Free
                        ship
                      </p>
                    </div>
                  </div>
                  <div className='hidden lg:flex absolute -right-4 bottom-[18%] rounded-[16px] bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_12px_32px_rgba(0,0,0,0.14)] p-3 items-center gap-3 hover:-translate-y-1 transition-transform'>
                    <div className='h-11 w-11 rounded-[10px] bg-gradient-to-br from-[#F5F5F7] to-white border border-gray-100 relative overflow-hidden shadow-inner'>
                      <Image
                        src='https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop'
                        alt='Watch'
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='pr-1'>
                      <p className='text-[11px] font-bold leading-none tracking-tight'>Watch S9</p>
                      <p className='text-[11px] font-black text-[#FF6A00]'>₱25,990</p>
                      <p className='text-[10px] font-semibold text-emerald-600'>✓ Warranty</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-2.5'>
                {[
                  { l: 'Free Delivery', s: 'Today, insured', icon: Truck },
                  { l: 'Warranty', s: '1 Year Apple', icon: ShieldCheck },
                  { l: 'Authentic', s: 'Sealed box', icon: BadgeCheck },
                ].map((x) => {
                  const Icon = x.icon
                  return (
                    <div
                      key={x.l}
                      className='rounded-[16px] bg-white border border-gray-100 p-3 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all'
                    >
                      <div className='h-9 w-9 rounded-[10px] bg-[#111111] flex items-center justify-center shrink-0 shadow-sm'>
                        <Icon className='h-4 w-4 text-white' />
                      </div>
                      <div className='leading-none'>
                        <div className='text-[11px] font-bold tracking-tight'>{x.l}</div>
                        <div className='text-[10px] font-medium text-[#86868b]'>{x.s}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className='w-full bg-white py-10 lg:py-14'>
        <div className='mx-auto w-full max-w-[1280px] px-4 sm:px-6'>
          {/* Section header */}
          <div className='flex flex-col items-center text-center gap-2 pb-8'>
            <span className='text-[11px] font-bold tracking-[0.14em] text-[#FF6A00] uppercase'>
              Why Apple Avenue?
            </span>
            <h2 className='text-[22px] lg:text-[26px] font-bold tracking-tight text-[#1D1D1F]'>
              Your Apple Experience, Perfected
            </h2>
            <div className='mt-1 h-[3px] w-10 rounded-full bg-[#111111]' />
            <p className='max-w-[520px] text-[12.5px] leading-[1.6] text-[#6E6E73] pt-1'>
              We obsess over authenticity, presentation and care — so you get only the best Apple,
              with warranty and flawless delivery.
            </p>
          </div>

          {/* Feature cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5'>
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className='flex flex-col items-center text-center rounded-[14px] border border-gray-100 bg-white p-6 lg:p-7 shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-200'
                >
                  <div className='flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F5F5F7] mb-4'>
                    <Icon className='h-6 w-6 text-[#111111]' />
                  </div>
                  <h3 className='text-[14px] font-semibold text-[#1D1D1F] mb-2'>{f.title}</h3>
                  <p className='text-[12.5px] leading-[1.6] text-[#6E6E73] max-w-[220px]'>
                    {f.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION SECTION */}
      <section className='w-full bg-[#FCFCFC] border-t border-gray-50 py-8 lg:py-10'>
        <div className='mx-auto w-full max-w-[1280px] px-4 sm:px-6'>
          {/* Header row */}
          <div className='flex items-center justify-between gap-4 pb-5'>
            <h2 className='text-[18px] lg:text-[20px] font-bold tracking-tight text-[#1D1D1F]'>
              {query ? `Search results for "${query}"` : 'Featured Collection'}
            </h2>
            <button
              onClick={() => router.push('/store')}
              className='inline-flex items-center gap-1 text-[13px] font-semibold text-[#FF6A00] hover:text-[#FF8533] transition-colors'
            >
              View All Devices <ArrowRight className='h-4 w-4' />
            </button>
          </div>

          {/* Image Slider — admin editable via Dashboard → Banners */}
          <BannerSlider
            fallback={
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5'>
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
                        <div className='relative z-10 flex flex-col gap-2 max-w-[55%]'>
                          <span
                            className={`text-[10px] font-bold tracking-[0.12em] uppercase ${isDark ? 'text-[#86868b]' : 'text-[#FF6A00]'}`}
                          >
                            {p.category} • Featured
                          </span>
                          <h3
                            className={`text-[20px] font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}
                          >
                            {p.productName}
                          </h3>
                          <p
                            className={`text-[12px] line-clamp-2 ${isDark ? 'text-[#A1A1A6]' : 'text-[#6E6E73]'}`}
                          >
                            {p.description}
                          </p>
                          <span
                            className={`inline-flex mt-1 text-[12px] font-semibold ${isDark ? 'text-[#FF6A00]' : 'text-[#FF6A00]'}`}
                          >
                            Shop Now →
                          </span>
                        </div>
                        <div className='absolute right-0 top-0 h-full w-[45%] opacity-40'>
                          <Image
                            src={img || '/placeholder.jpg'}
                            alt={p.productName}
                            fill
                            className='object-cover object-center group-hover:scale-[1.02] transition'
                            sizes='50vw'
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <>
                    <div className='group relative overflow-hidden rounded-[14px] bg-gradient-to-br from-[#1D1D1F] via-[#2C2C2E] to-black border border-gray-900 shadow-[0_4px_18px_rgba(0,0,0,0.08)] h-[200px] lg:h-[210px] cursor-pointer flex items-center p-6'>
                      <div className='relative z-10 flex flex-col gap-2'>
                        <span className='text-[10px] font-bold tracking-[0.12em] text-[#86868b] uppercase'>
                          New Arrival
                        </span>
                        <h3 className='text-[20px] font-bold tracking-tight text-white leading-none'>
                          iPhone 15 Pro
                        </h3>
                        <p className='text-[12px] text-[#A1A1A6]'>
                          Titanium. So strong. So light. So Pro.
                        </p>
                        <span className='inline-flex mt-1 text-[12px] font-semibold text-[#FF6A00]'>
                          Shop Now →
                        </span>
                      </div>
                      <div className='absolute right-0 top-0 h-full w-[55%] opacity-30'>
                        <Image
                          src='/Black Friday blowout!.png'
                          alt='iPhone 15 Pro — Apple Avenue featured'
                          fill
                          className='object-cover object-center group-hover:scale-[1.02] transition-transform duration-300 opacity-40 mix-blend-luminosity'
                          sizes='(max-width: 1024px) 100vw, 50vw'
                        />
                      </div>
                    </div>
                    <div className='group relative overflow-hidden rounded-[14px] bg-[#F5F5F7] border border-gray-100 shadow-[0_4px_18px_rgba(15,23,42,0.05)] h-[200px] lg:h-[210px] cursor-pointer flex items-center p-6'>
                      <div className='relative z-10 flex flex-col gap-2'>
                        <span className='text-[10px] font-bold tracking-[0.12em] text-[#FF6A00] uppercase'>
                          MacBook Air
                        </span>
                        <h3 className='text-[20px] font-bold tracking-tight text-[#1D1D1F] leading-none'>
                          Supercharged by M3
                        </h3>
                        <p className='text-[12px] text-[#6E6E73]'>
                          Strikingly thin. Impressively light.
                        </p>
                        <span className='inline-flex mt-1 text-[12px] font-semibold text-[#FF6A00]'>
                          Discover →
                        </span>
                      </div>
                      <div className='absolute right-0 top-0 h-full w-[55%] opacity-20'>
                        <Image
                          src='/Black Friday blowout! (1).png'
                          alt='MacBook Air M3 — Apple Avenue featured'
                          fill
                          className='object-cover object-center group-hover:scale-[1.02] transition-transform duration-300'
                          sizes='(max-width: 1024px) 100vw, 50vw'
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            }
          />
          {featuredForBanner.length === 0 &&
            !isFetchingProducts &&
            allProductsForFallback.length > 0 && (
              <p className='mt-3 text-[11px] text-[#86868b]'>
                No featured collection yet — admin: mark products as{' '}
                <span className='font-semibold'>Featured</span> in Dashboard → Featured to show
                custom landing collection; add slider images in Dashboard → Banners.
              </p>
            )}

          {/* Featured Products — single-merchant Apple Avenue */}
          {isFetchingProducts ? (
            <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 pt-6'>
              {Array(8)
                .fill({})
                .map((_, i) => (
                  <ProductCard
                    key={i}
                    isLoading
                    value={0}
                    _id=''
                    productName=''
                    images=''
                    price={0}
                    status='Posted'
                    onButtonAddClick={() => {}}
                    onButtonMinusClick={() => {}}
                  />
                ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className='grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 pt-6'>
              {products.slice(0, 8).map((item: any) => {
                const cartVal =
                  (cartData?.cart || []).find((c: any) => c._id === item._id)?.value || 0
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
                    onButtonAddClick={() =>
                      addToCart({ merchant: '', item: [{ _id: item._id, value: cartVal + 1 }] })
                    }
                    onButtonMinusClick={() =>
                      addToCart({ merchant: '', item: [{ _id: item._id, value: cartVal - 1 }] })
                    }
                  />
                )
              })}
            </div>
          ) : (
            <div className='rounded-[14px] border border-gray-100 bg-white p-10 text-center'>
              <p className='text-[13px] text-[#6E6E73]'>
                {query
                  ? `No devices found for "${query}"`
                  : 'No Featured Collection yet — admin has not marked any products as Featured.'}
              </p>
              <p className='text-[12px] text-[#86868b] pt-1'>
                {query
                  ? 'Try searching for iPhone, Mac or iPad'
                  : 'Admin: Dashboard → Featured to create custom landing collection; Dashboard → Products → Edit → tick Featured. All Featured/Deals are admin-driven.'}
              </p>
              <button
                onClick={() => router.push('/store')}
                className='mt-3 text-[13px] font-semibold text-[#FF6A00] hover:text-[#FF8533]'
              >
                Browse all devices →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* COLLECTIONS — admin-created, products added via Dashboard → Collections → Manage products */}
      {!query && collections.length > 0 && (
        <section className='w-full bg-white border-t border-gray-50 py-8 lg:py-10'>
          <div className='mx-auto w-full max-w-[1280px] px-4 sm:px-6'>
            <div className='flex items-center justify-between gap-4 pb-5'>
              <div>
                <h2 className='text-[18px] lg:text-[20px] font-bold tracking-tight text-[#1D1D1F]'>
                  Collections — Curated by Apple Avenue
                </h2>
                <p className='text-[12.5px] text-[#6E6E73]'>
                  Create collections and add products in Dashboard → Collections. They appear here
                  automatically.
                </p>
              </div>
              <button
                onClick={() => router.push('/store')}
                className='hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-[#FF6A00] hover:text-[#FF8533]'
              >
                Shop All <ArrowRight className='h-4 w-4' />
              </button>
            </div>
            <div className='flex flex-col gap-8'>
              {collections.map((col: any) => (
                <div
                  key={col._id}
                  className='rounded-[14px] border border-gray-100 bg-[#FCFCFC] p-4 lg:p-5'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex gap-3 items-center'>
                      {col.image ? (
                        <div className='h-12 w-12 rounded-[8px] overflow-hidden bg-white border border-gray-100 relative shrink-0'>
                          <Image src={col.image} alt={col.name} fill className='object-cover' />
                        </div>
                      ) : (
                        <div className='h-12 w-12 rounded-[8px] bg-[#111111] flex items-center justify-center shrink-0'>
                          <span className='text-white font-bold text-[11px]'>
                            {col.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className='text-[14px] font-semibold text-[#1D1D1F]'>{col.name}</h3>
                        <p className='text-[12px] text-[#6E6E73] max-w-[500px] line-clamp-1'>
                          {col.description || 'Curated collection'}
                        </p>
                        <p className='text-[11px] text-[#86868b]'>{col.products.length} products</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/store')}
                      className='hidden sm:inline-flex text-[12px] font-semibold text-[#FF6A00] hover:text-[#FF8533]'
                    >
                      View all →
                    </button>
                  </div>
                  <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {col.products.slice(0, 4).map((item: any) => {
                      const cartVal =
                        (cartData?.cart || []).find((c: any) => c._id === item._id)?.value || 0
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
                          onButtonAddClick={() =>
                            addToCart({
                              merchant: '',
                              item: [{ _id: item._id, value: cartVal + 1 }],
                            })
                          }
                          onButtonMinusClick={() =>
                            addToCart({
                              merchant: '',
                              item: [{ _id: item._id, value: cartVal - 1 }],
                            })
                          }
                        />
                      )
                    })}
                  </div>
                  {col.products.length > 4 && (
                    <p className='mt-3 text-[11px] text-[#86868b] text-center'>
                      + {col.products.length - 4} more in this collection — view in Store
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
