import { apiSlice } from '@/lib/config/apiSlice'

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: ({ search, status, category }: { search?: string; status?: string; category?: string } = {}) => ({
        url: `/api/store/dashboard/inventory?search=${encodeURIComponent(search || '')}&status=${encodeURIComponent(status || '')}&category=${encodeURIComponent(category || '')}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Product', id: 'LIST' }],
    }),
    getInventoryHistory: builder.query({
      query: ({ productId, type, page, limit }: { productId?: string; type?: string; page?: number; limit?: number }) => ({
        url: `/api/store/dashboard/inventory/history`,
        method: 'POST',
        body: { productId, type, page, limit },
      }),
      providesTags: [{ type: 'Inventory', id: 'HISTORY' }],
    }),
    getPriceHistory: builder.query({
      query: ({ productId, page, limit }: { productId?: string; page?: number; limit?: number }) => ({
        url: `/api/store/dashboard/inventory/price-history`,
        method: 'POST',
        body: { productId, page, limit },
      }),
      providesTags: [{ type: 'PriceHistory', id: 'LIST' }],
    }),
    addStock: builder.mutation({
      query: ({ productId, quantity, reason, referenceId }: { productId: string; quantity: number; reason: string; referenceId?: string }) => ({
        url: '/api/store/dashboard/inventory/add',
        method: 'POST',
        body: { productId, quantity, reason, referenceId },
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'HISTORY' }, { type: 'Product', id: 'LIST' }],
    }),
    removeStock: builder.mutation({
      query: ({ productId, quantity, reason, referenceId, type }: { productId: string; quantity: number; reason: string; referenceId?: string; type?: string }) => ({
        url: '/api/store/dashboard/inventory/remove',
        method: 'POST',
        body: { productId, quantity, reason, referenceId, type },
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'HISTORY' }, { type: 'Product', id: 'LIST' }],
    }),
    adjustStock: builder.mutation({
      query: ({ productId, adjustment, reason, referenceId }: { productId: string; adjustment: number; reason: string; referenceId?: string }) => ({
        url: '/api/store/dashboard/inventory/adjust',
        method: 'POST',
        body: { productId, adjustment, reason, referenceId },
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'HISTORY' }, { type: 'Product', id: 'LIST' }],
    }),
    updatePrice: builder.mutation({
      query: ({ productId, newPrice, reason, referenceId }: { productId: string; newPrice: number; reason?: string; referenceId?: string }) => ({
        url: '/api/store/dashboard/inventory/update-price',
        method: 'POST',
        body: { productId, newPrice, reason, referenceId },
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'PriceHistory', id: 'LIST' }, { type: 'Product', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetInventoryQuery,
  useGetInventoryHistoryQuery,
  useGetPriceHistoryQuery,
  useAddStockMutation,
  useRemoveStockMutation,
  useAdjustStockMutation,
  useUpdatePriceMutation,
} = inventoryApi
