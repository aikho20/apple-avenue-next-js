import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
  {
    merchant: { type: String, required: true },
    branch: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    link: { type: String, default: '/store' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema)
export default Banner
