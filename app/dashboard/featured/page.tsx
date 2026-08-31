'use client'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Star, Search, Check, Eye } from 'lucide-react'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import { useUpdateProductMutation } from '@/store/action/productAction'
import { useSession } from 'next-auth/react'
import { useGetDashboardBranchesQuery } from '@/store/action/branchAction'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

export default function FeaturedPage() {
  const { data: session } = useSession()
  const merchant = (session as any)?.user?._id || ''
  const isAdmin = (session as any)?.user?.role === 'admin'
  const [branchId, setBranchId] = useState('all')
  const { data: branchData } = useGetDashboardBranchesQuery({}, { skip: !isAdmin })
  const branches: any[] = branchData?.branches || []
  const { data, isLoading } = useGetStoreProductQuery(
    isAdmin && branchId !== 'all' ? { branchId } : isAdmin && branchId === 'all' ? { branchId: 'all' } as any : { merchantId: merchant }
  )
  const [query, setQuery] = useState('')
  const canManage = !isAdmin || branchId !== 'all'

  const products: any[] = (data?.product || []) as any[]
  const featured = useMemo(() => products.filter((p) => p.isFeatured), [products])
  const filtered = useMemo(() => {
    if (!query) return products
    return products.filter((p) => p.productName.toLowerCase().includes(query.toLowerCase()))
  }, [products, query])
  const [updateProduct] = useUpdateProductMutation()

  const toggleFeatured = async (p: any) => {
    if (!canManage) return toast.error('Admin must select a branch before managing featured')
    try {
      await updateProduct({ _id: p._id, isFeatured: !p.isFeatured } as any).unwrap()
      toast.success(!p.isFeatured ? 'Added to Featured — shows on landing page' : 'Removed from Featured')
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed')
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2"><Star className="h-5 w-5 text-[#111111]" /> Featured — Custom Landing Collection</h1>
          <p className="text-[13px] text-[#6E6E73]">Create custom featured products that will show in the landing page. {isAdmin ? 'Select branch before managing.' : 'Branch scoped.'} Toggle Featured — homepage updates instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && branches.length > 0 && (
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Branch" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Branches</SelectItem>{branches.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <div className="text-[12px] text-[#6E6E73] bg-[#F5F5F7] rounded-full px-3 py-1 shrink-0">{featured.length} featured / {products.length} total</div>
        </div>
      </div>
      {isAdmin && !canManage && (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">Admin must select a branch before managing featured — choose a branch from the dropdown.</div>
      )}

      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#86868b]" />
          <Input placeholder="Search products to feature..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-[320px]" />
        </div>

        <div className="grid gap-3">
          {isLoading ? <p className="text-[13px] text-[#6E6E73]">Loading...</p> : filtered.length === 0 ? <p className="text-[13px] text-[#6E6E73]">No products found</p> : filtered.map((p) => (
            <div key={p._id} className={`flex gap-3 rounded-[12px] border p-3 items-center ${p.isFeatured ? 'border-[#111111] bg-[#F5F5F7]' : 'border-gray-100 bg-white'}`}>
              <div className="h-12 w-12 rounded-[8px] overflow-hidden bg-[#F5F5F7] relative shrink-0">
                <Image src={Array.isArray(p.images) ? p.images[0] : p.images || '/placeholder.jpg'} alt={p.productName} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{p.productName}</p>
                <p className="text-[12px] text-[#6E6E73] truncate">{p.category} • ₱{Number(p.price).toLocaleString()} • {p.status}</p>
              </div>
              <Button size="sm" variant={p.isFeatured ? 'default' : 'outline'} className={p.isFeatured ? 'bg-[#111111] hover:bg-black' : ''} onClick={() => toggleFeatured(p)}>
                {p.isFeatured ? <><Check className="h-3.5 w-3.5 mr-1" /> Featured</> : 'Make Featured'}
              </Button>
            </div>
          ))}
        </div>

        {featured.length > 0 && (
          <div className="rounded-[12px] bg-[#F5F5F7] p-3">
            <p className="text-[12px] font-semibold text-[#1D1D1F] flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Preview — Landing page Featured Collection ({featured.length})</p>
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {featured.map((p) => (
                <div key={p._id} className="h-16 w-16 rounded-[8px] overflow-hidden bg-white border border-gray-100 relative shrink-0">
                  <Image src={Array.isArray(p.images) ? p.images[0] : p.images || '/placeholder.jpg'} alt={p.productName} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
