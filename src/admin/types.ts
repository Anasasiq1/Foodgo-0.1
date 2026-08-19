import {
  Product,
  Order,
  ToppingItem,
  SideItem,
  ChatMessage,
  OptionGroup,
  ProductOption,
  OptionGroupTemplate,
  CustomizationSection,
  CustomizationSectionItem,
  SelectedSectionChoice,
  PaymentSettings,
  PaymentMethodType,
  PaymentStatusType,
  OrderStatusType,
  AppModule,
  CurryOption,
  ProductCurryConfig,
  SelectedCurrySnapshot,
  DeliveryTimeSlot,
  DeliverySettings,
} from '../types';

export type {
  AppModule,
  CurryOption,
  ProductCurryConfig,
  SelectedCurrySnapshot,
  DeliveryTimeSlot,
  DeliverySettings,
  OptionGroup,
  ProductOption,
  OptionGroupTemplate,
  CustomizationSection,
  CustomizationSectionItem,
  SelectedSectionChoice,
  PaymentSettings,
  PaymentMethodType,
  PaymentStatusType,
  OrderStatusType,
};

export interface AdminUser {
  username: string;
  name: string;
  role: string;
}

export interface AdminProductItem extends Product {
  available: boolean;
  featured: boolean;
  popular: boolean;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  order: number;
  active: boolean;
  moduleId?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  registeredAt: string;
  status: 'Active' | 'Inactive';
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  status: PaymentStatusType;
  date: string;
  details?: string;
}

export interface SupportConversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  status: 'Open' | 'Resolved';
  lastMessage: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface StoreSettings {
  storeName: string;
  storeOpen: boolean;
  deliveryFee: number;
  taxRate: number;
  minOrder: number;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  paymentSettings: PaymentSettings;
  deliverySettings?: DeliverySettings;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  admin: string;
  timestamp: string;
  ip?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  // Payment analytics
  upiOrdersCount: number;
  upiRevenue: number;
  cardOrdersCount: number;
  cardRevenue: number;
  codOrdersCount: number;
  codRevenue: number;
  pendingVerificationCount: number;
  paymentFailuresCount: number;
}

export type AdminTab =
  | 'dashboard'
  | 'modules'
  | 'categories'
  | 'products'
  | 'curries'
  | 'custom-order'
  | 'orders'
  | 'customers'
  | 'payments'
  | 'favorites'
  | 'support'
  | 'settings'
  | 'audit-logs';

