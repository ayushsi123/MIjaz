import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, Address, Order, UserProfile, Coupon } from "../types";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { updateFirestoreUserProfile } from "../lib/authService";

export function calculateCouponDiscount(coupon: Coupon | null | undefined, total: number): number {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.minOrder && total < coupon.minOrder) return 0;
  if (coupon.type === "percentage") {
    let disc = Math.round((total * coupon.value) / 100);
    if (coupon.maxDiscount && disc > coupon.maxDiscount) {
      disc = coupon.maxDiscount;
    }
    return Math.min(total, disc);
  } else {
    return Math.min(total, Math.round(coupon.value));
  }
}

interface CartState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  cart: CartItem[];
  cartTotal: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, qty?: number | any, gifting?: any) => void;
  updateQty: (productId: string | number, size: string, delta: number) => void;
  removeFromCart: (productId: string | number, size: string) => void;
  clearCart: () => void;

  // Auth States & Actions
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  login: (name: string, email: string, phone: string, uid?: string) => void;
  setUserSession: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  
  // Coupon state
  appliedCoupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (coupon: Coupon) => { success: boolean; message: string; discount: number };
  removeCoupon: () => void;

  // Gifting state
  giftWrap: boolean;
  setGiftWrap: (wrap: boolean) => void;
  giftMessage: string;
  setGiftMessage: (msg: string) => void;
  shipMultiple: boolean;
  setShipMultiple: (val: boolean) => void;
  recipientCount: number;
  setRecipientCount: (val: number) => void;

  // Checkout info
  checkoutShippingAddress: Address | null;
  setCheckoutShippingAddress: (addr: Address | null) => void;
  checkoutPaymentMethod: string;
  setCheckoutPaymentMethod: (method: string) => void;

  // Profile / Address Book / Orders
  profile: UserProfile;
  addAddress: (addr: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  placeOrder: (order: Order) => void;
  addOrder: (order: Order) => void;
  
  // UI states that might need global sync
  trackModalOpen: boolean;
  setTrackModalOpen: (val: boolean) => void;
  trackingOrder: Order | null;
  setTrackingOrder: (order: Order | null) => void;

  // Announcement Bar
  announcementBarEnabled: boolean;
  setAnnouncementBarEnabled: (enabled: boolean) => void;
  announcementBarText: string;
  setAnnouncementBarText: (text: string) => void;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    name: "Aisha Khan",
    street: "42, Rose Garden Lane",
    city: "Bandra West",
    state: "Mumbai",
    postalCode: "400050",
    country: "India",
    isDefault: true,
    label: "Home"
  },
  {
    id: "addr-2",
    name: "Aisha Khan",
    street: "7th Floor, Tower B, Prestige Tech Park, Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560066",
    country: "India",
    isDefault: false,
    label: "Office"
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "MJ-2047",
    date: "12 Jun 2025",
    status: "Delivered",
    items: [{ productId: 2, name: "Oud Royale", size: "50ml", price: 4199, qty: 1 }],
    total: 4199,
    address: "42, Rose Garden Lane, Bandra West, Mumbai - 400050",
    trackingNumber: "BD8849271",
    carrier: "Blue Dart",
    estimatedDelivery: "14 June 2025",
    updates: [
      { date: "12 Jun 2025, 04:30 PM", status: "Delivered", location: "Bandra Hub" },
      { date: "12 Jun 2025, 10:15 AM", status: "Out for Delivery", location: "Bandra West Office" },
      { date: "11 Jun 2025, 08:00 PM", status: "Shipped", location: "Mumbai Central Warehouse" },
      { date: "11 Jun 2025, 11:00 AM", status: "Packed", location: "Mumbai Central Warehouse" },
      { date: "10 Jun 2025, 02:00 PM", status: "Placed", location: "Online Portal" }
    ]
  },
  {
    id: "MJ-2031",
    date: "02 Jun 2025",
    status: "In Transit",
    items: [{ productId: 7, name: "Velvet Rose Oil", size: "8ml", price: 899, qty: 1 }],
    total: 899,
    address: "7th Floor, Tower B, Prestige Tech Park, Whitefield, Bengaluru - 560066",
    trackingNumber: "BD8849275",
    carrier: "Blue Dart",
    estimatedDelivery: "14 June 2025",
    updates: [
      { date: "03 Jun 2025, 09:42 AM", status: "In Transit", location: "Mumbai Hub" },
      { date: "02 Jun 2025, 06:15 PM", status: "Shipped", location: "Mumbai Central Warehouse" },
      { date: "02 Jun 2025, 11:30 AM", status: "Packed", location: "Mumbai Central Warehouse" },
      { date: "02 Jun 2025, 09:00 AM", status: "Placed", location: "Online Portal" }
    ]
  },
  {
    id: "MJ-2015",
    date: "18 May 2025",
    status: "Delivered",
    items: [
      { productId: 1, name: "Mijaz Noir", size: "20ml", price: 2100, qty: 1 },
      { productId: 8, name: "Oud Musk Oil", size: "8ml", price: 1099, qty: 1 }
    ],
    total: 3198,
    address: "42, Rose Garden Lane, Bandra West, Mumbai - 400050",
    trackingNumber: "BD8849221",
    carrier: "Blue Dart",
    estimatedDelivery: "21 May 2025",
    updates: [
      { date: "21 May 2025, 02:15 PM", status: "Delivered", location: "Bandra Hub" }
    ]
  }
];

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      products: [],
      setProducts: (products) => set({ products }),
      cart: [],
      cartTotal: 0,
      cartDrawerOpen: false,
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      
      // Coupon state
      appliedCoupon: null,
      discountAmount: 0,
      applyCoupon: (coupon) => {
        const state = (useCart as any).getState();
        const currentTotal = state.cartTotal || 0;
        if (!coupon.isActive) {
          return { success: false, message: "This coupon is no longer active.", discount: 0 };
        }
        if (coupon.minOrder && currentTotal < coupon.minOrder) {
          return { 
            success: false, 
            message: `Minimum order amount of Rs. ${coupon.minOrder.toLocaleString()} required for this coupon.`, 
            discount: 0 
          };
        }
        const disc = calculateCouponDiscount(coupon, currentTotal);
        if (disc <= 0) {
          return { success: false, message: "Coupon cannot be applied to this cart.", discount: 0 };
        }
        set({ appliedCoupon: coupon, discountAmount: disc });
        return { 
          success: true, 
          message: coupon.type === "percentage" 
            ? `${coupon.value}% discount applied (-Rs. ${disc.toLocaleString()})!` 
            : `Rs. ${disc.toLocaleString()} flat discount applied!`, 
          discount: disc 
        };
      },
      removeCoupon: () => set({ appliedCoupon: null, discountAmount: 0 }),

      addToCart: (product, size, qty = 1, gifting) => set((state) => {
        const resolvedQty = typeof qty === "number" ? qty : 1;
        const resolvedGifting = typeof qty === "object" ? (qty as any) : gifting;

        const price = product.salePrices?.[size] ?? product.prices?.[size] ?? 0;
        const cleanCart = (state.cart || []).filter(
          (item) => item && item.productId != null && typeof item.qty === "number" && !isNaN(item.qty)
        );
        const existing = cleanCart.find((item) => item.productId === product.id && item.size === size);
        
        let newCart;
        if (existing) {
          newCart = cleanCart.map((item) =>
            item.productId === product.id && item.size === size
              ? { 
                  ...item, 
                  qty: item.qty + resolvedQty,
                  giftMessage: resolvedGifting?.message || item.giftMessage,
                  recipientName: resolvedGifting?.recipientName || item.recipientName
                }
              : item
          );
        } else {
          newCart = [
            ...cleanCart, 
            { 
              productId: product.id, 
              name: product.name, 
              size, 
              price, 
              qty: resolvedQty,
              giftMessage: resolvedGifting?.message,
              recipientName: resolvedGifting?.recipientName
            }
          ];
        }
        const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const newDiscount = calculateCouponDiscount(state.appliedCoupon, newTotal);
        return { cart: newCart, cartTotal: newTotal, discountAmount: newDiscount, cartDrawerOpen: true };
      }),
      
      updateQty: (productId, size, delta) => set((state) => {
        const cleanCart = (state.cart || []).filter(
          (item) => item && item.productId != null && typeof item.qty === "number" && !isNaN(item.qty)
        );
        const newCart = cleanCart
          .map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, qty: item.qty + delta }
              : item
          )
          .filter((item) => item.qty > 0);
        const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const newDiscount = calculateCouponDiscount(state.appliedCoupon, newTotal);
        return { cart: newCart, cartTotal: newTotal, discountAmount: newDiscount };
      }),
      
      removeFromCart: (productId, size) => set((state) => {
        const cleanCart = (state.cart || []).filter(
          (item) => item && item.productId != null && typeof item.qty === "number" && !isNaN(item.qty)
        );
        const newCart = cleanCart.filter((item) => !(item.productId === productId && item.size === size));
        const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const newDiscount = calculateCouponDiscount(state.appliedCoupon, newTotal);
        return { cart: newCart, cartTotal: newTotal, discountAmount: newDiscount };
      }),
      
      clearCart: () => set({ 
        cart: [], 
        cartTotal: 0, 
        appliedCoupon: null, 
        discountAmount: 0, 
        giftWrap: false, 
        giftMessage: "", 
        shipMultiple: false, 
        recipientCount: 1 
      }),
      
      // Auth Initializers & Actions
      isLoggedIn: false,
      setIsLoggedIn: (val) => set({ isLoggedIn: val }),
      login: (name, email, phone, uid) => set((state) => ({
        isLoggedIn: true,
        profile: {
          ...state.profile,
          name: name || state.profile.name || "Customer",
          email: email || state.profile.email,
          phone: phone || state.profile.phone,
          uid: uid || state.profile.uid
        }
      })),
      setUserSession: (profile) => set({
        isLoggedIn: !!profile,
        profile: profile || {
          name: "",
          email: "",
          phone: "",
          addresses: [],
          orders: []
        }
      }),
      updateProfile: (updates) => set((state) => {
        const updated = { ...state.profile, ...updates };
        if (updated.uid) {
          updateFirestoreUserProfile(updated.uid, updates).catch(console.warn);
        }
        return { profile: updated };
      }),
      logout: () => {
        signOut(auth).catch(console.warn);
        set({
          isLoggedIn: false,
          profile: {
            name: "",
            email: "",
            phone: "",
            addresses: [],
            orders: []
          }
        });
      },
      
      giftWrap: false,
      setGiftWrap: (wrap) => set({ giftWrap: wrap }),
      giftMessage: "",
      setGiftMessage: (msg) => set({ giftMessage: msg }),
      shipMultiple: false,
      setShipMultiple: (val) => set({ shipMultiple: val }),
      recipientCount: 1,
      setRecipientCount: (val) => set({ recipientCount: val }),

      checkoutShippingAddress: null,
      setCheckoutShippingAddress: (addr) => set({ checkoutShippingAddress: addr }),
      checkoutPaymentMethod: "card",
      setCheckoutPaymentMethod: (method) => set({ checkoutPaymentMethod: method }),

      profile: {
        name: "",
        email: "",
        phone: "",
        addresses: [],
        orders: []
      },
      
      addAddress: (addr) => set((state) => {
        const newAddress: Address = {
          ...addr,
          id: `addr-${Date.now()}`
        };
        const addresses = newAddress.isDefault
          ? state.profile.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
          : state.profile.addresses.concat(newAddress);
        const updatedProfile = { ...state.profile, addresses };
        if (state.profile.uid) {
          updateFirestoreUserProfile(state.profile.uid, { addresses }).catch(console.warn);
        }
        return { profile: updatedProfile };
      }),
      
      removeAddress: (id) => set((state) => {
        const addresses = state.profile.addresses.filter((a) => a.id !== id);
        const updatedProfile = { ...state.profile, addresses };
        if (state.profile.uid) {
          updateFirestoreUserProfile(state.profile.uid, { addresses }).catch(console.warn);
        }
        return { profile: updatedProfile };
      }),
      
      updateAddress: (id, updatedFields) => set((state) => {
        let addresses = state.profile.addresses.map((a) =>
          a.id === id ? { ...a, ...updatedFields } : a
        );
        if (updatedFields.isDefault) {
          addresses = addresses.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
        }
        const updatedProfile = { ...state.profile, addresses };
        if (state.profile.uid) {
          updateFirestoreUserProfile(state.profile.uid, { addresses }).catch(console.warn);
        }
        return { profile: updatedProfile };
      }),
      
      placeOrder: (order) => set((state) => ({
        profile: {
          ...state.profile,
          orders: [order, ...state.profile.orders]
        }
      })),
      addOrder: (order) => set((state) => ({
        profile: {
          ...state.profile,
          orders: [order, ...state.profile.orders]
        }
      })),

      trackModalOpen: false,
      setTrackModalOpen: (val) => set({ trackModalOpen: val }),
      trackingOrder: null,
      setTrackingOrder: (order) => set({ trackingOrder: order, trackModalOpen: order !== null }),

      announcementBarEnabled: true,
      setAnnouncementBarEnabled: (val) => set({ announcementBarEnabled: val }),
      announcementBarText: "Free Shipping above 999 INR | FLAT 10% OFF On Orders above 2499 INR (Automatically Applied) | COD Eligible Above 999 INR",
      setAnnouncementBarText: (val) => set({ announcementBarText: val })
    }),
    {
      name: "mijaz-fragrances-storage",
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        appliedCoupon: state.appliedCoupon,
        discountAmount: state.discountAmount,
        isLoggedIn: state.isLoggedIn,
        profile: state.profile,
        giftWrap: state.giftWrap,
        giftMessage: state.giftMessage,
        shipMultiple: state.shipMultiple,
        recipientCount: state.recipientCount,
        announcementBarEnabled: state.announcementBarEnabled,
        announcementBarText: state.announcementBarText
      })
    }
  )
);
