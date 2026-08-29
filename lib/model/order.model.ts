import { Double, Int32 } from 'mongodb'
import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    merchant: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    products: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    total: {
      type: String,
      required: true,
    },
    shippingOption: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
