import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    merchant: { type: String, required: true },
    branch: { type: String, default: '' },
    image: { type: String, default: '' },
    productIds: { type: [String], default: [] },
  },
  { timestamps: true }
)

const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema)
export default Collection
