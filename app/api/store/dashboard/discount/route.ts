import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Discount from '@/lib/model/discount.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

async function requireAuth() {
  const session = await getServerSession(nextauthOptions)
  if (!session?.user?._id) return { error: 'Unauthorized', status: 401 } as const
  const user: any = await User.findById(session.user._id)
  if (!user || (user.role !== 'admin' && user.role !== 'branch')) return { error: 'Forbidden', status: 403 } as const
  return { user } as const
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')
    let filter: any = {}
    if (auth.user.role === 'branch') {
      filter = { $or: [{ merchant: auth.user._id.toString() }, { branch: auth.user.branch?.toString() }] }
    } else if (branchId) {
      if (branchId === 'all') filter = {}
      else filter = { $or: [{ branch: branchId }, { merchant: branchId }] }
    } else {
      // admin default: show all (after transfer admin has 0, so show all)
      filter = {}
    }
    const discounts = await Discount.find(filter).sort({ createdAt: -1 })
    return NextResponse.json({ discounts }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { code, type, value, minOrder, expiresAt, branchId: bodyBranchId } = await req.json()
    if (!code || !value) return NextResponse.json({ error: 'Code and value required' }, { status: 400 })
    let merchantId = auth.user._id.toString()
    let branchId = ''
    if (auth.user.role === 'branch') {
      branchId = auth.user.branch?.toString() || ''
      if (!branchId) return NextResponse.json({ error: 'Branch not assigned' }, { status: 400 })
    } else if (auth.user.role === 'admin') {
      const requested = (bodyBranchId || '').toString().trim()
      if (!requested || requested === 'all') return NextResponse.json({ error: 'Admin must select a branch before adding discount' }, { status: 400 })
      const Branch = (await import('@/lib/model/branch.model')).default
      const br: any = await Branch.findById(requested).lean()
      if (!br) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
      branchId = br._id.toString()
      merchantId = br.manager ? br.manager.toString() : branchId
    }
    const exists = await Discount.findOne({ code: code.toUpperCase().trim(), $or: [{ merchant: merchantId }, { branch: branchId }] })
    // simple duplicate check per merchant/branch
    const dup = await Discount.findOne({ code: code.toUpperCase().trim(), merchant: merchantId })
    if (dup) return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    const d = await Discount.create({
      code: code.toUpperCase().trim(),
      type: type || 'percentage',
      value: Number(value),
      minOrder: Number(minOrder || 0),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      merchant: merchantId,
      branch: branchId,
    })
    return NextResponse.json({ message: 'Discount created', discount: d }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { _id, active } = await req.json()
    let filter: any = { _id }
    if (auth.user.role === 'branch') {
      const ownBranch = auth.user.branch ? auth.user.branch.toString() : ''
      const ownMerchant = auth.user._id.toString()
      filter = { _id, $or: [{ branch: ownBranch }, { merchant: ownMerchant }] }
    }
    const d: any = await Discount.findOne(filter)
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
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    let filter: any = { _id: id }
    if (auth.user.role === 'branch') {
      const ownBranch = auth.user.branch ? auth.user.branch.toString() : ''
      const ownMerchant = auth.user._id.toString()
      filter = { _id: id, $or: [{ branch: ownBranch }, { merchant: ownMerchant }] }
    }
    await Discount.findOneAndDelete(filter)
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
