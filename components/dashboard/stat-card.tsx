'use client'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  tone,
}: {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  delta?: number
  tone?: 'amber' | 'red' | 'green'
}) {
  const isPos = typeof delta === 'number' ? delta >= 0 : undefined
  return (
    <div
      className={cn(
        'rounded-[14px] border bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col gap-2',
        tone === 'amber' ? 'border-amber-100 bg-amber-50/40' : tone === 'red' ? 'border-red-100 bg-red-50/40' : 'border-gray-100'
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase">{label}</p>
        <Icon className={cn('h-4 w-4', tone === 'amber' ? 'text-amber-600' : tone === 'red' ? 'text-red-600' : 'text-[#111111]')} />
      </div>
      <p className="text-[22px] font-extrabold tracking-tight text-[#1D1D1F]">{value}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {sub && <p className="text-[12px] text-[#6E6E73]">{sub}</p>}
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
              isPos ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            )}
          >
            {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPos ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return <div className="h-[118px] rounded-[14px] bg-white border border-gray-100 animate-pulse" />
}
