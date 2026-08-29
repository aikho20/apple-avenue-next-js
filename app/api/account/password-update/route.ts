import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { oldPassword, newPassword } = await req.json()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }
    if (session.user.provider && session.user.provider !== 'credentials') {
      return NextResponse.json(
        { error: `Signed in via ${session.user.provider}. Password change not allowed.` },
        { status: 400 }
      )
    }
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Old and new password required' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }
    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password!' }, { status: 400 })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    await User.findByIdAndUpdate(user._id, { password: hashedPassword })
    return NextResponse.json({ message: 'Successfully updated!' }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
