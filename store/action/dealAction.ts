import { apiSlice } from '@/lib/config/apiSlice'

export const dealApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query({
      query: ({ branchId }: { branchId?: string } = {}) => ({
        url: branchId ? `/api/store/deals?branchId=${branchId}` : '/api/store/deals',
        method: 'GET',
      }),
      providesTags: [{ type: 'Deal', id: 'LIST' }],
    }),
  }),
})

export const { useGetDealsQuery } = dealApi
