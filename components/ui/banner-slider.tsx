'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Banner = { _id: string; title: string; subtitle: string; image: string; link: string; order: number; active: boolean }

export default function BannerSlider({ fallback }: { fallback?: React.ReactNode }) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((d) => { setBanners(d.banners || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4000)
    return () => clearInterval(t)
  }, [banners.length])

  if (loading) return <div className="h-[200px] lg:h-[220px] rounded-[14px] bg-[#F5F5F7] animate-pulse" />
  if (banners.length === 0) return <>{fallback}</> as any

  const b = banners[idx]
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-gray-100 shadow-[0_4px_18px_rgba(15,23,42,0.05)] h-[220px] lg:h-[260px] bg-[#111111]">
      <Image src={b.image} alt={b.title} fill className="object-cover opacity-90" priority />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-6 lg:p-8 max-w-[60%]">
        <h3 className="text-[22px] lg:text-[28px] font-bold tracking-tight text-white leading-none">{b.title}</h3>
        {b.subtitle && <p className="mt-2 text-[12px] lg:text-[13px] text-white/80 line-clamp-2">{b.subtitle}</p>}
        <Link href={b.link || '/store'} className="mt-4 inline-flex w-fit rounded-[9px] bg-white px-5 py-2 text-[13px] font-semibold text-[#111111] hover:bg-[#F5F5F7]">Shop Now</Link>
      </div>
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setIdx((i) => (i + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"><ChevronRight className="h-4 w-4" /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
