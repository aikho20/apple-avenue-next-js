'use client'
import RegisterForm from '@/components/forms/register-form'
import Link from 'next/link'
import { FaApple } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RegisterProps {
  searchParams: {
    callbackUrl: string
  }
}

export default function Register({ searchParams: { callbackUrl } }: RegisterProps) {
  const router = useRouter()
  const { data: session } = useSession()
  useEffect(() => {
    if (session) router.push('/')
  }, [session, router])

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#F5F5F7] via-[#F5F5F7]/60 to-[#FCFCFC] flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-[440px] rounded-[14px] border border-gray-100 bg-white p-7 lg:p-8 shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#111111]">
            <FaApple className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">Create account</h1>
          <p className="text-[13px] leading-[1.6] text-[#6E6E73]">Join Apple Avenue — premium Apple, perfected</p>
        </div>
        <RegisterForm callbackUrl={callbackUrl || '/'} />
        <p className="text-center text-[12.5px] text-[#6E6E73]">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-[#0071E3] hover:text-[#0077ED]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
