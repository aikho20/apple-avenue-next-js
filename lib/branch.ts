import Branch from '@/lib/model/branch.model'

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function getAllBranchesActive() {
  return Branch.find({ isActive: true }).sort({ createdAt: 1 }).lean()
}

export async function findNearestBranch(lat: number, lng: number) {
  const branches = await getAllBranchesActive()
  if (branches.length === 0) return null
  let nearest: any = branches[0]
  let min = haversine(lat, lng, nearest.latitude, nearest.longitude)
  for (const b of branches.slice(1)) {
    const d = haversine(lat, lng, b.latitude, b.longitude)
    if (d < min) {
      min = d
      nearest = b
    }
  }
  return { branch: nearest, distanceKm: min }
}

export async function resolveBranchId(provided?: string | null, lat?: number | null, lng?: number | null): Promise<string | null> {
  if (provided) {
    const b = await Branch.findById(provided).lean()
    if (b) return (b as any)._id.toString()
  }
  if (lat != null && lng != null) {
    const nearest = await findNearestBranch(lat, lng)
    if (nearest?.branch) return nearest.branch._id.toString()
  }
  // fallback to first active branch or null
  const first = await Branch.findOne({ isActive: true }).sort({ createdAt: 1 }).lean()
  return first ? (first as any)._id.toString() : null
}

// For merchant resolution with branch awareness: if branchId provided, use branch's manager merchant; otherwise singleton admin
export async function resolveMerchantIdWithBranch(providedMerchant?: string | null, branchId?: string | null): Promise<string | null> {
  if (branchId) {
    const branch: any = await Branch.findById(branchId).lean()
    if (branch) {
      // Branch manager is the merchant for that branch
      if (branch.manager) {
        const User = (await import('@/lib/model/user.model')).default
        const mgr = await User.findById(branch.manager).lean()
        if (mgr) return (mgr as any)._id.toString()
      }
      // Fallback to branch itself as merchant key
      return branch._id.toString()
    }
  }
  if (providedMerchant) return providedMerchant
  // singleton fallback
  const { getSingletonMerchantId } = await import('@/lib/merchant')
  return getSingletonMerchantId()
}
