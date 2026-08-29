import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { asyncEncode } from '@/lib/utils/token'

export async function GET() {
  try {
    await connectDB()
    // Apple Avenue is single-merchant: return singleton admin store
    const admin = await User.findOne({ role: 'admin' })
      .select('-password -role -email -provider')
    if (!admin) {
      // No seeded store yet — return empty so UI shows seed-required, not a fake ObjectId
      return NextResponse.json({ store: [], singleton: false, seedRequired: true }, { status: 200 })
    }
    return NextResponse.json({ store: [admin] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { merchantId } = await req.json()
    const store = await User.findOne({ _id: merchantId })
      .select('-password')
      .select('-role')
      .select('-email')
      .select('-provider')
    if (!store) {
      return NextResponse.json({ message: 'No store found' }, { status: 200 })
    }
    return NextResponse.json({ store: asyncEncode(store) }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
