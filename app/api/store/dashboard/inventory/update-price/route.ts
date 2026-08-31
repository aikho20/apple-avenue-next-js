import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import PriceHistory from '@/lib/model/priceHistory.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import mongoose from 'mongoose'
import { toProductInventory } from '@/lib/inventory'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { productId, newPrice, reason, referenceId } = await req.json()
    const priceNum = Number(newPrice)
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
    if (isNaN(priceNum) || priceNum < 0) return NextResponse.json({ error: 'Price must be >= 0' }, { status: 400 })
    // reason optional but if price drops maybe require? We'll allow empty but warn

    const product: any = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if ((user as any).role === 'branch') {
      const ownBranch = (user as any).branch ? (user as any).branch.toString() : ''
      const prodBranch = (product.branch || '').toString()
      const prodMerchant = (product.merchant || '').toString()
      const isOwner = prodBranch === ownBranch || prodMerchant === (user as any)._id.toString()
      if (!isOwner) return NextResponse.json({ error: 'Forbidden — not your branch product' }, { status: 403 })
    }

    const previousPrice = Number(product.price.toString())
    if (previousPrice === priceNum) return NextResponse.json({ error: 'New price same as current' }, { status: 400 })

    const tryTx = async () => {
      const sess = await mongoose.startSession()
      try {
        sess.startTransaction()
        product.price = new mongoose.Types.Decimal128(priceNum.toString()) as any
        ;(product as any).updatedBy = user._id.toString()
        await product.save({ session: sess })
        const ph = await PriceHistory.create(
          [
            {
              productId: product._id,
              merchant: product.merchant.toString(),
              branch: product.branch || (user as any).branch?.toString() || '',
              previousPrice,
              newPrice: priceNum,
              reason: reason || '',
              referenceId: referenceId || '',
              updatedBy: user._id.toString(),
              updatedByName: user.name || user.email || 'Admin',
            },
          ],
          { session: sess }
        )
        await sess.commitTransaction()
        return ph[0]
      } catch (err) {
        await sess.abortTransaction()
        throw err
      } finally {
        sess.endSession()
      }
    }

    let ph: any
    try {
      ph = await tryTx()
    } catch (e: any) {
      const msg = e.message || ''
      if (msg.includes('Transaction numbers') || msg.includes('replica set') || msg.includes('Transaction')) {
        product.price = new mongoose.Types.Decimal128(priceNum.toString()) as any
        ;(product as any).updatedBy = user._id.toString()
        await product.save()
        ph = await PriceHistory.create({
          productId: product._id,
          merchant: product.merchant.toString(),
          branch: product.branch || (user as any).branch?.toString() || '',
          previousPrice,
          newPrice: priceNum,
          reason: reason || '',
          referenceId: referenceId || '',
          updatedBy: user._id.toString(),
          updatedByName: user.name || user.email || 'Admin',
        })
      } else throw e
    }

    const updated = await Product.findById(productId).lean()
    return NextResponse.json({ message: 'Price updated', product: toProductInventory(updated), history: ph }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
