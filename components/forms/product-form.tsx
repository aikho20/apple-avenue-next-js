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
import { ProductSchema } from '@/utils/validation/schemas/index'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import FormError from '@/components/ui/from-error'
import { useRouter } from 'next/navigation'
import { useAddProductMutation, useUpdateProductMutation } from '@/store/action/productAction'
import { useToggle } from '@/hooks/useToggle'
import ImageUpload from '@/components/ui/ImageUpload'
import { ADD_PRODUCT, DRAFT, OUT_OF_STOCK, POSTED, UPDATE_PRODUCT } from '@/utils/data'
import { ProductProps } from '@/types/type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import toast from 'react-hot-toast'

export default function ProductForm({ action, initialValue, callback }: ProductProps) {
  const [addProduct, { isLoading: isAddingProduct, data }] = useAddProductMutation()
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation()
  const router = useRouter()

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: initialValue,
  })

  const onSubmit = async (values: z.infer<typeof ProductSchema>) => {
    if (action === ADD_PRODUCT) {
      const res = await addProduct(values).unwrap()

      if (res.message) {
        toast.success(res.message)
      }
    }
    if (action === UPDATE_PRODUCT) {
      const res = await updateProduct(values).unwrap()
      if (res.message) {
        toast.success(res.message)
      }
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
              name='images'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload name='images' />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isUpdatingProduct || isAddingProduct} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='productName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isUpdatingProduct || isAddingProduct} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isUpdatingProduct || isAddingProduct} />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={'number'}
                      disabled={isUpdatingProduct || isAddingProduct}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='cost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={'number'}
                      disabled={isUpdatingProduct || isAddingProduct}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (Total Stock)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={'number'}
                      disabled={isUpdatingProduct || isAddingProduct}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sku'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Auto if blank" disabled={isUpdatingProduct || isAddingProduct} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lowStockThreshold'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input {...field} type={'number'} disabled={isUpdatingProduct || isAddingProduct} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='reservedStock'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reserved Stock</FormLabel>
                  <FormControl>
                    <Input {...field} type={'number'} disabled={isUpdatingProduct || isAddingProduct} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    defaultValue={form.getValues('status')}
                    onValueChange={(e) => {
                      form.setValue('status', e)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select Option' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[POSTED, DRAFT, OUT_OF_STOCK].map((items) => (
                        <SelectItem key={items} value={items}>
                          {items}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 rounded-[10px] border border-gray-100 bg-[#F5F5F7] p-3'>
            <FormField
              control={form.control}
              name='isFeatured'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                  <FormControl>
                    <input
                      type='checkbox'
                      checked={field.value as boolean}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className='h-4 w-4 rounded border-gray-300'
                    />
                  </FormControl>
                  <div>
                    <FormLabel className='text-[13px] font-semibold'>Featured — show on homepage</FormLabel>
                    <p className='text-[11px] text-[#6E6E73]'>Appears in Featured Collection</p>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isDeal'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                  <FormControl>
                    <input
                      type='checkbox'
                      checked={field.value as boolean}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className='h-4 w-4 rounded border-gray-300'
                    />
                  </FormControl>
                  <div>
                    <FormLabel className='text-[13px] font-semibold'>Deal — show on Deals page</FormLabel>
                    <p className='text-[11px] text-[#6E6E73]'>Appears as a deal / promo tile</p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        {data?.error && <FormError message={data?.error} />}

        <Button type='submit' disabled={isUpdatingProduct || isAddingProduct}>
          {action === ADD_PRODUCT
            ? `${isUpdatingProduct || isAddingProduct ? 'Adding...' : 'Add Product'}`
            : `${isUpdatingProduct || isAddingProduct ? 'Updating...' : 'Update Product'}`}
        </Button>
      </form>
    </Form>
  )
}
