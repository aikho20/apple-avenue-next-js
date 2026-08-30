import * as z from 'zod'

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export const RegisterSchema = z.object({
  name: z.string().min(1, { message: 'Full Name is required' }),
  email: z.string().email({ message: 'Email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})
export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Full Name is required' }),
})
export const PasswordUpdateSchema = z.object({
  oldPassword: z.string().min(1, { message: 'Old Password is required' }),
  newPassword: z.string().min(6, { message: 'New Password must be at least 6 characters' }),
  confirmPassword: z.string().min(1, { message: 'Confirm Password is required' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const ProductSchema = z.object({
  _id: z.string().optional(),
  images: z.array(z.string()).min(1, { message: 'At least one image is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  productName: z.string().min(1, { message: 'Product name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
  cost: z.coerce.number().min(0, { message: 'Cost is required' }),
  quantity: z.coerce.number().min(0, { message: 'Quantity is required' }),
  status: z.string().min(1, { message: 'Status is required' }),
  isFeatured: z.boolean().optional().default(false),
  isDeal: z.boolean().optional().default(false),
  specs: z.any().optional(),
  sku: z.string().optional(),
  reservedStock: z.coerce.number().min(0).optional().default(0),
  lowStockThreshold: z.coerce.number().min(0).optional().default(5),
})
export const AddressSchema = z.object({
  _id: z.string().optional(),
  country: z.coerce.number().min(1, { message: 'Country is required' }),
  province: z.coerce.number().min(1, { message: 'Province is required' }),
  city: z.coerce.number().min(1, { message: 'City is required' }),
  barangay: z.coerce.number().min(1, { message: 'Barangay is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  zipCode: z.string().min(1, { message: 'Zip code is required' }),
})

export const ImageSchema = z.object({
  image: z.array(z.string()).min(1, { message: 'Image is required' }),
})

export const CollectionSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
})

export const DiscountSchema = z.object({
  code: z.string().min(1, { message: 'Code is required' }),
  value: z.coerce.number().min(1, { message: 'Value is required' }),
})
