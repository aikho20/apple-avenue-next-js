import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import InventoryTransaction from '@/lib/model/inventoryTransaction.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { resolveMerchantId } from '@/lib/merchant'

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
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    let body: any = {}
    try {
      body = await req.json()
    } catch {}
    const productId = (url.searchParams.get('productId') || body.productId || '').toString()
    const type = (url.searchParams.get('type') || body.type || '').toString()
    const page = Math.max(parseInt((url.searchParams.get('page') || body.page || '1').toString()), 1)
    const limit = Math.min(Math.max(parseInt((url.searchParams.get('limit') || body.limit || '20').toString()), 1), 100)
    const merchantId = await resolveMerchantId(body.merchantId || url.searchParams.get('merchantId') || user._id.toString())

    const filter: any = {}
    if (merchantId) filter.merchant = merchantId
    if (productId) filter.productId = productId
    if (type && type !== 'All' && type !== 'all') {
      // map UI filter "Inventory" to all inventory types, otherwise specific
      const inventoryTypes = ['STOCK_ADDED', 'STOCK_REMOVED', 'ADJUSTMENT', 'DAMAGED', 'LOST', 'TRANSFER', 'INITIAL_STOCK', 'SALE', 'RETURN']
      if (type === 'Inventory') filter.type = { $in: inventoryTypes }
      else if (type === 'Adjustments') filter.type = 'ADJUSTMENT'
      else filter.type = type
    }

    const total = await InventoryTransaction.countDocuments(filter)
    const items = await InventoryTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({ history: items, total, page, limit, totalPages: Math.ceil(total / limit) }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
