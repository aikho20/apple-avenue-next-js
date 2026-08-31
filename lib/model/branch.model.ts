import mongoose from 'mongoose'

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
    barangay: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    image: { type: String, default: '' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    managerEmail: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

branchSchema.index({ name: 1 })
branchSchema.index({ isActive: 1 })
branchSchema.index({ latitude: 1, longitude: 1 })
branchSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = (this.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + (this._id ? (this._id as any).toString().slice(-4) : Date.now().toString().slice(-4))
  }
  next()
})

const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema)

export default Branch
