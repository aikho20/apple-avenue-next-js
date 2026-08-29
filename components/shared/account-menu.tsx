import { ACCOUNT_MENU } from '@/utils/data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { FaSignOutAlt } from 'react-icons/fa'

const AccountMenu = () => {
  const pathname = usePathname()

  return (
    <div className="py-2 flex flex-col gap-1">
      {ACCOUNT_MENU.map((menu, index) => {
        const Icon = menu.icon
        const active = pathname === menu.path
        return (
          <Link
            key={index}
            href={menu.path}
            className={`mx-2 flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13px] font-medium transition-colors ${
              active ? 'bg-[#F5F5F7] text-[#111111]' : 'text-[#374151] hover:bg-gray-50 hover:text-[#1F2937]'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#111111]' : 'text-[#6B7280]'}`} />
            {menu.title}
          </Link>
        )
      })}
      <button
        onClick={() => signOut()}
        className="mx-2 flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-gray-50 hover:text-[#1F2937] text-left transition-colors"
      >
        <FaSignOutAlt className="h-4 w-4 text-[#6B7280]" />
        Sign Out
      </button>
    </div>
  )
}
export default AccountMenu
