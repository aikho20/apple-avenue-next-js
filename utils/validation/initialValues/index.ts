import { v4 as uuid } from 'uuid'

export const LoginInitialValues = {
  email: '',
  password: '',
}

export const RegisterInitialValues = {
  name: '',
  email: '',
  password: '',
}

export const ProfileUpdateInitialValues = {
  name: '',
}
export const PasswordUpdateInitialValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export const ProductInitialValue = {
  images: [],
  category: '',
  productName: '',
  description: '',
  price: 0,
  cost: 0,
  quantity: 0,
  status: '',
  isFeatured: false,
  isDeal: false,
  sku: '',
  reservedStock: 0,
  lowStockThreshold: 5,
}

export const AddressInitailValue = {
  _id: uuid(),
  country: 0,
  province: 0,
  city: 0,
  barangay: 0,
  address: '',
  zipCode: '',
}

export const ImageInitialValue = {
  image: [],
}
