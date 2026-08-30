import { Double, Int32 } from 'mongodb'
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    images: {
      type: Array,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    merchant: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeal: {
      type: Boolean,
      default: false,
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sku: {
      type: String,
      default: '',
    },
    reservedStock: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    updatedBy: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
