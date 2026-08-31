'use client'

import ProductForm from '@/components/forms/product-form'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { useToggle } from '@/hooks/useToggle'
import { useSession } from 'next-auth/react'
import { DataTable } from '@/components/ui/custom-table'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, EyeIcon } from 'lucide-react'
import { useGetDashboardOrderQuery, useUpdateOrderStatusMutation } from '@/store/action/dashboardAction'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import OrderInfoLayout from '@/components/shared/order-info-layout'
import { useGetDashboardBranchesQuery } from '@/store/action/branchAction'

function Orders() {
  const { data: session } = useSession()
  const [value, toggle, setValue] = useToggle()
  const [activeOrder, setActiveOrder] = useState<any>()
  const [nextStatus, setNextStatus] = useState('')
  const merchant = session?.user?._id || ''
  const role = (session as any)?.user?.role
  const isAdmin = role === 'admin'
  const isBranch = role === 'branch'
  const ownBranchId = (session as any)?.user?.branch ? String((session as any).user.branch) : ''
  const [branchId, setBranchId] = useState('all')
  const { data: branchData } = useGetDashboardBranchesQuery({}, { skip: !isAdmin })
  const branches: any[] = branchData?.branches || []
  const effectiveBranchParam = isBranch ? ownBranchId : isAdmin ? branchId : undefined
  const { data: ordersData, isLoading: isFetchingOrders, refetch } = useGetDashboardOrderQuery(
    { merchantId: merchant, branchId: effectiveBranchParam },
    { skip: !merchant }
  )
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation()

  const columns = React.useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Status
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'status',
        cell: ({ row }) => (
          <div>
            {row.getValue('status') === 'Pending' && (
              <p className="text-[11px] font-semibold border border-[#D2D2D7] bg-[#F5F5F7] px-2.5 py-1 w-fit rounded-full text-[#111111] whitespace-nowrap">
                {row.getValue('status')}
              </p>
            )}
            {row.getValue('status') === 'Out For Delivery' && (
              <p className="text-[11px] font-semibold border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 w-fit rounded-full text-[#D97706] whitespace-nowrap">
                {row.getValue('status')}
              </p>
            )}
            {row.getValue('status') === 'Delivered' && (
              <p className="text-[11px] font-semibold border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 w-fit rounded-full text-[#059669] whitespace-nowrap">
                {row.getValue('status')}
              </p>
            )}
          </div>
        ),
      },

      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Name
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'fullName',
      },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Shipping Address
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'shippingAddress',
      },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Shipping Option
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'shippingOption',
      },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Payment Method
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'paymentMethod',
      },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Order Placed
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'createdAt',
      },

      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              className='text-center'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Total
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'total',
        cell: ({ row }) => <p className='text-center'>₱{row?.original?.total}</p>,
      },

      {
        header: 'Action',
        accessorKey: 'action',
        cell: ({ row }) => (
          <div
            className='flex flex-row justify-center items-center cursor-pointer'
            onClick={() => {
              setActiveOrder(row.original)
              toggle()
            }}
          >
            <EyeIcon className='h-6 w-6 text-primary mr-1' />
            View
          </div>
        ),
      },
    ],

    [toggle]
  )

  const order = useMemo(() => (isFetchingOrders ? [] : ordersData?.orders || []), [isFetchingOrders, ordersData?.orders])

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#1F2937]">Orders {isBranch ? `— ${(session as any)?.user?.branchName || 'Your Branch'}` : ''}</h1>
          <p className="text-[13px] text-[#6B7280]">{isBranch ? 'Only orders for your branch.' : isAdmin ? 'Track and manage customer orders — filter by branch.' : 'Track and manage customer orders'}</p>
        </div>
        {isAdmin && branches.length > 0 && (
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Branch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b: any) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {isBranch && ownBranchId && <div className="rounded-full bg-[#F5F5F7] border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-[#1D1D1F]">{(session as any)?.user?.branchName || ownBranchId}</div>}
      </div>
      <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden p-2">
        <DataTable columns={columns} data={order} />
      </div>

      <Dialog open={value} onOpenChange={setValue}>
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-auto rounded-[14px]">
          <div className="p-2">
            <OrderInfoLayout data={activeOrder} isLoading={isFetchingOrders} />
          </div>
          {activeOrder && (
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-50 mt-4">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-[#374151]">Update status:</span>
                <Select value={nextStatus || activeOrder?.status} onValueChange={setNextStatus}>
                  <SelectTrigger className="w-[200px] h-9 rounded-[9px] border-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Out For Delivery">Out For Delivery</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={isUpdating || !nextStatus || nextStatus === activeOrder.status}
                onClick={async () => {
                  try {
                    await updateStatus({ orderId: activeOrder._id, status: nextStatus }).unwrap()
                    toast.success(`Order marked as ${nextStatus}`)
                    setValue(false)
                    setNextStatus('')
                    refetch()
                  } catch (e: any) {
                    toast.error(e?.data?.error || 'Failed to update')
                  }
                }}
              >
                {isUpdating ? 'Updating...' : `Update to ${nextStatus || activeOrder.status}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders
