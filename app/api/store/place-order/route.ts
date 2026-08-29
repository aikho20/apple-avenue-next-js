import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import Cart from '@/lib/model/cart.model'
import Product from '@/lib/model/product.model'
import { ProductCardProps } from '@/types/type'
import Order from '@/lib/model/order.model'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { id, paymentMethod, shippingOption, shippingAddress, fullName } = await req.json()
    const session = await getServerSession(nextauthOptions)

    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }

    if (!paymentMethod || !shippingOption || !shippingAddress || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Cart id required' }, { status: 400 })
    }

    const userCart = await Cart.findById(id)
    if (!userCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    if (userCart.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!userCart?.cart?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const cartItems = await Promise.all(
      userCart.cart.map(async (item: any) => {
        const pid = item._id || item.id
        const searchprod = await Product.findById(pid)
        if (!searchprod) {
          throw new Error(`Product not found`)
        }
        if (searchprod.status !== 'Posted') {
          throw new Error(`${searchprod.productName} is unavailable`)
        }
        if (searchprod.quantity < item.value) {
          throw new Error(`${searchprod.productName} only ${searchprod.quantity} in stock`)
        }
        return {
          _id: searchprod._id,
          productName: searchprod.productName,
          images: searchprod.images,
          price: Number(searchprod.price.toString()),
          value: item.value,
        }
      })
    )

    const total: number = cartItems.reduce((acc: number, item: ProductCardProps) => acc + item.price * item.value, 0)

    // Decrement inventory
    for (const item of userCart.cart) {
      const pid = (item as any)._id || (item as any).id
      await Product.findByIdAndUpdate(pid, { $inc: { quantity: -Number((item as any).value) } })
      // Auto mark out of stock if quantity 0
      const p = await Product.findById(pid).select('quantity')
      if (p && p.quantity <= 0) {
        await Product.findByIdAndUpdate(pid, { status: 'Out of Stock' })
      }
    }

    const newOrder = new Order({
      merchant: userCart.merchant,
      user: userCart.user,
      products: cartItems,
      shippingOption,
      shippingAddress,
      paymentMethod,
      fullName,
      total: total.toString(),
      status: 'Pending',
    })
    await newOrder.save()
    await Cart.findByIdAndDelete(id)

    // Log activity
    try {
      const Activity = (await import('@/lib/model/activity.model')).default
      await Activity.create({
        merchant: userCart.merchant,
        user: user._id.toString(),
        action: 'order_placed',
        detail: `Order ${newOrder._id} placed for ₱${total}`,
      })
    } catch {}

    return NextResponse.json({ message: 'You have successfully placed the order', orderId: newOrder._id }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
