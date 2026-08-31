import { apiSlice } from '@/lib/config/apiSlice'

export const collectionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCollections: builder.query({
      query: ({ branchId }: { branchId?: string } = {}) => ({ url: `/api/collections${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`, method: 'GET' }),
      providesTags: (result: any) =>
        result?.collections
          ? ([{ type: 'Collection', id: 'LIST' } as const, ...result.collections.map((c: any) => ({ type: 'Collection' as const, id: c._id }))] )
          : ([{ type: 'Collection', id: 'LIST' } as const]),
    }),
    getDashboardCollections: builder.query({
      query: ({ branchId }: { branchId?: string } = {}) => ({ url: `/api/store/dashboard/collection${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`, method: 'GET' }),
      providesTags: (result: any) =>
        result?.collections
          ? ([{ type: 'Collection', id: 'ADMIN' } as const, ...result.collections.map((c: any) => ({ type: 'Collection' as const, id: c._id }))] )
          : ([{ type: 'Collection', id: 'ADMIN' } as const]),
    }),
    createCollection: builder.mutation({
      query: (body: { name: string; description?: string; image?: string; branchId?: string }) => ({
        url: '/api/store/dashboard/collection',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Collection', id: 'ADMIN' }, { type: 'Collection', id: 'LIST' }],
    }),
    updateCollection: builder.mutation({
      query: (body: { _id: string; name?: string; description?: string; image?: string; productIds?: string[] }) => ({
        url: '/api/store/dashboard/collection',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Collection', id: 'ADMIN' }, { type: 'Collection', id: 'LIST' }],
    }),
    deleteCollection: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/store/dashboard/collection?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Collection', id: 'ADMIN' }, { type: 'Collection', id: 'LIST' }],
    }),
  }),
})

export const { useGetCollectionsQuery, useGetDashboardCollectionsQuery, useCreateCollectionMutation, useUpdateCollectionMutation, useDeleteCollectionMutation } = collectionApi
