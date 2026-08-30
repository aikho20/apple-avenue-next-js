import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import User from '@/lib/model/user.model'
import { resolveMerchantId } from '@/lib/merchant'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { merchantId: provided } = await req.json().catch(() => ({}))
    const merchantId = await resolveMerchantId(provided)
    if (!merchantId) {
      return NextResponse.json({ product: [], merchant: null }, { status: 200 })
    }
    const product = await Product.find({ merchant: merchantId })
    const user = await User.findById(merchantId)
      .select('-password -role -email -provider -shippingAddress -_id')

    if (!product || product.length === 0) {
      return NextResponse.json({ product: [], merchant: user }, { status: 200 })
    }
    const updatedProduct = product.map((items: any) => {
      const quantity = Number(items.quantity || 0)
      const reservedStock = Number(items.reservedStock || 0)
      const availableStock = Math.max(quantity - reservedStock, 0)
      const lowStockThreshold = Number(items.lowStockThreshold ?? 5)
      let inventoryStatus: string = 'In Stock'
      if (availableStock <= 0) inventoryStatus = 'Out of Stock'
      else if (availableStock <= lowStockThreshold) inventoryStatus = 'Low Stock'
      const sku = items.sku || `SKU-${items._id.toString().slice(-6).toUpperCase()}`
      return {
        _id: items._id.toString(),
        images: items.images,
        category: items.category,
        productName: items.productName,
        description: items.description,
        cost: items.cost,
        quantity,
        price: Number(items.price.toString()),
        status: items.status,
        isFeatured: !!items.isFeatured,
        isDeal: !!items.isDeal,
        specs: items.specs || {},
        sku,
        reservedStock,
        availableStock,
        lowStockThreshold,
        inventoryStatus,
        updatedAt: items.updatedAt,
        updatedBy: items.updatedBy || '',
        merchant: items.merchant,
      }
    })
    return NextResponse.json({ product: updatedProduct, merchant: user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
