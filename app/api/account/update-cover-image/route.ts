import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { image } = await req.json()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    if (!image) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }
    await User.findByIdAndUpdate(user._id, { coverPhoto: image })
    return NextResponse.json({ message: 'Successfully updated cover image!' }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
