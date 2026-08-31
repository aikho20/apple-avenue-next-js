import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import bcrypt from 'bcrypt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50)

    const filter: any = { role: 'user' }
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    }
    const customers = await User.find(filter).select('name email createdAt').sort({ createdAt: -1 }).limit(limit).lean()
    return NextResponse.json({ customers }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const staff: any = await User.findById(session.user._id)
    if (!staff || (staff.role !== 'admin' && staff.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, email, phone } = await req.json()
    if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    const cleanEmail = email.toLowerCase().trim()
    const exists = await User.findOne({ email: cleanEmail })
    if (exists) return NextResponse.json({ error: 'Customer email already exists', customer: exists }, { status: 409 })

    const randomPass = Math.random().toString(36).slice(2, 10) + 'A1!'
    const hashed = await bcrypt.hash(randomPass, 10)
    const customer = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashed,
      role: 'user',
      provider: 'credentials',
      // store phone in shippingAddress for quick lookup if needed
    })
    // Optionally store phone in an unused field - keep in cards placeholder? Just return
    return NextResponse.json({ message: 'Customer created', customer: { _id: customer._id, name: customer.name, email: customer.email } }, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
