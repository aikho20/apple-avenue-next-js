import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { resolveMerchantId } from '@/lib/merchant'
import { toProductInventory, computeStats } from '@/lib/inventory'

export async function GET(req: NextRequest) {
  return handle(req)
}
export async function POST(req: NextRequest) {
  return handle(req)
}

async function handle(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    let body: any = {}
    try {
      body = await req.json()
    } catch {}
    const url = new URL(req.url)
    const search = (url.searchParams.get('search') || body.search || '').toString().trim()
    const statusFilter = (url.searchParams.get('status') || body.status || '').toString()
    const categoryFilter = (url.searchParams.get('category') || body.category || '').toString()
    const merchantId = await resolveMerchantId(body.merchantId || url.searchParams.get('merchantId'))

    const filter: any = {}
    if (merchantId) filter.merchant = merchantId
    if (categoryFilter) filter.category = categoryFilter
    // statusFilter for inventory status is computed, so handle later; product status fallback
    let products = await Product.find(filter).sort({ updatedAt: -1 }).lean()

    // Map to inventory shape
    let mapped = products.map((p: any) => toProductInventory(p))

    // Search by productName or sku
    if (search) {
      const s = search.toLowerCase()
      mapped = mapped.filter(
        (p: any) => p.productName.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
      )
    }
    if (statusFilter && statusFilter !== 'all') {
      mapped = mapped.filter((p: any) => p.inventoryStatus === statusFilter)
    }

    const stats = computeStats(mapped)

    // Derive categories for filter UI
    const categories = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))

    return NextResponse.json({ products: mapped, stats, categories }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
