import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import Activity from '@/lib/model/activity.model'
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
    const activities = await Activity.find({ merchant: user._id.toString() }).sort({ createdAt: -1 }).limit(50)
    return NextResponse.json({ activities }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
