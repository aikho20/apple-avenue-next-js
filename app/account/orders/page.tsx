'use client'

import React, { useMemo } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useGetUserOrderQuery } from '@/store/action/accountAction'
import { OrderInfoProps } from '@/types/type'
import OrderCard from '@/components/ui/order-card'

function Orders() {
  const { data, isLoading: isFetchingOrderList } = useGetUserOrderQuery({})

  const orderList = useMemo(
    () =>
      isFetchingOrderList
        ? Array(4).fill({ orderInfo: { products: Array(2).fill({}) } })
        : data?.orders,
    [isFetchingOrderList, data?.orders]
  )

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-bold tracking-tight text-[#1F2937]">My Orders</h1>
        <span className="text-[12px] font-medium text-[#6B7280] bg-white border border-gray-100 rounded-full px-3 py-1">
          {orderList?.length || 0} orders
        </span>
      </div>

      {orderList?.length > 0 ? (
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          {orderList?.map((datum: OrderInfoProps, index: number) => (
            <div key={index} className="h-full">
              <OrderCard data={datum} isLoading={isFetchingOrderList} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] flex flex-col items-center justify-center py-16 gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
            <ShoppingBag className="h-5 w-5 text-[#111111]" />
          </div>
          <p className="text-[13px] font-medium text-[#6B7280]">No Orders Found</p>
          <p className="text-[12px] text-[#9CA3AF]">Your orders will appear here</p>
        </div>
      )}
    </div>
  )
}

export default Orders
