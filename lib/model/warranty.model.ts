import mongoose from 'mongoose'

const warrantySchema = new mongoose.Schema(
  {
    user: { type: String, required: true, index: true },
    product: { type: String, required: true }, // product _id
    productName: { type: String, default: '' },
    imei: { type: String, required: true },
    serialNumber: { type: String, required: true },
    orderId: { type: String, default: '' },
    purchaseDate: { type: Date, required: true },
    warrantyStart: { type: Date, required: true },
    warrantyExpiration: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Expired', 'Void', 'Pending'], default: 'Active' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

warrantySchema.index({ imei: 1, user: 1 }, { unique: true })
warrantySchema.index({ serialNumber: 1, user: 1 }, { unique: true })

const Warranty = mongoose.models.Warranty || mongoose.model('Warranty', warrantySchema)
export default Warranty
