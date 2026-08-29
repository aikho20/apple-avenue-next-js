import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import Cart from '@/lib/model/cart.model'
import Product from '@/lib/model/product.model'
import { ProductCardProps } from '@/types/type'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { id } = await req.json()
    const session = await getServerSession(nextauthOptions)

    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
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

    if (userCart?.cart?.length > 0) {
      const cartItems = await Promise.all(
        userCart.cart.map(async (item: any) => {
          const pid = item._id || item.id
          const searchprod = await Product.findById(pid).select('-merchant')
          if (!searchprod) {
            throw new Error(`Product not found`)
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
      return NextResponse.json({ cart: cartItems, total, cartId: userCart._id }, { status: 200 })
    } else {
      return NextResponse.json({ cart: [], total: 0, cartId: userCart._id }, { status: 200 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
