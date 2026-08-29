import { Middleware, MiddlewareAPI, configureStore, isRejectedWithValue } from '@reduxjs/toolkit'
import { apiSlice } from './apiSlice'
import storeReducer from '@/store/reducers/storeReducer'
import toast from 'react-hot-toast'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    store: storeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({}).concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
