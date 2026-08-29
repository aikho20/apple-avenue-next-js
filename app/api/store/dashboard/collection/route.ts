import connectDB from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import Collection from '@/lib/model/collection.model'
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
    const collections = await Collection.find({ merchant: user._id.toString() }).sort({ createdAt: -1 })
    return NextResponse.json({ collections }, { status: 200 })
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
    const { name, description, image } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const c = await Collection.create({ name: name.trim(), description: description || '', image: image || '', merchant: user._id.toString() })
    return NextResponse.json({ message: 'Collection created', collection: c }, { status: 201 })
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
    const { _id, name, description, image, productIds } = await req.json()
    const c = await Collection.findOne({ _id, merchant: user._id.toString() })
    if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (name !== undefined) c.name = name || c.name
    if (description !== undefined) c.description = description ?? c.description
    if (image !== undefined) c.image = image ?? c.image
    if (productIds !== undefined) c.productIds = Array.isArray(productIds) ? productIds : c.productIds
    await c.save()
    return NextResponse.json({ message: 'Updated', collection: c }, { status: 200 })
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
    await Collection.findOneAndDelete({ _id: id, merchant: user._id.toString() })
    return NextResponse.json({ message: 'Deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
