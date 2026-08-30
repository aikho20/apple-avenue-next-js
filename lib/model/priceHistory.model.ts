import mongoose from 'mongoose'

const priceHistorySchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    merchant: { type: String, required: true, index: true },
    previousPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    reason: { type: String, default: '' },
    referenceId: { type: String, default: '' },
    updatedBy: { type: String, required: true },
    updatedByName: { type: String, default: '' },
  },
  { timestamps: true }
)

priceHistorySchema.index({ productId: 1, createdAt: -1 })
priceHistorySchema.index({ merchant: 1, createdAt: -1 })

const PriceHistory =
  mongoose.models.PriceHistory || mongoose.model('PriceHistory', priceHistorySchema)

export default PriceHistory
