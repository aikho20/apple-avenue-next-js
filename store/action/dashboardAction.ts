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
    getDashboardStats: builder.query({
      query: ({ branchId, range }: { branchId?: string; range?: string } = {}) => ({
        url: '/api/store/dashboard/stats',
        method: 'POST',
        body: { branchId, range },
      }),
      providesTags: [{ type: 'Store' as const }],
    }),
  }),
})

export const { useGetDashboardOrderQuery, useUpdateOrderStatusMutation, useGetDashboardStatsQuery } = dashboardApi
