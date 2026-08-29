import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await User.findById(session.user._id)
    return NextResponse.json({ cards: (user as any).cards || [] }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(nextauthOptions)
    if (!session?.user?._id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { cardNumber, expiry, holder, action, cardId } = await req.json()
    const user = await User.findById(session.user._id)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (action === 'delete' && cardId) {
      await User.findByIdAndUpdate(user._id, { $pull: { cards: { _id: cardId } } })
      return NextResponse.json({ message: 'Card deleted' }, { status: 200 })
    }

    if (!cardNumber || !expiry || !holder) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const last4 = cardNumber.slice(-4)
    const newCard = { _id: new ObjectId().toString(), cardNumber: `**** **** **** ${last4}`, holder, expiry, brand: 'Visa' }
    await User.findByIdAndUpdate(user._id, { $push: { cards: newCard } })
    return NextResponse.json({ message: 'Card added', card: newCard }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
