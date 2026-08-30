import { ACCOUNT_MENU } from '@/utils/data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { FaSignOutAlt } from 'react-icons/fa'

const AccountMenu = () => {
  const pathname = usePathname()

  return (
    <div className="py-2 flex flex-col gap-1 p-1">
      {ACCOUNT_MENU.map((menu, index) => {
        const Icon = menu.icon
        const active = pathname === menu.path
        return (
          <Link
            key={index}
            href={menu.path}
            className={`mx-1 flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-medium transition-colors ${
              active ? 'bg-[#F5F5F7] text-[#111111]' : 'text-[#374151] hover:bg-gray-50 hover:text-[#1F2937]'
            }`}
          >
            <Icon className={`h-[16px] w-[16px] shrink-0 ${active ? 'text-[#111111]' : 'text-[#6B7280]'}`} />
            {menu.title}
          </Link>
        )
      })}
      <button
        onClick={() => signOut()}
        className="mx-1 flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-medium text-[#374151] hover:bg-gray-50 hover:text-[#1F2937] text-left transition-colors"
      >
        <FaSignOutAlt className="h-[16px] w-[16px] text-[#6B7280]" />
        Sign Out
      </button>
    </div>
  )
}
export default AccountMenu
