import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Banner from '@/lib/model/banner.model'
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
      // admin default after transfer: show all branches
      filter = {}
    }
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: 1 })
    return NextResponse.json({ banners }, { status: 200 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { title, subtitle, image, link, order, branchId: bodyBranchId } = await req.json()
    if (!title || !image) return NextResponse.json({ error: 'Title and image required' }, { status: 400 })
    let branchId = ''
    let merchantId = auth.user._id.toString()
    if (auth.user.role === 'branch') {
      branchId = auth.user.branch?.toString() || ''
      if (!branchId) return NextResponse.json({ error: 'Branch not assigned' }, { status: 400 })
    } else if (auth.user.role === 'admin') {
      const requested = (bodyBranchId || '').toString().trim()
      if (!requested || requested === 'all') return NextResponse.json({ error: 'Admin must select a branch before adding banner' }, { status: 400 })
      const Branch = (await import('@/lib/model/branch.model')).default
      const br: any = await Branch.findById(requested).lean()
      if (!br) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
      branchId = br._id.toString()
      merchantId = br.manager ? br.manager.toString() : branchId
    }
    const b = await Banner.create({
      merchant: merchantId,
      branch: branchId,
      title: title.trim(),
      subtitle: subtitle || '',
      image,
      link: link || '/store',
      order: Number(order || 0),
      active: true,
    })
    return NextResponse.json({ message: 'Banner created', banner: b }, { status: 201 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { _id, title, subtitle, image, link, order, active } = await req.json()
    if (!_id) return NextResponse.json({ error: '_id required' }, { status: 400 })
    let filter: any = { _id }
    if (auth.user.role === 'branch') {
      const ownBranch = auth.user.branch ? auth.user.branch.toString() : ''
      const ownMerchant = auth.user._id.toString()
      filter = { _id, $or: [{ branch: ownBranch }, { merchant: ownMerchant }] }
    }
    const b: any = await Banner.findOne(filter)
    if (!b) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (title !== undefined) b.title = title
    if (subtitle !== undefined) b.subtitle = subtitle
    if (image !== undefined) b.image = image
    if (link !== undefined) b.link = link
    if (order !== undefined) b.order = Number(order)
    if (typeof active === 'boolean') b.active = active
    await b.save()
    return NextResponse.json({ message: 'Updated', banner: b }, { status: 200 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
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
    await Banner.findOneAndDelete(filter)
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
