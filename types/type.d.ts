export interface AuthProps {
  searchParams: {
    callbackUrl: string
  }
}
export interface OptionAddressProps {
  id: number
  parent_id: string
  description: string
}
export interface OptionProps {
  param: string
  parent_id: number
}
export interface ProductCartProps {
  _id: string
  productName: string
  price: number
  images: string
  value: number
  status: string
}

export interface ProductCardProps {
  _id: string
  productName: string
  cost?: string | number
  description?: string
  price: number
  images: string
  status: string
  category?: string
  quantity?: number
  buttonLabel?: string
  isLoading?: boolean
  value: number
  onButtonAddClick: () => void
  onButtonMinusClick: () => void
}

export interface StoreProps {
  // Apple Avenue is single-merchant — storeId is optional legacy param
  searchParams: {
    storeId?: string
  }
}
export interface CheckoutProps {
  searchParams: {
    id: string
  }
}
export interface CartItemProps {
  _id: string
  value: number
}
export interface ProductStoreQuery {
  merchantId?: string
}

export interface CartProps {
  merchant?: string
  item: [CartItemProps]
}

export interface CartCardProps {
  _id: string
  title: string
  price: number
  image: string
  value: number
  status: string
  isLoading?: boolean
  onButtonAddClick: () => void
  onButtonMinusClick: () => void
}

export interface AddressProps {
  _id?: string
  country: number
  province: number
  city: number
  barangay: number
  address: string
  zipCode: string
}

export interface AddressAndActionProps {
  action: string
  address: AddressProps
}
export interface PhoneSpecifications {
  display: { size: string; resolution?: string; refreshRate?: string; panelType?: string }
  processor?: string
  memory: { ram: string; storage: string }
  camera: { main?: string; ultrawide?: string; telephoto?: string; front?: string }
  battery?: { capacity?: string; charging?: string }
  connectivity?: { network?: string; wifi?: string; bluetooth?: string }
  operatingSystem?: string
  weight?: string
  dimensions?: string
  warranty?: string
}

export interface ProductFormProps {
  _id?: string
  images: Array<string>
  category: string
  productName: string
  description: string
  price: number
  cost: number
  quantity: number
  status: string
  isFeatured?: boolean
  isDeal?: boolean
  specs?: PhoneSpecifications
}

export interface ProductProps {
  action: string
  initialValue: ProductFormProps
  callback: () => void
}

export interface profileProps {
  name: string
}
export interface passwordProps {
  oldPassword: string
  newPassword: string
}
export interface ProfileImageFormProps {
  callback: () => void
  initialValue: { image: Array<string> }
}

export interface PlaceOrderProps {
  id: string
  paymentMethod: string
  shippingOption: string
  shippingAddress: string
  fullName: string
}

export interface OrderItemProps {
  fullName: string
  status: string
  shippingAddress: string
  shippingOption: string
  paymentMethod: string
  total: number
  products: Array<ProductCartProps>
}
export interface OrderInfoProps {
  _id: string
  coverPhoto: string
  profilePhoto: string
  name: string
  orderInfo: OrderItemProps
}

export interface OrderLayoutProps {
  data: OrderItemProps
  isLoading: boolean
}

export interface OrderCardProps {
  data: OrderInfoProps
  isLoading: boolean
}

export interface StoreCardProps {
  name: string
  coverPhoto: string
  profilePhoto: string
  isLoading: boolean
  buttonClick?: () => void
}
