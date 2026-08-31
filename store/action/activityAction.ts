import { apiSlice } from '@/lib/config/apiSlice'

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivity: builder.query({
      query: ({ branchId }: { branchId?: string } = {}) => ({
        url: branchId ? `/api/store/dashboard/activity?branchId=${branchId}` : '/api/store/dashboard/activity',
        method: 'GET',
      }),
      providesTags: [{ type: 'Activity', id: 'LIST' }],
    }),
  }),
})

export const { useGetActivityQuery } = activityApi
