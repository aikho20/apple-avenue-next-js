'use client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CurrencyPage() {
  const [currency, setCurrency] = useState('PHP')

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight text-[#1F2937]">Currency</h1>
        <p className="text-[13px] text-[#6B7280]">Manage store currency settings</p>
      </div>

      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-[#111111]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1F2937]">Philippine Peso</p>
            <p className="text-[12px] text-[#6B7280]">PHP — ₱ (default)</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <label className="text-[13px] font-medium text-[#374151]">Store currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-[40px] w-full max-w-[320px] rounded-[9px] border border-gray-100 bg-white px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#111111]/10"
          >
            <option value="PHP">PHP — Philippine Peso (₱)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="JPY">JPY — Yen (¥)</option>
          </select>
          <p className="text-[11px] text-[#9CA3AF]">All prices are displayed in the selected currency. Multi-currency conversion coming soon.</p>
        </div>

        <Button className="w-fit" onClick={() => toast.success(`Currency set to ${currency}`)}>
          Save
        </Button>
      </Card>
    </div>
  )
}
