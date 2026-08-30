import { apiSlice } from '@/lib/config/apiSlice'
import { AddressAndActionProps, passwordProps, profileProps } from '@/types/type'
export const accountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: ({ name }: profileProps) => ({
        url: '/api/account/update-profile',
        method: 'POST',
        body: { name },
      }),
    }),
    updatePassword: builder.mutation({
      query: ({ oldPassword, newPassword }: passwordProps) => ({
        url: '/api/account/password-update',
        method: 'POST',
        body: { oldPassword, newPassword },
      }),
    }),
    updateOrDeleteAddress: builder.mutation({
      query: ({ action, address }: AddressAndActionProps) => ({
        url: '/api/account/address',
        method: 'POST',
        body: { action, address },
      }),
      invalidatesTags: [{ type: 'Account', id: 'ADDRESS' }],
    }),
    getAddress: builder.query({
      query: ({ action, address }: AddressAndActionProps) => ({
        url: '/api/account/address',
        method: 'POST',
        body: { action, address },
      }),
      providesTags: [{ type: 'Account', id: 'ADDRESS' }],
    }),
    updateProfileImage: builder.mutation({
      query: ({ image }: { image: string }) => ({
        url: '/api/account/update-profile-image',
        method: 'POST',
        body: { image },
      }),
      invalidatesTags: [{ type: 'Account', id: 'INFO' }],
    }),
    updateCoverImage: builder.mutation({
      query: ({ image }: { image: string }) => ({
        url: '/api/account/update-cover-image',
        method: 'POST',
        body: { image },
      }),
      invalidatesTags: [{ type: 'Account', id: 'INFO' }],
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: '/api/account/get-profile',
        method: 'POST',
      }),
      providesTags: [{ type: 'Account', id: 'INFO' }],
    }),
    getUserOrder: builder.query({
      query: () => ({
        url: '/api/account/get-orders',
        method: 'POST',
      }),
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: '/api/account/delete',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
  useUpdateOrDeleteAddressMutation,
  useGetAddressQuery,
  useUpdateCoverImageMutation,
  useUpdateProfileImageMutation,
  useGetUserProfileQuery,
  useGetUserOrderQuery,
  useDeleteAccountMutation,
} = accountApi
