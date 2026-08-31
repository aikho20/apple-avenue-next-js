'use client'
import { useMemo, useState } from 'react'
import { useGetInventoryQuery } from '@/store/action/inventoryAction'
import { InventoryStats } from '@/components/inventory/inventory-stats'
import { ProductHistory } from '@/components/inventory/inventory-history'
import { AddStockDialog, RemoveStockDialog, AdjustStockDialog, UpdatePriceDialog } from '@/components/inventory/inventory-actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import { Search, RefreshCw, Package, Plus, Minus, SlidersHorizontal, DollarSign, History, ArrowUpDown, StoreIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useGetDashboardBranchesQuery } from '@/store/action/branchAction'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [branchId, setBranchId] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [selected, setSelected] = useState<any>(null)
  const [action, setAction] = useState<'add' | 'remove' | 'adjust' | 'price' | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const { data: session } = useSession()
  const isAdmin = (session as any)?.user?.role === 'admin'
  const { data: branchData } = useGetDashboardBranchesQuery({}, { skip: !isAdmin })
  const branches: any[] = branchData?.branches || []

  const { data, isLoading, isFetching, error, refetch } = useGetInventoryQuery({ search: search || undefined, status: status !== 'all' ? status : undefined, category: category !== 'all' ? category : undefined, branchId: isAdmin ? (branchId !== 'all' ? branchId : 'all') : undefined })
  const canManage = !isAdmin || branchId !== 'all'
  const products: any[] = data?.products || []
  const stats = data?.stats
  const categories: string[] = data?.categories || []

  const filtered = useMemo(() => products, [products])
  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1)
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  const onSearchReset = () => { setSearch(''); setStatus('all'); setCategory('all'); setBranchId('all'); setPage(1) }

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#1F2937]">Inventory</h1>
          <p className="text-[12px] sm:text-[13px] text-[#6B7280]">Auditable stock & price — available = total - reserved. Every change creates history.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="self-start sm:self-auto"><RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Refresh</Button>
      </div>

      <InventoryStats stats={stats} isLoading={isLoading} />
      {isAdmin && !canManage && (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">Admin must select a branch before managing inventory — choose a branch from the dropdown.</div>
      )}

      <Card className="p-3 sm:p-4 space-y-3 overflow-hidden">
        <div className="flex flex-col gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search product or SKU..." className="pl-9" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            {isAdmin && branches.length > 0 && (
              <Select value={branchId} onValueChange={v => { setBranchId(v); setPage(1) }}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Branch" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={v => { setCategory(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[64px] w-full" />)}
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-[13px] text-red-600">Failed to load inventory</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-2 text-center">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center"><Package className="h-5 w-5 text-[#111111]" /></div>
            <p className="text-[13px] font-medium text-[#6E6E73]">{search || status !== 'all' || category !== 'all' ? 'No matching inventory' : 'No inventory yet'}</p>
            <p className="text-[12px] text-[#9CA3AF]">{search ? `No results for "${search}"` : 'Add products to see inventory'}</p>
            {(search || status !== 'all' || category !== 'all') && <Button variant="outline" size="sm" onClick={onSearchReset}>Clear filters</Button>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-3 sm:mx-0 rounded-[10px] border border-gray-100">
              <div className="min-w-[860px]">
              <table className="w-full text-[13px]">
                <thead className="bg-[#F5F5F7] text-[11px] font-bold tracking-[0.06em] text-[#6B7280] uppercase">
                  <tr>
                    <th className="text-left px-3 py-2.5">Product</th>
                    <th className="text-left px-3 py-2.5">SKU</th>
                    <th className="text-right px-3 py-2.5">Total</th>
                    <th className="text-right px-3 py-2.5">Reserved</th>
                    <th className="text-right px-3 py-2.5">Available</th>
                    <th className="text-left px-3 py-2.5">Status</th>
                    <th className="text-right px-3 py-2.5">Price</th>
                    <th className="text-right px-3 py-2.5 hidden lg:table-cell">Cost</th>
                    <th className="text-left px-3 py-2.5 hidden xl:table-cell">Updated</th>
                    <th className="text-left px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paged.map((p: any) => (
                    <tr key={p._id} className="hover:bg-gray-50/60">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 min-w-[180px]">
                          <div className="h-10 w-10 rounded-[8px] border border-gray-100 bg-[#F5F5F7] overflow-hidden relative shrink-0">
                            <Image src={(Array.isArray(p.images) ? p.images[0] : p.images) || '/placeholder.jpg'} alt={p.productName} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1F2937] truncate max-w-[160px]">{p.productName}</p>
                            <p className="text-[11px] text-[#6E6E73] truncate">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[12px] font-mono text-[#6E6E73]">{p.sku}</td>
                      <td className="px-3 py-2 text-right font-semibold">{p.quantity}</td>
                      <td className="px-3 py-2 text-right text-[#6E6E73]">{p.reservedStock}</td>
                      <td className="px-3 py-2 text-right font-extrabold text-[#111111]">{p.availableStock}</td>
                      <td className="px-3 py-2">
                        {p.inventoryStatus === 'In Stock' && <span className="text-[11px] font-semibold border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 rounded-full text-[#059669] whitespace-nowrap">In Stock</span>}
                        {p.inventoryStatus === 'Low Stock' && <span className="text-[11px] font-semibold border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 rounded-full text-[#D97706] whitespace-nowrap">Low Stock</span>}
                        {p.inventoryStatus === 'Out of Stock' && <span className="text-[11px] font-semibold border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1 rounded-full text-[#DC2626] whitespace-nowrap">Out of Stock</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">₱{Number(p.price).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-[#6E6E73] hidden lg:table-cell">₱{Number(p.cost || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 hidden xl:table-cell text-[11px] text-[#6E6E73]">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={!canManage} onClick={() => { if (!canManage) return; setSelected(p); setAction('add') }}><Plus className="h-3 w-3 mr-1" />Add</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={!canManage} onClick={() => { if (!canManage) return; setSelected(p); setAction('remove') }}><Minus className="h-3 w-3 mr-1" />Remove</Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" disabled={!canManage} onClick={() => { if (!canManage) return; setSelected(p); setAction('adjust') }}><SlidersHorizontal className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" disabled={!canManage} onClick={() => { if (!canManage) return; setSelected(p); setAction('price') }}><DollarSign className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setHistoryId(historyId === p._id ? null : p._id)}><History className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[12px] text-[#6E6E73]">{filtered.length} products • Page {page} / {totalPages}</p>
              <div className="flex gap-1 flex-wrap justify-center">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const n = i + 1
                  return <Button key={n} variant={page === n ? 'default' : 'outline'} size="sm" onClick={() => setPage(n)}>{n}</Button>
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {historyId && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-[#1F2937]">History — {products.find((p: any) => p._id === historyId)?.productName || historyId}</h3>
            <Button variant="ghost" size="sm" onClick={() => setHistoryId(null)}>Close</Button>
          </div>
          <ProductHistory productId={historyId} />
        </Card>
      )}

      {selected && action === 'add' && <AddStockDialog open={true} onOpenChange={(v) => !v && setAction(null)} product={selected} />}
      {selected && action === 'remove' && <RemoveStockDialog open={true} onOpenChange={(v) => !v && setAction(null)} product={selected} />}
      {selected && action === 'adjust' && <AdjustStockDialog open={true} onOpenChange={(v) => !v && setAction(null)} product={selected} />}
      {selected && action === 'price' && <UpdatePriceDialog open={true} onOpenChange={(v) => !v && setAction(null)} product={selected} />}
    </div>
  )
}
