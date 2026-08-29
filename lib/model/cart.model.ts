import { Double, Int32 } from 'mongodb'
import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, required: true },
})

const cartSchema = new mongoose.Schema({
  cart: {
    type: [cartItemSchema],
    required: true,
  },
  merchant: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
})

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema)

export default Cart
