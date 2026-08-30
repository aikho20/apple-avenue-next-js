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
import { Pencil2Icon, PlusCircledIcon } from '@radix-ui/react-icons'
import { useToggle } from '@/hooks/useToggle'
import { useGetStoreProductQuery } from '@/store/action/storeAction'
import { useSession } from 'next-auth/react'
import { DataTable } from '@/components/ui/custom-table'
import { ADD_PRODUCT, UPDATE_PRODUCT } from '@/utils/data'
import { ProductInitialValue } from '@/utils/validation/initialValues'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Trash2, Boxes } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useDeleteProductMutation } from '@/store/action/productAction'
import toast from 'react-hot-toast'

function Products() {
  const { data: session } = useSession()
  const [value, toggle, setValue] = useToggle()
  const [value1, toggle1, setValue1] = useToggle()
  const [activeProduct, setActiveProduct] = useState({
    action: '',
    initialValue: ProductInitialValue,
  })
  const merchant = session?.user?._id || ''
  const { data: productData, isLoading: isFetchingProduct } = useGetStoreProductQuery({
    merchantId: merchant,
  })
  const [deleteProduct] = useDeleteProductMutation()

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
            {row.getValue('status') === 'Out of Stock' && (
              <p className="text-[11px] font-semibold border border-[#D2D2D7] bg-[#F5F5F7] px-2.5 py-1 w-fit rounded-full text-[#111111] whitespace-nowrap">
                {row.getValue('status')}
              </p>
            )}
            {row.getValue('status') === 'Draft' && (
              <p className="text-[11px] font-semibold border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 w-fit rounded-full text-[#D97706] whitespace-nowrap">
                {row.getValue('status')}
              </p>
            )}
            {row.getValue('status') === 'Posted' && (
              <p className="text-[11px] font-semibold border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 w-fit rounded-full text-[#059669] whitespace-nowrap">
                {row.getValue('status')}
              </p>
            )}
          </div>
        ),
      },
      {
        header: 'Image',
        accessorKey: 'images',
        cell: ({ row }) => {
          const v: any = row.getValue('images')
          const src = Array.isArray(v) ? v[0] : typeof v === 'string' ? v : ''
          return (
            <div className="h-10 w-10 overflow-hidden rounded-[8px] border border-gray-100 bg-gray-50">
              <Image
                src={src || '/placeholder.jpg'}
                className="h-10 w-10 object-cover"
                height={40}
                width={40}
                alt="product"
              />
            </div>
          )
        },
      },
      { header: 'ID', accessorKey: '_id' },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Category
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'category',
      },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Product Name
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'productName',
      },
      { header: 'Description', accessorKey: 'description' },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Price
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'price',
      },
      {
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Quantity
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        accessorKey: 'quantity',
      },
      {
        header: 'Featured',
        accessorKey: 'isFeatured',
        cell: ({ row }: any) => (
          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${row.getValue('isFeatured') ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-[#6B7280] border-gray-200'}`}>
            {row.getValue('isFeatured') ? 'Featured' : '—'}
          </span>
        ),
      },
      {
        header: 'Deal',
        accessorKey: 'isDeal',
        cell: ({ row }: any) => (
          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${row.getValue('isDeal') ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' : 'bg-gray-50 text-[#6B7280] border-gray-200'}`}>
            {row.getValue('isDeal') ? 'Deal' : '—'}
          </span>
        ),
      },
      {
        header: 'Action',
        accessorKey: 'action',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#F5F5F7] hover:border-[#D2D2D7] transition-colors"
              onClick={() => {
                setActiveProduct({ action: UPDATE_PRODUCT, initialValue: row.original })
                setValue1(true)
              }}
              title="Edit"
            >
              <Pencil2Icon className="h-4 w-4 text-[#374151]" />
            </button>
            <button
              className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
              onClick={async () => {
                if (!confirm(`Delete "${row.original.productName}"?`)) return
                try {
                  await deleteProduct({ _id: row.original._id }).unwrap()
                  toast.success('Product deleted')
                } catch (e: any) {
                  toast.error(e?.data?.error || 'Failed to delete')
                }
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line
    []
  )

  const product = useMemo(
    () => (isFetchingProduct ? [] : productData?.product),
    [isFetchingProduct, productData?.product]
  )

  return (
    <div className="w-full flex flex-col gap-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#1F2937]">Products</h1>
          <p className="text-[12px] sm:text-[13px] text-[#6B7280]">Manage your store catalog — inventory & price history audited</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm" className="sm:size-default"><Boxes className="h-4 w-4 mr-1" /> Inventory</Button>
          </Link>
          <Button onClick={() => toggle()} size="sm" className="sm:size-default">
            <PlusCircledIcon className="h-4 w-4" /> <span className="hidden xs:inline">New product</span><span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>
      <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden p-2 overflow-x-auto">
        <div className="min-w-[640px]">
        <DataTable columns={columns} data={product} />
        </div>
      </div>
      <Dialog open={value} onOpenChange={setValue}>
        <DialogContent className="lg:max-w-[900px] max-h-[90vh] overflow-auto rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Add Product</DialogTitle>
            <DialogDescription>Add new product to your store</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <ProductForm action={ADD_PRODUCT} initialValue={ProductInitialValue} callback={() => setValue(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={value1} onOpenChange={setValue1}>
        <DialogContent className="lg:max-w-[900px] max-h-[90vh] overflow-auto rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Update Product</DialogTitle>
            <DialogDescription>Update product in your store</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <ProductForm action={activeProduct.action} initialValue={activeProduct.initialValue} callback={() => setValue1(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Products
