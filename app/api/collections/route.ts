import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Collection from '@/lib/model/collection.model'
import Product from '@/lib/model/product.model'
import { resolveMerchantId } from '@/lib/merchant'

export async function GET(req: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')
    let filter: any = {}
    if (branchId) {
      if (branchId === 'all') filter = {}
      else {
        const Branch = (await import('@/lib/model/branch.model')).default
        const br: any = await Branch.findById(branchId).lean().catch(() => null)
        if (br) filter = { $or: [{ branch: branchId }, { merchant: br.manager?.toString() }] }
        else filter = { branch: branchId }
      }
    } else {
      const merchantId = await resolveMerchantId()
      if (!merchantId) return NextResponse.json({ collections: [] }, { status: 200 })
      filter = { merchant: merchantId }
    }
    const cols = await Collection.find(filter).sort({ createdAt: -1 }).lean()
    // Populate products for each collection
    const withProducts = await Promise.all(
      cols.map(async (c: any) => {
        const ids: string[] = c.productIds || []
        if (ids.length === 0) return { ...c, products: [] }
        const prodFilter: any = { _id: { $in: ids }, status: 'Posted' }
        // if branch-specific, don't restrict by merchant to allow branch products
        if (!branchId) {
          const mId = await resolveMerchantId()
          if (mId) prodFilter.merchant = mId
        }
        const prods = await Product.find(prodFilter).lean()
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
