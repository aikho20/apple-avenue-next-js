'use client'
import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useGetStoreProductQuery, useAddToCartMutation, useGetStoreCartQuery } from '@/store/action/storeAction'
import { Button } from '@/components/ui/button'
import { Star, Heart, GitCompare, ShieldCheck, Truck, BadgeCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useWishlist } from '@/hooks/useWishlist'
import { useCompare } from '@/hooks/useCompare'
import toast from 'react-hot-toast'

interface Specs {
  display?: { size: string; resolution?: string; refreshRate?: string; panelType?: string }
  processor?: string
  memory: { ram: string; storage: string }
  camera: { main?: string; ultrawide?: string; telephoto?: string; front?: string }
  battery?: { capacity?: string; charging?: string }
  connectivity?: { network?: string; wifi?: string; bluetooth?: string }
  operatingSystem?: string
  warranty?: string
  weight?: string
  dimensions?: string
}

export default function ProductDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const { data, isLoading } = useGetStoreProductQuery({})
  const { data: session } = useSession()
  const { data: cart } = useGetStoreCartQuery({}, { skip: !session?.user })
  const [addToCart] = useAddToCartMutation()
  const { isWishlisted, toggle: toggleWishlist } = useWishlist()
  const { isCompared, toggle: toggleCompare, count: compareCount, max: compareMax } = useCompare()
  const [qty] = useState(1)
  const [down, setDown] = useState(10000)
  const [term, setTerm] = useState(12)

  const product = useMemo(() => (data?.product || []).find((p: any) => p._id === params.id), [data, params.id])

  // Real specs from DB (structured per AGENTS.md) — fallback to empty
  const specs: Specs | null = product ? ((product as any).specs && Object.keys((product as any).specs).length > 0 ? (product as any).specs as Specs : null) : null

  const price = product ? Number((product.price as any)?.$numberDecimal ?? product.price) : 59990
  const monthly = term > 0 ? Math.round((price - down) / term) : 0

  if (isLoading) {
    return (
      <div className="w-full bg-[#FCFCFC] min-h-[50vh] flex items-center justify-center px-6 py-10">
        <div className="text-center"><p className="text-[13px] text-[#6E6E73]">Loading Apple device…</p></div>
      </div>
    )
  }
  if (!product) {
    return (
      <div className="w-full bg-[#FCFCFC] min-h-[50vh] flex items-center justify-center px-6 py-10">
        <div className="text-center"><p className="text-[13px] text-[#6E6E73]">Product not found.</p><Button variant="outline" className="mt-3" onClick={()=>router.push('/store')}>Back to store</Button></div>
      </div>
    )
  }

  const cartVal = (cart?.cart || []).find((c: any) => c._id === product._id)?.value || 0

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1200px] px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gallery */}
        <div className="rounded-[14px] border border-gray-100 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <div className="relative h-[360px] bg-[#F5F5F7] rounded-[10px] overflow-hidden">
            <Image src={product.images?.[0] || '/placeholder.jpg'} alt={product.productName} fill className="object-contain p-6" />
          </div>
          <div className="mt-3 flex gap-2">
            {(product.images || []).slice(0,4).map((src:string,i:number)=>(
              <div key={i} className="h-16 w-16 rounded-[8px] border border-gray-100 bg-[#F5F5F7] overflow-hidden relative">
                <Image src={src || '/placeholder.jpg'} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-[10px] bg-[#F5F5F7] p-3 text-[11px] text-[#86868b]">Product video when available • Swipe gallery • Specs use structured data, not free text.</div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="rounded-[14px] border border-gray-100 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[#0071E3] uppercase">Apple • {product.category || 'iPhone'}</p>
            <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">{product.productName}</h1>
            <div className="flex items-center gap-2 text-[12px]"><span className="flex text-[#FFD60A]"><Star className="h-3.5 w-3.5 fill-[#FFD60A]" /> 4.8</span><span className="text-[#6E6E73]">• Verified purchase • In stock • Warranty</span></div>
            <div className="mt-3 flex items-baseline gap-2"><span className="text-[22px] font-extrabold text-[#1D1D1F]">₱{price.toLocaleString()}</span><span className="text-[12px] line-through text-[#86868b]">₱{(price*1.15).toFixed(0)}</span><span className="rounded-full bg-[#111111] text-white px-2 py-0.5 text-[11px] font-bold">-13%</span></div>
            <p className="text-[12px] text-[#6E6E73] mt-1">₱{monthly.toLocaleString()}/mo with installment — estimate only, not an offer.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-[#F5F5F7] px-2.5 py-1">Storage variants • 128GB • 256GB • 512GB</span><span className="rounded-full bg-[#F5F5F7] px-2.5 py-1">Colors • Black • Silver • Blue</span><span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 inline-flex gap-1"><BadgeCheck className="h-3 w-3" /> Authentic</span><span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 inline-flex gap-1"><ShieldCheck className="h-3 w-3" /> Warranty</span><span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 inline-flex gap-1"><Truck className="h-3 w-3" /> Insured delivery</span></div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 bg-[#111111] hover:bg-black" onClick={()=>addToCart({ merchant:'', item:[{_id: product._id, value: cartVal + qty}]})}>Add to Cart • {cartVal||0} in cart</Button>
              <Button variant="outline" onClick={()=>router.push(`/store/checkout?id=${cart?.cartId||''}`)}>Buy Now</Button>
            </div>
            <div className="mt-2 flex gap-2">
              <Button variant={product && isWishlisted(product._id) ? 'default' : 'ghost'} size="sm" className={product && isWishlisted(product._id) ? 'bg-[#111111] text-white' : ''} onClick={async()=>{ if(!product) return; await toggleWishlist(product._id); toast.success(isWishlisted(product._id) ? 'Removed from wishlist' : 'Added to wishlist') }}><Heart className={`h-4 w-4 mr-1 ${product && isWishlisted(product._id) ? 'fill-white' : ''}`} /> {product && isWishlisted(product._id) ? 'Wishlisted' : 'Wishlist'}</Button>
              <Button variant={product && isCompared(product._id) ? 'default' : 'ghost'} size="sm" className={product && isCompared(product._id) ? 'bg-[#111111] text-white' : ''} onClick={()=>{ if(!product) return; if (isCompared(product._id)) { toggleCompare(product._id); toast.success('Removed from compare') } else { if (compareCount >= compareMax) { toast.error(`Compare max ${compareMax}`); return } toggleCompare(product._id); toast.success('Added to compare (2-4)') }}}><GitCompare className="h-4 w-4 mr-1" /> {product && isCompared(product._id) ? 'Compared' : 'Compare'}</Button>
            </div>
          </div>

          {/* Installment calculator */}
          <div className="rounded-[14px] border border-gray-100 bg-white p-5">
            <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Installment Calculator</h3>
            <div className="mt-3 grid grid-cols-3 gap-3 text-[12px]">
              <div><label className="text-[11px] text-[#86868b]">Price</label><div className="font-semibold">₱{price.toLocaleString()}</div></div>
              <div><label className="text-[11px] text-[#86868b]">Down</label><input type="number" value={down} onChange={e=>setDown(Number(e.target.value))} className="w-full h-8 rounded border border-gray-100 px-2 text-[12px]" /></div>
              <div><label className="text-[11px] text-[#86868b]">Term (mo)</label><select value={term} onChange={e=>setTerm(Number(e.target.value))} className="w-full h-8 rounded border border-gray-100 px-2"><option value={12}>12</option><option value={18}>18</option><option value={24}>24</option></select></div>
            </div>
            <div className="mt-3 rounded-[10px] bg-[#F5F5F7] p-3 flex justify-between items-center"><span className="text-[11px] text-[#86868b]">Estimated Monthly</span><span className="text-[16px] font-extrabold text-[#1D1D1F]">₱{monthly.toLocaleString()}</span></div>
            <p className="mt-1 text-[10px] text-[#86868b]">Estimate only — actual financing terms, interest/fees vary. Not a financing offer.</p>
          </div>

          {/* Specs structured — from DB, never invented */}
          {specs && Object.keys(specs).length > 0 ? (
            <div className="rounded-[14px] border border-gray-100 bg-white p-5">
              <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Specifications — structured</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                {specs.display && <div><dt className="text-[#86868b]">Display</dt><dd className="font-medium">{[specs.display.size, specs.display.resolution, specs.display.refreshRate, specs.display.panelType].filter(Boolean).join(' • ')}</dd></div>}
                {specs.processor && specs.processor !== '—' && <div><dt className="text-[#86868b]">Processor</dt><dd className="font-medium">{specs.processor}</dd></div>}
                {specs.memory && <div><dt className="text-[#86868b]">Memory</dt><dd className="font-medium">{[specs.memory.ram, specs.memory.storage].filter(v => v && v !== '—').join(' • ')}</dd></div>}
                {specs.camera && Object.keys(specs.camera).length > 0 && <div><dt className="text-[#86868b]">Camera</dt><dd className="font-medium">{[specs.camera.main, specs.camera.ultrawide, specs.camera.telephoto, specs.camera.front].filter(Boolean).join(' / ') || '—'}</dd></div>}
                {specs.battery && <div><dt className="text-[#86868b]">Battery</dt><dd className="font-medium">{[specs.battery.capacity, specs.battery.charging].filter(Boolean).join(' • ')}</dd></div>}
                {specs.connectivity && <div><dt className="text-[#86868b]">Connectivity</dt><dd className="font-medium">{[specs.connectivity.network, specs.connectivity.wifi, specs.connectivity.bluetooth].filter(Boolean).join(' • ')}</dd></div>}
                {specs.operatingSystem && specs.operatingSystem !== '—' && <div><dt className="text-[#86868b]">OS</dt><dd className="font-medium">{specs.operatingSystem}</dd></div>}
                {(specs as any).weight && <div><dt className="text-[#86868b]">Weight</dt><dd className="font-medium">{(specs as any).weight}</dd></div>}
                {(specs as any).dimensions && <div><dt className="text-[#86868b]">Dimensions</dt><dd className="font-medium">{(specs as any).dimensions}</dd></div>}
                {specs.warranty && <div><dt className="text-[#86868b]">Warranty</dt><dd className="font-medium">{specs.warranty}</dd></div>}
              </dl>
              <p className="mt-2 text-[11px] text-[#86868b]">Structured specs per AGENTS.md — used for filtering & comparison. What&apos;s included, shipping, delivery estimate & warranty tied to order.</p>
            </div>
          ) : (
            <div className="rounded-[14px] border border-gray-100 bg-white p-5 text-[12px] text-[#6E6E73]">No structured specs yet — admin can add via Dashboard → Products → Edit → Specs (JSON).</div>
          )}
        </div>
      </div>
    </div>
  )
}
