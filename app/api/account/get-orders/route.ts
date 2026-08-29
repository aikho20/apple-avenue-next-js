import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import Order from '@/lib/model/order.model'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const listOfOrders = await Order.find({ user: user._id }).sort({ createdAt: -1 })

    const orders = (
      await Promise.all(
        listOfOrders.map(async (item: any) => {
          const merchant = await User.findById(item.merchant).select('name coverPhoto profilePhoto')
          if (!merchant) return null
          return {
            _id: merchant._id,
            name: merchant.name,
            coverPhoto: merchant.coverPhoto,
            profilePhoto: merchant.profilePhoto,
            orderInfo: item,
          }
        })
      )
    ).filter(Boolean)

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
