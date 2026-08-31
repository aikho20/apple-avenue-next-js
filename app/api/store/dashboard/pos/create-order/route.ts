import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/model/product.model'
import Order from '@/lib/model/order.model'
import User from '@/lib/model/user.model'
import Branch from '@/lib/model/branch.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { autoRegisterWarrantiesForOrder } from '@/lib/warranty'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const staff: any = await User.findById(session.user._id)
    if (!staff || (staff.role !== 'admin' && staff.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { customerId, newCustomer, items, paymentMethod, shippingOption, shippingAddress, branchId: bodyBranchId, createWarranty } = body

    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'No products selected' }, { status: 400 })
    if (!paymentMethod) return NextResponse.json({ error: 'Payment method required' }, { status: 400 })

    // Resolve branch
    let branchId = ''
    let branchDoc: any = null
    if (staff.role === 'branch') {
      branchId = staff.branch ? staff.branch.toString() : ''
      if (!branchId) return NextResponse.json({ error: 'Branch staff has no branch assigned' }, { status: 400 })
      branchDoc = await Branch.findById(branchId).lean().catch(() => null)
    } else {
      // admin must provide branchId
      branchId = (bodyBranchId || '').toString()
      if (!branchId || branchId === 'all') return NextResponse.json({ error: 'Admin must select a branch for POS order' }, { status: 400 })
      branchDoc = await Branch.findById(branchId).lean().catch(() => null)
      if (!branchDoc) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Resolve customer
    let customer: any = null
    if (newCustomer?.name && newCustomer?.email) {
      const cleanEmail = newCustomer.email.toLowerCase().trim()
      customer = await User.findOne({ email: cleanEmail })
      if (!customer) {
        const bcrypt = await import('bcrypt')
        const hashed = await bcrypt.hash(Math.random().toString(36).slice(2, 10) + 'A1!', 10)
        customer = await User.create({ name: newCustomer.name.trim(), email: cleanEmail, password: hashed, role: 'user', provider: 'credentials' })
      }
    } else if (customerId) {
      customer = await User.findById(customerId)
      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    } else {
      return NextResponse.json({ error: 'Customer required — select or create' }, { status: 400 })
    }

    // Validate and build cartItems
    const cartItems: any[] = []
    let total = 0
    // Pre-validate stock first
    for (const entry of items) {
      const pid = entry.productId
      const qty = Number(entry.quantity || entry.value || 0)
      if (!pid || !qty || qty <= 0) return NextResponse.json({ error: `Invalid quantity for ${pid}` }, { status: 400 })
      const prod: any = await Product.findById(pid)
      if (!prod) return NextResponse.json({ error: `Product ${pid} not found` }, { status: 404 })
      // Branch ownership check: must belong to this branch or its manager
      const prodBranch = (prod.branch || '').toString()
      const prodMerchant = (prod.merchant || '').toString()
      const isOwnBranchProduct = prodBranch === branchId
      const isManagerProduct = branchDoc?.manager ? prodMerchant === branchDoc.manager.toString() : false
      const isStaffMerchantProduct = prodMerchant === staff._id.toString()
      // Admin fallback: allow if product branch matches or product is in branch
      if (!isOwnBranchProduct && !isManagerProduct && !isStaffMerchantProduct) {
        // For admin POS, also allow product with empty branch if merchant matches admin
        // Strict: require branch match
        if (prodBranch && prodBranch !== branchId) {
          return NextResponse.json({ error: `${prod.productName} does not belong to selected branch` }, { status: 400 })
        }
      }
      const available = Number(prod.quantity || 0) - Number(prod.reservedStock || 0)
      if (available < qty) return NextResponse.json({ error: `${prod.productName} only ${available} units available` }, { status: 400 })
      if (prod.status !== 'Posted' && prod.status !== 'In Stock') {
        // Allow Low Stock but not Out of Stock/Draft
        if (prod.status === 'Out of Stock' || available <= 0) return NextResponse.json({ error: `${prod.productName} is out of stock` }, { status: 400 })
      }
      const price = Number(prod.price?.toString?.() ?? prod.price)
      total += price * qty
      // Collect imei/serial if provided
      const imeis: string[] = Array.isArray(entry.imei) ? entry.imei : entry.imei ? [entry.imei] : Array.isArray(entry.imeis) ? entry.imeis : []
      const serials: string[] = Array.isArray(entry.serialNumber) ? entry.serialNumber : Array.isArray(entry.serialNumbers) ? entry.serialNumbers : entry.serialNumber ? [entry.serialNumber] : []
      cartItems.push({
        _id: prod._id.toString(),
        productName: prod.productName,
        images: prod.images,
        price,
        value: qty,
        // Store imei arrays for warranty creation later
        imei: imeis,
        serialNumber: serials,
        category: prod.category,
      })
    }

    // Deduct stock + inventory transactions
    for (const entry of items) {
      const pid = entry.productId
      const qty = Number(entry.quantity || entry.value || 0)
      const prod: any = await Product.findById(pid)
      if (!prod) continue
      const before = Number(prod.quantity || 0)
      const after = Math.max(before - qty, 0)
      await Product.findByIdAndUpdate(pid, { quantity: after })
      const updated = await Product.findById(pid).select('quantity')
      if (updated && updated.quantity <= 0) {
        await Product.findByIdAndUpdate(pid, { status: 'Out of Stock' })
      }
      try {
        const InventoryTransaction = (await import('@/lib/model/inventoryTransaction.model')).default
        await InventoryTransaction.create({
          productId: pid,
          merchant: staff._id.toString(),
          branch: branchId,
          type: 'SALE',
          quantityBefore: before,
          quantityChange: -qty,
          quantityAfter: after,
          reason: `POS Sale — ${customer.name} (${customer.email})`,
          referenceId: '',
          createdBy: staff._id.toString(),
          createdByName: staff.name || staff.email || 'POS Staff',
        })
      } catch {}
    }

    const fullName = customer.name || newCustomer?.name || 'POS Customer'
    const addr = shippingAddress || (branchDoc ? `${branchDoc.name} — ${branchDoc.address}` : 'POS Walk-in Store')
    const shipOpt = shippingOption || 'POS Walk-in'

    const order = await Order.create({
      merchant: staff._id.toString(),
      branch: branchId,
      user: customer._id.toString(),
      products: cartItems,
      shippingAddress: addr,
      shippingOption: shipOpt,
      paymentMethod,
      fullName,
      total: total.toString(),
      status: 'Delivered', // POS Completed directly
    })

    // Activity log
    try {
      const Activity = (await import('@/lib/model/activity.model')).default
      await Activity.create({
        merchant: staff._id.toString(),
        branch: branchId,
        user: staff._id.toString(),
        action: 'pos_order_created',
        detail: `POS Order ${order._id} for ${fullName} — ₱${total} via ${paymentMethod}`,
      })
    } catch {}

    // Auto warranty registration (for POS Delivered orders)
    let warranties: any[] = []
    try {
      // Allow opt-out via createWarranty === false
      if (createWarranty !== false) {
        warranties = await autoRegisterWarrantiesForOrder(order)
      }
    } catch (e) {
      console.log('POS warranty auto-create error', (e as any).message)
    }

    return NextResponse.json({ message: 'POS order completed', order, warranties }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
