import { RootState } from '@/lib/config/store'
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'

interface ProductItemProps {
  _id: string
  title: string
  price: number
  image: string
  value: number
}
interface Cart {
  cart: Array<ProductItemProps>
}

const initialState: Cart = {
  cart: [],
}

const storeReducer = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = []
    },
    setCartItems: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload.cart
    },
    addItemCart: (state, action: PayloadAction<ProductItemProps>) => {
      state.cart.push(action.payload)
    },
    incrementItemCart: (state, action: PayloadAction<{ _id: string }>) => {
      const item = state.cart.find((item) => item._id === action.payload._id)
      if (item) {
        item.value += 1
      }
    },
    decmentItemCart: (state, action: PayloadAction<{ _id: string }>) => {
      const item = state.cart.find((item) => item._id === action.payload._id)
      if (item && item.value > 1) {
        item.value -= 1
      } else {
        state.cart = state.cart.filter((item) => item._id !== action.payload._id)
      }
    },
    decrementItemCart: (state, action: PayloadAction<{ _id: string }>) => {
      const item = state.cart.find((item) => item._id === action.payload._id)
      if (item && item.value > 1) {
        item.value -= 1
      } else {
        state.cart = state.cart.filter((item) => item._id !== action.payload._id)
      }
    },
  },
})
export const getStoreState = createSelector(
  (state: RootState) => state,
  ({ store }) => store
)
export const { addItemCart, incrementItemCart, decmentItemCart, decrementItemCart, setCartItems, clearCart } =
  storeReducer.actions

export default storeReducer.reducer
