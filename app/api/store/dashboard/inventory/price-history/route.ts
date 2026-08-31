import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import PriceHistory from '@/lib/model/priceHistory.model'
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
    const page = Math.max(parseInt((url.searchParams.get('page') || body.page || '1').toString()), 1)
    const limit = Math.min(Math.max(parseInt((url.searchParams.get('limit') || body.limit || '20').toString()), 1), 100)
    const branchIdParam = (url.searchParams.get('branchId') || body.branchId || '').toString()
    let merchantId: string | null = null
    const userRole = (user as any).role
    if (userRole !== 'branch') {
      if (branchIdParam && branchIdParam !== 'all') {
        try {
          const Branch = (await import('@/lib/model/branch.model')).default
          const br: any = await Branch.findById(branchIdParam).lean().catch(() => null)
          if (br?.manager) merchantId = br.manager.toString()
        } catch {}
      } else {
        merchantId = await resolveMerchantId(body.merchantId || url.searchParams.get('merchantId') || user._id.toString())
      }
    }
    const filter: any = {}
    if (userRole === 'branch') {
      const ownBranch = (user as any).branch ? (user as any).branch.toString() : ''
      if (ownBranch) filter.branch = ownBranch
      else filter.merchant = (user as any)._id.toString()
    } else {
      if (branchIdParam && branchIdParam !== 'all') {
        filter.branch = branchIdParam
      } else if (branchIdParam === 'all') {
        // no filter
      } else if (merchantId) filter.merchant = merchantId
    }
    if (productId) filter.productId = productId

    const total = await PriceHistory.countDocuments(filter)
    const items = await PriceHistory.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()

    return NextResponse.json({ history: items, total, page, limit, totalPages: Math.ceil(total / limit) }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
