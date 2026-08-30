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

    const { productName, description, price, cost, quantity, images, category, status, isFeatured, isDeal, specs, sku, lowStockThreshold, reservedStock } = await req.json()

    if (!productName || !price || !category || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const skuVal = (sku && String(sku).trim()) || `SKU-${Date.now().toString().slice(-6)}`
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
      sku: skuVal,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      reservedStock: reservedStock !== undefined ? Number(reservedStock) : 0,
      updatedBy: user._id.toString(),
    })

    await newProduct.save()

    // Create initial inventory transaction atomically if quantity >0
    try {
      const InventoryTransaction = (await import('@/lib/model/inventoryTransaction.model')).default
      const qty = Number(quantity)
      if (qty > 0) {
        await InventoryTransaction.create({
          productId: newProduct._id,
          merchant: user._id.toString(),
          type: 'INITIAL_STOCK',
          quantityBefore: 0,
          quantityChange: qty,
          quantityAfter: qty,
          reason: 'Initial stock',
          createdBy: user._id.toString(),
          createdByName: user.name || user.email || 'Admin',
        })
      }
    } catch {}

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
