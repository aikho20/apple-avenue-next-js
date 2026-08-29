import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    merchant: { type: String, required: true },
    user: { type: String },
    action: { type: String, required: true },
    detail: { type: String, default: '' },
  },
  { timestamps: true }
)

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)
export default Activity
