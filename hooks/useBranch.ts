'use client'
import { useEffect, useState } from 'react'
import { useGetBranchesQuery, useGetNearestBranchMutation } from '@/store/action/branchAction'

const KEY = 'apple_avenue_branch_id'
const EVENT = 'apple-branch-change'

export function useBranch() {
  const { data } = useGetBranchesQuery({})
  const branches: any[] = data?.branches || []
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [locateLoading, setLocateLoading] = useState(false)
  const [getNearest] = useGetNearestBranchMutation()

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null
    if (stored) setCurrentId(stored)
    else if (branches.length > 0 && !currentId) {
      // auto-pick first active if no stored
      // don't auto-pick, let user choose or locate
    }
  }, [branches])

  useEffect(() => {
    if (currentId && typeof window !== 'undefined') {
      localStorage.setItem(KEY, currentId)
    }
  }, [currentId])

  // Sync location changes across all hook instances (same-tab custom event + cross-tab storage event)
  useEffect(() => {
    const handleBranchChange = (e: Event) => {
      const custom = e as CustomEvent<string | null>
      const nextId = custom.detail !== undefined ? custom.detail : (typeof window !== 'undefined' ? localStorage.getItem(KEY) : null)
      setCurrentId(nextId)
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY) setCurrentId(e.newValue)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT, handleBranchChange as EventListener)
      window.addEventListener('storage', handleStorage)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EVENT, handleBranchChange as EventListener)
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [])

  const currentBranch = branches.find((b: any) => b._id === currentId) || null

  const setBranch = (id: string) => {
    setCurrentId(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, id)
      window.dispatchEvent(new CustomEvent(EVENT, { detail: id }))
    }
  }

  const clearBranch = () => {
    setCurrentId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEY)
      window.dispatchEvent(new CustomEvent(EVENT, { detail: null }))
    }
  }

  const locateNearest = async () => {
    if (!navigator.geolocation) return
    setLocateLoading(true)
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res: any = await getNearest({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }).unwrap()
            if (res?.branch?._id) {
              setBranch(res.branch._id)
            }
          } catch {}
          setLocateLoading(false)
          resolve()
        },
        () => {
          setLocateLoading(false)
          resolve()
        }
      )
    })
  }

  return { branches, currentId, currentBranch, setBranch, clearBranch, locateNearest, locateLoading }
}
