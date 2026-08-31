import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'branch'],
      default: 'user',
    },
    provider: {
      type: String,
      default: 'credentials',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    branchName: {
      type: String,
      default: '',
    },
    shippingAddress: {
      type: Array,
      default: [],
    },
    cards: {
      type: Array,
      default: [],
    },
    coverPhoto: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
