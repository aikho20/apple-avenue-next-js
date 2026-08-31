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
    const { productId, quantity, reason, referenceId, type } = await req.json()
    const qty = Number(quantity)
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
    if (!qty || isNaN(qty) || qty <= 0 || !Number.isInteger(qty))
      return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 })
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
    const reserved = Number((product as any).reservedStock || 0)
    const available = quantityBefore - reserved
    if (qty > available) {
      return NextResponse.json({ error: `Insufficient stock. Available: ${available}` }, { status: 400 })
    }
    const quantityAfter = quantityBefore - qty
    const txType = ['DAMAGED', 'LOST', 'STOCK_REMOVED', 'ADJUSTMENT'].includes(type) ? type : 'STOCK_REMOVED'

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
              type: txType,
              quantityBefore,
              quantityChange: -qty,
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
          type: txType,
          quantityBefore,
          quantityChange: -qty,
          quantityAfter,
          reason: reason.trim(),
          referenceId: referenceId || '',
          createdBy: user._id.toString(),
          createdByName: user.name || user.email || 'Admin',
        })
      } else throw e
    }

    const updated = await Product.findById(productId).lean()
    return NextResponse.json({ message: 'Stock removed', product: toProductInventory(updated), transaction: tx }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
