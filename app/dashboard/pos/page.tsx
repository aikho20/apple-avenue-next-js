'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useGetDashboardBranchesQuery } from '@/store/action/branchAction'
import toast from 'react-hot-toast'
import { Search, Plus, Minus, Trash2, ShoppingCart, UserPlus, Users, Package, CreditCard, Banknote, Smartphone, Receipt, ShieldCheck, Store } from 'lucide-react'
import Link from 'next/link'

type PosProduct = {
  _id: string
  productName: string
  category: string
  price: number
  quantity: number
  availableStock: number
  inventoryStatus: string
  sku: string
  images: any
}

type CartLine = {
  productId: string
  productName: string
  price: number
  quantity: number
  availableStock: number
  images: any
  category: string
  sku: string
  // per-unit imei / serial for warranty
  imeis: string[]
  serials: string[]
}

export default function POSPage() {
  const { data: session } = useSession()
  const role = (session as any)?.user?.role
  const isAdmin = role === 'admin'
  const isBranch = role === 'branch'
  const ownBranchId = (session as any)?.user?.branch ? String((session as any).user.branch) : ''
  const ownBranchName = (session as any)?.user?.branchName || ''

  const [branchId, setBranchId] = useState<string>(() => ownBranchId || 'all')
  useEffect(() => {
    if (isBranch && ownBranchId) setBranchId(ownBranchId)
  }, [isBranch, ownBranchId])

  const { data: branchData } = useGetDashboardBranchesQuery({}, { skip: !isAdmin })
  const branches: any[] = branchData?.branches || []
  const effectiveBranchId = isBranch ? ownBranchId : branchId !== 'all' ? branchId : ''

  // Customers
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [newCustName, setNewCustName] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)

  // Products
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<PosProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Cart
  const [cart, setCart] = useState<CartLine[]>([])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [shippingOption, setShippingOption] = useState('POS Walk-in')
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [receipt, setReceipt] = useState<any | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showImeiDialog, setShowImeiDialog] = useState(false)
  const [imeiDraft, setImeiDraft] = useState<{ productId: string; imeis: string[]; serials: string[] } | null>(null)

  // Fetch customers
  useEffect(() => {
    let cancelled = false
    async function fetchCustomers() {
      try {
        const res = await fetch(`/api/store/dashboard/pos/customers?search=${encodeURIComponent(customerSearch)}&limit=20`)
        const data = await res.json()
        if (!cancelled && res.ok) setCustomers(data.customers || [])
      } catch {}
    }
    fetchCustomers()
    return () => {
      cancelled = true
    }
  }, [customerSearch])

  // Fetch products
  useEffect(() => {
    if (!effectiveBranchId && isAdmin) {
      // admin must select branch first
      setProducts([])
      return
    }
    let cancelled = false
    async function fetchProducts() {
      setLoadingProducts(true)
      try {
        const qs = new URLSearchParams()
        if (productSearch) qs.set('search', productSearch)
        if (effectiveBranchId) qs.set('branchId', effectiveBranchId)
        const res = await fetch(`/api/store/dashboard/pos/products?${qs.toString()}`)
        const data = await res.json()
        if (!cancelled && res.ok) setProducts(data.products || [])
      } catch {}
      setLoadingProducts(false)
    }
    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [productSearch, effectiveBranchId, isAdmin])

  const total = useMemo(() => cart.reduce((s, l) => s + l.price * l.quantity, 0), [cart])
  const totalUnits = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart])

  function addToCart(p: PosProduct) {
    if (p.availableStock <= 0) {
      toast.error(`${p.productName} is out of stock`)
      return
    }
    setCart(prev => {
      const idx = prev.findIndex(l => l.productId === p._id)
      if (idx >= 0) {
        const next = [...prev]
        const line = next[idx]
        if (line.quantity + 1 > p.availableStock) {
          toast.error(`Only ${p.availableStock} units available`)
          return prev
        }
        next[idx] = { ...line, quantity: line.quantity + 1, imeis: [...line.imeis, ''], serials: [...line.serials, ''] }
        return next
      }
      return [...prev, { productId: p._id, productName: p.productName, price: p.price, quantity: 1, availableStock: p.availableStock, images: p.images, category: p.category, sku: p.sku, imeis: [''], serials: [''] }]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev =>
      prev
        .map(l => {
          if (l.productId !== productId) return l
          const nextQty = l.quantity + delta
          if (nextQty <= 0) return null as any
          if (nextQty > l.availableStock) {
            toast.error(`Only ${l.availableStock} available`)
            return l
          }
          let imeis = [...l.imeis]
          let serials = [...l.serials]
          if (delta > 0) {
            imeis.push('')
            serials.push('')
          } else {
            imeis.pop()
            serials.pop()
          }
          return { ...l, quantity: nextQty, imeis, serials }
        })
        .filter(Boolean)
    )
  }

  function removeLine(productId: string) {
    setCart(prev => prev.filter(l => l.productId !== productId))
  }

  async function handleCreateCustomer() {
    if (!newCustName.trim() || !newCustEmail.trim()) {
      toast.error('Name and email required')
      return
    }
    setCreatingCustomer(true)
    try {
      const res = await fetch('/api/store/dashboard/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCustName.trim(), email: newCustEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast.success('Customer created')
      setCustomers(prev => [data.customer, ...prev])
      setSelectedCustomer(data.customer)
      setNewCustName('')
      setNewCustEmail('')
      setShowCustomerDialog(false)
    } catch (e: any) {
      toast.error(e.message)
    }
    setCreatingCustomer(false)
  }

  function openImeiDialog(line: CartLine) {
    setImeiDraft({ productId: line.productId, imeis: [...line.imeis], serials: [...line.serials] })
    setShowImeiDialog(true)
  }

  function saveImeiDialog() {
    if (!imeiDraft) return
    setCart(prev => prev.map(l => (l.productId === imeiDraft.productId ? { ...l, imeis: imeiDraft.imeis, serials: imeiDraft.serials } : l)))
    setShowImeiDialog(false)
  }

  async function handleCreateOrder() {
    if (!selectedCustomer) {
      toast.error('Select or create a customer first')
      return
    }
    if (cart.length === 0) {
      toast.error('Add at least one product')
      return
    }
    if (isAdmin && !effectiveBranchId) {
      toast.error('Admin must select a branch')
      return
    }
    setCreatingOrder(true)
    try {
      const payload = {
        customerId: selectedCustomer._id,
        items: cart.map(l => ({ productId: l.productId, quantity: l.quantity, imei: l.imeis.filter(Boolean), serialNumber: l.serials.filter(Boolean) })),
        paymentMethod,
        shippingOption,
        shippingAddress: branches.find((b: any) => b._id === effectiveBranchId)?.address || effectiveBranchId || 'POS Walk-in Store',
        branchId: effectiveBranchId,
      }
      const res = await fetch('/api/store/dashboard/pos/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')
      toast.success('Order completed — warranty registered')
      setReceipt({ order: data.order, warranties: data.warranties || [], customer: selectedCustomer, branchId: effectiveBranchId })
      setShowReceipt(true)
      setCart([])
      // refetch products to reflect reduced stock
      const qs = new URLSearchParams()
      if (effectiveBranchId) qs.set('branchId', effectiveBranchId)
      const rp = await fetch(`/api/store/dashboard/pos/products?${qs.toString()}`)
      const rd = await rp.json()
      if (rp.ok) setProducts(rd.products || [])
    } catch (e: any) {
      toast.error(e.message)
    }
    setCreatingOrder(false)
  }

  const canManage = isBranch ? !!ownBranchId : isAdmin ? !!effectiveBranchId : false

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
            <Store className="h-5 w-5" /> POS — {isBranch ? ownBranchName || 'Your Branch' : isAdmin && effectiveBranchId ? branches.find((b: any) => b._id === effectiveBranchId)?.name || 'Branch POS' : 'Point of Sale'}
          </h1>
          <p className="text-[13px] text-[#6E6E73]">Branch Staff → Select/Create Customer → Select Products → Quantity → Payment → Completed. Inventory & warranty auto-handled.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b: any) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isBranch && ownBranchId && <div className="rounded-full bg-[#F5F5F7] border border-gray-200 px-3 py-1.5 text-[12px] font-medium">{ownBranchName || ownBranchId.slice(-6)}</div>}
        </div>
      </div>

      {!canManage && isAdmin && (
        <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">Admin: select a branch to use POS. Branch stock will be reduced for the selected branch.</div>
      )}

      {/* Flow indicator */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wide">
        {['Customer', 'Products', 'Quantity', 'Payment', 'Complete'].map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold border ${i === 0 && !selectedCustomer ? 'bg-[#111111] text-white border-[#111111]' : i === 0 && selectedCustomer ? 'bg-emerald-600 text-white border-emerald-600' : cart.length > 0 && i <= 2 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 text-[#6E6E73]'}`}>{i + 1}</span>
            {s}
            {i < 4 && <span className="w-6 h-px bg-gray-200" />}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-4">
        {/* Left: Products */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-50 py-4">
            <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Select Products
              <span className="ml-auto text-[11px] font-normal text-[#86868b]">{products.length} available</span>
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#86868b]" />
                <Input placeholder="Search product / SKU / category" value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-9 bg-[#F5F5F7] border-gray-100" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {!canManage ? (
              <p className="text-[13px] text-[#86868b]">Select a branch to load products.</p>
            ) : loadingProducts ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[140px] rounded-xl bg-gray-50 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-[13px] text-[#86868b]">No products found for this branch.</p>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 max-h-[640px] overflow-auto pr-1">
                {products.map(p => (
                  <div key={p._id} className="rounded-[12px] border border-gray-100 bg-white p-3 flex flex-col gap-2 hover:shadow-sm transition-shadow">
                    <div className="h-[86px] rounded-[10px] bg-[#F5F5F7] overflow-hidden flex items-center justify-center">
                      {p.images?.[0] ? <img src={Array.isArray(p.images) ? p.images[0] : p.images} alt={p.productName} className="h-full w-full object-cover" /> : <Package className="h-8 w-8 text-gray-300" />}
                    </div>
                    <p className="text-[12px] font-semibold text-[#1D1D1F] line-clamp-2 leading-tight">{p.productName}</p>
                    <p className="text-[11px] text-[#86868b]">{p.category} • {p.sku}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-extrabold text-[#1D1D1F]">₱{Number(p.price).toLocaleString()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.availableStock <= 0 ? 'bg-red-50 border-red-100 text-red-700' : p.inventoryStatus === 'Low Stock' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{p.availableStock} avail</span>
                    </div>
                    <Button size="sm" className="w-full h-8 text-[12px]" disabled={p.availableStock <= 0} onClick={() => addToCart(p)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Customer + Cart + Payment */}
        <div className="flex flex-col gap-4">
          {/* Customer */}
          <Card>
            <CardHeader className="border-b border-gray-50 py-4">
              <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Select / Create Customer
              </CardTitle>
              <CardDescription>Required for order & warranty</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#86868b]" />
                  <Input placeholder="Search name or email" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-9" />
                </div>
                <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <UserPlus className="h-4 w-4 mr-1" /> New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[420px]">
                    <DialogHeader>
                      <DialogTitle>Create Customer</DialogTitle>
                      <DialogDescription>Quick create for POS walk-in.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-2">
                      <div>
                        <Label className="text-[12px]">Name</Label>
                        <Input value={newCustName} onChange={e => setNewCustName(e.target.value)} placeholder="Juan Dela Cruz" />
                      </div>
                      <div>
                        <Label className="text-[12px]">Email</Label>
                        <Input value={newCustEmail} onChange={e => setNewCustEmail(e.target.value)} placeholder="juan@email.com" />
                      </div>
                      <Button className="w-full" onClick={handleCreateCustomer} disabled={creatingCustomer}>
                        {creatingCustomer ? 'Creating...' : 'Create & Select'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedCustomer ? (
                <div className="rounded-[10px] border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1D1D1F]">{selectedCustomer.name}</p>
                    <p className="text-[11px] text-[#6E6E73]">{selectedCustomer.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="max-h-[160px] overflow-auto border border-gray-100 rounded-[10px] divide-y">
                  {customers.slice(0, 8).map((c: any) => (
                    <button key={c._id} onClick={() => setSelectedCustomer(c)} className="w-full text-left px-3 py-2 hover:bg-[#F5F5F7] flex justify-between items-center">
                      <div>
                        <p className="text-[12px] font-medium text-[#1D1D1F]">{c.name}</p>
                        <p className="text-[11px] text-[#86868b]">{c.email}</p>
                      </div>
                      <span className="text-[11px] text-[#0071E3] font-semibold">Select</span>
                    </button>
                  ))}
                  {customers.length === 0 && <p className="text-[12px] text-[#86868b] px-3 py-3">No customers found. Create one.</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader className="border-b border-gray-50 py-4">
              <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Cart
                <span className="ml-auto text-[11px] font-normal text-white bg-[#111111] rounded-full px-2 py-0.5">{totalUnits} units</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {cart.length === 0 ? (
                <p className="text-[12px] text-[#86868b] py-4 text-center">No products yet — select from left.</p>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                  {cart.map(line => (
                    <div key={line.productId} className="rounded-[10px] border border-gray-100 bg-[#F5F5F7] px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#1D1D1F] line-clamp-1">{line.productName}</p>
                          <p className="text-[11px] text-[#6E6E73]">{line.sku} • ₱{line.price.toLocaleString()} × {line.quantity} = ₱{(line.price * line.quantity).toLocaleString()}</p>
                        </div>
                        <button onClick={() => removeLine(line.productId)} className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(line.productId, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[28px] text-center text-[13px] font-bold">{line.quantity}</span>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(line.productId, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-[11px] text-[#86868b] ml-2">avail {line.availableStock}</span>
                        <button onClick={() => openImeiDialog(line)} className="ml-auto text-[11px] font-semibold text-[#0071E3] hover:underline flex items-center gap-1">
                          <Smartphone className="h-3 w-3" /> IMEI/Serial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 rounded-[10px] bg-white border border-gray-100 p-3 space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6E6E73]">Subtotal</span>
                  <span className="font-bold text-[#1D1D1F]">₱{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#86868b]">
                  <span>Branch stock will be reduced on order</span>
                  <span>{totalUnits} items</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="border-b border-gray-50 py-4">
              <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div>
                <Label className="text-[11px] font-bold uppercase tracking-wide text-[#86868b]">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="GCash">GCash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="COD">COD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-bold uppercase tracking-wide text-[#86868b]">Fulfillment</Label>
                <Select value={shippingOption} onValueChange={setShippingOption}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POS Walk-in">POS Walk-in (Completed)</SelectItem>
                    <SelectItem value="In-Store Pickup">In-Store Pickup</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full h-[44px] text-[14px] font-bold" disabled={!canManage || creatingOrder || !selectedCustomer || cart.length === 0} onClick={handleCreateOrder}>
                {creatingOrder ? 'Processing...' : `Pay ₱${total.toLocaleString()} • Complete Order`}
              </Button>
              <p className="text-[11px] text-[#86868b] text-center">Creates Order → Inventory SALE → Reduce stock → Warranty (when Delivered)</p>
              {!selectedCustomer && cart.length > 0 && <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">Select customer to complete sale.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* IMEI Dialog */}
      <Dialog open={showImeiDialog} onOpenChange={setShowImeiDialog}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">IMEI / Serial per unit — Warranty</DialogTitle>
            <DialogDescription className="text-[12px]">Enter device identifiers. If left blank, auto-generated. Stored with order and used for auto warranty on Delivered.</DialogDescription>
          </DialogHeader>
          {imeiDraft && (
            <div className="space-y-3 max-h-[360px] overflow-auto">
              {imeiDraft.imeis.map((imei, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 p-3 bg-[#F5F5F7] space-y-2">
                  <p className="text-[11px] font-bold uppercase text-[#86868b]">Unit {idx + 1}</p>
                  <div>
                    <Label className="text-[11px]">IMEI</Label>
                    <Input
                      value={imeiDraft.imeis[idx] || ''}
                      onChange={e => {
                        const next = [...imeiDraft.imeis]
                        next[idx] = e.target.value
                        setImeiDraft({ ...imeiDraft, imeis: next })
                      }}
                      placeholder="15-digit IMEI"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Serial Number</Label>
                    <Input
                      value={imeiDraft.serials[idx] || ''}
                      onChange={e => {
                        const next = [...imeiDraft.serials]
                        next[idx] = e.target.value
                        setImeiDraft({ ...imeiDraft, serials: next })
                      }}
                      placeholder="Serial"
                    />
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={saveImeiDialog}>
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" /> Order Completed
            </DialogTitle>
            <DialogDescription>Inventory deducted & warranty registered.</DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#F5F5F7] border border-gray-100 p-4 space-y-1.5">
                <p className="text-[12px] text-[#6E6E73]">Order #{String(receipt.order._id).slice(-8).toUpperCase()}</p>
                <p className="text-[13px] font-semibold text-[#1D1D1F]">{receipt.customer?.name} • {receipt.customer?.email}</p>
                <p className="text-[13px] font-extrabold text-[#1D1D1F]">₱{Number(receipt.order.total).toLocaleString()} • {receipt.order.paymentMethod}</p>
                <p className="text-[11px] text-[#6E6E73]">{receipt.order.shippingOption} • {receipt.order.status} • Branch {String(receipt.branchId).slice(-6)}</p>
                <div className="pt-2 space-y-1 border-t border-gray-200 mt-2">
                  {receipt.order.products?.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between text-[12px]">
                      <span className="text-[#1D1D1F]">
                        {p.productName} × {p.value}
                      </span>
                      <span className="font-semibold">₱{(Number(p.price) * Number(p.value)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              {receipt.warranties?.length > 0 && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="text-[12px] font-semibold text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> {receipt.warranties.length} warrant{receipt.warranties.length > 1 ? 'ies' : 'y'} auto-registered (1 year)
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {receipt.warranties.slice(0, 3).map((w: any) => (
                      <p key={w._id} className="text-[11px] text-emerald-900">
                        {w.productName} • {w.imei} • until {new Date(w.warrantyExpiration).toLocaleDateString()}
                      </p>
                    ))}
                    {receipt.warranties.length > 3 && <p className="text-[11px] text-emerald-700">+{receipt.warranties.length - 3} more</p>}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                  Print Receipt
                </Button>
                <Link href="/dashboard/orders" className="flex-1">
                  <Button className="w-full">View Orders</Button>
                </Link>
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setShowReceipt(false)}>
                New Sale
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-[12px] border border-gray-100 bg-white p-3 text-[11px] text-[#86868b]">
        Flow: Branch Staff → Customer → Products → Quantity (IMEI) → <b>Create Order</b> → InventoryTransaction SALE → Stock reduced → Payment ({paymentMethod}) → Delivered → Warranty auto-created (+1 year). All writes branch-scoped, audited via InventoryTransaction & Activity.
      </div>
    </div>
  )
}
