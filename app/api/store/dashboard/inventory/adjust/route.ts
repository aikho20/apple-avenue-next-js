import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import InventoryTransaction from '@/lib/model/inventoryTransaction.model'
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

    const { productId, quantity, adjustment, reason, referenceId } = await req.json()
    const deltaRaw = quantity ?? adjustment
    const delta = Number(deltaRaw)
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
    if (delta === 0 || isNaN(delta) || !Number.isInteger(delta)) return NextResponse.json({ error: 'Adjustment must be a non-zero integer' }, { status: 400 })
    if (!reason || !reason.trim()) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })

    const product: any = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if ((user as any).role === 'branch') {
      const ownBranch = (user as any).branch ? (user as any).branch.toString() : ''
      const prodBranch = (product.branch || '').toString()
      const prodMerchant = (product.merchant || '').toString()
      const isOwner = prodBranch === ownBranch || prodMerchant === (user as any)._id.toString()
      if (!isOwner) return NextResponse.json({ error: 'Forbidden — not your branch product' }, { status: 403 })
    }

    const quantityBefore = Number(product.quantity || 0)
    const quantityAfter = quantityBefore + delta
    if (quantityAfter < 0) return NextResponse.json({ error: 'Resulting stock cannot be negative' }, { status: 400 })

    const tryTx = async () => {
      const sess = await mongoose.startSession()
      try {
        sess.startTransaction()
        product.quantity = quantityAfter
        ;(product as any).updatedBy = user._id.toString()
        await product.save({ session: sess })
        const tx = await InventoryTransaction.create(
          [
            {
              productId: product._id,
              merchant: product.merchant.toString(),
              branch: product.branch || (user as any).branch?.toString() || '',
              type: 'ADJUSTMENT',
              quantityBefore,
              quantityChange: delta,
              quantityAfter,
              reason: reason.trim(),
              referenceId: referenceId || '',
              createdBy: user._id.toString(),
              createdByName: user.name || user.email || 'Admin',
            },
          ],
          { session: sess }
        )
        await sess.commitTransaction()
        return tx[0]
      } catch (err) {
        await sess.abortTransaction()
        throw err
      } finally {
        sess.endSession()
      }
    }

    let tx: any
    try {
      tx = await tryTx()
    } catch (e: any) {
      const msg = e.message || ''
      if (msg.includes('Transaction numbers') || msg.includes('replica set') || msg.includes('Transaction')) {
        product.quantity = quantityAfter
        ;(product as any).updatedBy = user._id.toString()
        await product.save()
        tx = await InventoryTransaction.create({
          productId: product._id,
          merchant: product.merchant.toString(),
          branch: product.branch || (user as any).branch?.toString() || '',
          type: 'ADJUSTMENT',
          quantityBefore,
          quantityChange: delta,
          quantityAfter,
          reason: reason.trim(),
          referenceId: referenceId || '',
          createdBy: user._id.toString(),
          createdByName: user.name || user.email || 'Admin',
        })
      } else throw e
    }

    const updated = await Product.findById(productId).lean()
    return NextResponse.json({ message: 'Inventory adjusted', product: toProductInventory(updated), transaction: tx }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
