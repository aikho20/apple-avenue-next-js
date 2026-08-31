import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Branch from '@/lib/model/branch.model'
import { haversine } from '@/lib/branch'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { latitude, longitude } = await req.json()
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (isNaN(lat) || isNaN(lng)) return NextResponse.json({ error: 'latitude/longitude required' }, { status: 400 })
    const branches: any[] = await Branch.find({ isActive: true }).lean()
    if (branches.length === 0) return NextResponse.json({ branch: null, distanceKm: null }, { status: 200 })
    let nearest = branches[0]
    let min = haversine(lat, lng, nearest.latitude, nearest.longitude)
    for (const b of branches.slice(1)) {
      const d = haversine(lat, lng, b.latitude, b.longitude)
      if (d < min) {
        min = d
        nearest = b
      }
    }
    return NextResponse.json({ branch: nearest, distanceKm: Math.round(min * 10) / 10 }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  if (isNaN(lat) || isNaN(lng)) return NextResponse.json({ error: 'lat/lng required' }, { status: 400 })
  return POST(new NextRequest(req.url, { method: 'POST', body: JSON.stringify({ latitude: lat, longitude: lng }) } as any))
}
