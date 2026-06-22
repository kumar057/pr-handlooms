export type Category = {
  id: string
  slug: string
  name: string
  description: string
  image: string
  productCount: number
}

export type Product = {
  id: string
  slug: string
  name: string
  category: string // category slug
  categoryName: string
  price: number
  compareAtPrice?: number
  rating: number
  reviewCount: number
  image: string
  images: string[]
  description: string
  details: string[]
  fabric: string
  color: string
  colors: string[]
  weave: string
  origin: string
  stock: number
  sku: string
  badges: ProductBadge[]
  featured: boolean
  bestSeller: boolean
  newArrival: boolean
}

export type ProductBadge = "New" | "Best Seller" | "Limited" | "Sale" | "Handwoven"

export type CartItem = {
  productId: string
  quantity: number
}

export type Testimonial = {
  id: string
  name: string
  location: string
  rating: number
  quote: string
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"

export type Order = {
  id: string
  customer: string
  email: string
  date: string
  total: number
  status: OrderStatus
  items: number
  paymentStatus: "Paid" | "Pending" | "Refunded"
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  totalSpent: number
  joined: string
  status: "Active" | "VIP" | "New"
}
