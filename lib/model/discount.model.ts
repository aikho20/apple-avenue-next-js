import mongoose from 'mongoose'

const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    merchant: { type: String, required: true },
    branch: { type: String, default: '' },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

discountSchema.index({ code: 1, merchant: 1 }, { unique: true })

const Discount = mongoose.models.Discount || mongoose.model('Discount', discountSchema)
export default Discount
