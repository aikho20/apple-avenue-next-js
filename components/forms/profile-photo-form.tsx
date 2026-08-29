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
import { ImageSchema, ProductSchema } from '@/utils/validation/schemas/index'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import FormError from '@/components/ui/from-error'
import { useRouter } from 'next/navigation'
import { useAddProductMutation, useUpdateProductMutation } from '@/store/action/productAction'
import { useToggle } from '@/hooks/useToggle'
import ImageUpload from '@/components/ui/ImageUpload'
import { ADD_PRODUCT, UPDATE_PRODUCT } from '@/utils/data'
import { useToast } from '@/hooks/use-toast'
import { ProductProps, ProfileImageFormProps } from '@/types/type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useUpdateProfileImageMutation } from '@/store/action/accountAction'
import { ImageInitialValue } from '@/utils/validation/initialValues'

export default function ProfilePhotoForm({ initialValue, callback }: ProfileImageFormProps) {
  const { toast } = useToast()
  const [updateProfileImage, { isLoading }] = useUpdateProfileImageMutation()
  const form = useForm<z.infer<typeof ImageSchema>>({
    resolver: zodResolver(ImageSchema),
    defaultValues: initialValue,
  })

  const onSubmit = async (values: z.infer<typeof ImageSchema>) => {
    const res = await updateProfileImage({ image: values?.image[0] }).unwrap()
    if (res.message) {
      toast({
        title: 'Success!',
        variant: 'success',
        description: res.message,
      })
    } else {
      toast({
        title: 'Error!',
        description: res.error,
        variant: 'destructive',
      })
    }
    callback()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className={'space-y-4'}>
          <div className='flex items-center justify-center min-h-[200px] w-100 shadow-md border-2 border-dashed border-gray-300'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload name='image' />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
