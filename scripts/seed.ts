/**
 * Apple Avenue seeder — single merchant (admin) + products
 * Usage: npm run seed  (requires MONGODB_URI in env)
 * Products are ONLY provided by admin — never by guests.
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1', '1.0.0.1'])

// Reuse existing models (import after mongoose setup to avoid duplicate model errors)
async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI missing in env')
    process.exit(1)
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5 })
  console.log('🚀 Connected for seeding')

  const User = (await import('../lib/model/user.model')).default
  const Product = (await import('../lib/model/product.model')).default

  // 1. Admin singleton — Apple Avenue official store
  const adminEmail = 'admin@apple-avenue.com'
  const adminPassword = 'Admin123!'
  let admin: any = await User.findOne({ email: adminEmail.toLowerCase() })
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 10)
    admin = await User.create({
      name: 'Apple Avenue',
      email: adminEmail.toLowerCase(),
      password: hash,
      role: 'admin',
      provider: 'credentials',
      profilePhoto: '',
      coverPhoto: '',
    })
    console.log(`✅ Admin created — ${adminEmail} / ${adminPassword} — _id=${admin._id}`)
  } else {
    // Ensure role is admin
    if (admin.role !== 'admin') {
      admin.role = 'admin'
      await admin.save()
      console.log(`🔧 Admin role fixed for ${adminEmail}`)
    } else {
      console.log(`ℹ️ Admin exists — ${adminEmail} — _id=${admin._id}`)
    }
  }
  const merchantId = admin._id.toString()

  // 2. Apple products — curated, authentic, warranty-backed
  // Featured & Deal flags drive homepage Featured Collection & Deals page — admin-controlled
  // Specs are structured per AGENTS.md — used for comparison & detail
  const seedProducts: any[] = [
    { productName: 'iPhone 15 Pro 256GB — Natural Titanium', category: 'iPhone', description: 'Titanium design • A17 Pro • 48MP triple camera • 120Hz Super Retina XDR • 5G • iOS 17 • Warranty included.', price: '89990', cost: '75000', quantity: 12, images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '6.1"', resolution: '2556×1179', refreshRate: '120Hz', panelType: 'Super Retina XDR OLED' }, processor: 'A17 Pro', memory: { ram: '8GB', storage: '256GB' }, camera: { main: '48MP', ultrawide: '12MP', telephoto: '12MP (3x)', front: '12MP' }, battery: { capacity: '3200mAh', charging: '20W + MagSafe' }, connectivity: { network: '5G', wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'iOS 17', weight: '187g', dimensions: '146.6×70.6×8.25mm', warranty: '1 Year Apple' } },
    { productName: 'iPhone 15 128GB — Blue', category: 'iPhone', description: 'Dynamic Island • A16 Bionic • 48MP main • Super Retina XDR • All-day battery • 5G.', price: '59990', cost: '50000', quantity: 18, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: false, isDeal: true, specs: { display: { size: '6.1"', resolution: '2556×1179', refreshRate: '60Hz', panelType: 'Super Retina XDR' }, processor: 'A16 Bionic', memory: { ram: '6GB', storage: '128GB' }, camera: { main: '48MP', ultrawide: '12MP', front: '12MP' }, battery: { capacity: '3349mAh', charging: '20W' }, connectivity: { network: '5G', wifi: 'Wi-Fi 6', bluetooth: '5.3' }, operatingSystem: 'iOS 17', weight: '171g', dimensions: '147.6×71.6×7.8mm', warranty: '1 Year Apple' } },
    { productName: 'iPad Pro 12.9" M2 256GB', category: 'iPad', description: 'M2 chip • Liquid Retina XDR • 120Hz ProMotion • 12MP cameras • Apple Pencil support.', price: '77990', cost: '65000', quantity: 8, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '12.9"', resolution: '2732×2048', refreshRate: '120Hz ProMotion', panelType: 'Liquid Retina XDR' }, processor: 'M2', memory: { ram: '8GB', storage: '256GB' }, camera: { main: '12MP Wide', ultrawide: '10MP', front: '12MP TrueDepth' }, battery: { capacity: '10758mAh', charging: 'USB-C 20W' }, connectivity: { network: 'Wi-Fi 6E', wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'iPadOS 17', weight: '682g', dimensions: '280.6×214.9×6.4mm', warranty: '1 Year Apple' } },
    { productName: 'MacBook Air 13" M3 256GB', category: 'Mac', description: 'Supercharged by M3 • Strikingly thin • 18h battery • Liquid Retina • Magic Keyboard.', price: '69990', cost: '58000', quantity: 6, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '13.6"', resolution: '2560×1664', refreshRate: '60Hz', panelType: 'Liquid Retina' }, processor: 'M3 8-core', memory: { ram: '8GB', storage: '256GB SSD' }, camera: { front: '1080p FaceTime' }, battery: { capacity: '52.6Wh', charging: '30W / MagSafe' }, connectivity: { wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'macOS Sonoma', weight: '1.24kg', dimensions: '304.1×215×11.3mm', warranty: '1 Year Apple' } },
    { productName: 'MacBook Pro 14" M3 Pro 512GB', category: 'Mac', description: 'M3 Pro • 18GB unified memory • Liquid Retina XDR • Pro performance • Warranty.', price: '129990', cost: '110000', quantity: 4, images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop'], isFeatured: false, isDeal: true, specs: { display: { size: '14.2"', resolution: '3024×1964', refreshRate: '120Hz ProMotion', panelType: 'Liquid Retina XDR' }, processor: 'M3 Pro 11-core', memory: { ram: '18GB', storage: '512GB SSD' }, camera: { front: '1080p' }, battery: { capacity: '72.4Wh', charging: '96W' }, connectivity: { wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'macOS Sonoma', weight: '1.55kg', dimensions: '312.6×221.2×15.5mm', warranty: '1 Year Apple' } },
    { productName: 'Apple Watch Series 9 GPS 45mm', category: 'Watch', description: 'S9 chip • Retina display • Heart monitoring • Water resistant • WatchOS 10.', price: '25990', cost: '19000', quantity: 22, images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop'], isFeatured: true, isDeal: false, specs: { display: { size: '45mm', resolution: '396×484', panelType: 'LTPO OLED Always-On' }, processor: 'S9', memory: { ram: '1GB', storage: '64GB' }, battery: { capacity: '308mAh', charging: 'Magnetic' }, connectivity: { network: 'GPS', bluetooth: '5.3' }, operatingSystem: 'watchOS 10', weight: '32g', dimensions: '45×38×10.7mm', warranty: '1 Year Apple' } },
    { productName: 'AirPods Pro (2nd Gen) with USB-C', category: 'AirPods', description: 'H2 chip • Active Noise Cancellation • Adaptive Transparency • MagSafe charging.', price: '15990', cost: '12000', quantity: 30, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: true, isDeal: false, specs: { processor: 'H2', battery: { capacity: '49.7mAh buds', charging: 'MagSafe/USB-C' }, connectivity: { bluetooth: '5.3' }, operatingSystem: '—', weight: '5.3g each', warranty: '1 Year Apple', display: { size: '—' }, memory: { ram: '—', storage: '—' }, camera: {} } },
    { productName: 'AirPods Max — Silver', category: 'AirPods', description: 'High-fidelity audio • Active Noise Cancellation • Spatial audio • Premium aluminum.', price: '34990', cost: '28000', quantity: 9, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-silver-202011?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: false, isDeal: true, specs: { processor: 'H1 dual', battery: { capacity: '20h', charging: 'Lightning' }, connectivity: { bluetooth: '5.0' }, weight: '384g', warranty: '1 Year Apple', display: { size: '—' }, memory: { ram: '—', storage: '—' }, camera: {}, operatingSystem: '—' } },
    { productName: 'Apple Pencil Pro', category: 'Accessories', description: 'Pixel-perfect precision • Tilt & pressure • Magnetic attach • For iPad Pro.', price: '8990', cost: '6500', quantity: 15, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MUWA3?wid=5120&hei=2880&fmt=p-jpg'], isFeatured: false, isDeal: false, specs: { display: { size: '—' }, processor: '—', memory: { ram: '—', storage: '—' }, camera: {}, battery: { capacity: '—', charging: 'Magnetic' }, weight: '20.5g', dimensions: '166×8.9mm', warranty: '1 Year Apple', operatingSystem: '—' } },
    { productName: 'iPhone 15 Pro Max 512GB — Black Titanium', category: 'iPhone', description: 'Largest display • Best battery • 5x Telephoto • A17 Pro • ProRes video.', price: '109990', cost: '92000', quantity: 3, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'], isFeatured: false, isDeal: false, specs: { display: { size: '6.7"', resolution: '2796×1290', refreshRate: '120Hz', panelType: 'Super Retina XDR OLED' }, processor: 'A17 Pro', memory: { ram: '8GB', storage: '512GB' }, camera: { main: '48MP', ultrawide: '12MP', telephoto: '12MP (5x)', front: '12MP' }, battery: { capacity: '4422mAh', charging: '27W + MagSafe' }, connectivity: { network: '5G', wifi: 'Wi-Fi 6E', bluetooth: '5.3' }, operatingSystem: 'iOS 17', weight: '221g', dimensions: '159.9×76.7×8.25mm', warranty: '1 Year Apple' } },
  ]

  for (const p of seedProducts) {
    const exists: any = await Product.findOne({ productName: p.productName, merchant: merchantId })
    if (exists) {
      let changed = false
      if (exists.isFeatured !== p.isFeatured || exists.isDeal !== p.isDeal) { exists.isFeatured = p.isFeatured; exists.isDeal = p.isDeal; changed = true }
      if (JSON.stringify(exists.images || []) !== JSON.stringify(p.images || [])) { exists.images = p.images; changed = true }
      if (JSON.stringify(exists.specs || {}) !== JSON.stringify(p.specs || {})) { exists.specs = p.specs; changed = true }
      if (changed) { await exists.save(); console.log(`🔧 Updated — ${p.productName} featured=${p.isFeatured} deal=${p.isDeal} specs/images`) } else { console.log(`↪️ Exists — ${p.productName}`) }
      continue
    }
    await Product.create({
      productName: p.productName,
      category: p.category,
      description: p.description,
      price: mongoose.Types.Decimal128.fromString(p.price),
      cost: Number(p.cost),
      merchant: merchantId,
      quantity: p.quantity,
      status: 'Posted',
      images: p.images,
      isFeatured: !!p.isFeatured,
      isDeal: !!p.isDeal,
      specs: p.specs || {},
    })
    console.log(`✅ Seeded — ${p.productName} featured=${!!p.isFeatured} deal=${!!p.isDeal}`)
  }

  // 3. Discounts (deals) — appear on /deals page, managed in Dashboard → Discounts
  const Discount = (await import('../lib/model/discount.model')).default
  const seedDiscounts = [
    { code: 'APPLE10', type: 'percentage', value: 10, active: true },
    { code: 'SAVE500', type: 'fixed', value: 500, minOrder: 20000, active: true },
    { code: 'FREESHIP', type: 'fixed', value: 0, active: true },
  ]
  for (const d of seedDiscounts) {
    const exists = await Discount.findOne({ code: d.code, merchant: merchantId })
    if (exists) { console.log(`↪️ Discount exists ${d.code}`); continue }
    await Discount.create({ ...d, merchant: merchantId })
    console.log(`✅ Discount created ${d.code}`)
  }

  // 4. Banners — image slider editable in Dashboard → Banners, shows on landing page
  const Banner = (await import('../lib/model/banner.model')).default
  const seedBanners = [
    { title: 'iPhone 15 Pro', subtitle: 'Titanium. So strong. So light. So Pro. — Shop featured collection', image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&auto=format&fit=crop', link: '/store', order: 0 },
    { title: 'MacBook Air M3', subtitle: 'Supercharged by M3 — Strikingly thin. Light.', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', link: '/store', order: 1 },
    { title: 'Apple Watch Series 9', subtitle: 'Smarter. Brighter. Mightier. — Featured', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop', link: '/store', order: 2 },
  ]
  for (const b of seedBanners) {
    const exists: any = await Banner.findOne({ title: b.title, merchant: merchantId })
    if (exists) {
      if (exists.image !== b.image) { exists.image = b.image; exists.subtitle = b.subtitle; await exists.save(); console.log(`🔧 Updated banner image ${b.title}`) }
      else { console.log(`↪️ Banner exists ${b.title}`) }
      continue
    }
    await Banner.create({ ...b, merchant: merchantId, active: true })
    console.log(`✅ Banner created ${b.title}`)
  }

  const count = await Product.countDocuments({ merchant: merchantId })
  const featuredCount = await Product.countDocuments({ merchant: merchantId, isFeatured: true })
  const dealCount = await Product.countDocuments({ merchant: merchantId, isDeal: true })
  const discountCount = await Discount.countDocuments({ merchant: merchantId, active: true })
  const bannerCount = await Banner.countDocuments({ merchant: merchantId, active: true })

  // 5. Collections — admin creates collections and adds products, shown on landing page
  const Collection = (await import('../lib/model/collection.model')).default
  const allProds = await Product.find({ merchant: merchantId }).select('_id category').lean()
  const byCat = (cat: string) => allProds.filter((p: any) => p.category === cat).map((p: any) => p._id.toString())
  const seedCollections = [
    { name: 'Best Sellers', description: 'Most loved iPhone & Mac — curated by Apple Avenue', productIds: [...byCat('iPhone').slice(0,2), ...byCat('Mac').slice(0,1), ...byCat('AirPods').slice(0,1)] },
    { name: 'New Arrivals', description: 'Latest arrivals — fresh drops', productIds: allProds.slice(0,4).map((p: any) => p._id.toString()) },
    { name: 'Watch & AirPods', description: 'Wearables & audio', productIds: [...byCat('Watch'), ...byCat('AirPods')].slice(0,4).map((id:string)=>id) },
  ]
  for (const col of seedCollections) {
    const exists = await Collection.findOne({ name: col.name, merchant: merchantId })
    if (exists) {
      // update productIds if empty
      if (!exists.productIds || exists.productIds.length === 0) { exists.productIds = col.productIds; await exists.save(); console.log(`🔧 Updated collection products ${col.name}`) }
      else { console.log(`↪️ Collection exists ${col.name}`) }
      continue
    }
    await Collection.create({ name: col.name, description: col.description, merchant: merchantId, productIds: col.productIds, image: '' })
    console.log(`✅ Collection created ${col.name} (${col.productIds.length} products)`)
  }
  const colCount = await Collection.countDocuments({ merchant: merchantId })
  console.log(`\n🎉 Seed done — admin _id=${merchantId} — products=${count} (featured=${featuredCount} deal=${dealCount}) discounts=${discountCount} banners=${bannerCount} collections=${colCount}`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((e) => {
  console.error('Seed failed', e)
  process.exit(1)
})
