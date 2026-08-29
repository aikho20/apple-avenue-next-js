import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Order from '@/lib/model/order.model'
import User from '@/lib/model/user.model'
import Activity from '@/lib/model/activity.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { orderId, status } = await req.json()
    const allowed = ['Pending', 'Out For Delivery', 'Delivered', 'Cancelled']
    if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.merchant.toString() !== user._id.toString()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    order.status = status
    await order.save()
    await Activity.create({
      merchant: user._id.toString(),
      user: user._id.toString(),
      action: 'order_status_updated',
      detail: `Order ${orderId} → ${status}`,
    })
    return NextResponse.json({ message: 'Status updated', order }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
