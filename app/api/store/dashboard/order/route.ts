import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Order from '@/lib/model/order.model'
import User from '@/lib/model/user.model'
import Activity from '@/lib/model/activity.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { autoRegisterWarrantiesForOrder } from '@/lib/warranty'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { orderId, status } = await req.json()
    const allowed = ['Pending', 'Out For Delivery', 'Delivered', 'Cancelled']
    if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    const order: any = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    // Branch can only manage own branch orders
    if (user.role === 'branch') {
      const ownBranch = user.branch ? user.branch.toString() : ''
      const orderBranch = (order.branch || '').toString()
      const isOwner = orderBranch ? orderBranch === ownBranch : order.merchant.toString() === user._id.toString()
      if (!isOwner) return NextResponse.json({ error: 'Forbidden — not your branch order' }, { status: 403 })
    } else if (order.merchant.toString() !== user._id.toString()) {
      // Admin owns orders via branch merchants — allow if order belongs to any branch managed by admin
      // Admin can manage all, so no merchant check needed; keep permissive for admin
    }
    const previousStatus = order.status
    order.status = status
    await order.save()
    await Activity.create({
      merchant: user._id.toString(),
      branch: user.role === 'branch' ? (user.branch?.toString() || order.branch || '') : (order.branch || ''),
      user: user._id.toString(),
      action: 'order_status_updated',
      detail: `Order ${orderId} → ${status}`,
    })

    // Auto warranty registration when order is delivered (POS + online)
    let warranties: any[] = []
    if (status === 'Delivered' && previousStatus !== 'Delivered') {
      try {
        warranties = await autoRegisterWarrantiesForOrder(order)
      } catch (e) {
        console.log('auto warranty error', (e as any).message)
      }
    }

    return NextResponse.json({ message: 'Status updated', order, warrantiesCreated: warranties.length, warranties }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
