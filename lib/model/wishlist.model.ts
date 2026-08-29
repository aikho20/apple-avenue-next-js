import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, unique: true },
    products: [{ type: String, required: true }], // array of product _id strings
  },
  { timestamps: true }
)

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema)
export default Wishlist
