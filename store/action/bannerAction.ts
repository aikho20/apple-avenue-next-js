import { apiSlice } from '@/lib/config/apiSlice'

export const bannerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query({
      query: () => ({ url: '/api/banners', method: 'GET' }),
      providesTags: [{ type: 'Banner', id: 'LIST' }],
    }),
    getDashboardBanners: builder.query({
      query: ({ branchId }: { branchId?: string } = {}) => ({ url: `/api/store/dashboard/banner${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`, method: 'GET' }),
      providesTags: [{ type: 'Banner', id: 'ADMIN' }],
    }),
    createBanner: builder.mutation({
      query: (body: { title: string; subtitle?: string; image: string; link?: string; order?: number; branchId?: string }) => ({
        url: '/api/store/dashboard/banner',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Banner', id: 'ADMIN' }, { type: 'Banner', id: 'LIST' }],
    }),
    updateBanner: builder.mutation({
      query: (body: { _id: string; title?: string; subtitle?: string; image?: string; link?: string; order?: number; active?: boolean }) => ({
        url: '/api/store/dashboard/banner',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Banner', id: 'ADMIN' }, { type: 'Banner', id: 'LIST' }],
    }),
    deleteBanner: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/store/dashboard/banner?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Banner', id: 'ADMIN' }, { type: 'Banner', id: 'LIST' }],
    }),
  }),
})

export const { useGetBannersQuery, useGetDashboardBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } = bannerApi
