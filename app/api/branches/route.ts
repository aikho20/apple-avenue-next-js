import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Branch from '@/lib/model/branch.model'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const filter: any = { isActive: true }
    let branches = await Branch.find(filter).sort({ createdAt: 1 }).lean()
    if (search) {
      branches = branches.filter(
        (b: any) =>
          b.name.toLowerCase().includes(search) ||
          b.address.toLowerCase().includes(search) ||
          (b.city || '').toLowerCase().includes(search) ||
          (b.province || '').toLowerCase().includes(search)
      )
    }
    return NextResponse.json({ branches }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
