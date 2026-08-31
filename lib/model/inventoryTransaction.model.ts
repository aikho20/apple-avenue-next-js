import mongoose from 'mongoose'

export const InventoryTransactionTypes = [
  'STOCK_ADDED',
  'STOCK_REMOVED',
  'SALE',
  'RETURN',
  'DAMAGED',
  'LOST',
  'ADJUSTMENT',
  'TRANSFER',
  'INITIAL_STOCK',
] as const
export type InventoryTransactionType = (typeof InventoryTransactionTypes)[number]

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    merchant: { type: String, required: true, index: true },
    branch: { type: String, default: '', index: true },
    type: { type: String, enum: InventoryTransactionTypes, required: true },
    quantityBefore: { type: Number, required: true },
    quantityChange: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    reason: { type: String, default: '' },
    referenceId: { type: String, default: '' },
    createdBy: { type: String, required: true },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
)

inventoryTransactionSchema.index({ productId: 1, createdAt: -1 })
inventoryTransactionSchema.index({ merchant: 1, createdAt: -1 })

const InventoryTransaction =
  mongoose.models.InventoryTransaction ||
  mongoose.model('InventoryTransaction', inventoryTransactionSchema)

export default InventoryTransaction
