'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapPin, Search, Navigation, StoreIcon, Check } from 'lucide-react'
import { useBranch } from '@/hooks/useBranch'

export function BranchSelector({ compact }: { compact?: boolean }) {
  const { branches, currentBranch, currentId, setBranch, locateNearest, locateLoading } = useBranch()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const filtered = branches.filter((b: any) => {
    if (!q) return true
    const hay = `${b.name} ${b.address} ${b.city}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${currentBranch ? 'bg-white border-gray-200 text-[#1D1D1F] hover:bg-[#F5F5F7]' : 'bg-[#111111] text-white border-[#111111] hover:bg-black'} ${compact ? 'h-8' : ''}`}
      >
        <MapPin className="h-3.5 w-3.5" />
        <span className="hidden sm:inline truncate max-w-[140px]">{currentBranch ? currentBranch.name : 'Select branch'}</span>
        <span className="sm:hidden">{currentBranch ? 'Branch' : 'Select'}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[560px] rounded-[14px]">
          <DialogHeader><DialogTitle>Choose branch</DialogTitle><DialogDescription>We&apos;ll show products, inventory & services nearest to you — or search a branch.</DialogDescription></DialogHeader>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
              <Input placeholder="Search branch, city..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
            </div>
            <Button variant="outline" size="sm" onClick={locateNearest} disabled={locateLoading}>
              <Navigation className="h-3.5 w-3.5 mr-1" /> {locateLoading ? 'Locating...' : 'Near me'}
            </Button>
          </div>
          {currentBranch && (
            <div className="rounded-[10px] border border-[#111111] bg-[#F5F5F7] p-3 flex items-center gap-2">
              <StoreIcon className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold">{currentBranch.name}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{currentBranch.address} • {currentBranch.city}</p>
              </div>
              <span className="text-[11px] bg-[#111111] text-white px-2 py-1 rounded-full">Current</span>
            </div>
          )}
          <div className="max-h-[40vh] overflow-auto grid gap-2">
            {filtered.length === 0 ? <p className="text-[13px] text-[#6B7280] py-6 text-center">No branches found</p> : filtered.map((b: any) => {
              const isActive = currentId === b._id
              return (
                <button key={b._id} onClick={() => { setBranch(b._id); setOpen(false) }} className={`text-left flex gap-3 rounded-[10px] border p-3 items-center ${isActive ? 'border-[#111111] bg-[#F5F5F7]' : 'border-gray-100 hover:bg-[#F5F5F7]'}`}>
                  <div className="h-10 w-10 rounded-[8px] bg-white border border-gray-100 flex items-center justify-center shrink-0"><StoreIcon className="h-5 w-5 text-[#111111]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{b.name}</p>
                    <p className="text-[11px] text-[#6E6E73] truncate flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.address}{b.city ? `, ${b.city}` : ''}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Lat {b.latitude} Lng {b.longitude}</p>
                  </div>
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center ${isActive ? 'bg-[#111111] border-[#111111] text-white' : 'border-gray-200 bg-white'}`}>{isActive && <Check className="h-3.5 w-3.5" />}</div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function CurrentBranchBanner() {
  const { currentBranch, locateNearest } = useBranch()
  if (currentBranch) return null // hide if already selected
  return (
    <div className="w-full bg-[#FF6A00]/10 border-b border-[#FF6A00]/20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-[#1D1D1F] flex items-center gap-2"><MapPin className="h-4 w-4 text-[#FF6A00]" /> Choose your nearest Apple Avenue branch for accurate stock & delivery estimates</p>
        <button onClick={locateNearest} className="rounded-full bg-[#FF6A00] text-white px-3 py-1.5 text-[12px] font-semibold hover:bg-[#FF8533]">Use my location</button>
      </div>
    </div>
  )
}
