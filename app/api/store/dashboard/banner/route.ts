import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Banner from '@/lib/model/banner.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

async function requireAdmin() {
  const session = await getServerSession(nextauthOptions)
  if (!session?.user?._id) return { error: 'Unauthorized', status: 401 } as const
  const user = await User.findById(session.user._id)
  if (!user || user.role !== 'admin') return { error: 'Forbidden', status: 403 } as const
  return { user } as const
}

export async function GET() {
  try {
    await connectDB()
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const banners = await Banner.find({ merchant: auth.user._id.toString() }).sort({ order: 1, createdAt: 1 })
    return NextResponse.json({ banners }, { status: 200 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { title, subtitle, image, link, order } = await req.json()
    if (!title || !image) return NextResponse.json({ error: 'Title and image required' }, { status: 400 })
    const b = await Banner.create({
      merchant: auth.user._id.toString(),
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
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { _id, title, subtitle, image, link, order, active } = await req.json()
    if (!_id) return NextResponse.json({ error: '_id required' }, { status: 400 })
    const b: any = await Banner.findOne({ _id, merchant: auth.user._id.toString() })
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
    const auth: any = await requireAdmin()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await Banner.findOneAndDelete({ _id: id, merchant: auth.user._id.toString() })
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
