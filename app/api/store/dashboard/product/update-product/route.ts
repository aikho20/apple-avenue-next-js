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

    const { productName, description, price, cost, category, quantity, images, _id, status, isFeatured, isDeal, specs, sku, lowStockThreshold, reservedStock } = await req.json()
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

    const prevPrice = Number(product.price.toString())
    const newPriceNum = price !== undefined ? Number(price) : prevPrice
    const prevQty = Number(product.quantity || 0)
    const newQty = quantity !== undefined ? Number(quantity) : prevQty
    const priceChanged = price !== undefined && newPriceNum !== prevPrice
    const qtyChanged = quantity !== undefined && newQty !== prevQty

    // Validate price
    if (price !== undefined && (isNaN(newPriceNum) || newPriceNum < 0)) {
      return NextResponse.json({ error: 'Price must be >=0' }, { status: 400 })
    }
    if (qtyChanged && (isNaN(newQty) || newQty < 0 || !Number.isInteger(newQty))) {
      return NextResponse.json({ error: 'Quantity must be integer >=0' }, { status: 400 })
    }

    await Product.findByIdAndUpdate(_id, {
      category,
      images,
      productName,
      description,
      price: price !== undefined ? price : product.price,
      cost,
      quantity: newQty,
      status,
      isFeatured: isFeatured !== undefined ? !!isFeatured : product.isFeatured,
      isDeal: isDeal !== undefined ? !!isDeal : product.isDeal,
      specs: specs !== undefined ? specs : (product as any).specs,
      sku: sku !== undefined ? sku : (product as any).sku,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : (product as any).lowStockThreshold,
      reservedStock: reservedStock !== undefined ? Number(reservedStock) : (product as any).reservedStock,
      updatedBy: user._id.toString(),
    })

    // Audit: price history & inventory adjustment if changed via product update
    try {
      if (priceChanged) {
        const PriceHistory = (await import('@/lib/model/priceHistory.model')).default
        await PriceHistory.create({
          productId: product._id,
          merchant: product.merchant.toString(),
          previousPrice: prevPrice,
          newPrice: newPriceNum,
          reason: 'Price updated via product edit',
          updatedBy: user._id.toString(),
          updatedByName: user.name || user.email || 'Admin',
        })
      }
      if (qtyChanged) {
        const InventoryTransaction = (await import('@/lib/model/inventoryTransaction.model')).default
        const delta = newQty - prevQty
        await InventoryTransaction.create({
          productId: product._id,
          merchant: product.merchant.toString(),
          type: 'ADJUSTMENT',
          quantityBefore: prevQty,
          quantityChange: delta,
          quantityAfter: newQty,
          reason: 'Quantity updated via product edit',
          createdBy: user._id.toString(),
          createdByName: user.name || user.email || 'Admin',
        })
      }
    } catch {}

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
