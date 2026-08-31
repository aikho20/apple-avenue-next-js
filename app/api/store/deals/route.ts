import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Discount from '@/lib/model/discount.model'
import Product from '@/lib/model/product.model'
import { resolveMerchantId } from '@/lib/merchant'

// Public — Deals & coupons from admin dashboard (no auth) — branch-aware when branchId provided
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const url = new URL(req.url)
    const branchId = url.searchParams.get('branchId')
    let merchantId: string | null = null
    let branchFilter: any = null

    if (branchId) {
      try {
        const Branch = (await import('@/lib/model/branch.model')).default
        const branchDoc: any = await Branch.findById(branchId).lean().catch(() => null)
        if (branchDoc?.manager) {
          merchantId = branchDoc.manager.toString()
          branchFilter = { $or: [{ branch: branchId }, { merchant: merchantId }, { branch: merchantId }] }
        } else {
          branchFilter = { branch: branchId }
          merchantId = await resolveMerchantId()
        }
      } catch {
        merchantId = await resolveMerchantId()
      }
    } else {
      merchantId = await resolveMerchantId()
    }
    if (!merchantId) return NextResponse.json({ deals: [], dealProducts: [] }, { status: 200 })

    const deals = await Discount.find({ merchant: merchantId, active: true })
      .sort({ createdAt: -1 })
      .lean()

    const productFilter: any = branchFilter
      ? { ...branchFilter, isDeal: true, status: 'Posted' }
      : { merchant: merchantId, isDeal: true, status: 'Posted' }

    // If branchFilter uses $or, need to combine with isDeal/status via $and
    let finalFilter: any = productFilter
    if (branchFilter && branchFilter.$or) {
      finalFilter = { $and: [branchFilter, { isDeal: true, status: 'Posted' }] }
    }

    const dealProductsRaw = await Product.find(finalFilter)
      .sort({ updatedAt: -1 })
      .lean()

    const dealProducts = dealProductsRaw.map((p: any) => ({
      _id: p._id.toString(),
      productName: p.productName,
      category: p.category,
      description: p.description,
      price: Number(p.price.toString()),
      images: p.images,
      quantity: p.quantity,
      status: p.status,
      isFeatured: !!p.isFeatured,
      isDeal: !!p.isDeal,
    }))

    return NextResponse.json({ deals, dealProducts }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST variant for RTK Query with body branchId
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { branchId } = await req.json().catch(() => ({}))
    // Reuse GET logic by forwarding to same flow - construct URL with branchId
    const url = new URL(req.url)
    if (branchId) url.searchParams.set('branchId', branchId)
    const fakeReq = { url: url.toString() } as NextRequest
    return GET(fakeReq)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
