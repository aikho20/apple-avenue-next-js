/**
 * Branch dummy creator + data transfer
 * - Creates 2 branches (SM Megamall, SM Mall of Asia) with branch manager accounts
 * - Transfers all current admin data (products, banners, collections, discounts) evenly to the 2 branches
 * Usage: npx tsx scripts/branch-transfer.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1', '1.0.0.1'])

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI missing')
    process.exit(1)
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5 })
  console.log('🚀 Connected')

  const User = (await import('../lib/model/user.model')).default
  const Branch = (await import('../lib/model/branch.model')).default
  const Product = (await import('../lib/model/product.model')).default
  const Banner = (await import('../lib/model/banner.model')).default
  const Collection = (await import('../lib/model/collection.model')).default
  const Discount = (await import('../lib/model/discount.model')).default
  const InventoryTransaction = (await import('../lib/model/inventoryTransaction.model')).default
  const PriceHistory = (await import('../lib/model/priceHistory.model')).default

  const admin = await User.findOne({ email: 'admin@apple-avenue.com' })
  if (!admin) {
    console.error('Admin not found — run npm run seed first')
    process.exit(1)
  }
  console.log(`Admin _id=${admin._id}`)

  const branchesDef = [
    {
      name: 'Apple Avenue - SM Megamall Branch',
      address: '3F SM Megamall, EDSA, Mandaluyong City, Metro Manila',
      city: 'Mandaluyong',
      province: 'Metro Manila',
      barangay: 'Wack-Wack',
      zipCode: '1550',
      latitude: 14.5849,
      longitude: 121.0578,
      phone: '09171234567',
      email: 'megamall@apple-avenue.com',
      managerEmail: 'branch1@apple-avenue.com',
      managerPassword: 'Branch123!',
      managerName: 'SM Megamall Manager',
      image: '',
    },
    {
      name: 'Apple Avenue - SM Mall of Asia Branch',
      address: '2F SM Mall of Asia, Seaside Blvd, Pasay City, Metro Manila',
      city: 'Pasay',
      province: 'Metro Manila',
      barangay: 'MOA Complex',
      zipCode: '1300',
      latitude: 14.535,
      longitude: 120.982,
      phone: '09177654321',
      email: 'moa@apple-avenue.com',
      managerEmail: 'branch2@apple-avenue.com',
      managerPassword: 'Branch123!',
      managerName: 'MOA Branch Manager',
      image: '',
    },
  ]

  const createdBranches: any[] = []

  for (const def of branchesDef) {
    let branch: any = await Branch.findOne({ name: def.name })
    let manager: any = await User.findOne({ email: def.managerEmail.toLowerCase() })

    if (!manager) {
      const hash = await bcrypt.hash(def.managerPassword, 10)
      manager = await User.create({
        name: def.managerName,
        email: def.managerEmail.toLowerCase(),
        password: hash,
        role: 'branch',
        branchName: def.name,
        provider: 'credentials',
      })
      console.log(`✅ Manager created ${def.managerEmail} / ${def.managerPassword}`)
    } else {
      // ensure role branch
      if (manager.role !== 'branch') {
        manager.role = 'branch'
        manager.branchName = def.name
        await manager.save()
        console.log(`🔧 Promoted ${manager.email} to branch`)
      }
    }

    if (!branch) {
      branch = await Branch.create({
        name: def.name,
        address: def.address,
        city: def.city,
        province: def.province,
        barangay: def.barangay,
        zipCode: def.zipCode,
        latitude: def.latitude,
        longitude: def.longitude,
        phone: def.phone,
        email: def.email,
        image: def.image,
        manager: manager._id,
        managerEmail: manager.email,
        isActive: true,
        createdBy: admin._id.toString(),
      })
      console.log(`✅ Branch created ${branch.name} _id=${branch._id} manager=${manager.email}`)
    } else {
      // update manager link if missing
      if (!branch.manager || branch.manager.toString() !== manager._id.toString()) {
        branch.manager = manager._id
        branch.managerEmail = manager.email
        await branch.save()
        console.log(`🔧 Branch ${branch.name} manager linked`)
      } else {
        console.log(`ℹ️ Branch exists ${branch.name} _id=${branch._id}`)
      }
    }

    // ensure manager.branch points to branch
    if (!manager.branch || manager.branch.toString() !== branch._id.toString()) {
      manager.branch = branch._id
      await manager.save()
    }

    createdBranches.push({ branch, manager })
  }

  // Transfer all current data: split products, banners, collections, discounts evenly between 2 branches
  // Find all admin products (merchant == admin && (branch == '' or null))
  const adminProducts = await Product.find({ merchant: admin._id.toString() }).lean()
  // Also include products with no branch (legacy)
  const legacyProducts = await Product.find({ $or: [{ branch: '' }, { branch: null }, { branch: { $exists: false } }], merchant: admin._id.toString() }).lean()
  // Use adminProducts as source (includes legacy)
  const allToTransfer = adminProducts
  console.log(`\n📦 Found ${allToTransfer.length} admin products to transfer`)

  if (allToTransfer.length > 0) {
    for (let i = 0; i < allToTransfer.length; i++) {
      const p = allToTransfer[i]
      const target = createdBranches[i % createdBranches.length]
      const newMerchant = target.manager._id.toString()
      const newBranchId = target.branch._id.toString()
      await Product.findByIdAndUpdate(p._id, { merchant: newMerchant, branch: newBranchId, updatedBy: newMerchant })
      // transfer inventory history
      await InventoryTransaction.updateMany({ productId: p._id, merchant: admin._id.toString() }, { $set: { merchant: newMerchant, branch: newBranchId } })
      await PriceHistory.updateMany({ productId: p._id, merchant: admin._id.toString() }, { $set: { merchant: newMerchant, branch: newBranchId } })
      console.log(`  ↪ ${p.productName} → ${target.branch.name} (${newBranchId.slice(-6)})`)
    }
  }

  // Banners: transfer admin banners similarly (split)
  const adminBanners = await Banner.find({ merchant: admin._id.toString() }).lean()
  console.log(`\n🖼️  Found ${adminBanners.length} admin banners to transfer`)
  for (let i = 0; i < adminBanners.length; i++) {
    const b = adminBanners[i]
    const target = createdBranches[i % createdBranches.length]
    await Banner.findByIdAndUpdate(b._id, { merchant: target.manager._id.toString(), branch: target.branch._id.toString() })
    console.log(`  ↪ Banner ${b.title} → ${target.branch.name}`)
  }

  // Collections: transfer
  const adminCollections = await Collection.find({ merchant: admin._id.toString() }).lean()
  console.log(`\n📚 Found ${adminCollections.length} admin collections to transfer`)
  for (let i = 0; i < adminCollections.length; i++) {
    const c = adminCollections[i]
    const target = createdBranches[i % createdBranches.length]
    await Collection.findByIdAndUpdate(c._id, { merchant: target.manager._id.toString(), branch: target.branch._id.toString() })
    console.log(`  ↪ Collection ${c.name} → ${target.branch.name}`)
  }

  // Discounts: transfer
  const adminDiscounts = await Discount.find({ merchant: admin._id.toString() }).lean()
  console.log(`\n🏷️  Found ${adminDiscounts.length} admin discounts to transfer`)
  for (let i = 0; i < adminDiscounts.length; i++) {
    const d = adminDiscounts[i]
    const target = createdBranches[i % createdBranches.length]
    await Discount.findOneAndUpdate({ _id: d._id }, { merchant: target.manager._id.toString(), branch: target.branch._id.toString() })
    console.log(`  ↪ Discount ${d.code} → ${target.branch.name}`)
  }

  // Final counts
  for (const { branch, manager } of createdBranches) {
    const pc = await Product.countDocuments({ $or: [{ merchant: manager._id.toString() }, { branch: branch._id.toString() }] })
    const bc = await Banner.countDocuments({ $or: [{ merchant: manager._id.toString() }, { branch: branch._id.toString() }] })
    const cc = await Collection.countDocuments({ $or: [{ merchant: manager._id.toString() }, { branch: branch._id.toString() }] })
    const dc = await Discount.countDocuments({ $or: [{ merchant: manager._id.toString() }, { branch: branch._id.toString() }] })
    console.log(`\n📊 ${branch.name}: products=${pc} banners=${bc} collections=${cc} discounts=${dc} manager=${manager.email}`)
  }
  const remainingAdminProducts = await Product.countDocuments({ merchant: admin._id.toString() })
  console.log(`\n🔎 Remaining admin products: ${remainingAdminProducts} (should be 0 after transfer)`)
  const totalBranches = await Branch.countDocuments({})
  console.log(`\n🎉 Done — total branches=${totalBranches}`)
  console.log(`\n🔐 Branch logins:\n  branch1@apple-avenue.com / Branch123! → ${createdBranches[0].branch.name}\n  branch2@apple-avenue.com / Branch123! → ${createdBranches[1].branch.name}\n  admin@apple-avenue.com / Admin123! → All branches view (filter)`)

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((e) => {
  console.error('Branch transfer failed', e)
  process.exit(1)
})
