import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Order from '@/lib/model/order.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json().catch(() => ({}))
    const { merchantId, branchId: bodyBranchId } = body
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 403 })
    }
    // Branch manager sees only own branch orders
    if (user.role === 'branch') {
      const ownBranch = user.branch ? user.branch.toString() : ''
      if (!ownBranch) return NextResponse.json({ orders: [] }, { status: 200 })
      const orders = await Order.find({ $or: [{ branch: ownBranch }, { merchant: user._id.toString() }] }).sort({ createdAt: -1 })
      return NextResponse.json({ orders }, { status: 200 })
    }
    // Admin: respect branchId filter if provided
    if (bodyBranchId && bodyBranchId !== 'all') {
      const Branch = (await import('@/lib/model/branch.model')).default
      const br: any = await Branch.findById(bodyBranchId).lean().catch(() => null)
      const managerId = br?.manager?.toString()
      const filter: any = managerId ? { $or: [{ branch: bodyBranchId }, { merchant: managerId }] } : { branch: bodyBranchId }
      const orders = await Order.find(filter).sort({ createdAt: -1 })
      return NextResponse.json({ orders }, { status: 200 })
    }
    if (bodyBranchId === 'all') {
      const orders = await Order.find({}).sort({ createdAt: -1 })
      return NextResponse.json({ orders }, { status: 200 })
    }
    if (merchantId && merchantId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const orders = await Order.find({ merchant: merchantId || user._id.toString() }).sort({ createdAt: -1 })
    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] }, { status: 200 })
    }
    return NextResponse.json({ orders }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
