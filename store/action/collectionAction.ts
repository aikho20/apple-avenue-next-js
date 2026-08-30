import { apiSlice } from '@/lib/config/apiSlice'

export const collectionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCollections: builder.query({
      query: () => ({ url: '/api/collections', method: 'GET' }),
      providesTags: [{ type: 'Collection', id: 'LIST' }],
    }),
    getDashboardCollections: builder.query({
      query: () => ({ url: '/api/store/dashboard/collection', method: 'GET' }),
      providesTags: [{ type: 'Collection', id: 'ADMIN' }],
    }),
    createCollection: builder.mutation({
      query: (body: { name: string; description?: string; image?: string }) => ({
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
