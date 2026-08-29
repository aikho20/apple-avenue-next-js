import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Warranty from '@/lib/model/warranty.model'
import User from '@/lib/model/user.model'
import Product from '@/lib/model/product.model'
import Order from '@/lib/model/order.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

async function requireAdmin() {
  const session = await getServerSession(nextauthOptions)
  if (!session?.user?._id) return { error: 'Unauthorized', status: 401 } as const
  const user = await User.findById(session.user._id)
  if (!user || user.role !== 'admin') return { error: 'Forbidden', status: 403 } as const
  return { user } as const
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { productId, imei, serialNumber, purchaseDate, orderId, userId, userEmail } = await req.json()
    if (!productId || !imei || !serialNumber || !purchaseDate)
      return NextResponse.json({ error: 'product, IMEI, serial and purchaseDate required' }, { status: 400 })
    let targetUserId = userId
    let targetUserEmail = ''
    let isGuestEmail = false
    if (userEmail) {
      const cleanEmail = userEmail.toLowerCase().trim()
      const u = await User.findOne({ email: cleanEmail })
      if (u) {
        targetUserId = u._id.toString()
        targetUserEmail = u.email
      } else {
        // Allow registration even if customer email not found — store email as identifier (guest warranty)
        targetUserId = cleanEmail
        targetUserEmail = cleanEmail
        isGuestEmail = true
      }
    }
    if (!targetUserId) return NextResponse.json({ error: 'Customer required (userId or userEmail)' }, { status: 400 })
    // Only validate user existence if not a guest email
    if (!isGuestEmail) {
      const targetUser = await User.findById(targetUserId)
      if (!targetUser) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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
    expiration.setFullYear(expiration.getFullYear() + 1)
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
    return NextResponse.json({ message: 'Warranty registered by admin', warranty }, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'IMEI or serial already registered' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const warranties = await Warranty.find({}).sort({ createdAt: -1 })
    // Populate user email for admin view
    const withUser = await Promise.all(
      warranties.map(async (w: any) => {
        const u = await User.findById(w.user).select('email name')
        return { ...w.toObject(), userEmail: u?.email || w.user, userName: u?.name || '' }
      })
    )
    return NextResponse.json({ warranties: withUser }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { _id, status, notes, warrantyExpiration } = await req.json()
    if (!_id) return NextResponse.json({ error: '_id required' }, { status: 400 })
    const w: any = await Warranty.findById(_id)
    if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (status && ['Active', 'Expired', 'Void', 'Pending'].includes(status)) w.status = status
    if (notes !== undefined) w.notes = notes
    if (warrantyExpiration) w.warrantyExpiration = new Date(warrantyExpiration)
    await w.save()
    return NextResponse.json({ message: 'Updated', warranty: w }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await Warranty.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
