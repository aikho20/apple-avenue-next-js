import Warranty from '@/lib/model/warranty.model'

function generateImei(orderId: string, productId: string, idx: number) {
  // 15 digit deterministic pseudo-imei: 35 + padded hash
  const base = `${orderId}${productId}${idx}`.replace(/[^0-9]/g, '').padEnd(13, '0').slice(0, 13)
  return `35${base}`.slice(0, 15)
}
function generateSerial(productName: string, orderId: string, idx: number) {
  const clean = productName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6) || 'SN'
  return `${clean}-${orderId.slice(-6).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`
}

export async function autoRegisterWarrantiesForOrder(order: any) {
  const results: any[] = []
  const purchaseDate = order.createdAt ? new Date(order.createdAt) : new Date()
  const start = new Date(purchaseDate)
  const expiration = new Date(purchaseDate)
  expiration.setFullYear(expiration.getFullYear() + 1)
  const now = new Date()
  const status = now > expiration ? 'Expired' : 'Active'
  const branch = (order.branch || '').toString()
  const user = (order.user || '').toString()
  const orderId = order._id.toString()
  const products: any[] = Array.isArray(order.products) ? order.products : []

  for (const item of products) {
    const productId = (item._id || item.id || '').toString()
    const productName = item.productName || ''
    const qty = Number(item.value || item.quantity || 1)
    // item may contain imei array or single imei
    const imeis: string[] = Array.isArray(item.imei)
      ? item.imei
      : Array.isArray(item.imeis)
        ? item.imeis
        : item.imei
          ? [item.imei]
          : []
    const serials: string[] = Array.isArray(item.serialNumber)
      ? item.serialNumber
      : Array.isArray(item.serialNumbers)
        ? item.serialNumbers
        : item.serialNumber
          ? [item.serialNumber]
          : []

    for (let i = 0; i < qty; i++) {
      let imei = imeis[i] || generateImei(orderId, productId, i)
      let serial = serials[i] || generateSerial(productName, orderId, i)
      imei = imei.toString().trim()
      serial = serial.toString().trim()
      if (imei.length < 10) imei = generateImei(orderId, productId, i)
      // deduplicate check
      const existing = await Warranty.findOne({ imei, user }).lean()
      if (existing) continue
      const existingSerial = await Warranty.findOne({ serialNumber: serial, user }).lean()
      if (existingSerial) {
        // make serial unique
        serial = `${serial}-${Date.now().toString().slice(-4)}`
      }
      try {
        const w = await Warranty.create({
          branch,
          user,
          product: productId,
          productName,
          imei,
          serialNumber: serial,
          orderId,
          purchaseDate,
          warrantyStart: start,
          warrantyExpiration: expiration,
          status,
        })
        results.push(w)
      } catch (e: any) {
        if (e.code === 11000) continue
        throw e
      }
    }
  }
  return results
}
