'use client'

import React from 'react'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  GitCompare,
  Smartphone,
} from 'lucide-react'
import Image from 'next/image'
import { useWishlist } from '@/hooks/useWishlist'
import { useCompare } from '@/hooks/useCompare'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'

const Header = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [search, setSearch] = React.useState('')
  const { wishlistIds } = useWishlist()
  const { ids: compareIds } = useCompare()

  const handleSearch = () => {
    const q = search.trim()
    if (!q) return
    router.push(`/?search=${encodeURIComponent(q)}`)
  }

  return (
    <header className='sticky top-0 left-0 z-50 w-full bg-white border-b border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)]'>
      <div className='mx-auto flex h-[56px] sm:h-[64px] w-full max-w-[1280px] items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6'>
        {/* Left: Logo + Nav */}
        <div className='flex items-center gap-8'>
          {/* Mobile menu */}
          <Drawer direction={'left'}>
            <DrawerTrigger asChild>
              <button className='flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] md:hidden'>
                <Menu className='h-5 w-5 text-[#111111]' />
              </button>
            </DrawerTrigger>
            <VisuallyHidden>
              <DrawerTitle>Menu</DrawerTitle>
              <DialogDescription>Mobile Controls</DialogDescription>
            </VisuallyHidden>
            <DrawerContent className='h-screen top-0 left-0 mt-0 w-[300px] rounded-r-[14px]'>
              <div className='flex flex-col items-start p-6 gap-6'>
                <Link href='/' className='flex items-center gap-2 text-[#111111]'>
                  <Image src="/icon.png" alt="Apple Avenue" width={140} height={32} className="h-8 w-auto object-contain" priority unoptimized />
                </Link>
                <nav className='flex flex-col gap-3 w-full max-h-[65vh] overflow-y-auto pr-2'>
                  <p className='text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase'>
                    Shop
                  </p>
                  <Link href='/' className='text-sm font-medium text-gray-700'>
                    Home
                  </Link>
                  <Link href='/store' className='text-sm font-medium text-gray-700'>
                    Shop — All Devices
                  </Link>
                  <Link href='/deals' className='text-sm font-medium text-gray-700'>
                    Deals
                  </Link>
                  <div className='pt-3 mt-1 border-t border-gray-100 flex flex-col gap-3'>
                    <p className='text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase'>
                      Discover
                    </p>
                    <Link href='/phone-finder' className='text-sm font-medium text-gray-700'>
                      Phone Finder
                    </Link>
                    <Link href='/compare' className='text-sm font-medium text-gray-700'>
                      Compare (2-4)
                    </Link>
                    <Link
                      href='/wishlist'
                      className='text-sm font-medium text-gray-700 flex items-center gap-2'
                    >
                      <Heart className='h-3.5 w-3.5' /> Wishlist
                    </Link>
                  </div>
                  <div className='pt-3 border-t border-gray-100 flex flex-col gap-3'>
                    <p className='text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase'>
                      Services
                    </p>
                    <Link href='/trade-in' className='text-sm font-medium text-gray-700'>
                      Trade-In
                    </Link>
                    <Link
                      href='/warranty'
                      className='text-sm font-medium text-gray-700 flex items-center gap-2'
                    >
                      <ShieldCheck className='h-3.5 w-3.5' /> Warranty
                    </Link>
                    <Link
                      href='/store-locator'
                      className='text-sm font-medium text-gray-700 flex items-center gap-2'
                    >
                      <MapPin className='h-3.5 w-3.5' /> Store Locator
                    </Link>
                    <Link
                      href='/reviews'
                      className='text-sm font-medium text-gray-700 flex items-center gap-2'
                    >
                      <Star className='h-3.5 w-3.5' /> Reviews
                    </Link>
                  </div>
                  <div className='pt-3 border-t border-gray-100 flex flex-col gap-3'>
                    <Link href='/contact-us' className='text-sm font-medium text-gray-700'>
                      Contact
                    </Link>
                    <Link href='/account/orders' className='text-sm font-medium text-gray-700'>
                      My Orders
                    </Link>
                    <Link href='/account/profile' className='text-sm font-medium text-gray-700'>
                      Account
                    </Link>
                  </div>
                </nav>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 shrink-0'>
            <Image src="/icon.png" alt="Apple Avenue" width={140} height={32} className="h-7 sm:h-8 w-auto object-contain" priority unoptimized />
          </Link>

          {/* Desktop Nav — all features visible */}
          <NavigationMenu className='hidden lg:block'>
            <NavigationMenuList className='gap-0'>
              <NavigationMenuItem>
                <NavigationMenuTrigger className='bg-transparent px-2.5 py-2 text-[13px] font-medium text-[#424245] hover:text-secondary data-[state=open]:bg-transparent data-[state=open]:text-secondary hover:bg-transparent focus:bg-transparent h-auto'>
                  Shop
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className='p-3 min-w-[560px] flex flex-row h-[340px] space-x-2'>
                    <div className='flex flex-col px-4 gap-1 w-[160px]'>
                      <span className='text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase px-2 py-1'>
                        Categories
                      </span>
                      {['iPhone', 'iPad', 'Mac', 'Watch', 'AirPods', 'Accessories'].map((c) => (
                        <Link
                          key={c}
                          href={`/store?category=${c}`}
                          className='text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded px-2 py-1.5'
                        >
                          {c}
                        </Link>
                      ))}
                      <span className='text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase px-2 pt-3'>
                        Quick
                      </span>
                      <Link
                        href='/deals'
                        className='text-sm font-medium text-secondary hover:bg-[#F5F5F7] rounded px-2 py-1'
                      >
                        Deals
                      </Link>
                    </div>
                    <Separator orientation='vertical' className='h-full flex' />
                    <div className='flex flex-col items-start gap-2 px-5 flex-1'>
                      <span className='text-[11px] font-bold tracking-[0.08em] text-[#86868b] uppercase'>
                        Apple Avenue — All features
                      </span>
                      <div className='grid grid-cols-2 gap-2 w-full text-[12.5px]'>
                        <Link
                          href='/phone-finder'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F]'
                        >
                          Phone Finder
                        </Link>
                        <Link
                          href='/compare'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center gap-1'
                        >
                          <GitCompare className='h-3 w-3' /> Compare
                        </Link>
                        <Link
                          href='/trade-in'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F]'
                        >
                          Trade-In
                        </Link>
                        <Link
                          href='/warranty'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center gap-1'
                        >
                          <ShieldCheck className='h-3 w-3' /> Warranty
                        </Link>
                        <Link
                          href='/store-locator'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center gap-1'
                        >
                          <MapPin className='h-3 w-3' /> Store Locator
                        </Link>
                        <Link
                          href='/reviews'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F] flex items-center gap-1'
                        >
                          <Star className='h-3 w-3' /> Reviews
                        </Link>
                        <Link
                          href='/contact-us'
                          className='rounded px-2 py-1.5 hover:bg-[#F5F5F7] text-[#1D1D1F]'
                        >
                          Contact
                        </Link>
                      </div>
                      <p className='text-[11px] text-[#86868b] mt-1'>
                        Single official store • Certified • Warranty • Insured delivery. Every
                        product, deal & service is admin-driven.
                      </p>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {/* Primary - always visible */}
              {[
                ['/deals', 'Deals'],
                ['/phone-finder', 'Phone Finder'],
                ['/compare', 'Compare'],
                ['/trade-in', 'Trade-In'],
                ['/warranty', 'Warranty'],
                ['/store-locator', 'Stores'],
                ['/reviews', 'Reviews'],
              ].map(([href, label]) => (
                <NavigationMenuItem key={href} className='hidden xl:block'>
                  <Link href={href} legacyBehavior passHref>
                    <span className='inline-flex h-auto items-center justify-center rounded-md bg-transparent px-2 py-2 text-[13px] font-medium text-[#424245] hover:text-secondary transition-colors cursor-pointer'>
                      {label}
                    </span>
                  </Link>
                </NavigationMenuItem>
              ))}
              {/* Compact overflow for large screens - visible on lg but not xl */}
              <NavigationMenuItem className='xl:hidden'>
                <NavigationMenuTrigger className='bg-transparent px-2 py-2 text-[13px] font-medium text-[#424245] hover:text-secondary h-auto'>
                  More
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className='p-3 w-[280px] grid grid-cols-2 gap-1'>
                    {[
                      ['/warranty', 'Warranty'],
                      ['/store-locator', 'Store Locator'],
                      ['/reviews', 'Reviews'],
                      ['/trade-in', 'Trade-In'],
                    ].map(([href, label]) => (
                      <Link
                        key={href}
                        href={href}
                        className='rounded px-3 py-2 text-[13px] hover:bg-[#F5F5F7] text-[#1D1D1F]'
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Center: Search */}
        <div className='hidden md:flex flex-1 max-w-[360px] items-center mx-4'>
          <div className='relative w-full'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              placeholder='Search iPhone, Mac, iPad…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              className='h-[36px] w-full rounded-full bg-[#F5F5F7] border border-gray-100 pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring--secondary/10 focus:border--secondary/20 transition'
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className='flex items-center gap-2.5 shrink-0'>
          {/* Mobile search icon */}
          <button
            onClick={() => {
              const q = prompt('Search Apple devices (iPhone, Mac…)')
              if (q) router.push(`/store?search=${encodeURIComponent(q)}`)
            }}
            className='flex md:hidden h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
          >
            <Search className='h-4 w-4 text-[#111111]' />
          </button>

          {status === 'loading' ? (
            <Skeleton className='w-[40px] h-[40px] rounded-full' />
          ) : status === 'authenticated' ? (
            <>
              <Link
                href='/wishlist'
                className='hidden sm:flex relative h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
                title='Wishlist'
              >
                <Heart className='h-[18px] w-[18px] text-[#111111]' />
                {wishlistIds.length > 0 && (
                  <span className='absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center'>
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              <Link
                href='/compare'
                className='hidden sm:flex relative h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
                title='Compare (2-4)'
              >
                <GitCompare className='h-[18px] w-[18px] text-[#111111]' />
                {compareIds.length > 0 && (
                  <span className='absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg--secondary text-white text-[10px] font-bold flex items-center justify-center'>
                    {compareIds.length}
                  </span>
                )}
              </Link>
              <Link
                href='/store'
                className='flex relative h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
                title='Cart'
              >
                <ShoppingCart className='h-[18px] w-[18px] text-[#111111]' />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className='flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors outline-none'
                  title='Account'
                >
                  <User className='h-[18px] w-[18px] text-[#111111]' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  {session?.user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href='/dashboard' className='w-full cursor-pointer text-sm'>
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href='/account/orders' className='w-full cursor-pointer text-sm'>
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/account/profile' className='w-full cursor-pointer text-sm'>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className='cursor-pointer text-sm'>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href='/wishlist'
                className='hidden md:flex relative h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
                title='Wishlist'
              >
                <Heart className='h-[18px] w-[18px] text-[#111111]' />
                {wishlistIds.length > 0 && (
                  <span className='absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center'>
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              <Link
                href='/compare'
                className='hidden md:flex relative h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
                title='Compare'
              >
                <GitCompare className='h-[18px] w-[18px] text-[#111111]' />
                {compareIds.length > 0 && (
                  <span className='absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg--secondary text-white text-[10px] font-bold flex items-center justify-center'>
                    {compareIds.length}
                  </span>
                )}
              </Link>
              <Link
                href='/store'
                className='hidden md:flex relative h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors'
                title='Cart'
              >
                <ShoppingCart className='h-[18px] w-[18px] text-[#111111]' />
              </Link>
              <div
                className='hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7]'
                title='Account'
              >
                <User className='h-[18px] w-[18px] text-[#111111]' />
              </div>
              <Button
                onClick={() => router.push('/auth/login')}
                className='h-[36px] rounded-[8px] bg-[#111111] px-5 text-[13px] font-semibold text-white hover:bg-black shadow-none'
              >
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
