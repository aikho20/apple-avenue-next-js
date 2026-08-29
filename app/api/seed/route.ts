import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/model/user.model'
import Product from '@/lib/model/product.model'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

async function handleSeed(secret?: string) {
  const expected = process.env.SEED_SECRET || process.env.TOKEN_SECRET
  if (expected && secret !== expected) {
    return NextResponse.json({ error: 'Invalid seed secret. Pass ?secret=SEED_SECRET or { secret }' }, { status: 401 })
  }
  await connectDB()
  const adminEmail = 'admin@apple-avenue.com'
  let admin: any = await User.findOne({ email: adminEmail.toLowerCase() })
  if (!admin) {
    const hash = await bcrypt.hash('Admin123!', 10)
    admin = await User.create({ name: 'Apple Avenue', email: adminEmail.toLowerCase(), password: hash, role: 'admin', provider: 'credentials' })
  } else if (admin.role !== 'admin') { admin.role = 'admin'; await admin.save() }
  const merchantId = admin._id.toString()
  const seedProducts: any[] = [
    { productName: 'iPhone 15 Pro 256GB — Natural Titanium', category: 'iPhone', description: 'Titanium • A17 Pro • 48MP • 120Hz • 5G • Warranty', price: '89990', cost: 75000, quantity: 12, images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '6.1"', resolution: '2556×1179', refreshRate: '120Hz', panelType: 'Super Retina XDR OLED' }, processor: 'A17 Pro', memory: { ram: '8GB', storage: '256GB' }, camera: { main: '48MP', ultrawide: '12MP', telephoto: '12MP (3x)', front: '12MP' }, battery: { capacity: '3200mAh', charging: '20W + MagSafe' }, connectivity: { network: '5G', wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'iOS 17', weight: '187g', dimensions: '146.6×70.6×8.25mm', warranty: '1 Year Apple' } },
    { productName: 'iPhone 15 128GB — Blue', category: 'iPhone', description: 'Dynamic Island • A16 • 48MP • Super Retina XDR', price: '59990', cost: 50000, quantity: 18, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: false, isDeal: true, specs: { display: { size: '6.1"', resolution: '2556×1179', refreshRate: '60Hz', panelType: 'Super Retina XDR' }, processor: 'A16 Bionic', memory: { ram: '6GB', storage: '128GB' }, camera: { main: '48MP', ultrawide: '12MP', front: '12MP' }, battery: { capacity: '3349mAh', charging: '20W' }, connectivity: { network: '5G', wifi: 'Wi-Fi 6', bluetooth: '5.3' }, operatingSystem: 'iOS 17', weight: '171g', dimensions: '147.6×71.6×7.8mm', warranty: '1 Year Apple' } },
    { productName: 'iPad Pro 12.9" M2 256GB', category: 'iPad', description: 'M2 • Liquid Retina XDR • 120Hz • Pencil', price: '77990', cost: 65000, quantity: 8, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '12.9"', resolution: '2732×2048', refreshRate: '120Hz ProMotion', panelType: 'Liquid Retina XDR' }, processor: 'M2', memory: { ram: '8GB', storage: '256GB' }, camera: { main: '12MP Wide', ultrawide: '10MP', front: '12MP TrueDepth' }, battery: { capacity: '10758mAh', charging: 'USB-C 20W' }, connectivity: { network: 'Wi-Fi 6E', wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'iPadOS 17', weight: '682g', dimensions: '280.6×214.9×6.4mm', warranty: '1 Year Apple' } },
    { productName: 'MacBook Air 13" M3 256GB', category: 'Mac', description: 'M3 • Thin • 18h battery • Liquid Retina', price: '69990', cost: 58000, quantity: 6, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '13.6"', resolution: '2560×1664', refreshRate: '60Hz', panelType: 'Liquid Retina' }, processor: 'M3 8-core', memory: { ram: '8GB', storage: '256GB SSD' }, camera: { front: '1080p FaceTime' }, battery: { capacity: '52.6Wh', charging: '30W / MagSafe' }, connectivity: { wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'macOS Sonoma', weight: '1.24kg', dimensions: '304.1×215×11.3mm', warranty: '1 Year Apple' } },
    { productName: 'MacBook Pro 14" M3 Pro 512GB', category: 'Mac', description: 'M3 Pro • 18GB • XDR • Pro', price: '129990', cost: 110000, quantity: 4, images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop'], isFeatured: false, isDeal: true, specs: { display: { size: '14.2"', resolution: '3024×1964', refreshRate: '120Hz ProMotion', panelType: 'Liquid Retina XDR' }, processor: 'M3 Pro 11-core', memory: { ram: '18GB', storage: '512GB SSD' }, camera: { front: '1080p' }, battery: { capacity: '72.4Wh', charging: '96W' }, connectivity: { wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'macOS Sonoma', weight: '1.55kg', dimensions: '312.6×221.2×15.5mm', warranty: '1 Year Apple' } },
    { productName: 'Apple Watch Series 9 GPS 45mm', category: 'Watch', description: 'S9 • Retina • Heart • WatchOS 10', price: '25990', cost: 19000, quantity: 22, images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '45mm', resolution: '396×484', panelType: 'LTPO OLED Always-On' }, processor: 'S9', memory: { ram: '1GB', storage: '64GB' }, battery: { capacity: '308mAh', charging: 'Magnetic' }, connectivity: { network: 'GPS', bluetooth: '5.3' }, operatingSystem: 'watchOS 10', weight: '32g', dimensions: '45×38×10.7mm', warranty: '1 Year Apple' } },
    { productName: 'AirPods Pro (2nd Gen) USB-C', category: 'AirPods', description: 'H2 • ANC • Transparency • MagSafe', price: '15990', cost: 12000, quantity: 30, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: true, isDeal: false, specs: { processor: 'H2', battery: { capacity: '49.7mAh buds', charging: 'MagSafe/USB-C' }, connectivity: { bluetooth: '5.3' }, operatingSystem: '—', weight: '5.3g each', warranty: '1 Year Apple', display: { size: '—' }, memory: { ram: '—', storage: '—' }, camera: {} } },
    { productName: 'AirPods Max — Silver', category: 'AirPods', description: 'Hi-fi • ANC • Spatial • Aluminum', price: '34990', cost: 28000, quantity: 9, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-silver-202011?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: false, isDeal: true, specs: { processor: 'H1 dual', battery: { capacity: '20h', charging: 'Lightning' }, connectivity: { bluetooth: '5.0' }, weight: '384g', warranty: '1 Year Apple', display: { size: '—' }, memory: { ram: '—', storage: '—' }, camera: {}, operatingSystem: '—' } },
    { productName: 'Apple Pencil Pro', category: 'Accessories', description: 'Precision • Tilt • Magnetic • iPad Pro', price: '8990', cost: 6500, quantity: 15, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MUWA3?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: false, isDeal: false, specs: { display: { size: '—' }, processor: '—', memory: { ram: '—', storage: '—' }, camera: {}, battery: { capacity: '—', charging: 'Magnetic' }, weight: '20.5g', dimensions: '166×8.9mm', warranty: '1 Year Apple', operatingSystem: '—' } },
    { productName: 'iPhone 15 Pro Max 512GB — Black Titanium', category: 'iPhone', description: 'Largest • 5x Telephoto • A17 Pro', price: '109990', cost: 92000, quantity: 3, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'], isFeatured: false, isDeal: false, specs: { display: { size: '6.7"', resolution: '2796×1290', refreshRate: '120Hz', panelType: 'Super Retina XDR OLED' }, processor: 'A17 Pro', memory: { ram: '8GB', storage: '512GB' }, camera: { main: '48MP', ultrawide: '12MP', telephoto: '12MP (5x)', front: '12MP' }, battery: { capacity: '4422mAh', charging: '27W + MagSafe' }, connectivity: { network: '5G', wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'iOS 17', weight: '221g', dimensions: '159.9×76.7×8.25mm', warranty: '1 Year Apple' } },
  ]
  let created = 0
  for (const p of seedProducts) {
    const exists: any = await Product.findOne({ productName: p.productName, merchant: merchantId })
    if (exists) {
      let changed = false
      if (exists.isFeatured !== p.isFeatured || exists.isDeal !== p.isDeal) { exists.isFeatured = p.isFeatured; exists.isDeal = p.isDeal; changed = true }
      if (JSON.stringify(exists.images || []) !== JSON.stringify(p.images || [])) { exists.images = p.images; changed = true }
      if (JSON.stringify(exists.specs || {}) !== JSON.stringify(p.specs || {})) { exists.specs = p.specs; changed = true }
      if (changed) await exists.save()
      continue
    }
    await Product.create({ productName: p.productName, category: p.category, description: p.description, price: mongoose.Types.Decimal128.fromString(p.price), cost: p.cost, merchant: merchantId, quantity: p.quantity, status: 'Posted', images: p.images, isFeatured: !!p.isFeatured, isDeal: !!p.isDeal, specs: p.specs || {} })
    created++
  }
  const Discount = (await import('@/lib/model/discount.model')).default
  for (const d of [{ code: 'APPLE10', type: 'percentage', value: 10, active: true }, { code: 'SAVE500', type: 'fixed', value: 500, active: true }, { code: 'FREESHIP', type: 'fixed', value: 0, active: true }]) {
    const ex = await Discount.findOne({ code: d.code, merchant: merchantId })
    if (!ex) await Discount.create({ ...d, merchant: merchantId })
  }
  const Banner = (await import('@/lib/model/banner.model')).default
  for (const b of [
    { title: 'iPhone 15 Pro', subtitle: 'Titanium. So strong. So light. So Pro.', image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&auto=format&fit=crop', link: '/store', order: 0 },
    { title: 'MacBook Air M3', subtitle: 'Supercharged by M3 — Strikingly thin.', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', link: '/store', order: 1 },
    { title: 'Apple Watch Series 9', subtitle: 'Smarter. Brighter. Mightier.', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop', link: '/store', order: 2 },
  ]) {
    const ex: any = await Banner.findOne({ title: b.title, merchant: merchantId })
    if (!ex) await Banner.create({ ...b, merchant: merchantId, active: true })
    else if (ex.image !== b.image) { ex.image = b.image; ex.subtitle = b.subtitle; await ex.save() }
  }
  // Collections — shown on landing page
  const Collection = (await import('@/lib/model/collection.model')).default
  const allProds = await Product.find({ merchant: merchantId }).select('_id category').lean()
  const byCat = (cat: string) => allProds.filter((p: any) => p.category === cat).map((p: any) => p._id.toString())
  for (const col of [
    { name: 'Best Sellers', description: 'Most loved iPhone & Mac — curated by Apple Avenue', productIds: [...byCat('iPhone').slice(0, 2), ...byCat('Mac').slice(0, 1), ...byCat('AirPods').slice(0, 1)] },
    { name: 'New Arrivals', description: 'Latest arrivals — fresh drops', productIds: allProds.slice(0, 4).map((p: any) => p._id.toString()) },
  ]) {
    const ex = await Collection.findOne({ name: col.name, merchant: merchantId })
    if (!ex) await Collection.create({ name: col.name, description: col.description, merchant: merchantId, productIds: col.productIds })
    else if (!ex.productIds || ex.productIds.length === 0) { ex.productIds = col.productIds; await ex.save() }
  }
  const count = await Product.countDocuments({ merchant: merchantId })
  const featured = await Product.countDocuments({ merchant: merchantId, isFeatured: true })
  const dealProducts = await Product.countDocuments({ merchant: merchantId, isDeal: true })
  const discounts = await Discount.countDocuments({ merchant: merchantId, active: true })
  const banners = await Banner.countDocuments({ merchant: merchantId, active: true })
  const cols = await Collection.countDocuments({ merchant: merchantId })
  return NextResponse.json({ message: `Seeded — admin ${adminEmail} / Admin123! — created ${created} — total ${count} featured=${featured} dealProducts=${dealProducts} discounts=${discounts} banners=${banners} collections=${cols}`, adminId: merchantId, total: count }, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json().catch(() => ({} as any))
    return handleSeed(secret)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret') || undefined
    return handleSeed(secret)
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
