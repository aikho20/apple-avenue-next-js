import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Discount from '@/lib/model/discount.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const discounts = await Discount.find({ merchant: user._id.toString() }).sort({ createdAt: -1 })
    return NextResponse.json({ discounts }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { code, type, value, minOrder, expiresAt } = await req.json()
    if (!code || !value) return NextResponse.json({ error: 'Code and value required' }, { status: 400 })
    const exists = await Discount.findOne({ code: code.toUpperCase().trim(), merchant: user._id.toString() })
    if (exists) return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    const d = await Discount.create({
      code: code.toUpperCase().trim(),
      type: type || 'percentage',
      value: Number(value),
      minOrder: Number(minOrder || 0),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      merchant: user._id.toString(),
    })
    return NextResponse.json({ message: 'Discount created', discount: d }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { _id, active } = await req.json()
    const d = await Discount.findOne({ _id, merchant: user._id.toString() })
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (typeof active === 'boolean') d.active = active
    await d.save()
    return NextResponse.json({ message: 'Updated', discount: d }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await Discount.findOneAndDelete({ _id: id, merchant: user._id.toString() })
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
