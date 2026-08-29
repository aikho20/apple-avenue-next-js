import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Banner from '@/lib/model/banner.model'
import { resolveMerchantId } from '@/lib/merchant'

// Public — landing page slider, no auth
export async function GET() {
  try {
    await connectDB()
    const merchantId = await resolveMerchantId()
    if (!merchantId) return NextResponse.json({ banners: [] }, { status: 200 })
    const banners = await Banner.find({ merchant: merchantId, active: true }).sort({ order: 1, createdAt: 1 }).lean()
    return NextResponse.json({ banners }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
