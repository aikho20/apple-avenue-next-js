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
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 403 })
    }

    const { productName, description, price, cost, quantity, images, category, status, isFeatured, isDeal, specs } = await req.json()

    if (!productName || !price || !category || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newProduct = new Product({
      images: images || [],
      category,
      productName: productName.trim(),
      description: description || '',
      price,
      cost: cost || 0,
      merchant: user._id.toString(),
      quantity: Number(quantity),
      status: status || 'Posted',
      isFeatured: !!isFeatured,
      isDeal: !!isDeal,
      specs: specs || {},
    })

    await newProduct.save()

    await Activity.create({
      merchant: user._id.toString(),
      user: user._id.toString(),
      action: 'product_created',
      detail: `Created product ${productName}`,
    })

    return NextResponse.json({ message: 'Successfully added!', product: newProduct }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
