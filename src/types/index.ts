export type ProductCategory = {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  itemCount?: number;
};

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  fabric: string; // e.g., 'قطن مصري 100%', 'قطيفة ناعمة', 'مايكروفايبر ناعم'
  stock: number;
  isAvailable: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  specifications?: { label: string; value: string }[];
  careInstructions?: string;
  createdAt?: string;
};

export type CartItem = {
  id: string; // unique item id (productId + size + color)
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  color: ProductColor;
  quantity: number;
  maxStock: number;
};

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod' | 'instapay' | 'wallet';

export type PaymentStatus = 'pending_review' | 'confirmed' | 'rejected' | 'cod_pending';

export type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
};

export type Order = {
  id: string;
  orderCode: string; // e.g. CAA-2026-00001
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  governorate: string;
  area: string;
  detailedAddress: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReceiptImage?: string;
  status: OrderStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  workingHours: string;
  mapsUrl: string;
};

export type StoreSettings = {
  brandName: string;
  brandNameAr: string;
  brandNameEn: string;
  logoUrl: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  announcementText: string;
  showAnnouncement: boolean;
  contactPhones: string[];
  whatsappNumber: string;
  email: string;
  branches: Branch[];
  paymentSettings: {
    codEnabled: boolean;
    instaPayEnabled: boolean;
    instaPayHandle: string;
    instaPayAccountName: string;
    instaPayPhone: string;
    walletEnabled: boolean;
    walletNumber: string;
    walletAccountName: string;
    walletProvider: string;
    paymentInstructions: string;
  };
  shippingSettings: {
    defaultShippingCost: number;
    freeShippingThreshold: number;
    governorates: { name: string; cost: number; deliveryDays: string }[];
  };
  aiAssistantEnabled: boolean;
  aiWelcomeMessage: string;
  policies: {
    returnPolicy: string;
    privacyPolicy: string;
    shippingPolicy: string;
  };
};

export type AdminUser = {
  username: string;
  role: 'superadmin' | 'admin';
  token: string;
};

export type AiChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  actionLink?: { label: string; page: string };
};
