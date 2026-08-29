'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { signIn } from 'next-auth/react'

interface socialProps {
    callbackUrl: string
}
function Social({ callbackUrl }: socialProps) {
    return (
        <div className='flex items-center gap-x-2 w-full'>
            <Button variant="outline" size={'lg'} onClick={() => { signIn('google', { callbackUrl }) }} className='w-full gap-x-2'><FcGoogle className='h-5 w-5' /></Button>
            <Button variant="outline" size={'lg'} onClick={() => { }} className='w-full gap-x-2'><FaGithub className='h-5 w-5' /></Button>
        </div>
    )
}

export default Social