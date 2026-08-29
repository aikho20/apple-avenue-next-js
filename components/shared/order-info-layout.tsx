import { ArrowRight, Minus, Plus, Trash2Icon } from 'lucide-react'

import { CartCardProps, OrderLayoutProps, ProductCartProps } from '@/types/type'
import { DRAFT, OUT_OF_STOCK } from '@/utils/data'
import Image from 'next/image'
import { Skeleton } from '../ui/skeleton'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function OrderInfoLayout({ data, isLoading }: OrderLayoutProps) {
  return (
    <div className='w-full relative rounded bg-white h-[100vh] md:h-full flex flex-col '>
      <Tabs defaultValue='Order' className='w-full relative'>
        <TabsList className='grid w-full grid-cols-2 sticky top-0'>
          <TabsTrigger value='order'>Order</TabsTrigger>
          <TabsTrigger value='status'>Status</TabsTrigger>
        </TabsList>
        <TabsContent value='order'>
          <div className='grid lg:grid-cols-1 gap-2 md:grid-cols-1 sm:grid-cols-1 grid-cols-1 flex'>
            {data?.products?.map((items: ProductCartProps, index: number) => (
              <div className='flex flex-row w-100 px-2 py-1 rounded' key={index}>
                {isLoading ? (
                  <Skeleton className='w-[90px] h-[70px]' />
                ) : (
                  <Image
                    src={items?.images?.[0]}
                    alt='cart-item'
                    className='w-[60px] h-[60px] rounded'
                    height={60}
                    width={60}
                  />
                )}

                <div className='w-full p-2 '>
                  {isLoading ? (
                    <Skeleton className='w-[80px] h-[20px]' />
                  ) : (
                    <Label size={'md'}> {items?.productName} </Label>
                  )}

                  {isLoading ? (
                    <div className='flex flex-row justify-between w-100'>
                      <Skeleton className='w-[80px] h-[20px] my-1' />
                      <Skeleton className='w-[80px] h-[20px]' />
                    </div>
                  ) : (
                    <div className='flex flex-row justify-between w-100'>
                      <Label size={'sm'}> P{items?.price} </Label>
                      <Label size={'sm'}> Qty:{items?.value} </Label>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading ? (
              <Skeleton className='h-[20px] w-[150px] mt-3' />
            ) : (
              <Label size={'md'} className='flex flex-col'>
                Full Name
                <Label size={'sm'} className='px-0'>
                  {data?.fullName}
                </Label>
              </Label>
            )}
            {isLoading ? (
              <Skeleton className='h-[20px] w-[180px] mt-3' />
            ) : (
              <Label size={'md'} className='flex flex-col'>
                Shipping address
                <Label size={'sm'} className='px-0'>
                  {data?.shippingAddress}
                </Label>
              </Label>
            )}

            {isLoading ? (
              <Skeleton className='h-[20px] w-[130px] mt-3' />
            ) : (
              <Label size={'md'} className='flex flex-col'>
                Shipping Option
                <Label size={'sm'} className='px-0'>
                  {data?.shippingOption}
                </Label>
              </Label>
            )}
            {isLoading ? (
              <Skeleton className='h-[20px] w-[130px] mt-3' />
            ) : (
              <Label size={'md'} className='flex flex-col'>
                Payment Method
                <Label size={'sm'} className='px-0'>
                  {data?.paymentMethod}
                </Label>
              </Label>
            )}
          </div>
        </TabsContent>
        <TabsContent value='status'></TabsContent>
      </Tabs>
    </div>
  )
}
