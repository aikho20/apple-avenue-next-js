'use client'

import PasswordUpdate from '@/components/forms/password-update'
import ProfileUpdateForm from '@/components/forms/profile-update-form'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import {
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useToggle } from '@/hooks/useToggle'
import { Edit, ImageIcon, StoreIcon } from 'lucide-react'
import { ImageInitialValue } from '@/utils/validation/initialValues'
import { useGetUserProfileQuery, useDeleteAccountMutation } from '@/store/action/accountAction'
import { Skeleton } from '@/components/ui/skeleton'
import ProfilePhotoForm from '@/components/forms/profile-photo-form'
import CoverPhotoForm from '@/components/forms/cover-photo-form'
import Image from 'next/image'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

function Profile() {
  const [value, toggle, setValue] = useToggle()
  const [value1, toggle1, setValue1] = useToggle()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data, isLoading } = useGetUserProfileQuery({})
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation()

  const handleDelete = async () => {
    try {
      await deleteAccount({}).unwrap()
      toast.success('Account deleted')
      await signOut({ callbackUrl: '/' })
    } catch (e: any) {
      toast.error(e?.data?.error || 'Failed to delete')
    }
  }
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="relative">
          {isLoading ? (
            <Skeleton className="h-[220px] md:h-[260px] w-full rounded-none" />
          ) : (
            <>
              {!data?.user.coverPhoto ? (
                <div className="w-full h-[220px] md:h-[260px] flex items-center justify-center bg-[#F5F5F7]">
                  <ImageIcon className="h-8 w-8 text-[#111111]/30" />
                </div>
              ) : (
                <div className="relative w-full h-[220px] md:h-[260px] bg-gray-50">
                  <Image src={data?.user.coverPhoto} alt="Cover" fill className="object-cover" sizes="800px" />
                </div>
              )}
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-3 bottom-3 h-8 bg-white/90 backdrop-blur border border-gray-100 shadow-sm hover:bg-white text-[#374151]"
            onClick={() => toggle1()}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit cover
          </Button>
        </div>

        <div className="px-6 pb-6 flex flex-col items-center -mt-14 relative">
          <div className="rounded-full border-[4px] border-white shadow-[0_4px_18px_rgba(15,23,42,0.08)] bg-white overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-[96px] w-[96px] md:h-[112px] md:w-[112px] rounded-full" />
            ) : (
              <>
                {!data?.user.profilePhoto ? (
                  <div className="h-[96px] w-[96px] md:h-[112px] md:w-[112px] flex items-center justify-center bg-[#F5F5F7]">
                    <StoreIcon className="h-8 w-8 text-[#111111]" />
                  </div>
                ) : (
                  <Image
                    src={`${data?.user.profilePhoto}`}
                    className="h-[96px] w-[96px] md:h-[112px] md:w-[112px] object-cover"
                    width={112}
                    height={112}
                    alt="Profile"
                  />
                )}
              </>
            )}
          </div>
          <Button variant="secondary" size="sm" className="mt-3 h-8 bg-white border border-gray-100 shadow-sm" onClick={() => toggle()}>
            <Edit className="h-3.5 w-3.5" />
            Edit photo
          </Button>
          {!isLoading && (
            <h2 className="mt-3 text-[16px] font-bold text-[#1F2937]">{data?.user.name}</h2>
          )}
          {!isLoading && <p className="text-[13px] text-[#6B7280]">{data?.user.email}</p>}
        </div>
      </div>

      <div className="rounded-[14px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] p-6 flex flex-col gap-6">
        <ProfileUpdateForm />
        <Separator className="bg-gray-50" />
        <div className="flex flex-col gap-3">
          <h3 className="text-[14px] font-semibold text-[#1F2937]">Change Password</h3>
          <PasswordUpdate />
        </div>
        <Separator className="bg-gray-50" />
        <div className="flex flex-col gap-2">
          <h3 className="text-[14px] font-semibold text-[#1F2937]">Account Management</h3>
          <p className="text-[12.5px] leading-[1.6] text-[#6B7280]">
            You can delete your account and personal data associated with it
          </p>
          <Button variant="outline" className="w-fit border-[#D2D2D7] text-[#111111] hover:bg-[#F5F5F7]" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent className="rounded-[14px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#1F2937]">Delete account?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete your account and all data. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#111111] text-white hover:bg-[#000000]"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Dialog open={value} onOpenChange={setValue}>
        <DialogContent className="max-w-[520px] rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Upload your profile photo</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ProfilePhotoForm initialValue={ImageInitialValue} callback={() => toggle()} />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={value1} onOpenChange={setValue1}>
        <DialogContent className="max-w-[520px] rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="text-[#1F2937]">Upload your cover photo</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <CoverPhotoForm initialValue={ImageInitialValue} callback={() => toggle1()} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
