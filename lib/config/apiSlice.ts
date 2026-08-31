import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'
import { useToast } from '@/hooks/use-toast'
import toast from 'react-hot-toast'

export const baseQuery = fetchBaseQuery({
  baseUrl: '/',
})

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error) {
    const status = (result.error as any)?.status
    // Guest cart/wishlist (401) is expected for public storefront — don't spam toast
    const isGuestRoute = typeof args === 'object' && ((args as any)?.url?.includes('/api/store/get-cart') || (args as any)?.url?.includes('/api/wishlist'))
    if (status === 401 && isGuestRoute) return result
    toast.error((result.error as any)?.data?.error || 'Something went wrong, please try again!')
  }
  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({}),
  tagTypes: ['Store', 'Product', 'Cart', 'Address', 'Account', 'Wishlist', 'Compare', 'Inventory', 'PriceHistory', 'Banner', 'Collection', 'Deal', 'Discount', 'Warranty', 'Activity', 'Cards', 'Branch'],
})
