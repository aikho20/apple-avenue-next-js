import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import Activity from '@/lib/model/activity.model'
import Cart from '@/lib/model/cart.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { _id } = await req.json()
    if (!_id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 })
    }

    const product = await Product.findById(_id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found!' }, { status: 404 })
    }

    const isOwner = product.merchant.toString() === user._id.toString() || (product as any).branch?.toString() === (user.branch?.toString() || '')
    if (!isOwner && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if product is in pending orders - warn but allow delete
    // Remove from all carts
    await Cart.updateMany({}, { $pull: { cart: { _id: _id.toString() } } })

    await Product.findByIdAndDelete(_id)

    await Activity.create({
      merchant: user._id.toString(),
      branch: (product as any).branch || (user as any).branch?.toString() || '',
      user: user._id.toString(),
      action: 'product_deleted',
      detail: `Deleted product ${product.productName}`,
    })

    return NextResponse.json({ message: 'Successfully deleted!' }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
