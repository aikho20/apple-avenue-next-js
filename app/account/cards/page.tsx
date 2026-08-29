'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type CardT = { _id: string; cardNumber: string; holder: string; expiry: string; brand: string }

export default function CardsPage() {
  const [cards, setCards] = useState<CardT[]>([])
  const [loading, setLoading] = useState(true)
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')

  const fetchCards = async () => {
    const res = await fetch('/api/account/cards')
    const data = await res.json()
    setCards(data.cards || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const add = async () => {
    if (!holder || !number || !expiry) return toast.error('Fill all fields')
    const res = await fetch('/api/account/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holder, cardNumber: number, expiry }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Card added')
      setHolder('')
      setNumber('')
      setExpiry('')
      fetchCards()
    } else toast.error(data.error || 'Failed')
  }

  const remove = async (id: string) => {
    await fetch('/api/account/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', cardId: id }),
    })
    toast.success('Card removed')
    fetchCards()
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <h1 className="text-[18px] font-bold tracking-tight text-[#1F2937]">Payment cards</h1>
        <p className="text-[13px] text-[#6B7280]">{cards.length} saved cards</p>
      </div>

      <Card className="p-5 flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-[#1F2937]">Add new card</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Card holder" value={holder} onChange={(e) => setHolder(e.target.value)} />
          <Input placeholder="Card number" value={number} onChange={(e) => setNumber(e.target.value)} />
          <Input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <Button onClick={add} className="w-fit">
          <Plus className="h-4 w-4" /> Add card
        </Button>
      </Card>

      <div className="grid gap-3">
        {loading ? (
          <p className="text-[13px] text-[#6B7280]">Loading...</p>
        ) : cards.length === 0 ? (
          <Card className="p-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#111111]" />
            </div>
            <p className="text-[13px] font-medium text-[#6B7280]">No cards yet</p>
          </Card>
        ) : (
          cards.map((c) => (
            <Card key={c._id} className="p-4 flex justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-12 rounded-[8px] bg-[#1F2937] flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1F2937]">{c.cardNumber}</p>
                  <p className="text-[12px] text-[#6B7280]">
                    {c.holder} • {c.expiry}
                  </p>
                </div>
              </div>
              <button
                onClick={() => remove(c._id)}
                className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
