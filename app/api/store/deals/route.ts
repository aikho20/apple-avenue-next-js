import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Discount from '@/lib/model/discount.model'
import Product from '@/lib/model/product.model'
import { resolveMerchantId } from '@/lib/merchant'

// Public — Deals & coupons from admin dashboard (no auth)
export async function GET() {
  try {
    await connectDB()
    const merchantId = await resolveMerchantId()
    if (!merchantId) return NextResponse.json({ deals: [], dealProducts: [] }, { status: 200 })

    const deals = await Discount.find({ merchant: merchantId, active: true })
      .sort({ createdAt: -1 })
      .lean()

    const dealProductsRaw = await Product.find({ merchant: merchantId, isDeal: true, status: 'Posted' })
      .sort({ updatedAt: -1 })
      .lean()

    const dealProducts = dealProductsRaw.map((p: any) => ({
      _id: p._id.toString(),
      productName: p.productName,
      category: p.category,
      description: p.description,
      price: Number(p.price.toString()),
      images: p.images,
      quantity: p.quantity,
      status: p.status,
      isFeatured: !!p.isFeatured,
      isDeal: !!p.isDeal,
    }))

    return NextResponse.json({ deals, dealProducts }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
