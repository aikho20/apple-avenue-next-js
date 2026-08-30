'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAddStockMutation, useRemoveStockMutation, useAdjustStockMutation, useUpdatePriceMutation } from '@/store/action/inventoryAction'
import toast from 'react-hot-toast'

const REASONS = ['New supplier delivery', 'Damaged', 'Lost', 'Expired', 'Manual Correction', 'Inventory Count', 'Other', 'Promotional pricing', 'Restock']

export function AddStockDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (v: boolean) => void; product: any }) {
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const [refId, setRefId] = useState('')
  const [addStock, { isLoading }] = useAddStockMutation()
  const current = Number(product?.quantity || 0)
  const qNum = Number(qty)
  const newStock = !isNaN(qNum) && qNum > 0 ? current + qNum : current

  const submit = async () => {
    if (!qNum || qNum <= 0 || !Number.isInteger(qNum)) return toast.error('Quantity must be positive integer')
    if (!reason.trim()) return toast.error('Reason required')
    try {
      await addStock({ productId: product._id, quantity: qNum, reason, referenceId: refId }).unwrap()
      toast.success('Stock added')
      onOpenChange(false)
      setQty(''); setReason(''); setRefId('')
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[14px] max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
          <DialogDescription>Increase inventory with audit trail</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="rounded-[10px] bg-[#F5F5F7] p-3 flex justify-between text-[13px]">
            <span className="text-[#6E6E73]">Current Stock</span><span className="font-bold">{current}</span>
          </div>
          <div>
            <Label>Quantity (+)</Label>
            <Input type="number" min={1} value={qty} onChange={e=>setQty(e.target.value)} placeholder="10" />
            <p className="text-[11px] text-[#6E6E73] mt-1">New Stock: <span className="font-semibold text-[#111111]">{newStock}</span> {newStock!==current && <span className="text-[#059669]">(+{qNum})</span>}</p>
          </div>
          <div>
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
              <SelectContent>{REASONS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Input className="mt-2" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Or type reason" />
          </div>
          <div>
            <Label>Reference (optional)</Label>
            <Input value={refId} onChange={e=>setRefId(e.target.value)} placeholder="PO-123 / SUP-..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Stock'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RemoveStockDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (v: boolean) => void; product: any }) {
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState('')
  const [refId, setRefId] = useState('')
  const [type, setType] = useState('STOCK_REMOVED')
  const [removeStock, { isLoading }] = useRemoveStockMutation()
  const current = Number(product?.quantity || 0)
  const qNum = Number(qty)
  const newStock = !isNaN(qNum) && qNum>0 ? Math.max(current - qNum, 0) : current
  const available = Number(product?.availableStock ?? current)

  const submit = async () => {
    if (!qNum || qNum<=0 || !Number.isInteger(qNum)) return toast.error('Quantity must be positive integer')
    if (qNum>available) return toast.error(`Insufficient available stock (${available})`)
    if (!reason.trim()) return toast.error('Reason required')
    try {
      await removeStock({ productId: product._id, quantity: qNum, reason, referenceId: refId, type }).unwrap()
      toast.success('Stock removed')
      onOpenChange(false); setQty(''); setReason(''); setRefId('')
    } catch(e:any){ toast.error(e?.data?.error||'Failed')}
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[14px] max-w-[480px]">
        <DialogHeader><DialogTitle>Remove Stock</DialogTitle><DialogDescription>Deduct inventory — requires reason</DialogDescription></DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="rounded-[10px] bg-[#F5F5F7] p-3 flex justify-between text-[13px]"><span className="text-[#6E6E73]">Current / Available</span><span className="font-bold">{current} / {available}</span></div>
          <div><Label>Quantity (-)</Label><Input type="number" min={1} max={available} value={qty} onChange={e=>setQty(e.target.value)} placeholder="5" /><p className="text-[11px] text-[#6E6E73] mt-1">New Stock: <span className="font-semibold">{newStock}</span> {newStock!==current && <span className="text-red-600">(-{qNum})</span>}</p></div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK_REMOVED">Stock Removed</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
                <SelectItem value="ADJUSTMENT">Manual Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger><SelectContent>{REASONS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
            <Input className="mt-2" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Or type reason" />
          </div>
          <div><Label>Reference (optional)</Label><Input value={refId} onChange={e=>setRefId(e.target.value)} placeholder="REF-..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button><Button variant="destructive" onClick={submit} disabled={isLoading}>{isLoading?'Removing...':'Remove Stock'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdjustStockDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (v: boolean)=>void; product:any }) {
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [refId, setRefId] = useState('')
  const [adjustStock,{isLoading}] = useAdjustStockMutation()
  const current = Number(product?.quantity||0)
  const dNum = Number(delta)
  const newStock = !isNaN(dNum) && delta!=='' ? current + dNum : current
  const submit = async()=>{
    if (!delta || isNaN(dNum) || dNum===0 || !Number.isInteger(dNum)) return toast.error('Adjustment must be non-zero integer')
    if (newStock<0) return toast.error('Resulting stock cannot be negative')
    if (!reason.trim()) return toast.error('Reason required')
    try{
      await adjustStock({ productId: product._id, adjustment: dNum, reason, referenceId: refId }).unwrap()
      toast.success('Adjusted')
      onOpenChange(false); setDelta(''); setReason(''); setRefId('')
    }catch(e:any){toast.error(e?.data?.error||'Failed')}
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[14px] max-w-[480px]">
        <DialogHeader><DialogTitle>Adjust Inventory</DialogTitle><DialogDescription>Manual correction — positive or negative</DialogDescription></DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="rounded-[10px] bg-[#F5F5F7] p-3 flex justify-between text-[13px]"><span className="text-[#6E6E73]">Current Stock</span><span className="font-bold">{current}</span></div>
          <div><Label>Adjustment (e.g. -5 or +10)</Label><Input type="number" value={delta} onChange={e=>setDelta(e.target.value)} placeholder="-5" /><p className="text-[11px] text-[#6E6E73] mt-1">New Stock: <span className="font-semibold">{newStock}</span> {dNum!==0 && delta!=='' && <span className={dNum>0?'text-[#059669]':'text-red-600'}>({dNum>0?`+${dNum}`:dNum})</span>}</p></div>
          <div><Label>Reason *</Label><Select value={reason} onValueChange={setReason}><SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger><SelectContent>{REASONS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><Input className="mt-2" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Damaged products, inventory count..." /></div>
          <div><Label>Reference (optional)</Label><Input value={refId} onChange={e=>setRefId(e.target.value)} placeholder="REF-..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={isLoading}>{isLoading?'Adjusting...':'Adjust Stock'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UpdatePriceDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange:(v:boolean)=>void; product:any }) {
  const [price, setPrice] = useState('')
  const [reason, setReason] = useState('')
  const [updatePrice,{isLoading}] = useUpdatePriceMutation()
  const current = Number(product?.price||0)
  const n = Number(price)
  const diff = !isNaN(n) ? n - current : 0
  const submit = async()=>{
    if (isNaN(n) || n<0) return toast.error('Price must be >=0')
    if (n===current) return toast.error('Same as current price')
    try{
      await updatePrice({ productId: product._id, newPrice: n, reason }).unwrap()
      toast.success('Price updated')
      onOpenChange(false); setPrice(''); setReason('')
    }catch(e:any){toast.error(e?.data?.error||'Failed')}
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[14px] max-w-[480px]">
        <DialogHeader><DialogTitle>Update Price</DialogTitle><DialogDescription>Current ₱{current.toLocaleString()}</DialogDescription></DialogHeader>
        <div className="grid gap-3 py-2">
          <div><Label>New Price</Label><Input type="number" min={0} value={price} onChange={e=>setPrice(e.target.value)} placeholder={String(current)} />
            {price && !isNaN(n) && <p className="text-[11px] mt-1"><span className="text-[#6E6E73]">Difference</span> <span className={diff>=0?'text-[#059669]':'text-red-600'}>{diff>=0?'+':''}₱{diff.toLocaleString()}</span> <span className="text-[#6E6E73]">{current} → {n}</span></p>}
          </div>
          <div><Label>Reason</Label><Input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Promotional pricing, supplier cost..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={isLoading}>{isLoading?'Updating...':'Update Price'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
