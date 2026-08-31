import { apiSlice } from '@/lib/config/apiSlice'
import { ProductFormProps } from '@/types/type'

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOrder: builder.query({
      query: ({ merchantId, branchId }: { merchantId?: string; branchId?: string }) => ({
        url: '/api/store/dashboard/get-store-orders',
        method: 'POST',
        body: { merchantId, branchId },
      }),
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }: { orderId: string; status: string }) => ({
        url: '/api/store/dashboard/order',
        method: 'PUT',
        body: { orderId, status },
      }),
    }),
  }),
})

export const { useGetDashboardOrderQuery, useUpdateOrderStatusMutation } = dashboardApi
