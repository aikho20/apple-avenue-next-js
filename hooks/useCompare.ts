'use client'
import { useState, useEffect, useCallback } from 'react'

const COMPARE_KEY = 'apple-avenue-compare'
const MAX = 4

export function useCompare() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try { const raw = localStorage.getItem(COMPARE_KEY); if (raw) setIds(JSON.parse(raw)) } catch {}
  }, [])

  const persist = (next: string[]) => {
    setIds(next)
    localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
  }

  const add = useCallback((id: string) => {
    setIds(prev => {
      if (prev.includes(id)) return prev
      if (prev.length >= MAX) return prev
      const next = [...prev, id]
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setIds(prev => {
      const next = prev.filter(x => x !== id)
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setIds(prev => {
      let next: string[]
      if (prev.includes(id)) next = prev.filter(x => x !== id)
      else {
        if (prev.length >= MAX) next = prev
        else next = [...prev, id]
      }
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setIds([])
    localStorage.removeItem(COMPARE_KEY)
  }, [])

  const isCompared = useCallback((id: string) => ids.includes(id), [ids])

  return { ids, add, remove, toggle, clear, isCompared, count: ids.length, max: MAX }
}
