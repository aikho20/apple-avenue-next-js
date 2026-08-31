import { apiSlice } from '@/lib/config/apiSlice'

export const warrantyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWarranties: builder.query({
      query: () => ({ url: '/api/warranty', method: 'GET' }),
      providesTags: [{ type: 'Warranty', id: 'LIST' }],
    }),
    getDashboardWarranties: builder.query({
      query: ({ branchId }: { branchId?: string } = {}) => ({ url: `/api/store/dashboard/warranty${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`, method: 'GET' }),
      providesTags: [{ type: 'Warranty', id: 'ADMIN' }],
    }),
    createWarranty: builder.mutation({
      query: (body: { productId: string; imei: string; serialNumber: string; purchaseDate: string; orderId?: string; userId?: string; userEmail?: string }) => ({
        url: '/api/warranty',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Warranty', id: 'LIST' }, { type: 'Warranty', id: 'ADMIN' }],
    }),
    updateWarranty: builder.mutation({
      query: (body: any) => ({
        url: '/api/store/dashboard/warranty',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Warranty', id: 'ADMIN' }, { type: 'Warranty', id: 'LIST' }],
    }),
    createDashboardWarranty: builder.mutation({
      query: (body: { productId: string; imei: string; serialNumber: string; purchaseDate: string; orderId?: string; userId?: string; userEmail?: string; branchId?: string }) => ({
        url: '/api/store/dashboard/warranty',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Warranty', id: 'ADMIN' }, { type: 'Warranty', id: 'LIST' }],
    }),
    deleteDashboardWarranty: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/store/dashboard/warranty?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Warranty', id: 'ADMIN' }],
    }),
    deleteWarranty: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/warranty?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Warranty', id: 'LIST' }],
    }),
  }),
})

export const { useGetWarrantiesQuery, useGetDashboardWarrantiesQuery, useCreateWarrantyMutation, useCreateDashboardWarrantyMutation, useUpdateWarrantyMutation, useDeleteDashboardWarrantyMutation, useDeleteWarrantyMutation } = warrantyApi
