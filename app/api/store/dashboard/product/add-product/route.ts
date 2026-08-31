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
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 403 })
    }

    const { productName, description, price, cost, quantity, images, category, status, isFeatured, isDeal, specs, sku, lowStockThreshold, reservedStock, branch, branchId: bodyBranchId } = await req.json()

    if (!productName || !price || !category || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Admin must select branch before adding
    let targetBranchId = ''
    let targetMerchantId = user._id.toString()
    if (user.role === 'branch') {
      targetBranchId = user.branch ? user.branch.toString() : ''
      if (!targetBranchId) return NextResponse.json({ error: 'Branch account has no branch assigned' }, { status: 400 })
    } else if (user.role === 'admin') {
      const requestedBranch = (bodyBranchId || branch || '').toString().trim()
      if (!requestedBranch || requestedBranch === 'all') {
        return NextResponse.json({ error: 'Admin must select a branch before adding product' }, { status: 400 })
      }
      const Branch = (await import('@/lib/model/branch.model')).default
      const br: any = await Branch.findById(requestedBranch).lean()
      if (!br) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
      targetBranchId = br._id.toString()
      targetMerchantId = br.manager ? br.manager.toString() : targetBranchId
    }

    const skuVal = (sku && String(sku).trim()) || `SKU-${Date.now().toString().slice(-6)}`
    const newProduct = new Product({
      images: images || [],
      category,
      productName: productName.trim(),
      description: description || '',
      price,
      cost: cost || 0,
      merchant: targetMerchantId,
      quantity: Number(quantity),
      status: status || 'Posted',
      isFeatured: !!isFeatured,
      isDeal: !!isDeal,
      specs: specs || {},
      sku: skuVal,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      reservedStock: reservedStock !== undefined ? Number(reservedStock) : 0,
      updatedBy: user._id.toString(),
      branch: targetBranchId,
    })

    await newProduct.save()

    // Create initial inventory transaction atomically if quantity >0
    try {
      const InventoryTransaction = (await import('@/lib/model/inventoryTransaction.model')).default
      const qty = Number(quantity)
      if (qty > 0) {
        await InventoryTransaction.create({
          productId: newProduct._id,
          merchant: targetMerchantId,
          type: 'INITIAL_STOCK',
          quantityBefore: 0,
          quantityChange: qty,
          quantityAfter: qty,
          reason: 'Initial stock',
          branch: targetBranchId,
          createdBy: user._id.toString(),
          createdByName: user.name || user.email || 'Admin',
        })
      }
    } catch {}

    await Activity.create({
      merchant: user._id.toString(),
      branch: targetBranchId || (user as any).branch?.toString() || '',
      user: user._id.toString(),
      action: 'product_created',
      detail: `Created product ${productName}`,
    })

    return NextResponse.json({ message: 'Successfully added!', product: newProduct }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
