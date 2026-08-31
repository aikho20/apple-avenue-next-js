import { apiSlice } from '@/lib/config/apiSlice'

export const branchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query({
      query: ({ search }: { search?: string } = {}) => ({
        url: `/api/branches${search ? `?search=${encodeURIComponent(search)}` : ''}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Branch', id: 'LIST' }],
    }),
    getNearestBranch: builder.mutation({
      query: ({ latitude, longitude }: { latitude: number; longitude: number }) => ({
        url: '/api/branches/nearest',
        method: 'POST',
        body: { latitude, longitude },
      }),
    }),
    getDashboardBranches: builder.query({
      query: () => ({ url: '/api/store/dashboard/branch', method: 'GET' }),
      providesTags: [{ type: 'Branch', id: 'ADMIN' }],
    }),
    createBranch: builder.mutation({
      query: (body: { name: string; address: string; city?: string; province?: string; barangay?: string; zipCode?: string; latitude: number; longitude: number; phone?: string; email?: string; image?: string; managerEmail: string; managerPassword: string; managerName?: string }) => ({
        url: '/api/store/dashboard/branch',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Branch', id: 'ADMIN' }, { type: 'Branch', id: 'LIST' }],
    }),
    updateBranch: builder.mutation({
      query: (body: { _id: string; name?: string; address?: string; city?: string; province?: string; barangay?: string; zipCode?: string; latitude?: number; longitude?: number; phone?: string; email?: string; image?: string; isActive?: boolean }) => ({
        url: '/api/store/dashboard/branch',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Branch', id: 'ADMIN' }, { type: 'Branch', id: 'LIST' }],
    }),
    deleteBranch: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/store/dashboard/branch?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Branch', id: 'ADMIN' }, { type: 'Branch', id: 'LIST' }],
    }),
  }),
})

export const { useGetBranchesQuery, useGetNearestBranchMutation, useGetDashboardBranchesQuery, useCreateBranchMutation, useUpdateBranchMutation, useDeleteBranchMutation } = branchApi
