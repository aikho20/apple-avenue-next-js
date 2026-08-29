'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useGetWishlistQuery, useToggleWishlistMutation, useSyncWishlistMutation } from '@/store/action/wishlistAction'

const GUEST_KEY = 'apple-avenue-wishlist'

export function useWishlist() {
  const { data: session } = useSession()
  const isAuthed = !!session?.user
  const { data, isLoading, refetch } = useGetWishlistQuery(undefined, { skip: !isAuthed })
  const [toggleDb] = useToggleWishlistMutation()
  const [syncDb] = useSyncWishlistMutation()
  const [guestIds, setGuestIds] = useState<string[]>([])

  useEffect(() => {
    if (!isAuthed) {
      try { const raw = localStorage.getItem(GUEST_KEY); if (raw) setGuestIds(JSON.parse(raw)) } catch {}
    }
  }, [isAuthed])

  useEffect(() => {
    if (isAuthed && guestIds.length > 0) {
      // Sync guest to DB once after login
      syncDb({ productIds: guestIds }).then(() => {
        localStorage.removeItem(GUEST_KEY)
        setGuestIds([])
      })
    }
  }, [isAuthed])

  const wishlistIds: string[] = isAuthed ? ((data as any)?.wishlist?.map((p: any) => p._id) || []) : guestIds
  const wishlistProducts: any[] = isAuthed ? ((data as any)?.wishlist || []) : []

  const isWishlisted = useCallback((id: string) => wishlistIds.includes(id), [wishlistIds])

  const toggle = useCallback(async (productId: string) => {
    if (isAuthed) {
      await toggleDb({ productId }).unwrap()
    } else {
      let next: string[]
      if (guestIds.includes(productId)) next = guestIds.filter(id => id !== productId)
      else {
        if (guestIds.length >= 20) next = guestIds // limit
        else next = [...guestIds, productId]
      }
      setGuestIds(next)
      localStorage.setItem(GUEST_KEY, JSON.stringify(next))
    }
  }, [isAuthed, guestIds, toggleDb])

  return { wishlistIds, wishlistProducts, isWishlisted, toggle, isLoading: isAuthed ? isLoading : false, refetch, isAuthed, guestIds }
}
