import { apiSlice } from '@/lib/config/apiSlice'

export const cardsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCards: builder.query({
      query: () => ({ url: '/api/account/cards', method: 'GET' }),
      providesTags: [{ type: 'Cards', id: 'LIST' }],
    }),
    createCard: builder.mutation({
      query: (body: any) => ({
        url: '/api/account/cards',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Cards', id: 'LIST' }],
    }),
    deleteCard: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: '/api/account/cards',
        method: 'POST',
        body: { action: 'delete', cardId: id },
      }),
      invalidatesTags: [{ type: 'Cards', id: 'LIST' }],
    }),
  }),
})

export const { useGetCardsQuery, useCreateCardMutation, useDeleteCardMutation } = cardsApi
