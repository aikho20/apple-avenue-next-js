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
    const { merchantId: provided, branchId } = await req.json().catch(() => ({}))
    const session = await getServerSession(nextauthOptions)

    if (!session?.user?._id) {
      // Guest — return empty cart with 200 so public storefront doesn't trigger 401 toast loop
      return NextResponse.json({ cart: [], total: 0, cartId: null, guest: true }, { status: 200 })
    }

    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    // Branch-aware: if branchId provided, resolve to branch manager merchant
    let resolvedProvided = provided as string | null | undefined
    if (branchId) {
      try {
        const Branch = (await import('@/lib/model/branch.model')).default
        const branchDoc: any = await Branch.findById(branchId).lean().catch(() => null)
        if (branchDoc?.manager) resolvedProvided = branchDoc.manager.toString()
      } catch {}
    }
    // Apple Avenue — single merchant fallback
    const { resolveMerchantId } = await import('@/lib/merchant')
    const merchantId = await resolveMerchantId(resolvedProvided)
    if (!merchantId) {
      return NextResponse.json({ cart: [], total: 0, cartId: null }, { status: 200 })
    }

    const userCart = await Cart.findOne({ user: user._id.toString(), merchant: merchantId.toString() })

    if (userCart) {
      if (userCart?.cart?.length > 0) {
        const cartItems = await Promise.all(
          userCart.cart.map(async (item: any) => {
            const pid = item._id || item.id
            const searchprod = await Product.findById(pid).select('-merchant')
            if (!searchprod) {
              // Product deleted - skip it
              return null
            }
            return {
              _id: searchprod._id,
              productName: searchprod.productName,
              images: searchprod.images,
              price: Number(searchprod.price.toString()),
              status: searchprod.status,
              value: item.value,
              quantity: searchprod.quantity,
            }
          })
        )
        const filtered = cartItems.filter(Boolean) as ProductCardProps[]
        const total: number = filtered.reduce((acc: number, item: any) => acc + item.price * item.value, 0)
        return NextResponse.json({ cart: filtered, total, cartId: userCart._id }, { status: 200 })
      } else {
        return NextResponse.json({ cart: [], total: 0, cartId: userCart._id }, { status: 200 })
      }
    } else {
      const newCart = new Cart({
        cart: [],
        user: user._id.toString(),
        merchant: merchantId.toString(),
      })
      const createdCart = await newCart.save()
      return NextResponse.json({ cart: [], total: 0, cartId: createdCart._id }, { status: 200 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
