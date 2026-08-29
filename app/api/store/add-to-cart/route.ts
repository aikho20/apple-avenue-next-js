import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import Cart from '@/lib/model/cart.model'
import Product from '@/lib/model/product.model'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { item, merchant: provided } = await req.json()
    const session = await getServerSession(nextauthOptions)

    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }

    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }

    const { resolveMerchantId } = await import('@/lib/merchant')
    const merchant = await resolveMerchantId(provided)
    if (!merchant) {
      return NextResponse.json({ error: 'Apple Avenue store not initialized — please seed admin account' }, { status: 400 })
    }

    if (!item?.[0]?._id && !item?.[0]?.id) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 })
    }

    const itemId = item[0]._id || item[0].id
    const itemValue = Number(item[0].value) || 0

    // Validate product exists and is available
    const product = await Product.findById(itemId).select('status quantity')
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (product.status !== 'Posted') {
      return NextResponse.json({ error: 'Product unavailable' }, { status: 400 })
    }
    if (itemValue > 0 && product.quantity < itemValue) {
      return NextResponse.json({ error: `Only ${product.quantity} in stock` }, { status: 400 })
    }

    let userCart = await Cart.findOne({ user: user._id.toString(), merchant: merchant.toString() })

    // Create cart if doesn't exist (first add)
    if (!userCart) {
      userCart = await Cart.create({
        cart: [],
        user: user._id.toString(),
        merchant: merchant.toString(),
      })
    }

    const normalizedItem = { _id: itemId.toString(), value: itemValue }
    const existing = userCart.cart.find((v: any) => v._id.toString() === itemId.toString())

    if (existing) {
      if (itemValue > 0) {
        await Cart.findOneAndUpdate(
          { _id: userCart._id, 'cart._id': itemId.toString() },
          { $set: { 'cart.$': normalizedItem } },
          { new: true }
        )
        return NextResponse.json({ message: 'Successfully updated item in cart!' }, { status: 200 })
      } else {
        await Cart.findOneAndUpdate(
          { _id: userCart._id },
          { $pull: { cart: { _id: itemId.toString() } } },
          { new: true }
        )
        return NextResponse.json({ message: 'Removed item from cart' }, { status: 200 })
      }
    } else {
      if (itemValue <= 0) {
        return NextResponse.json({ message: 'No action' }, { status: 200 })
      }
      await Cart.findByIdAndUpdate(userCart._id, { $push: { cart: normalizedItem } })
      return NextResponse.json({ message: 'Successfully added item in cart!' }, { status: 200 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
