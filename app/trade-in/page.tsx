'use client'
import { useState } from 'react'
import { Smartphone, ShieldCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBranch } from '@/hooks/useBranch'
import { CurrentBranchBanner } from '@/components/branch/branch-selector'

export default function TradeInPage() {
  const [val] = useState(18500)
  const { currentBranch } = useBranch()
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <CurrentBranchBanner />
      <div className="mx-auto max-w-[900px] px-6 py-8">
        <div className="rounded-[14px] border border-gray-100 bg-white p-6 lg:p-8 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <h1 className="text-[18px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><Smartphone className="h-5 w-5" /> Trade-In — Estimate {currentBranch && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-orange-200 px-2.5 py-1 text-[11px] font-medium text-[#9A3412]"><MapPin className="h-3 w-3" /> {currentBranch.name}</span>}</h1>
          <p className="text-[12.5px] text-[#6E6E73]">{currentBranch ? `${currentBranch.name} • ${currentBranch.address} — trade-in valuation & drop-off at this branch. Configure brand, model, storage, condition, screen/battery & accessories.` : 'Configure brand, model, storage, condition, screen/battery & accessories. Select a branch for accurate trade-in valuation. Valuation configurable by admin, approvable.'}</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Brand','Model','Storage','Condition','Screen','Battery','Accessories'].map(k=>(
              <div key={k}><label className="text-[11px] font-semibold text-[#424245]">{k}</label><select className="mt-1 w-full h-[40px] rounded-[9px] border border-gray-100 px-3 text-[13px]"><option>{k} — select</option></select></div>
            ))}
          </div>
          <div className="mt-6 rounded-[14px] bg-[#F5F5F7] p-5 text-center">
            <p className="text-[11px] font-bold tracking-[0.12em] text-[#86868b] uppercase">Estimated Value {currentBranch ? `• ${currentBranch.name}` : ''}</p>
            <p className="text-[28px] font-extrabold text-[#1D1D1F]">₱{val.toLocaleString()}</p>
            <p className="text-[11px] text-[#86868b]">Final valuation after admin approval at {currentBranch ? currentBranch.name : 'selected branch'}. Transparent, configurable pricing.</p>
            <Button className="mt-3 bg-[#111111] hover:bg-black">Submit for Review {currentBranch ? `• ${currentBranch.city}` : ''}</Button>
          </div>
          <p className="mt-4 text-[11px] text-[#86868b] inline-flex gap-2 items-center"><ShieldCheck className="h-3.5 w-3.5 text-[#0071E3]" /> Admin can approve/reject and update final valuation {currentBranch ? `for ${currentBranch.name}` : ''}.</p>
        </div>
      </div>
    </div>
  )
}
