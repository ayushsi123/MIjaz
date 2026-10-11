export type Page = "home" | "products" | "gifting" | "cart" | "checkout" | "profile" | "about";

export type CheckoutStep = "address" | "customization" | "payment" | "confirmed";

export type ProfileTab = "personal" | "addresses" | "orders";

export interface CartItem {
  productId: number | string;
  name: string;
  size: string;
  price: number;
  qty: number;
  giftMessage?: string;
  recipientName?: string;
}

export interface Product {
  id: number | string;
  name: string;
  category: "Perfume" | "Oil";
  concentration?: "Eau de Parfum" | "Eau de Toilet" | "Parfum";
  gender: "Men" | "Women" | "Unisex";
  occasion: string;
  sizes: string[];
  prices: Record<string, number>;
  salePrices: Record<string, number>;
  stock?: Record<string, number>;
  notes: string[];
  img: string;
  images?: string[];
  description: string;
  reviews?: { name: string; rating: number; date: string; comment: string }[];
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  label: "Home" | "Office" | "Other";
}

export interface OrderUpdate {
  date: string;
  status: string;
  location: string;
}

export interface Order {
  id: string;
  date: string;
  status: "Placed" | "Packed" | "Shipped" | "Out" | "Delivered" | "In Transit" | "Cancelled";
  items: {
    productId: number | string;
    name: string;
    size: string;
    price: number;
    qty: number;
  }[];
  total: number;
  subtotal?: number;
  discount?: number;
  couponCode?: string;
  address: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  updates?: OrderUpdate[];
}

export interface Coupon {
  id?: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  uid?: string;
  photoURL?: string;
  scentPreference?: string;
  addresses: Address[];
  orders: Order[];
}

export interface GiftComboItem {
  productId: string;
  size: string;
}

export interface GiftCombo {
  id: string;
  name: string;
  description: string;
  items: GiftComboItem[];
  img: string;
}
