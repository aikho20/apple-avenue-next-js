import { apiSlice } from '@/lib/config/apiSlice'

export const dealApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query({
      query: () => ({ url: '/api/store/deals', method: 'GET' }),
      providesTags: [{ type: 'Deal', id: 'LIST' }],
    }),
  }),
})

export const { useGetDealsQuery } = dealApi
