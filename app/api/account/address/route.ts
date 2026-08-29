import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextauthOptions } from '@/lib/next-auth-option'
import { UPDATE, ADD, DELETE, GET } from '@/utils/data'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { address, action } = await req.json()
    const session = await getServerSession(nextauthOptions)

    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }

    const user = await User.findById(session.user._id)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
    }

    if (action === GET) {
      return NextResponse.json({ address: user.shippingAddress || [] }, { status: 200 })
    }

    if (address?._id && action === UPDATE) {
      await User.findOneAndUpdate(
        { _id: user._id, 'shippingAddress._id': address._id },
        { $set: { 'shippingAddress.$': address } },
        { new: true }
      )
      return NextResponse.json({ message: 'Successfully updated address!' }, { status: 200 })
    }

    if (address?._id && action === DELETE) {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { shippingAddress: { _id: address._id } } },
        { new: true }
      )
      return NextResponse.json({ message: 'Successfully deleted address!' }, { status: 200 })
    }

    if (action === ADD) {
      if (!address?.address || !address?.zipCode) {
        return NextResponse.json({ error: 'Address and zip code required' }, { status: 400 })
      }
      await User.findByIdAndUpdate(user._id, {
        $push: { shippingAddress: { _id: new ObjectId().toString(), ...address } },
      })
      return NextResponse.json({ message: 'Successfully added address!' }, { status: 200 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
