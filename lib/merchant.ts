import User from '@/lib/model/user.model'

/**
 * Apple Avenue single-merchant helper.
 * The entire marketplace is ONE merchant — the admin account.
 * All legacy multi-merchant params (merchantId/storeId) fallback to this singleton.
 */
export async function getSingletonMerchantId(): Promise<string | null> {
  // Prefer Apple Avenue official admin; fallback to any admin
  const preferred = await User.findOne({ email: 'admin@apple-avenue.com', role: 'admin' }).select('_id').lean()
  if (preferred) return (preferred as any)?._id?.toString() ?? null
  const admin = await User.findOne({ role: 'admin' }).select('_id').lean()
  return (admin as any)?._id?.toString() ?? null
}

export async function resolveMerchantId(provided?: string | null): Promise<string | null> {
  if (provided) return provided
  return getSingletonMerchantId()
}

export const SINGLE_MERCHANT_NAME = 'Apple Avenue'
export const SINGLE_MERCHANT_TAGLINE = 'Premium Apple — Certified • Warranty-backed'
