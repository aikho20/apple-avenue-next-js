'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Percent, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Discount = { _id: string; code: string; type: string; value: number; minOrder: number; active: boolean; createdAt: string }

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/store/dashboard/discount')
    const data = await res.json()
    setDiscounts(data.discounts || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const create = async () => {
    if (!code || !value) return toast.error('Code and value required')
    setCreating(true)
    const res = await fetch('/api/store/dashboard/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, type, value: Number(value) }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Discount created')
      setCode('')
      setValue('')
      fetchData()
    } else toast.error(data.error || 'Failed')
    setCreating(false)
  }

  const remove = async (id: string) => {
    await fetch(`/api/store/dashboard/discount?id=${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetchData()
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch('/api/store/dashboard/discount', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: id, active: !active }),
    })
    fetchData()
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight text-[#1F2937]">Discounts</h1>
        <p className="text-[13px] text-[#6B7280]">Manage promotions and discounts</p>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <h3 className="text-[13px] font-semibold text-[#1F2937]">Create discount</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Code e.g. SAVE10" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-[40px] rounded-[9px] border-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed (₱)</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <Button onClick={create} disabled={creating} className="w-fit">
          {creating ? 'Creating...' : 'Create discount'}
        </Button>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-[13px] text-[#6B7280]">Loading...</p>
        ) : discounts.length === 0 ? (
          <Card className="sm:col-span-2 p-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <Percent className="h-5 w-5 text-[#111111]" />
            </div>
            <p className="text-[13px] font-medium text-[#6B7280]">No discounts yet</p>
          </Card>
        ) : (
          discounts.map((d) => (
            <Card key={d._id} className="p-4 flex justify-between items-center gap-3">
              <div>
                <p className="text-[13px] font-bold tracking-widest text-[#1F2937]">{d.code}</p>
                <p className="text-[12px] text-[#6B7280]">
                  {d.type === 'percentage' ? `${d.value}% off` : `₱${d.value} off`}
                </p>
                <button
                  onClick={() => toggle(d._id, d.active)}
                  className={`mt-2 text-[11px] font-semibold px-2 py-1 rounded-full border ${d.active ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-gray-50 text-[#6B7280] border-gray-200'}`}
                >
                  {d.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <button
                onClick={() => remove(d._id)}
                className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#F5F5F7] transition-colors"
              >
                <Trash2 className="h-4 w-4 text-[#6B7280]" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
