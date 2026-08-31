'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { StoreIcon, Plus, Trash2, Pencil, MapPin, Search, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useGetDashboardBranchesQuery, useCreateBranchMutation, useUpdateBranchMutation, useDeleteBranchMutation } from '@/store/action/branchAction'

export default function BranchesPage() {
  const { data: session } = useSession()
  const role = (session as any)?.user?.role
  const isAdmin = role === 'admin'
  const { data, isLoading } = useGetDashboardBranchesQuery({})
  const branches: any[] = data?.branches || []
  const [createBranch, { isLoading: creating }] = useCreateBranchMutation()
  const [updateBranch] = useUpdateBranchMutation()
  const [deleteBranch] = useDeleteBranchMutation()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: '', address: '', city: '', province: '', barangay: '', zipCode: '', latitude: '', longitude: '', phone: '', email: '', image: '', managerEmail: '', managerPassword: '', managerName: ''
  })
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // admin: all, active, inactive - but for now search only

  const reset = () => { setForm({ name: '', address: '', city: '', province: '', barangay: '', zipCode: '', latitude: '', longitude: '', phone: '', email: '', image: '', managerEmail: '', managerPassword: '', managerName: '' }); setEditing(null) }

  const submit = async () => {
    if (!form.name || !form.address || !form.latitude || !form.longitude) return toast.error('Name, address, lat/lng required')
    if (!editing && (!form.managerEmail || !form.managerPassword)) return toast.error('Manager email/password required')
    try {
      if (editing) {
        await updateBranch({ _id: editing._id, name: form.name, address: form.address, city: form.city, province: form.province, barangay: form.barangay, zipCode: form.zipCode, latitude: Number(form.latitude), longitude: Number(form.longitude), phone: form.phone, email: form.email, image: form.image }).unwrap()
        toast.success('Branch updated')
      } else {
        await createBranch({ name: form.name, address: form.address, city: form.city, province: form.province, barangay: form.barangay, zipCode: form.zipCode, latitude: Number(form.latitude), longitude: Number(form.longitude), phone: form.phone, email: form.email, image: form.image, managerEmail: form.managerEmail, managerPassword: form.managerPassword, managerName: form.managerName }).unwrap()
        toast.success('Branch created with branch account')
      }
      setOpen(false); reset()
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete branch? Manager will be demoted to user.')) return
    try {
      await deleteBranch({ id }).unwrap()
      toast.success('Deleted')
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  const filtered = branches.filter((b: any) => {
    if (!q) return true
    const hay = `${b.name} ${b.address} ${b.city} ${b.province} ${b.managerEmail}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm({ ...form, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) })
      toast.success('Location filled')
    }, () => toast.error('Failed to get location'))
  }

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><Building2 className="h-5 w-5" /> {isAdmin ? 'Branches — All' : 'My Branch'}</h1>
          <p className="text-[12px] sm:text-[13px] text-[#6B7280]">{isAdmin ? 'Admin can create branches, branch accounts manage own branch' : 'Manage your branch — products, inventory, etc. are scoped to this branch'}</p>
        </div>
        {isAdmin && <Button onClick={() => { reset(); setOpen(true) }}><Plus className="h-4 w-4 mr-1" /> New Branch</Button>}
      </div>

      <Card className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[360px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
          <Input placeholder="Search branch name, address, manager..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
        <div className="text-[12px] text-[#6B7280] flex items-center gap-2">
          <span className="hidden sm:inline bg-[#F5F5F7] rounded-full px-3 py-1">{filtered.length} / {branches.length} branches</span>
        </div>
      </Card>

      {isLoading ? <p className="text-[13px] text-[#6B7280]">Loading...</p> : filtered.length === 0 ? (
        <Card className="p-10 flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center"><StoreIcon className="h-5 w-5 text-[#111111]" /></div>
          <p className="text-[13px] font-medium text-[#6B7280]">No branches yet</p>
          <p className="text-[12px] text-[#9CA3AF]">{isAdmin ? 'Create a branch with manager account to enable branch isolation' : 'No branch assigned'}</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((b: any) => (
            <Card key={b._id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1D1D1F] flex items-center gap-1.5"><StoreIcon className="h-4 w-4" /> {b.name} {b.isActive ? <span className="text-[10px] bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-2 py-0.5 rounded-full">Active</span> : <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Inactive</span>}</p>
                  <p className="text-[12px] text-[#6E6E73] mt-1 flex items-start gap-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {b.address}{b.city ? `, ${b.city}` : ''}{b.province ? `, ${b.province}` : ''}</p>
                  <p className="text-[11px] text-[#9CA3AF]">Manager: {b.managerName || b.managerEmail} • {b.managerEmail}</p>
                  <p className="text-[11px] text-[#9CA3AF]">Lat {b.latitude} Lng {b.longitude} {b.phone ? `• ${b.phone}` : ''}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(b); setForm({ name: b.name, address: b.address, city: b.city || '', province: b.province || '', barangay: b.barangay || '', zipCode: b.zipCode || '', latitude: String(b.latitude), longitude: String(b.longitude), phone: b.phone || '', email: b.email || '', image: b.image || '', managerEmail: b.managerEmail || '', managerPassword: '', managerName: '' }); setOpen(true) }}><Pencil className="h-3.5 w-3.5" /></Button>
                  {isAdmin && <Button size="sm" variant="ghost" onClick={() => remove(b._id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
              </div>
              {b.image && <div className="h-[120px] rounded-[8px] overflow-hidden bg-[#F5F5F7] relative"><img src={b.image} alt={b.name} className="w-full h-full object-cover" /></div>}
              <div className="flex gap-2 text-[11px]">
                <span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 text-[#6B7280]">{new Date(b.createdAt).toLocaleDateString()}</span>
                <span className="rounded-full bg-white border border-gray-200 px-2.5 py-1">ID {b._id.slice(-6)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-auto rounded-[14px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Branch' : 'New Branch — Create Branch Account'}</DialogTitle><DialogDescription>{editing ? 'Update branch details (manager change via admin)' : 'Creates branch + branch manager account (role branch). Manager can login and manage own branch.'}</DialogDescription></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1"><Label>Branch Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Apple Avenue - SM Megamall" /></div>
              <div className="flex flex-col gap-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0917..." /></div>
            </div>
            <div className="flex flex-col gap-1"><Label>Address *</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="3F SM Megamall, EDSA..." /></div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="Province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
              <Input placeholder="Barangay" value={form.barangay} onChange={(e) => setForm({ ...form, barangay: e.target.value })} />
            </div>
            <Input placeholder="Zip" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1"><Label>Latitude *</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="14.584" /></div>
              <div className="flex flex-col gap-1"><Label>Longitude *</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="121.059" /></div>
            </div>
            <Button variant="outline" size="sm" onClick={useCurrentLocation}>Use my current location</Button>
            <Input placeholder="Branch email (public)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            {!editing && (
              <>
                <div className="h-px bg-gray-100 my-1" />
                <p className="text-[12px] font-semibold">Branch Manager Account</p>
                <Input placeholder="Manager name" value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} />
                <Input placeholder="Manager email * (login)" value={form.managerEmail} onChange={(e) => setForm({ ...form, managerEmail: e.target.value })} />
                <Input placeholder="Manager password *" type="password" value={form.managerPassword} onChange={(e) => setForm({ ...form, managerPassword: e.target.value })} />
              </>
            )}
            <Button onClick={submit} disabled={creating}>{creating ? 'Saving...' : editing ? 'Update Branch' : 'Create Branch + Account'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
