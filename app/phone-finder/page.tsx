'use client'
import { useState, useMemo } from 'react'
import { Sparkles, Smartphone, Battery, Camera, Gamepad2, Search, Star, Zap, Monitor, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import { useBranch } from '@/hooks/useBranch'
import { CurrentBranchBanner } from '@/components/branch/branch-selector'

type Check = { perf: boolean; battery: boolean; display: boolean; camera: boolean }

export default function PhoneFinderPage() {
  const [budget, setBudget] = useState('20000-30000')
  const [useG, setUseG] = useState('Gaming')
  const [checks, setChecks] = useState<Check>({ perf: true, battery: true, display: false, camera: false })
  const [searched, setSearched] = useState(false)
  const { currentId: branchId, currentBranch } = useBranch()
  const { data } = useGetStoreProductQuery(branchId ? { branchId } : {})
  const all = (data?.product || []) as any[]

  const parseBudget = (b: string) => {
    if (b === '0-20000') return [0, 20000]
    if (b === '20000-30000') return [20000, 30000]
    if (b === '30000-50000') return [30000, 50000]
    return [50000, 9999999]
  }

  const scoreProduct = (p: any) => {
    let score = 0
    let max = 100
    const reasons: string[] = []
    const [min, maxB] = parseBudget(budget)
    const price = Number(p.price)
    if (price >= min && price <= maxB) {
      score += 30
      reasons.push(`Within budget ₱${price.toLocaleString()}`)
    } else if (price < min) {
      score += 15
    } else {
      score -= 10
    }

    // Primary use scoring
    const specs = p.specs || {}
    const proc = (specs.processor || '').toLowerCase()
    const display = `${specs.display?.refreshRate || ''} ${specs.display?.panelType || ''}`.toLowerCase()
    const battery = `${specs.battery?.capacity || ''} ${specs.battery?.charging || ''}`.toLowerCase()
    const cam = `${specs.camera?.main || ''}`.toLowerCase()

    if (useG === 'Gaming') {
      if (proc.includes('a17') || proc.includes('m3') || proc.includes('m2') || proc.includes('a16')) { score += 20; reasons.push(`High-performance ${specs.processor}`) }
      if (display.includes('120hz')) { score += 15; reasons.push('120Hz display — smooth gaming') }
      if (battery.includes('mah') || battery.includes('wh')) { score += 10; reasons.push('Large battery + fast charging') }
      if (p.category === 'iPhone' && proc.includes('a17')) score += 10
    } else if (useG === 'Camera') {
      if (cam.includes('48mp')) { score += 25; reasons.push('48MP pro camera') }
      else if (cam.includes('12mp')) { score += 12; reasons.push('12MP camera') }
      if (display.includes('retina')) { score += 10; reasons.push('Retina display') }
    } else if (useG === 'Battery') {
      if (battery.includes('mah') || specs.battery?.capacity) {
        const cap = parseInt(battery)
        if (!isNaN(cap) && cap > 4000) { score += 25; reasons.push('Large battery') }
        else score += 15
        reasons.push(`${specs.battery?.capacity || 'Good battery'}`)
      }
      if (battery.includes('fast') || battery.includes('magsafe')) { score += 10; reasons.push('Fast charging') }
    } else if (useG === 'Performance') {
      if (proc.includes('m3') || proc.includes('m2') || proc.includes('a17')) { score += 25; reasons.push(`Flagship ${specs.processor}`) }
      if (p.category === 'Mac' && proc.includes('m3')) score += 10
    } else { // Everyday
      score += 15
      reasons.push('Balanced everyday device')
      if (display.includes('retina')) { score += 8; reasons.push('Retina display') }
    }

    if (checks.perf && (proc.includes('m3') || proc.includes('a17') || proc.includes('a16'))) { score += 8; }
    if (checks.battery && battery) { score += 8; }
    if (checks.display && display.includes('120hz')) { score += 8; reasons.push('120Hz display') }
    if (checks.camera && cam.includes('48mp')) { score += 8; }

    if (p.isFeatured) { score += 5; reasons.push('Curated Featured') }
    if (p.status !== 'Posted') score -= 50

    score = Math.max(0, Math.min(98, score))
    // Add small boost for higher quantity (availability)
    if (p.quantity > 10) score = Math.min(98, score + 2)
    return { score: Math.round(score), reasons: reasons.slice(0, 3) }
  }

  const results = useMemo(() => {
    if (!searched) return []
    const scored = all.map((p) => {
      const { score, reasons } = scoreProduct(p)
      return { ...p, _score: score, _reasons: reasons }
    })
      .filter((p) => p._score > 25)
      .sort((a, b) => b._score - a._score)
      .slice(0, 6)
    return scored
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, all, budget, useG, checks])

  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <CurrentBranchBanner />
      <div className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="rounded-[14px] border border-gray-100 bg-white p-6 lg:p-8 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#111111]"><Sparkles className="h-4 w-4 text-white" /></div>
            <h1 className="text-[18px] font-bold tracking-tight text-[#1D1D1F]">Smart Phone Finder</h1>
            <span className="ml-2 rounded-full bg-[#F5F5F7] px-2.5 py-1 text-[11px] font-medium text-[#424245]">Guided recommendation • % match</span>
            {currentBranch && <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-orange-200 px-2.5 py-1 text-[11px] font-medium text-[#9A3412]"><MapPin className="h-3 w-3" /> {currentBranch.name}</span>}
          </div>
          <p className="mt-1 text-[12.5px] text-[#6E6E73]">
            {currentBranch ? `Browsing ${currentBranch.name} • ${currentBranch.address} — we match against this branch's real inventory. No invented specs — scores from actual price, display, processor, battery, camera.` : 'Tell us your budget, usage and priorities — we match against real Apple Avenue inventory. No invented specs — scores from actual price, display, processor, battery, camera. Select a branch for accurate stock.'}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[11px] font-semibold text-[#424245]">Budget</label><select value={budget} onChange={e=>{setBudget(e.target.value); setSearched(false)}} className="mt-1 w-full h-[40px] rounded-[9px] border border-gray-100 bg-white px-3 text-[13px]"><option value="0-20000">₱0 – ₱20,000</option><option value="20000-30000">₱20,000 – ₱30,000</option><option value="30000-50000">₱30,000 – ₱50,000</option><option value="50000+">₱50,000+</option></select></div>
            <div><label className="text-[11px] font-semibold text-[#424245]">Primary Use</label><select value={useG} onChange={e=>{setUseG(e.target.value); setSearched(false)}} className="mt-1 w-full h-[40px] rounded-[9px] border border-gray-100 bg-white px-3 text-[13px]"><option>Gaming</option><option>Camera</option><option>Battery</option><option>Everyday</option><option>Performance</option></select></div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#424245]">Important</span>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={checks.perf} onChange={e=>setChecks({...checks, perf: e.target.checked})} /> <Zap className="h-3.5 w-3.5 text-[#111111]" /> Performance</label>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={checks.battery} onChange={e=>setChecks({...checks, battery: e.target.checked})} /> <Battery className="h-3.5 w-3.5 text-[#111111]" /> Battery</label>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={checks.display} onChange={e=>setChecks({...checks, display: e.target.checked})} /> <Monitor className="h-3.5 w-3.5 text-[#111111]" /> Display (120Hz)</label>
              <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={checks.camera} onChange={e=>setChecks({...checks, camera: e.target.checked})} /> <Camera className="h-3.5 w-3.5 text-[#111111]" /> Camera</label>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#424245]">How it works</span>
              <p className="text-[12px] text-[#6E6E73]">Score: budget (30) + primary use (up to 35) + important toggles (up to 32) + featured/availability. Based on <span className="font-semibold text-[#1D1D1F]">actual specs</span> from catalog.</p>
              <div className="flex flex-wrap gap-2 text-[11px]"><span className="rounded-full bg-[#F5F5F7] px-3 py-1">Under ₱30k + 256GB</span><span className="rounded-full bg-[#F5F5F7] px-3 py-1">5G • 120Hz</span></div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={()=>setSearched(true)} className="bg-[#111111] hover:bg-black"><Search className="h-4 w-4 mr-1" /> Find my device</Button>
            <Link href="/store" className="inline-flex h-[40px] items-center rounded-[9px] border border-[#D2D2D7] px-5 text-[13px] font-semibold">Browse all</Link>
          </div>

          {searched && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Results • {results.length} matches for <span className="text-[#0071E3]">{useG}</span> in {budget === '50000+' ? '₱50k+' : `₱${budget.replace('-',' – ')}`}</h3>
                <span className="text-[11px] text-[#86868b]">{all.length} products scanned</span>
              </div>
              {results.length === 0 ? (
                <div className="mt-4 rounded-[12px] border border-dashed border-gray-200 bg-[#F5F5F7] p-6 text-center">
                  <p className="text-[13px] font-medium">No strong matches — try a higher budget or different use.</p>
                  <p className="text-[12px] text-[#6E6E73]">All scores are from real inventory — no invented specs.</p>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((p) => (
                    <div key={p._id} className="rounded-[14px] border border-gray-100 bg-white overflow-hidden flex">
                      <div className="relative w-[110px] shrink-0 bg-[#F5F5F7]">
                        <Image src={Array.isArray(p.images) ? p.images[0] : p.images || '/placeholder.jpg'} alt={p.productName} fill className="object-cover" />
                        <span className="absolute top-2 left-2 rounded-full bg-[#111111] text-white px-2 py-1 text-[11px] font-bold">{p._score}% Match</span>
                      </div>
                      <div className="flex-1 p-3 flex flex-col gap-1">
                        <p className="text-[12px] font-bold tracking-wide text-[#0071E3] uppercase">{p.category} • {p._score >= 80 ? 'Excellent' : p._score >= 60 ? 'Good' : 'Fair'}</p>
                        <Link href={`/product/${p._id}`} className="text-[13px] font-semibold text-[#1D1D1F] line-clamp-1 hover:text-[#0071E3]">{p.productName}</Link>
                        <p className="text-[12px] font-bold">₱{Number(p.price).toLocaleString()} • {p.specs?.memory?.storage || ''}</p>
                        <ul className="text-[11px] text-[#6E6E73] space-y-0.5">
                          {p._reasons.map((r: string, i:number) => <li key={i} className="flex gap-1"><span>•</span> {r}</li>)}
                        </ul>
                        <div className="mt-auto flex gap-1.5 pt-2">
                          <Link href={`/product/${p._id}`} className="inline-flex h-7 items-center rounded-full bg-[#111111] text-white px-3 text-[11px] font-semibold hover:bg-black">View</Link>
                          <Link href="/compare" className="inline-flex h-7 items-center rounded-full border border-gray-200 px-3 text-[11px]">Compare</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
