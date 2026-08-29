'use client'
import { store } from '@/lib/config/store'
import React from 'react'
import { Provider } from 'react-redux'

interface ProviderProps {
  children: React.ReactNode
}
export default function StoreProvider({ children }: ProviderProps) {
  return <Provider store={store}> {children} </Provider>
}
