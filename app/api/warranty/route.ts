import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Warranty from '@/lib/model/warranty.model'
import Product from '@/lib/model/product.model'
import Order from '@/lib/model/order.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

// GET /api/warranty — list current user's warranties (also matches guest email warranties)
export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = session.user._id.toString()
    const userEmail = (session.user as any).email?.toLowerCase()
    const query: any = userEmail ? { $or: [{ user: userId }, { user: userEmail }] } : { user: userId }
    const warranties = await Warranty.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ warranties }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/warranty — DISABLED for customers; only admin can register (Dashboard → Warranty)
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // Import User to check role
    const User = (await import('@/lib/model/user.model')).default
    const me = await User.findById(session.user._id)
    if (!me || me.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can register warranties. Please contact Apple Avenue support.' }, { status: 403 })
    }
    const { productId, imei, serialNumber, purchaseDate, orderId, userId, userEmail } = await req.json()
    if (!productId || !imei || !serialNumber || !purchaseDate)
      return NextResponse.json({ error: 'product, IMEI, serial and purchaseDate required' }, { status: 400 })

    // Resolve target user (admin can register for any customer, even if email not found — guest warranty)
    let targetUserId = userId || session.user._id.toString()
    let targetUserEmail = ''
    let isGuestEmail = false
    if (userEmail) {
      const cleanEmail = userEmail.toLowerCase().trim()
      const u = await User.findOne({ email: cleanEmail })
      if (u) {
        targetUserId = u._id.toString()
        targetUserEmail = u.email
      } else {
        // Allow registration even if customer email not found — store email as identifier (guest)
        targetUserId = cleanEmail
        targetUserEmail = cleanEmail
        isGuestEmail = true
      }
    } else if (userId) {
      const u = await User.findById(userId)
      if (!u) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      targetUserId = u._id.toString()
    }

    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Warranty must be tied to actual order/product — verify order belongs to target user and contains product (skip if guest email)
    if (orderId) {
      const order: any = await Order.findById(orderId)
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      if (!isGuestEmail && order.user.toString() !== targetUserId.toString()) return NextResponse.json({ error: 'Order does not belong to customer' }, { status: 403 })
      const hasProduct = (order.products || []).some((p: any) => (p._id || p.id || '').toString() === productId.toString())
      if (!hasProduct) return NextResponse.json({ error: 'Product not in order' }, { status: 400 })
    }

    const trimmedImei = imei.trim()
    const trimmedSerial = serialNumber.trim()
    if (trimmedImei.length < 10) return NextResponse.json({ error: 'Invalid IMEI' }, { status: 400 })

    const existingImei = await Warranty.findOne({ imei: trimmedImei, user: targetUserId.toString() })
    if (existingImei) return NextResponse.json({ error: 'IMEI already registered for this customer' }, { status: 409 })
    const existingSerial = await Warranty.findOne({ serialNumber: trimmedSerial, user: targetUserId.toString() })
    if (existingSerial) return NextResponse.json({ error: 'Serial already registered for this customer' }, { status: 409 })

    const purchase = new Date(purchaseDate)
    const start = new Date(purchase)
    const expiration = new Date(purchase)
    expiration.setFullYear(expiration.getFullYear() + 1) // 1 year warranty

    const now = new Date()
    const status = now > expiration ? 'Expired' : 'Active'

    const warranty = await Warranty.create({
      user: targetUserId.toString(),
      product: productId.toString(),
      productName: product.productName,
      imei: trimmedImei,
      serialNumber: trimmedSerial,
      orderId: orderId || '',
      purchaseDate: purchase,
      warrantyStart: start,
      warrantyExpiration: expiration,
      status,
    })

    return NextResponse.json({ message: 'Warranty registered', warranty }, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'IMEI or serial already registered' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/warranty?id=...
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const w = await Warranty.findOne({ _id: id, user: session.user._id.toString() })
    if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await Warranty.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
