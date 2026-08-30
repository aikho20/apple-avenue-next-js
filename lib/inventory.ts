export function getInventoryStatus(quantity: number, reserved: number, threshold: number) {
  const available = Math.max(quantity - reserved, 0)
  if (available <= 0) return 'Out of Stock'
  if (available <= threshold) return 'Low Stock'
  return 'In Stock'
}

export function toProductInventory(p: any) {
  const quantity = Number(p.quantity || 0)
  const reservedStock = Number(p.reservedStock || 0)
  const availableStock = Math.max(quantity - reservedStock, 0)
  const lowStockThreshold = Number(p.lowStockThreshold ?? 5)
  let inventoryStatus = 'In Stock'
  if (availableStock <= 0) inventoryStatus = 'Out of Stock'
  else if (availableStock <= lowStockThreshold) inventoryStatus = 'Low Stock'
  const sku = p.sku || `SKU-${p._id.toString().slice(-6).toUpperCase()}`
  return {
    _id: p._id.toString(),
    productName: p.productName,
    images: p.images,
    category: p.category,
    description: p.description,
    price: Number(p.price?.toString?.() ?? p.price),
    cost: p.cost,
    quantity,
    reservedStock,
    availableStock,
    lowStockThreshold,
    inventoryStatus,
    sku,
    status: p.status,
    isFeatured: !!p.isFeatured,
    isDeal: !!p.isDeal,
    specs: p.specs || {},
    merchant: p.merchant?.toString?.() ?? p.merchant,
    updatedAt: p.updatedAt,
    updatedBy: p.updatedBy || '',
    createdAt: p.createdAt,
  }
}

export function computeStats(products: any[]) {
  let totalStock = 0
  let lowStock = 0
  let outOfStock = 0
  let inventoryValue = 0
  products.forEach((p) => {
    totalStock += Number(p.quantity || 0)
    const available = Number(p.quantity || 0) - Number(p.reservedStock || 0)
    const threshold = Number(p.lowStockThreshold ?? 5)
    if (available <= 0) outOfStock += 1
    else if (available <= threshold) lowStock += 1
    inventoryValue += Number(p.quantity || 0) * Number(p.price?.toString?.() ?? p.price ?? 0)
  })
  return {
    totalProducts: products.length,
    totalStock,
    lowStock,
    outOfStock,
    inventoryValue,
  }
}
