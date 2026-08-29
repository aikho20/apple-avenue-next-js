import { apiSlice } from '@/lib/config/apiSlice'

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => ({ url: '/api/wishlist', method: 'GET' }),
      providesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),
    toggleWishlist: builder.mutation({
      query: ({ productId }: { productId: string }) => ({
        url: '/api/wishlist',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),
    syncWishlist: builder.mutation({
      query: ({ productIds }: { productIds: string[] }) => ({
        url: '/api/wishlist',
        method: 'POST',
        body: { productIds },
      }),
      invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),
    removeFromWishlist: builder.mutation({
      query: ({ productId }: { productId: string }) => ({
        url: `/api/wishlist?productId=${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),
  }),
})

export const { useGetWishlistQuery, useToggleWishlistMutation, useSyncWishlistMutation, useRemoveFromWishlistMutation } = wishlistApi
