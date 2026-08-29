import { apiSlice } from '@/lib/config/apiSlice'
import { ProductFormProps } from '@/types/type'

// API endpoint for fetching data

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // <Type of data the call will return, Type of parameter being passed to the query function>
    addProduct: builder.mutation({
      query: ({
        _id,
        productName,
        description,
        price,
        cost,
        quantity,
        images,
        category,
        status,
      }: ProductFormProps) => ({
        url: '/api/store/dashboard/product/add-product',
        method: 'POST',
        body: { productName, description, price, cost, quantity, images, category, status },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({
        productName,
        description,
        price,
        cost,
        quantity,
        images,
        category,
        _id,
        status,
      }: ProductFormProps) => ({
        url: '/api/store/dashboard/product/update-product',
        method: 'POST',
        body: { productName, description, price, cost, quantity, images, category, _id, status },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: builder.mutation({
      query: ({ _id }: { _id: string }) => ({
        url: '/api/store/dashboard/product/delete-product',
        method: 'POST',
        body: { _id },
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
})

export const { useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation } = productApi
