'use client'

import { SyncLoader } from 'react-spinners'

export default function Loading() {
  return (
    <div className='w-screen h-screen bg-white/50 fixed top-0 left-0 z-10'>
      <SyncLoader
        size={8}
        color='orange'
        loading={true}
        className='flex flex-col items-center fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]'
      />
    </div>
  )
}
