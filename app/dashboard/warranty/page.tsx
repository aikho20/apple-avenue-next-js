'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck, Trash2, Search, Clock, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import { useSession } from 'next-auth/react'
import { useGetDashboardWarrantiesQuery, useUpdateWarrantyMutation, useDeleteDashboardWarrantyMutation, useCreateDashboardWarrantyMutation } from '@/store/action/warrantyAction'
import { useGetDashboardBranchesQuery } from '@/store/action/branchAction'

type Warranty = {
  _id: string
  product: string
  productName: string
  imei: string
  serialNumber: string
  orderId: string
  user: string
  userEmail: string
  userName: string
  purchaseDate: string
  warrantyStart: string
  warrantyExpiration: string
  status: string
  notes: string
  createdAt: string
}

export default function WarrantyDashboardPage() {
  const { data: session } = useSession()
  const isAdmin = (session as any)?.user?.role === 'admin'
  const [branchId, setBranchId] = useState('all')
  const { data: branchData } = useGetDashboardBranchesQuery({}, { skip: !isAdmin })
  const branches: any[] = branchData?.branches || []
  const { data: warrantyData, isLoading: loading } = useGetDashboardWarrantiesQuery({ branchId: isAdmin ? branchId : undefined })
  const warranties: Warranty[] = warrantyData?.warranties || []
  const [updateWarranty] = useUpdateWarrantyMutation()
  const [deleteWarranty] = useDeleteDashboardWarrantyMutation()
  const [createWarranty, { isLoading: submitting }] = useCreateDashboardWarrantyMutation()
  const [q, setQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ userEmail: '', productId: '', orderId: '', imei: '', serialNumber: '', purchaseDate: new Date().toISOString().slice(0, 10) })
  const merchant = (session as any)?.user?._id || ''
  const { data: productData } = useGetStoreProductQuery(isAdmin && branchId !== 'all' ? { branchId } : isAdmin && branchId === 'all' ? { branchId: 'all' } as any : { merchantId: merchant })
  const products: any[] = (productData?.product || []) as any[]

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateWarranty({ _id: id, status }).unwrap()
      toast.success(`Status → ${status}`)
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete warranty?')) return
    try {
      await deleteWarranty({ id }).unwrap()
      toast.success('Deleted')
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  const filtered = warranties.filter((w) => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false
    if (!q) return true
    const hay = `${w.productName} ${w.imei} ${w.serialNumber} ${w.userEmail}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  const isExpired = (w: Warranty) => new Date(w.warrantyExpiration) < new Date()

  const register = async () => {
    if (!form.userEmail || !form.productId || !form.imei || !form.serialNumber || !form.purchaseDate) return toast.error('All fields required: customer email, product, IMEI, serial, purchase date')
    if (isAdmin && (!branchId || branchId === 'all')) return toast.error('Admin must select a branch before registering warranty')
    try {
      await createWarranty({ userEmail: form.userEmail, productId: form.productId, orderId: form.orderId || undefined, imei: form.imei, serialNumber: form.serialNumber, purchaseDate: form.purchaseDate, branchId: isAdmin ? branchId : undefined } as any).unwrap()
      toast.success('Warranty registered for customer')
      setShowForm(false)
      setForm({ userEmail: '', productId: '', orderId: '', imei: '', serialNumber: '', purchaseDate: new Date().toISOString().slice(0, 10) })
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Warranty — {isAdmin ? 'Admin' : 'Branch'}</h1>
          <p className="text-[13px] text-[#6E6E73]">Only admin/branch can register device warranties. {isAdmin ? 'Select branch before registering.' : 'Branch scoped.'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && branches.length > 0 && (
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Branches</SelectItem>{branches.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button size="sm" onClick={() => { if (isAdmin && (!branchId || branchId === 'all')) return toast.error('Admin must select a branch before registering warranty'); setShowForm(!showForm) }} className="bg-[#111111] hover:bg-black"><Plus className="h-3.5 w-3.5 mr-1" /> {showForm ? 'Close' : 'Register Device'}</Button>
          <span className="text-[12px] bg-[#F5F5F7] rounded-full px-3 py-1 text-[#6E6E73]">{filtered.length} / {warranties.length}</span>
        </div>
      </div>

      {showForm && (
        <Card className="p-5 flex flex-col gap-4 border-[#111111]/10">
          <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Register Device Warranty (Admin Only)</h3>
          <p className="text-[11px] text-[#6E6E73]">Enter customer email (even if not registered yet — guest warranty will be created and will appear when they sign up with that email), select product, IMEI/serial, purchase date, and order ID (optional but must belong to customer and contain product if provided).</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#424245]">Customer Email *</label>
              <Input placeholder="customer@example.com" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#424245]">Product *</label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger className="h-[40px] rounded-[9px] border-gray-100"><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => <SelectItem key={p._id} value={p._id}>{p.productName} — {p.category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#424245]">IMEI *</label>
              <Input placeholder="354901012345678" value={form.imei} onChange={(e) => setForm({ ...form, imei: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#424245]">Serial Number *</label>
              <Input placeholder="F17LQ01234" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#424245]">Purchase Date *</label>
              <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#424245]">Order ID (optional)</label>
              <Input placeholder="Paste order _id if tied to order" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} />
            </div>
          </div>
          <Button onClick={register} disabled={submitting} className="w-fit bg-[#111111] hover:bg-black">{submitting ? 'Registering...' : 'Register Warranty'}</Button>
        </Card>
      )}

      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
          <Input placeholder="Search IMEI, serial, product, email..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] h-[40px] rounded-[9px] border-gray-100"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Void">Void</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {loading ? <p className="text-[13px] text-[#6E6E73]">Loading...</p> : filtered.length === 0 ? (
        <Card className="p-10 flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center"><ShieldCheck className="h-5 w-5 text-[#111111]" /></div>
          <p className="text-[13px] font-medium text-[#6E6E73]">No warranties yet</p>
          <p className="text-[12px] text-[#9CA3AF]">Customers register via /warranty — they appear here.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((w) => {
            const expired = isExpired(w)
            return (
              <Card key={w._id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{w.productName} • <span className="font-normal text-[#6E6E73]">{w.product.slice(0, 8)}</span></p>
                    <p className="text-[12px] text-[#6E6E73]">Customer: {w.userName || w.userEmail} • {w.userEmail}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Order: {w.orderId || '—'} • IMEI: {w.imei} • SN: {w.serialNumber}</p>
                    <p className="text-[11px] text-[#6E6E73] flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> Purchase: {new Date(w.purchaseDate).toLocaleDateString()} → Expires: {new Date(w.warrantyExpiration).toLocaleDateString()} {expired && <span className="text-red-600 font-semibold">• Expired</span>}</p>
                  </div>
                  <span className={`h-fit text-[11px] font-bold px-2.5 py-1 rounded-full border ${w.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : w.status === 'Expired' ? 'bg-red-50 text-red-600 border-red-200' : w.status === 'Void' ? 'bg-gray-100 text-[#6E6E73] border-gray-200' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>{w.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={w.status} onValueChange={(v) => updateStatus(w._id, v)}>
                    <SelectTrigger className="w-[140px] h-8 rounded-[8px] border-gray-100 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Void">Void</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={async () => {
                    const ext = prompt('Extend warranty expiration (YYYY-MM-DD)', new Date(w.warrantyExpiration).toISOString().slice(0,10))
                    if (!ext) return
                    try {
                      await updateWarranty({ _id: w._id, warrantyExpiration: ext } as any).unwrap()
                      toast.success('Extended')
                    } catch (e: any) {
                      toast.error(e?.data?.error || 'Failed')
                    }
                  }}>Extend</Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(w._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                </div>
                {w.notes && <p className="text-[11px] text-[#86868b] bg-[#F5F5F7] rounded px-2 py-1">{w.notes}</p>}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
