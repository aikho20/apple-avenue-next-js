import { apiSlice } from '@/lib/config/apiSlice'

// API endpoint for fetching data
interface registerProps {
  name: string
  email: string
  password: string
  role?: string
}

interface loginProps {
  email: string
  password: string
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // <Type of data the call will return, Type of parameter being passed to the query function>
    register: builder.mutation({
      query: ({ name, email, password, role }: registerProps) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: { name, email, password, role },
      }),
    }),
    login: builder.mutation({
      query: ({ email, password }: loginProps) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: { email, password },
      }),
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation } = authApi
