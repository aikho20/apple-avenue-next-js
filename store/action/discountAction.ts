import { apiSlice } from '@/lib/config/apiSlice'

export const discountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDiscounts: builder.query({
      query: () => ({ url: '/api/store/dashboard/discount', method: 'GET' }),
      providesTags: [{ type: 'Discount', id: 'LIST' }],
    }),
    createDiscount: builder.mutation({
      query: (body: { code: string; type?: string; value: number; minOrder?: number; expiresAt?: string }) => ({
        url: '/api/store/dashboard/discount',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Discount', id: 'LIST' }, { type: 'Deal', id: 'LIST' }],
    }),
    updateDiscount: builder.mutation({
      query: (body: { _id: string; active?: boolean }) => ({
        url: '/api/store/dashboard/discount',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Discount', id: 'LIST' }, { type: 'Deal', id: 'LIST' }],
    }),
    deleteDiscount: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/store/dashboard/discount?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Discount', id: 'LIST' }, { type: 'Deal', id: 'LIST' }],
    }),
  }),
})

export const { useGetDiscountsQuery, useCreateDiscountMutation, useUpdateDiscountMutation, useDeleteDiscountMutation } = discountApi
