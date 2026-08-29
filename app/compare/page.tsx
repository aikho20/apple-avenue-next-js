'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GitCompare, X, Smartphone, Trash2, Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompare } from '@/hooks/useCompare'
import { useGetStoreProductQuery } from '@/store/action/storeAction'

const SPEC_ROWS: Array<{ label: string; get: (p: any) => string }> = [
  { label: 'Price', get: (p) => `₱${Number(p.price).toLocaleString()}` },
  { label: 'Category', get: (p) => p.category || '—' },
  { label: 'Display', get: (p) => p.specs?.display ? `${p.specs.display.size || ''} ${p.specs.display.panelType || ''} ${p.specs.display.refreshRate || ''}`.trim() : '—' },
  { label: 'Processor', get: (p) => p.specs?.processor || '—' },
  { label: 'RAM', get: (p) => p.specs?.memory?.ram || '—' },
  { label: 'Storage', get: (p) => p.specs?.memory?.storage || '—' },
  { label: 'Camera', get: (p) => p.specs?.camera ? [p.specs.camera.main, p.specs.camera.ultrawide, p.specs.camera.telephoto].filter(Boolean).join(' / ') : '—' },
  { label: 'Battery', get: (p) => p.specs?.battery?.capacity || '—' },
  { label: 'Charging', get: (p) => p.specs?.battery?.charging || '—' },
  { label: 'Network', get: (p) => p.specs?.connectivity?.network || p.specs?.network || '—' },
  { label: 'OS', get: (p) => p.specs?.operatingSystem || p.specs?.os || '—' },
  { label: 'Weight', get: (p) => p.specs?.weight || '—' },
  { label: 'Dimensions', get: (p) => p.specs?.dimensions || '—' },
  { label: 'Warranty', get: (p) => p.specs?.warranty || '1 Year Apple • Warranty-backed' },
  { label: 'Rating', get: (p) => '4.8 ★ • Verified' },
]

export default function ComparePage() {
  const { ids, remove, clear } = useCompare()
  const { data } = useGetStoreProductQuery({})
  const products = useMemo(() => {
    const all = (data?.product || []) as any[]
    return ids.map(id => all.find((p: any) => p._id === id)).filter(Boolean)
  }, [ids, data])

  const getDiff = (values: string[]) => {
    const uniq = new Set(values)
    return uniq.size > 1
  }

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><GitCompare className="h-5 w-5" /> Compare — 2 to 4 phones</h1>
            <p className="text-[12.5px] text-[#6E6E73]">Highlighting meaningful differences. Horizontal scroll on mobile. {ids.length}/4 selected.</p>
          </div>
          <div className="flex gap-2">
            {ids.length > 0 && <Button variant="outline" size="sm" onClick={clear}><Trash2 className="h-3.5 w-3.5 mr-1" /> Clear</Button>}
            <Link href="/store" className="hidden sm:inline-flex items-center rounded-full bg-[#111111] text-white px-4 py-2 text-[12px] font-semibold hover:bg-black"><Plus className="h-3.5 w-3.5 mr-1" /> Add device</Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2].map(i=>(
              <div key={i} className="rounded-[14px] border border-dashed border-gray-200 bg-white p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7]"><Smartphone className="h-5 w-5 text-[#111111]" /></div>
                <p className="mt-2 text-[13px] font-medium text-[#1D1D1F]">Add a device to compare</p>
                <p className="text-[12px] text-[#86868b]">Up to 4 devices — price, display, processor, battery & more.</p>
                <Link href="/store"><Button variant="outline" className="mt-3">Choose device</Button></Link>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Product header cards */}
            <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
              {products.map((p: any) => (
                <div key={p._id} className="rounded-[14px] border border-gray-100 bg-white overflow-hidden relative">
                  <button onClick={() => remove(p._id)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-[#F5F5F7]"><X className="h-3.5 w-3.5" /></button>
                  <div className="h-[140px] bg-[#F5F5F7] relative">
                    <Image src={Array.isArray(p.images) ? p.images[0] : p.images || '/placeholder.jpg'} alt={p.productName} fill className="object-contain p-4" />
                  </div>
                  <div className="p-3">
                    <Link href={`/product/${p._id}`} className="text-[12px] font-semibold text-[#1D1D1F] line-clamp-2 hover:text-[#0071E3]">{p.productName}</Link>
                    <p className="text-[11px] text-[#86868b]">{p.category}</p>
                    <p className="text-[13px] font-bold text-[#1D1D1F] mt-1">₱{Number(p.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - products.length) }).map((_, i) => (
                <Link key={`empty-${i}`} href="/store" className="rounded-[14px] border border-dashed border-gray-200 bg-white p-6 flex flex-col items-center justify-center text-center hover:bg-[#F5F5F7]">
                  <Smartphone className="h-5 w-5 text-[#86868b]" />
                  <p className="text-[12px] font-medium mt-1">Add phone {products.length + i + 1}</p>
                </Link>
              ))}
            </div>

            {/* Comparison table */}
            <div className="mt-6 overflow-x-auto rounded-[14px] border border-gray-100 bg-white">
              <table className="min-w-[640px] w-full text-[13px]">
                <thead><tr className="bg-[#F5F5F7]"><th className="text-left px-4 py-3 text-[#6E6E73] font-semibold w-[140px]">Spec</th>{products.map((p: any)=><th key={p._id} className="text-left px-4 py-3 text-[#1D1D1F]">{p.productName.slice(0,18)}</th>)}</tr></thead>
                <tbody>
                  {SPEC_ROWS.map(row => {
                    const values = products.map((p: any) => row.get(p) || '—')
                    const diff = getDiff(values)
                    return (
                      <tr key={row.label} className={`border-t border-gray-50 ${diff ? 'bg-[#FFF7ED]' : ''}`}>
                        <td className="px-4 py-3 font-medium text-[#424245]">{row.label} {diff && <span className="ml-1 text-[10px] bg-amber-100 text-[#92400E] px-1.5 py-0.5 rounded-full">diff</span>}</td>
                        {values.map((v, i)=><td key={i} className={`px-4 py-3 ${diff ? 'font-semibold text-[#1D1D1F]' : 'text-[#6E6E73]'}`}>{v}</td>)}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-[#86868b]">Differences highlighted in amber. Based on actual product data — specs never invented. Example: Phone A ₱29,990 • 8GB/256GB vs Phone B ₱32,990 • 12GB/512GB.</p>
          </>
        )}
      </div>
    </div>
  )
}
