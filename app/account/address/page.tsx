'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGetAddressQuery, useUpdateOrDeleteAddressMutation } from '@/store/action/accountAction'
import { GET, ADD, UPDATE, DELETE, BARANGAY, CITY, PROVINCE, COUNTRY } from '@/utils/data'
import { AddressInitailValue } from '@/utils/validation/initialValues'
import AddressForm from '@/components/forms/address-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react'
import { AddressProps } from '@/types/type'

export default function AddressPage() {
  const { data, isLoading } = useGetAddressQuery({ action: GET, address: AddressInitailValue })
  const [active, setActive] = useState<{ action: string; address: AddressProps }>({
    action: ADD,
    address: AddressInitailValue,
  })
  const [open, setOpen] = useState(false)
  const addresses: AddressProps[] = data?.address || []

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-[#1F2937]">Addresses</h1>
          <p className="text-[13px] text-[#6B7280]">{addresses.length} saved addresses</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setActive({ action: ADD, address: AddressInitailValue })
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add address
        </Button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <Card className="p-6 text-[13px] text-[#6B7280]">Loading...</Card>
        ) : addresses.length === 0 ? (
          <Card className="p-10 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#111111]" />
            </div>
            <p className="text-[13px] font-medium text-[#6B7280]">No addresses yet</p>
            <p className="text-[12px] text-[#9CA3AF]">Add an address to speed up checkout</p>
          </Card>
        ) : (
          addresses.map((a: AddressProps) => (
            <Card key={a._id} className="p-4 flex justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-medium text-[#1F2937]">
                  {a.address} {BARANGAY.find((x) => x.id === a.barangay)?.description || ''}
                </p>
                <p className="text-[12px] text-[#6B7280]">
                  {CITY.find((x) => x.id === a.city)?.description} {PROVINCE.find((x) => x.id === a.province)?.description}
                </p>
                <p className="text-[12px] text-[#6B7280]">
                  {COUNTRY.find((x) => x.id === a.country)?.description} {a.zipCode}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setActive({ action: UPDATE, address: a })
                    setOpen(true)
                  }}
                  className="h-8 w-8 rounded-full border border-gray-100 bg-white flex items-center justify-center hover:border-[#D2D2D7] hover:bg-[#F5F5F7] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-[#374151]" />
                </button>
                <DeleteButton address={a} />
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[560px] max-h-[90vh] overflow-auto rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">{active.action === ADD ? 'Add address' : 'Edit address'}</DialogTitle>
            <DialogDescription>We&apos;ll use this to deliver your orders</DialogDescription>
          </DialogHeader>
          <AddressForm
            action={active.action}
            initialValue={active.address}
            callback={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DeleteButton({ address }: { address: AddressProps }) {
  const [mutate, { isLoading }] = useUpdateOrDeleteAddressMutation()
  return (
    <button
      disabled={isLoading}
      onClick={() => mutate({ action: DELETE, address })}
      className="h-8 w-8 rounded-full border border-gray-100 bg-white flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5 text-red-500" />
    </button>
  )
}
