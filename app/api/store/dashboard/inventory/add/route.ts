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
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { productId, quantity, reason, referenceId } = await req.json()
    const qty = Number(quantity)
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
    if (!qty || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 })
    }
    if (!reason || !reason.trim()) return NextResponse.json({ error: 'Reason is required' }, { status: 400 })

    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.merchant.toString() !== user._id.toString()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const quantityBefore = Number(product.quantity || 0)
    const quantityAfter = quantityBefore + qty

    // Try transactional
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
              type: 'STOCK_ADDED',
              quantityBefore,
              quantityChange: qty,
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
      // fallback if transactions not supported (standalone mongo)
      if (msg.includes('Transaction numbers') || msg.includes('replica set') || msg.includes('Transaction')) {
        product.quantity = quantityAfter
        ;(product as any).updatedBy = user._id.toString()
        await product.save()
        tx = await InventoryTransaction.create({
          productId: product._id,
          merchant: product.merchant.toString(),
          type: 'STOCK_ADDED',
          quantityBefore,
          quantityChange: qty,
          quantityAfter,
          reason: reason.trim(),
          referenceId: referenceId || '',
          createdBy: user._id.toString(),
          createdByName: user.name || user.email || 'Admin',
        })
      } else {
        throw e
      }
    }

    const updated = await Product.findById(productId).lean()
    return NextResponse.json({ message: 'Stock added', product: toProductInventory(updated), transaction: tx }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
