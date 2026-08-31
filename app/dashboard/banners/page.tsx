'use client'
import { useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Image from 'next/image'
import { Image as ImageLucide, Plus, Trash2, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { fileBase64 } from '@/utils/helper'
import { useGetDashboardBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } from '@/store/action/bannerAction'
import { useGetDashboardBranchesQuery } from '@/store/action/branchAction'
import { useSession } from 'next-auth/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Banner = { _id: string; title: string; subtitle: string; image: string; link: string; order: number; active: boolean }

export default function BannersPage() {
  const { data: session } = useSession()
  const isAdmin = (session as any)?.user?.role === 'admin'
  const [branchId, setBranchId] = useState('all')
  const { data: branchData } = useGetDashboardBranchesQuery({}, { skip: !isAdmin })
  const branches: any[] = branchData?.branches || []
  const { data, isLoading: loading } = useGetDashboardBannersQuery({ branchId: isAdmin ? branchId : undefined })
  const banners: Banner[] = data?.banners || []
  const [createBanner] = useCreateBannerMutation()
  const [updateBanner] = useUpdateBannerMutation()
  const [deleteBanner] = useDeleteBannerMutation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '/store', order: 0 })

  const reset = () => { setForm({ title: '', subtitle: '', image: '', link: '/store', order: 0 }); setEditing(null) }

  const submit = async () => {
    if (!form.title || !form.image) return toast.error('Title and image required')
    if (isAdmin && (!branchId || branchId === 'all')) return toast.error('Admin must select a branch before adding banner')
    try {
      if (editing) {
        await updateBanner({ _id: editing._id, ...form } as any).unwrap()
        toast.success('Banner updated')
      } else {
        await createBanner({ ...form, branchId: isAdmin ? branchId : undefined } as any).unwrap()
        toast.success('Banner created')
      }
      setOpen(false); reset()
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete banner?')) return
    try {
      await deleteBanner({ id }).unwrap()
      toast.success('Deleted')
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }
  const toggleActive = async (b: Banner) => {
    try {
      await updateBanner({ _id: b._id, active: !b.active }).unwrap()
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><ImageLucide className="h-5 w-5" /> Banners — Image Slider</h1>
          <p className="text-[13px] text-[#6E6E73]">Manage landing page slider. {isAdmin ? 'Select branch before adding.' : 'Branch scoped.'} Order controls sequence.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && branches.length > 0 && (
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Branches</SelectItem>{branches.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button onClick={() => { if (isAdmin && (branchId === 'all' || !branchId)) return toast.error('Admin must select a branch before adding banner'); reset(); setOpen(true) }}><Plus className="h-4 w-4 mr-1" /> New Banner</Button>
        </div>
      </div>

      <div className="rounded-[14px] border border-gray-100 bg-white p-4">
        {loading ? <p className="text-[13px] text-[#6E6E73]">Loading...</p> : banners.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center"><ImageLucide className="h-5 w-5 text-[#111111]" /></div>
            <p className="text-[13px] font-medium text-[#6E6E73]">No banners yet — add image slider in admin, shows on landing page.</p>
            <Button variant="outline" onClick={() => setOpen(true)}>Create banner</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {banners.map((b) => (
              <div key={b._id} className="flex gap-4 rounded-[12px] border border-gray-100 p-3 items-center">
                <div className="h-[80px] w-[160px] rounded-[8px] overflow-hidden bg-[#F5F5F7] relative shrink-0">
                  <Image src={b.image} alt={b.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{b.title}</p>
                  <p className="text-[12px] text-[#6E6E73] truncate">{b.subtitle || '—'} • order {b.order} • link {b.link}</p>
                  <div className="mt-1 flex gap-2">
                    <button onClick={() => toggleActive(b)} className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${b.active ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' : 'bg-gray-50 text-[#6B7280] border-gray-200'}`}>{b.active ? 'Active' : 'Hidden'}</button>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, order: b.order }); setOpen(true) }} className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#F5F5F7]"><Pencil className="h-4 w-4 text-[#374151]" /></button>
                  <button onClick={() => remove(b._id)} className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="max-w-[560px] rounded-[14px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle><DialogDescription>Image slider editable in admin — shows on landing page.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold">Image *</label>
              <div className="min-h-[120px] border-2 border-dashed border-gray-200 rounded-[10px] p-2 flex items-center justify-center bg-gray-50/50">
                <div className="w-full">
                  {form.image ? (
                    <div className="relative h-[140px] w-full rounded-[8px] overflow-hidden">
                      <Image src={form.image} alt="preview" fill className="object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute top-1 right-1 bg-white rounded-full p-1 border shadow"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4 w-full">
                      <p className="text-[12px] text-[#6E6E73]">Paste image URL or upload file</p>
                      <Input placeholder="https://... image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                      <div className="w-full flex flex-col items-center gap-1">
                        <p className="text-[11px] text-[#86868b]">or choose file (recommended 1200×500)</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const base64 = await fileBase64(file)
                              setForm((prev) => ({ ...prev, image: base64 }))
                              toast.success('Image loaded — will be saved as base64')
                            } catch {
                              toast.error('Failed to load image')
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            <Input placeholder="Link (e.g. /store or /product/ID)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            <Input placeholder="Order (0 = first)" type="number" value={String(form.order)} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            <Button onClick={submit}>{editing ? 'Update Banner' : 'Create Banner'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
