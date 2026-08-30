'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Image from 'next/image'
import { FiFacebook } from 'react-icons/fi'
import { LinkedInLogoIcon } from '@radix-ui/react-icons'
import { X } from 'lucide-react'

export default function Footer() {
  const pathname = usePathname()
  return (
    <footer className="w-full bg-white border-t border-gray-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-3 lg:col-span-2 col-span-2 sm:col-span-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.png" alt="Apple Avenue" width={140} height={32} className="h-8 w-auto object-contain" unoptimized />
            </Link>
            <p className="text-[12.5px] leading-[1.7] text-[#6E6E73] max-w-[300px]">
              Premium Apple, perfected. Certified iPhone, iPad, Mac, Watch and AirPods — authentic, warranty-backed. Single official store — every product, deal & service is admin-driven.
            </p>
            <p className="text-[11px] text-[#86868b]">Home • Shop • Deals • Phone Finder • Compare • Trade-In • Wishlist • Warranty • Stores • Reviews — all visible in header & footer.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F]">Shop</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/store" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">All Devices</Link>
              <Link href="/deals" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Deals</Link>
              <Link href="/store?category=iPhone" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">iPhone</Link>
              <Link href="/store?category=Mac" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Mac</Link>
              <Link href="/store?category=iPad" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">iPad • Watch • AirPods</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F]">Discover</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/phone-finder" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Phone Finder</Link>
              <Link href="/compare" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Compare</Link>
              <Link href="/wishlist" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Wishlist</Link>
              <Link href="/reviews" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Reviews</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F]">Services</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/trade-in" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Trade-In</Link>
              <Link href="/warranty" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Warranty</Link>
              <Link href="/store-locator" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Store Locator</Link>
              <Link href="/contact-us" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">Contact</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F]">Popular</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/store?search=iPhone%2015%20Pro" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">iPhone 15 Pro</Link>
              <Link href="/store?search=MacBook%20Air%20M3" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">MacBook Air M3</Link>
              <Link href="/store?search=iPad%20Pro" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">iPad Pro</Link>
              <Link href="/store?search=AirPods" className="text-[13px] text-[#6E6E73] hover:text-[#0071E3]">AirPods Pro • Max</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F]">Follow us</h4>
            <div className="flex gap-2">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#111111] hover:bg-[#E8E8ED] transition-colors">
                <FiFacebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#111111] hover:bg-[#E8E8ED] transition-colors">
                <X className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#111111] hover:bg-[#E8E8ED] transition-colors">
                <LinkedInLogoIcon className="h-4 w-4" />
              </a>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <p className="text-[13px] font-semibold text-[#1D1D1F]">Daily Newsletter</p>
              <div className="flex gap-2">
                <input
                  placeholder="Email Address"
                  className="flex-1 h-[36px] rounded-[9px] border border-gray-100 bg-white px-3 text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/10 focus:border-[#D2D2D7]"
                />
                <Button className="h-[36px] px-5 shrink-0 bg-[#111111] hover:bg-black">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-50 pt-6 flex justify-center">
          <p className="text-[12px] text-[#86868b]">© 2024 Apple Avenue — Premium Apple, Perfected. Authentic • Certified • Warranty-backed.</p>
        </div>
      </div>
    </footer>
  )
}
