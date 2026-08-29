import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Order from '@/lib/model/order.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { merchantId } = await req.json()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 403 })
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
