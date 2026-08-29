import { apiSlice } from '@/lib/config/apiSlice'
import { CartProps, PlaceOrderProps, ProductStoreQuery } from '@/types/type'

// API endpoint for fetching data

export const storeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // <Type of data the call will return, Type of parameter being passed to the query function>
    getAllStore: builder.query({
      query: ({}) => ({
        url: `/api/store`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Store' }],
    }),
    getStore: builder.mutation({
      query: ({ merchantId }: { merchantId: string }) => ({
        url: `/api/store`,
        method: 'POST',
        body: { merchantId },
      }),
    }),
    addToCart: builder.mutation({
      query: ({ merchant, item }: CartProps) => ({
        url: `/api/store/add-to-cart`,
        method: 'POST',
        body: {
          merchant,
          item,
        },
      }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),
    getStoreProduct: builder.query({
      query: ({ merchantId }: ProductStoreQuery = {}) => ({
        url: `/api/store/get-store-product`,
        method: 'POST',
        body: { merchantId },
      }),
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    getStoreCart: builder.query({
      query: ({ merchantId }: { merchantId?: string } = {}) => ({
        url: `/api/store/get-cart`,
        method: 'POST',
        body: {
          merchantId,
        },
      }),
      providesTags: [{ type: 'Cart', id: 'LIST' }],
    }),
    storeCheckout: builder.query({
      query: ({ id }: { id: string }) => ({
        url: `/api/store/checkout`,
        method: 'POST',
        body: {
          id,
        },
      }),
    }),
    placeOrder: builder.mutation({
      query: ({
        id,
        paymentMethod,
        shippingOption,
        shippingAddress,
        fullName,
      }: PlaceOrderProps) => ({
        url: `/api/store/place-order`,
        method: 'POST',
        body: {
          id,
          paymentMethod,
          shippingOption,
          shippingAddress,
          fullName,
        },
      }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAllStoreQuery,
  useGetStoreMutation,
  useAddToCartMutation,
  useGetStoreCartQuery,
  useGetStoreProductQuery,
  useStoreCheckoutQuery,
  usePlaceOrderMutation,
} = storeApi
