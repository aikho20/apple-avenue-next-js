'use client'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, Trash2, Folder, Package, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import { useSession } from 'next-auth/react'

type Collection = { _id: string; name: string; description: string; image: string; productIds: string[]; createdAt: string }

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [image, setImage] = useState('')
  const [creating, setCreating] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [activeCol, setActiveCol] = useState<Collection | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')

  const { data: session } = useSession()
  const merchant = (session as any)?.user?._id || ''
  const { data: productData } = useGetStoreProductQuery({ merchantId: merchant })
  const products: any[] = (productData?.product || []) as any[]

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/store/dashboard/collection')
      const data = await res.json()
      setCollections(data.collections || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const create = async () => {
    if (!name.trim()) return toast.error('Name required')
    setCreating(true)
    const res = await fetch('/api/store/dashboard/collection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, image }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Collection created — now add products via Manage')
      setName(''); setDesc(''); setImage('')
      fetchData()
    } else toast.error(data.error || 'Failed')
    setCreating(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete collection?')) return
    await fetch(`/api/store/dashboard/collection?id=${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetchData()
  }

  const openManage = (c: Collection) => {
    setActiveCol(c)
    setSelected(new Set(c.productIds || []))
    setQ('')
    setManageOpen(true)
  }

  const toggleProd = (id: string) => {
    const n = new Set(selected)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    setSelected(n)
  }

  const saveProducts = async () => {
    if (!activeCol) return
    const res = await fetch('/api/store/dashboard/collection', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: activeCol._id, productIds: Array.from(selected) }),
    })
    const data = await res.json()
    if (res.ok) { toast.success(`Saved ${selected.size} products to "${activeCol.name}" — will show on landing page`); setManageOpen(false); fetchData() }
    else toast.error(data.error || 'Failed')
  }

  const filteredProducts = useMemo(() => {
    if (!q) return products
    return products.filter((p) => p.productName.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
  }, [products, q])

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Collections</h1>
          <p className="text-[13px] text-[#6E6E73]">Create collections, add products, and they appear on the landing page automatically.</p>
        </div>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Create collection</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Collection name e.g. Best Sellers" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Image URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} />
        </div>
        <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button onClick={create} disabled={creating} className="w-fit">
          <Plus className="h-4 w-4" /> {creating ? 'Creating...' : 'Create'}
        </Button>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-[13px] text-[#6E6E73]">Loading...</p>
        ) : collections.length === 0 ? (
          <Card className="sm:col-span-2 p-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <Folder className="h-5 w-5 text-[#111111]" />
            </div>
            <p className="text-[13px] font-medium text-[#6E6E73]">No collections yet</p>
            <p className="text-[12px] text-[#9CA3AF]">Create a collection and add products to show on landing page</p>
          </Card>
        ) : (
          collections.map((c) => (
            <Card key={c._id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1D1D1F]">{c.name}</p>
                  <p className="text-[12px] text-[#6E6E73]">{c.description || 'No description'}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">{new Date(c.createdAt).toLocaleDateString()} • {c.productIds?.length || 0} products</p>
                </div>
                <button
                  onClick={() => remove(c._id)}
                  className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#F5F5F7]"
                >
                  <Trash2 className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>
              {c.image && <div className="h-[120px] rounded-[8px] overflow-hidden bg-[#F5F5F7] relative"><Image src={c.image} alt={c.name} fill className="object-cover" /></div>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openManage(c)} className="flex-1"><Package className="h-3.5 w-3.5 mr-1" /> Manage products ({c.productIds?.length || 0})</Button>
                <Button size="sm" variant="ghost" onClick={() => window.open('/', '_blank')}>Preview</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-[720px] max-h-[85vh] overflow-hidden flex flex-col rounded-[14px]">
          <DialogHeader>
            <DialogTitle>Manage products — {activeCol?.name}</DialogTitle>
            <DialogDescription>Select products to add to this collection. Saved collection shows on landing page.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-[260px]" />
            <span className="text-[12px] text-[#6E6E73]">{selected.size} selected</span>
          </div>
          <div className="flex-1 overflow-y-auto grid gap-2 pr-1" style={{ maxHeight: '50vh' }}>
            {filteredProducts.length === 0 ? <p className="text-[13px] text-[#6E6E73] py-6 text-center">No products</p> : filteredProducts.map((p) => {
              const isSel = selected.has(p._id)
              return (
                <div key={p._id} onClick={() => toggleProd(p._id)} className={`flex gap-3 rounded-[10px] border p-3 cursor-pointer items-center ${isSel ? 'border-[#111111] bg-[#F5F5F7]' : 'border-gray-100 bg-white hover:bg-[#F5F5F7]'}`}>
                  <div className="h-12 w-12 rounded-[8px] overflow-hidden bg-[#F5F5F7] relative shrink-0">
                    <Image src={Array.isArray(p.images) ? p.images[0] : p.images || '/placeholder.jpg'} alt={p.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1D1D1F] truncate">{p.productName}</p>
                    <p className="text-[11px] text-[#6E6E73]">{p.category} • ₱{Number(p.price).toLocaleString()} • {p.status}</p>
                  </div>
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center ${isSel ? 'bg-[#111111] border-[#111111] text-white' : 'border-gray-200 bg-white'}`}>
                    {isSel && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
            <Button variant="outline" onClick={() => setManageOpen(false)}>Cancel</Button>
            <Button onClick={saveProducts} className="bg-[#111111] hover:bg-black">Save ({selected.size})</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
