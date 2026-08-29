import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import Cart from '@/lib/model/cart.model'
import Order from '@/lib/model/order.model'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await Cart.deleteMany({ user: user._id.toString() })
    await Order.deleteMany({ user: user._id.toString() })
    await User.findByIdAndDelete(user._id)
    return NextResponse.json({ message: 'Account deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
