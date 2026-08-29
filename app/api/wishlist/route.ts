import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import Wishlist from '@/lib/model/wishlist.model'
import Product from '@/lib/model/product.model'

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ wishlist: [], guest: true }, { status: 200 })
    let wl = await Wishlist.findOne({ user: session.user._id.toString() })
    if (!wl) return NextResponse.json({ wishlist: [] }, { status: 200 })
    // Populate product details
    const products = await Promise.all(
      wl.products.map(async (pid: string) => {
        const p: any = await Product.findById(pid).lean()
        if (!p) return null
        return {
          _id: p._id.toString(),
          productName: p.productName,
          category: p.category,
          description: p.description,
          price: Number((p.price as any).toString()),
          images: p.images,
          quantity: p.quantity,
          status: p.status,
          isFeatured: p.isFeatured,
          isDeal: p.isDeal,
          specs: p.specs || {},
        }
      })
    )
    return NextResponse.json({ wishlist: products.filter(Boolean) }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { productId, productIds } = await req.json()
    // Sync mode: productIds array for guest sync
    let wl = await Wishlist.findOne({ user: session.user._id.toString() })
    if (!wl) wl = await Wishlist.create({ user: session.user._id.toString(), products: [] })

    if (productIds && Array.isArray(productIds)) {
      // Merge guest wishlist
      const set = new Set([...wl.products, ...productIds.map((id: string) => id.toString())])
      wl.products = Array.from(set)
      await wl.save()
      return NextResponse.json({ message: 'Synced', wishlist: wl.products }, { status: 200 })
    }

    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
    const pid = productId.toString()
    if (wl.products.includes(pid)) {
      wl.products = wl.products.filter((id: string) => id !== pid)
      await wl.save()
      return NextResponse.json({ message: 'Removed from wishlist', wishlist: wl.products, removed: true }, { status: 200 })
    } else {
      // Validate product exists
      const prod = await Product.findById(pid)
      if (!prod) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      wl.products.push(pid)
      await wl.save()
      return NextResponse.json({ message: 'Added to wishlist', wishlist: wl.products, added: true }, { status: 200 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
    const wl = await Wishlist.findOne({ user: session.user._id.toString() })
    if (!wl) return NextResponse.json({ message: 'Empty' }, { status: 200 })
    wl.products = wl.products.filter((id: string) => id !== productId)
    await wl.save()
    return NextResponse.json({ message: 'Removed', wishlist: wl.products }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
