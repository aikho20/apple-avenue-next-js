import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import Activity from '@/lib/model/activity.model'
import User from '@/lib/model/user.model'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function GET(req: Request) {
  try {
    await connectDB()
    const url = new URL(req.url)
    const branchIdParam = url.searchParams.get('branchId') || ''
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user: any = await User.findById(session.user._id)
    if (!user || (user.role !== 'admin' && user.role !== 'branch')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (user.role === 'branch') {
      const ownBranch = user.branch ? user.branch.toString() : ''
      const filter: any = ownBranch ? { branch: ownBranch } : { merchant: user._id.toString() }
      const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(50)
      return NextResponse.json({ activities }, { status: 200 })
    }
    // Admin with optional branch filter
    if (branchIdParam && branchIdParam !== 'all') {
      const activities = await Activity.find({ branch: branchIdParam }).sort({ createdAt: -1 }).limit(50)
      return NextResponse.json({ activities }, { status: 200 })
    }
    if (branchIdParam === 'all') {
      const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(50)
      return NextResponse.json({ activities }, { status: 200 })
    }
    const activities = await Activity.find({ merchant: user._id.toString() }).sort({ createdAt: -1 }).limit(50)
    return NextResponse.json({ activities }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
