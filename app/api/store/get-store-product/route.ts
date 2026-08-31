import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import User from '@/lib/model/user.model'
import { resolveMerchantId } from '@/lib/merchant'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json().catch(() => ({}))
    const { merchantId: provided, branchId } = body
    // Branch-aware: if branchId === 'all' (admin view all) return all products; if specific Branch _id filter by branch; else fallback merchant
    let filter: any = {}
    if (branchId === 'all') {
      filter = {}
    } else if (branchId) {
      // Branch-specific: products where branch == branchId OR merchant == branch manager
      const Branch = (await import('@/lib/model/branch.model')).default
      const branchDoc: any = await Branch.findById(branchId).lean().catch(() => null)
      if (branchDoc) {
        const managerId = branchDoc.manager?.toString()
        filter = { $or: [{ branch: branchId }, { merchant: managerId }, { branch: managerId }] }
      } else {
        filter = { branch: branchId }
      }
    } else {
      // No branch filter: public storefront or admin legacy — show all products if no merchant provided (after branch transfer admin's own is empty)
      if (provided) {
        const merchantId = await resolveMerchantId(provided)
        if (merchantId) filter = { merchant: merchantId }
        else filter = {}
      } else {
        filter = {}
      }
    }
    // Include branch-scoped products also if merchant filter was used but product has branch field matching
    const product = await Product.find(filter).sort({ updatedAt: -1 })
    // Resolve merchant for response (admin vs branch manager)
    let merchantIdForUser: string | null = null
    if (branchId === 'all') {
      merchantIdForUser = await resolveMerchantId(provided)
    } else if (branchId) {
      const BranchTmp = (await import('@/lib/model/branch.model')).default
      const b: any = await BranchTmp.findById(branchId).lean().catch(() => null)
      merchantIdForUser = b?.manager?.toString() || branchId
    } else {
      merchantIdForUser = await resolveMerchantId(provided)
    }
    const user = merchantIdForUser ? await User.findById(merchantIdForUser).select('-password -role -email -provider -shippingAddress -_id') : null

    if (!product || product.length === 0) {
      return NextResponse.json({ product: [], merchant: user }, { status: 200 })
    }
    const updatedProduct = product.map((items: any) => {
      const quantity = Number(items.quantity || 0)
      const reservedStock = Number(items.reservedStock || 0)
      const availableStock = Math.max(quantity - reservedStock, 0)
      const lowStockThreshold = Number(items.lowStockThreshold ?? 5)
      let inventoryStatus: string = 'In Stock'
      if (availableStock <= 0) inventoryStatus = 'Out of Stock'
      else if (availableStock <= lowStockThreshold) inventoryStatus = 'Low Stock'
      const sku = items.sku || `SKU-${items._id.toString().slice(-6).toUpperCase()}`
      return {
        _id: items._id.toString(),
        images: items.images,
        category: items.category,
        productName: items.productName,
        description: items.description,
        cost: items.cost,
        quantity,
        price: Number(items.price.toString()),
        status: items.status,
        isFeatured: !!items.isFeatured,
        isDeal: !!items.isDeal,
        specs: items.specs || {},
        sku,
        reservedStock,
        availableStock,
        lowStockThreshold,
        inventoryStatus,
        updatedAt: items.updatedAt,
        updatedBy: items.updatedBy || '',
        merchant: items.merchant,
      }
    })
    return NextResponse.json({ product: updatedProduct, merchant: user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
