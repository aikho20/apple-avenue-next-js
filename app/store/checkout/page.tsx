'use client'
import AddressForm from '@/components/forms/address-form'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import ErrorMessage from '@/components/ui/errorMessage'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToggle } from '@/hooks/useToggle'
import { useGetAddressQuery, useUpdateOrDeleteAddressMutation } from '@/store/action/accountAction'
import {
  usePlaceOrderMutation,
  useStoreCheckoutQuery,
} from '@/store/action/storeAction'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AddressProps,
  CheckoutProps,
  ProductCartProps,
  AddressAndActionProps,
} from '@/types/type'
import {
  ADD,
  COUNTRY,
  GET,
  CITY,
  PROVINCE,
  BARANGAY,
  DELETE,
  UPDATE,
  STANDARD_DELIVERY,
  CASH_ON_DELIVERY,
} from '@/utils/data'
import { AddressInitailValue } from '@/utils/validation/initialValues'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { PlusCircle, TrashIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function Checkout({ searchParams: { id } }: CheckoutProps) {
  const { data: session } = useSession()
  const [value1, toggle1, setValue1] = useToggle()
  const [value2, toggle2, setValue2] = useToggle()
  const [value, toggle, setValue] = useToggle()
  const [activeItem, setActiveItem] = useState<AddressAndActionProps>({
    action: '',
    address: AddressInitailValue,
  })
  const [activeShippingAddress, setActiveShippingAddress] = useState('')
  const [activePaymentMethod, setActivePaymentMethod] = useState('')
  const [activeShippingOption, setActiveShippingOption] = useState('')
  const [fullName, setFullName] = useState('')
  const [placeOrder, { isLoading: isPlacingAnOrder }] = usePlaceOrderMutation()
  const [updateOrDeleteAddress, { isLoading }] = useUpdateOrDeleteAddressMutation()
  const router = useRouter()

  useEffect(() => {
    if (session) setFullName(session?.user?.name || '')
  }, [session])

  const { data: checkoutItems, isLoading: isFetchingCheckoutCart, error } = useStoreCheckoutQuery({ id })
  const { data: addressItems, isLoading: isFetchingAddress } = useGetAddressQuery({
    action: GET,
    address: AddressInitailValue,
  })
  const checkoutCart = useMemo(
    () => (isFetchingCheckoutCart ? { cart: Array(3).fill({}), total: 0 } : checkoutItems),
    [isFetchingCheckoutCart, checkoutItems]
  )
  const AddressList = useMemo(
    () => (isFetchingAddress ? Array(2).fill({}) : addressItems?.address),
    [isFetchingAddress, addressItems?.address]
  )

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#FCFCFC] flex justify-center py-8 px-4">
      {!error ? (
        <div className="w-full max-w-[640px] rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="flex flex-col items-center py-5 border-b border-gray-50">
            <h2 className="text-[16px] font-bold tracking-tight text-[#1F2937]">Your Order</h2>
            <div className="mt-2 h-[3px] w-8 rounded-full bg-[#111111]" />
          </div>

          <div className="p-4 divide-y divide-gray-50">
            {checkoutCart?.cart?.map((items: ProductCartProps, index: number) => (
              <div className="flex items-center gap-3 py-3" key={index}>
                {isFetchingCheckoutCart ? (
                  <Skeleton className="w-[52px] h-[52px] rounded-[8px]" />
                ) : (
                  <div className="relative h-[52px] w-[52px] overflow-hidden rounded-[8px] border border-gray-100 bg-gray-50 shrink-0">
                    <Image src={items?.images?.[0]} alt="cart-item" fill className="object-cover" sizes="52px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {isFetchingCheckoutCart ? (
                    <Skeleton className="w-[120px] h-4" />
                  ) : (
                    <p className="text-[13px] font-semibold text-[#1F2937] truncate">{items?.productName}</p>
                  )}
                  {isFetchingCheckoutCart ? (
                    <div className="flex justify-between mt-1">
                      <Skeleton className="w-16 h-3" />
                      <Skeleton className="w-12 h-3" />
                    </div>
                  ) : (
                    <div className="flex justify-between mt-1">
                      <span className="text-[12px] text-[#6B7280]">₱{items?.price}</span>
                      <span className="text-[12px] text-[#6B7280]">Qty: {items?.value}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center py-4 border-y border-gray-50 bg-[#FCFCFC]/50">
            <h3 className="text-[13px] font-semibold text-[#1F2937]">Shipping and Payment Info</h3>
          </div>

          <div className="p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#374151]">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="h-[40px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#374151]">Shipping address</label>
              <div className="flex gap-3 overflow-auto pb-2 -mx-1 px-1">
                {AddressList?.map((items: AddressProps, index: number) => {
                  const addrStr = `${items?.address} ${BARANGAY.find((l) => l.id === items?.barangay)?.description || ''} ${PROVINCE.find((l) => l.id === items?.province)?.description || ''} ${COUNTRY.find((l) => l.id === items?.country)?.description || ''} ${items.zipCode}`
                  const isActive = activeShippingAddress === addrStr
                  return (
                    <div
                      key={index}
                      onClick={() => setActiveShippingAddress(addrStr)}
                      className={`min-w-[220px] rounded-[12px] border p-3 flex flex-col gap-1 cursor-pointer transition-all shrink-0 ${
                        isActive
                          ? 'border-[#111111] bg-[#F5F5F7]/50 shadow-[0_2px_8px_rgba(17,17,17,0.08)]'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      {isFetchingAddress ? (
                        <>
                          <Skeleton className="h-4 w-[180px]" />
                          <Skeleton className="h-3 w-[120px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveItem({ action: UPDATE, address: items })
                                toggle()
                              }}
                              className="h-7 w-7 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:border-[#D2D2D7] hover:bg-[#F5F5F7] transition-colors"
                            >
                              <Pencil2Icon className="h-3.5 w-3.5 text-[#111111]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveItem({ action: DELETE, address: items })
                                toggle1()
                              }}
                              className="h-7 w-7 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                          <p className="text-[12px] leading-[1.5] text-[#374151]">
                            {items?.address} {BARANGAY.find((l) => l.id === items?.barangay)?.description}
                          </p>
                          <p className="text-[12px] leading-[1.5] text-[#6B7280]">
                            {CITY.find((l) => l.id === items?.city)?.description}{' '}
                            {PROVINCE.find((l) => l.id === items?.province)?.description}
                          </p>
                          <p className="text-[12px] leading-[1.5] text-[#6B7280]">
                            {COUNTRY.find((l) => l.id === items?.country)?.description} {items.zipCode}
                          </p>
                        </>
                      )}
                    </div>
                  )
                })}
                <button
                  onClick={() => {
                    setActiveItem({ action: ADD, address: AddressInitailValue })
                    toggle()
                  }}
                  className="min-w-[200px] min-h-[120px] rounded-[12px] border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-2 hover:border-[#D2D2D7] hover:bg-[#F5F5F7] transition-colors shrink-0"
                >
                  <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                    <PlusCircle className="h-4 w-4 text-[#111111]" />
                  </div>
                  <span className="text-[12px] font-medium text-[#6B7280]">Add address</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#374151]">Shipping Option</label>
              <div className="flex gap-2">
                {[STANDARD_DELIVERY].map((items, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveShippingOption(items)}
                    className={`rounded-[9px] border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                      activeShippingOption === items
                        ? 'bg-[#F5F5F7] border-[#D2D2D7] text-[#111111]'
                        : 'bg-white border-gray-100 text-[#374151] hover:border-gray-200'
                    }`}
                  >
                    {items}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#374151]">Payment Method</label>
              <div className="flex gap-2">
                {[CASH_ON_DELIVERY].map((items, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePaymentMethod(items)}
                    className={`rounded-[9px] border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                      activePaymentMethod === items
                        ? 'bg-[#F5F5F7] border-[#D2D2D7] text-[#111111]'
                        : 'bg-white border-gray-100 text-[#374151] hover:border-gray-200'
                    }`}
                  >
                    {items}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              {isFetchingAddress ? (
                <>
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </>
              ) : (
                <>
                  <span className="text-[13px] font-semibold text-[#6B7280]">Total</span>
                  <span className="text-[18px] font-bold text-[#1F2937]">₱{checkoutCart?.total}</span>
                </>
              )}
            </div>

            <Button
              className="w-full"
              disabled={isPlacingAnOrder || !activeShippingAddress || !activePaymentMethod || !activeShippingOption}
              onClick={async () => {
                await placeOrder({
                  id: id,
                  paymentMethod: activePaymentMethod,
                  shippingOption: activeShippingOption,
                  shippingAddress: activeShippingAddress,
                  fullName: fullName,
                }).unwrap()
                toggle2()
              }}
            >
              {isPlacingAnOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[640px]">
          <ErrorMessage />
        </div>
      )}

      <Dialog open={value1} onOpenChange={setValue1}>
        <DialogContent className="max-w-[400px] rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Are you sure?</DialogTitle>
            <DialogDescription className="text-[#6B7280]">This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3">
            <Button
              disabled={isLoading}
              onClick={async () => {
                const res = await updateOrDeleteAddress(activeItem).unwrap()
                if (res?.message) toast.success(res.message)
                setValue1(false)
              }}
            >
              {isLoading ? 'Processing...' : 'Proceed'}
            </Button>
            <Button variant="outline" onClick={() => setValue1(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={value} onOpenChange={setValue}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-auto rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">{activeItem.action === ADD ? 'Add new address' : 'Update address'}</DialogTitle>
            <DialogDescription>We will use your address to ship your orders</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <AddressForm initialValue={activeItem.address} callback={() => setValue(false)} action={activeItem.action} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={value2}>
        <AlertDialogContent className="max-w-[440px] rounded-[14px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1F2937]">Thank you!</AlertDialogTitle>
            <AlertDialogDescription>You have successfully placed an order.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button onClick={() => router.push('/account/orders')}>View Order</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back to Store
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
