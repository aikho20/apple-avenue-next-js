import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import Activity from '@/lib/model/activity.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { productName, description, price, cost, category, quantity, images, _id, status, isFeatured, isDeal, specs } = await req.json()
    if (!_id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 })
    }

    const product = await Product.findById(_id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found!' }, { status: 404 })
    }

    if (product.merchant.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Product.findByIdAndUpdate(_id, {
      category,
      images,
      productName,
      description,
      price,
      cost,
      quantity: quantity !== undefined ? Number(quantity) : product.quantity,
      status,
      isFeatured: isFeatured !== undefined ? !!isFeatured : product.isFeatured,
      isDeal: isDeal !== undefined ? !!isDeal : product.isDeal,
      specs: specs !== undefined ? specs : (product as any).specs,
    })

    await Activity.create({
      merchant: user._id.toString(),
      user: user._id.toString(),
      action: 'product_updated',
      detail: `Updated product ${productName || product.productName}`,
    })

    return NextResponse.json({ message: 'Successfully updated!' }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
