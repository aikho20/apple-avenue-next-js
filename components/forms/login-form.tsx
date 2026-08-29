'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form'
import { LoginSchema } from '@/utils/validation/schemas/index'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CardWraper from '@/components/ui/card-wrapper'
import Social from '@/components/ui/social'
import Link from 'next/link'
import { LoginInitialValues } from '@/utils/validation/initialValues'
import FormSuccess from '@/components/ui/form-success'
import FormError from '@/components/ui/from-error'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLoginMutation } from '@/store/action/authAction'

interface LoginFormProps {
  callbackUrl: string
}

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const searchParams = useSearchParams()
  const { status } = useSession()
  const error = searchParams.get('error')

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: LoginInitialValues,
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    await signIn('credentials', {
      email: values.email,
      password: values.password,
      callbackUrl,
    })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className={'space-y-4'}>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='john.doe@example.com' type={'email'} />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type={'password'} />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
        </div>
        {error && <FormError message={error} />}

        <Button type='submit' className='w-full' disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading...' : 'Login'}
        </Button>
        <div className='flex w-full flex-col items-center gap-3'>
          <div className="relative w-full flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[11px] font-medium text-[#9CA3AF]">or</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <Social callbackUrl={callbackUrl} />
        </div>
      </form>
    </Form>
  )
}
