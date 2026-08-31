import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { toProductInventory } from '@/lib/inventory'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const branchIdParam = (searchParams.get('branchId') || '').trim()

    let filter: any = {}
    if (user.role === 'branch') {
      const branchId = user.branch ? user.branch.toString() : ''
      // branch products + own merchant fallback
      filter.$or = [{ branch: branchId }, { merchant: user._id.toString() }]
    } else if (branchIdParam) {
      if (branchIdParam !== 'all') {
        const Branch = (await import('@/lib/model/branch.model')).default
        const br: any = await Branch.findById(branchIdParam).lean().catch(() => null)
        if (br?.manager) {
          filter.$or = [{ branch: branchIdParam }, { merchant: br.manager.toString() }]
        } else {
          filter.branch = branchIdParam
        }
      }
    }

    // Only Posted / active saleable + show low/out for visibility but POS should filter available >0
    let products = await Product.find(filter).sort({ updatedAt: -1 }).lean()
    let mapped = products.map((p: any) => toProductInventory(p))
    if (search) {
      mapped = mapped.filter((p: any) => p.productName.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search) || (p.category || '').toLowerCase().includes(search))
    }
    // For POS, prioritize available stock >0 but keep all for display
    return NextResponse.json({ products: mapped }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
