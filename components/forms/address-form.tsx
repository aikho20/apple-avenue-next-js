'use client'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form'
import { AddressSchema, LoginSchema } from '@/utils/validation/schemas/index'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BARANGAY, CITY, PROVINCE, COUNTRY, ADD } from '@/utils/data'
import { useUpdateOrDeleteAddressMutation } from '@/store/action/accountAction'

import { AddressProps } from '@/types/type'
import toast from 'react-hot-toast'

interface AddressFormProps {
  action: string
  initialValue: AddressProps
  callback: () => void
}

export default function AddressForm({ action, initialValue, callback }: AddressFormProps) {
  const [updateOrDeleteAddress, { isLoading }] = useUpdateOrDeleteAddressMutation()

  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: initialValue,
  })

  const { watch } = form
  const country = watch('country')
  const province = watch('province')
  const city = watch('city')
  const onSubmit = async (values: z.infer<typeof AddressSchema>) => {
    const res = await updateOrDeleteAddress({
      action: action,
      address: { ...values },
    }).unwrap()
    if (res?.message) {
      toast.success(res.message)
    }
    callback()
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className={'space-y-4'}>
          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='country'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  defaultValue={form.getValues('country').toString()}
                  onValueChange={(e) => {
                    form.setValue('country', +e)
                    form.setValue('province', 0)
                    form.setValue('city', 0)
                    form.setValue('barangay', 0)
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select Option' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRY.map((items) => (
                      <SelectItem key={items.id} value={items.id.toString()}>
                        {items.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='province'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select
                  defaultValue={form.getValues('province').toString()}
                  onValueChange={(e) => {
                    form.setValue('province', +e)
                    form.setValue('city', 0)
                    form.setValue('barangay', 0)
                  }}
                >
                  <FormControl>
                    <SelectTrigger disabled={country === 0}>
                      <SelectValue placeholder='Select Option' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROVINCE.map((items) => (
                      <SelectItem key={items.id} value={items.id.toString()}>
                        {items.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select
                  defaultValue={form.getValues('city').toString()}
                  onValueChange={(e) => {
                    form.setValue('city', +e)
                    form.setValue('barangay', 0)
                  }}
                >
                  <FormControl>
                    <SelectTrigger disabled={province === 0}>
                      <SelectValue placeholder='Select Option' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CITY.filter((datum) => datum.parent_id === province).map((items) => (
                      <SelectItem key={items.id} value={items.id.toString()}>
                        {items.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='barangay'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barangay</FormLabel>
                <Select
                  defaultValue={form.getValues('barangay').toString()}
                  onValueChange={(e) => {
                    form.setValue('barangay', +e)
                  }}
                >
                  <FormControl>
                    <SelectTrigger disabled={city === 0}>
                      <SelectValue placeholder='Select Option' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BARANGAY.filter((datum) => datum.parent_id === city).map((items) => (
                      <SelectItem key={items.id} value={items.id.toString()}>
                        {items.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='zipCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
        </div>
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Address'}
        </Button>
      </form>
    </Form>
  )
}
