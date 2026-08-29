'use client'
import { Star, BadgeCheck } from 'lucide-react'

export default function ReviewsPage() {
  return (
    <div className="w-full bg-[#FCFCFC] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[900px] px-6 py-8">
        <h1 className="text-[18px] font-bold text-[#1D1D1F]">Reviews — Verified Purchase</h1>
        <p className="text-[12.5px] text-[#6E6E73]">Star rating, written review, photo/video, verified badge, helpful votes. Admin moderated. Category scores: Camera 4.9 • Battery 4.7 • Performance 4.9 • Display 4.8 • Value 4.6</p>
        <div className="mt-6 space-y-4">
          {[1,2].map(i=>(
            <div key={i} className="rounded-[14px] border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2"><span className="flex text-[#FFD60A]">{Array(5).fill(0).map((_,j)=><Star key={j} className="h-4 w-4 fill-[#FFD60A] text-[#FFD60A]" />)}</span><span className="rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[11px] inline-flex gap-1"><BadgeCheck className="h-3 w-3 text-green-600" /> Verified purchase</span></div>
              <p className="mt-2 text-[13px] text-[#1D1D1F]">“Excellent — authentic, warranty registered instantly. Fast delivery.”</p>
              <div className="mt-2 text-[11px] text-[#86868b]">Camera 5 • Battery 4 • Performance 5 • Display 5 • Value 4 • 12 helpful</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
