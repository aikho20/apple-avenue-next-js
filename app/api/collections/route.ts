import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Collection from '@/lib/model/collection.model'
import Product from '@/lib/model/product.model'
import { resolveMerchantId } from '@/lib/merchant'

export async function GET() {
  try {
    await connectDB()
    const merchantId = await resolveMerchantId()
    if (!merchantId) return NextResponse.json({ collections: [] }, { status: 200 })
    const cols = await Collection.find({ merchant: merchantId }).sort({ createdAt: -1 }).lean()
    // Populate products for each collection
    const withProducts = await Promise.all(
      cols.map(async (c: any) => {
        const ids: string[] = c.productIds || []
        if (ids.length === 0) return { ...c, products: [] }
        const prods = await Product.find({ _id: { $in: ids }, merchant: merchantId, status: 'Posted' }).lean()
        const ordered = ids.map((id) => prods.find((p: any) => p._id.toString() === id)).filter(Boolean).map((p: any) => ({
          _id: p._id.toString(),
          productName: p.productName,
          category: p.category,
          description: p.description,
          price: Number(p.price.toString()),
          images: p.images,
          quantity: p.quantity,
          status: p.status,
        }))
        return { ...c, products: ordered }
      })
    )
    return NextResponse.json({ collections: withProducts }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
