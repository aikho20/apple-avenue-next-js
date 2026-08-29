'use client'

import React from 'react'
import { useSession } from 'next-auth/react'

import Link from 'next/link'

import { usePathname, useRouter } from 'next/navigation'

import { MOBILE_CONTROLS } from '@/utils/data'
const MobileControls = () => {
  const paths = MOBILE_CONTROLS.map((items) => {
    return items.path
  })
  const pathname = usePathname()
  return (
    <div
      className={`fixed bottom-0 z-10 flex w-full md:hidden ${
        !paths.includes(pathname) && 'hidden'
      }`}
    >
      <div className='px-5 py-2 flex flex-row w-full items-center justify-between shadow-lg border bg-[#ffff] z-50'>
        {MOBILE_CONTROLS.map((item, index) => {
          const Icon = item.icon
          return (
            <Link href={item.path} className={`100 rounded p-3 `} key={index}>
              <Icon
                className={`h-6 w-6 ${item.path === pathname ? 'text-primary ' : 'text-gray-400'}`}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileControls
