import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Branch from '@/lib/model/branch.model'
import User from '@/lib/model/user.model'
import bcrypt from 'bcrypt'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

async function requireAuth() {
  const session = await getServerSession(nextauthOptions)
  if (!session?.user?._id) return { error: 'Unauthorized', status: 401 } as const
  const user: any = await User.findById(session.user._id)
  if (!user) return { error: 'Unauthorized', status: 401 } as const
  if (user.role !== 'admin' && user.role !== 'branch') return { error: 'Forbidden', status: 403 } as const
  return { user, session } as const
}

export async function GET() {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const user = auth.user
    let branches: any[]
    if (user.role === 'admin') {
      branches = await Branch.find({}).sort({ createdAt: -1 }).lean()
      // attach manager info
      const enriched = await Promise.all(
        branches.map(async (b: any) => {
          let manager: any = null
          if (b.manager) manager = await User.findById(b.manager).select('name email').lean()
          return { ...b, managerName: manager?.name || b.managerEmail || '' }
        })
      )
      return NextResponse.json({ branches: enriched }, { status: 200 })
    } else {
      // branch user sees only own branch
      const branch = await Branch.findOne({ manager: user._id }).lean()
      if (!branch) return NextResponse.json({ branches: [] }, { status: 200 })
      return NextResponse.json({ branches: [branch] }, { status: 200 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    if (auth.user.role !== 'admin') return NextResponse.json({ error: 'Only admin can create branches' }, { status: 403 })
    const { name, address, city, province, barangay, zipCode, latitude, longitude, phone, email, image, managerEmail, managerPassword, managerName } = await req.json()
    if (!name || !address || latitude == null || longitude == null) {
      return NextResponse.json({ error: 'name, address, latitude, longitude required' }, { status: 400 })
    }
    if (!managerEmail || !managerPassword) return NextResponse.json({ error: 'Branch manager email/password required' }, { status: 400 })
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (isNaN(lat) || isNaN(lng)) return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })

    // check duplicate branch name
    const existsBranch = await Branch.findOne({ name: name.trim() }).lean()
    if (existsBranch) return NextResponse.json({ error: 'Branch name already exists' }, { status: 409 })

    // create or get manager user
    let manager: any = await User.findOne({ email: managerEmail.toLowerCase().trim() })
    if (manager) {
      if (manager.role === 'branch' && manager.branch) return NextResponse.json({ error: 'Manager already assigned to a branch' }, { status: 409 })
      // promote existing user to branch
      manager.role = 'branch'
      manager.branchName = name.trim()
      if (managerPassword) manager.password = await bcrypt.hash(managerPassword, 10)
      await manager.save()
    } else {
      const hashed = await bcrypt.hash(managerPassword, 10)
      manager = await User.create({
        name: managerName || name.trim() + ' Manager',
        email: managerEmail.toLowerCase().trim(),
        password: hashed,
        role: 'branch',
        branchName: name.trim(),
        provider: 'credentials',
      })
    }

    const branch = await Branch.create({
      name: name.trim(),
      description: '',
      address: address.trim(),
      city: city || '',
      province: province || '',
      barangay: barangay || '',
      zipCode: zipCode || '',
      latitude: lat,
      longitude: lng,
      phone: phone || '',
      email: email || managerEmail,
      image: image || '',
      manager: manager._id,
      managerEmail: manager.email,
      isActive: true,
      createdBy: auth.user._id.toString(),
    })

    // link user.branch
    manager.branch = branch._id
    await manager.save()

    return NextResponse.json({ message: 'Branch created', branch, manager: { _id: manager._id, email: manager.email } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { _id, name, address, city, province, barangay, zipCode, latitude, longitude, phone, email, image, isActive } = await req.json()
    if (!_id) return NextResponse.json({ error: '_id required' }, { status: 400 })
    const branch: any = await Branch.findById(_id)
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    // permission: admin can edit any, branch can edit own
    if (auth.user.role === 'branch' && branch.manager.toString() !== auth.user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (name !== undefined) branch.name = name
    if (address !== undefined) branch.address = address
    if (city !== undefined) branch.city = city
    if (province !== undefined) branch.province = province
    if (barangay !== undefined) branch.barangay = barangay
    if (zipCode !== undefined) branch.zipCode = zipCode
    if (latitude !== undefined) branch.latitude = Number(latitude)
    if (longitude !== undefined) branch.longitude = Number(longitude)
    if (phone !== undefined) branch.phone = phone
    if (email !== undefined) branch.email = email
    if (image !== undefined) branch.image = image
    if (typeof isActive === 'boolean' && auth.user.role === 'admin') branch.isActive = isActive
    await branch.save()
    return NextResponse.json({ message: 'Branch updated', branch }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB()
    const auth: any = await requireAuth()
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    if (auth.user.role !== 'admin') return NextResponse.json({ error: 'Only admin can delete branches' }, { status: 403 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const branch: any = await Branch.findById(id)
    if (!branch) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // optionally keep manager but demote? For now keep user but clear branch
    if (branch.manager) {
      await User.findByIdAndUpdate(branch.manager, { $unset: { branch: 1 }, branchName: '', role: 'user' })
    }
    await Branch.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Branch deleted' }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
