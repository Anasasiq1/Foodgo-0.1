export interface AppModule {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  tagline: string;
  icon: string;
  order: number;
  active: boolean;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerAction?: string;
  bannerBadge?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  priceType: 'fixed' | 'adjustment'; // fixed replaces base price, adjustment adds to it
  description?: string;
  image?: string;
  available: boolean;
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  selectionType: 'single' | 'multiple';
  minSelections: number;
  maxSelections: number;
  options: ProductOption[];
}

export interface OptionGroupTemplate {
  id: string;
  name: string;
  group: OptionGroup;
}

export interface CustomizationSectionItem {
  id: string;
  productId?: string; // Optional reference to a catalog product
  name: string;
  price: number;
  priceType?: 'adjustment' | 'fixed'; // adjustment (+) or fixed price override
  image?: string;
  description?: string;
  available?: boolean;
  isDefault?: boolean;
}

export interface CustomizationSection {
  id: string;
  name: string; // e.g. "Choose Your Curry", "Extra Side Dishes", "Drinks", "Best With", "Choose Size"
  description?: string;
  selectionType: 'single' | 'multiple';
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  items: CustomizationSectionItem[];
}

export interface CurryOption {
  id: string;
  name: string; // e.g. "Salna", "Kutton Chaps Curry", "Chicken Salna", "Fish Salna", "Beef Gravy"
  pricePerUnit: number; // e.g. 5, 10, 10, 12, 10
  unitLabel: string; // e.g. "Spoon" or "Cup" (default "Spoon")
  active: boolean; // stock / availability toggle
  image?: string;
  description?: string;
  isCurryLevelOption: boolean; // must be true to appear in Salna Level / Curry Level
  order?: number;
}

export interface ProductCurryConfig {
  enabled: boolean; // whether this product has Salna Level enabled
  defaultCurryId?: string; // id of default curry (e.g. "curry-salna")
  defaultUnits?: number; // legacy alias
  defaultCurryPerItem?: number; // default curry units per item (default 1)
  minUnits?: number; // minimum spoons/units (default 0)
  maxUnits?: number; // maximum spoons/units (default 20)
  allowCurryChange?: boolean; // whether customer can pick other curries (default true)
  allowedCurryIds?: string[]; // list of allowed curry IDs for this product (empty = all)
}

export interface SelectedCurrySnapshot {
  enabled: boolean;
  curryId: string;
  curryName: string;
  pricePerUnit: number;
  unitLabel: string; // "Spoon"
  unitsPerProduct: number; // e.g. 1 or 2
  totalUnits: number; // unitsPerProduct * productQuantity (e.g. 50 Spoons)
  totalPrice: number; // pricePerUnit * totalUnits (e.g. 250)
}

export interface Product {
  id: string;
  moduleId?: string;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  rating: number;
  prepTime: string;
  description: string;
  image: string;
  defaultSpice: number;
  defaultPortion: number;
  available?: boolean;
  featured?: boolean;
  popular?: boolean;
  customOrderEnabled?: boolean;
  customOrderSortOrder?: number;
  curryConfig?: ProductCurryConfig;
  optionGroups?: OptionGroup[];
  customizationSections?: CustomizationSection[];
}

export interface ToppingItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface SideItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface SelectedOptionItem {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
  priceType: 'fixed' | 'adjustment';
}

export interface SelectedSectionChoice {
  sectionId: string;
  sectionName: string;
  itemId: string;
  itemName: string;
  price: number;
  priceType?: 'fixed' | 'adjustment';
  image?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  subtitle: string;
  image: string;
  basePrice: number;
  portion: number;
  spiceLevel?: number;
  curry?: SelectedCurrySnapshot;
  selectedVariant?: SelectedOptionItem; // Primary single variant (e.g. Size/Portion)
  selectedOptions?: SelectedOptionItem[]; // All selected options & add-ons
  selectedSections?: SelectedSectionChoice[]; // Selected items from dynamic customization sections
  selectedToppings?: ToppingItem[];
  selectedSides?: SideItem[];
  unitPrice?: number;
  totalPrice: number;
  isCustom?: boolean;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  address: string;
  passwordMasked: string;
  avatar: string;
  phone?: string;
}

export interface PaymentCard {
  id: string;
  type: 'mastercard' | 'visa' | 'upi';
  numberMasked: string;
  holderName: string;
  expiry: string;
  upiId?: string;
  isDefault?: boolean;
}

export type PaymentMethodType = 'upi' | 'card' | 'cod' | 'mastercard' | 'visa';

export type PaymentStatusType =
  | 'Pending'
  | 'Pending Verification'
  | 'Paid'
  | 'Cash on Delivery'
  | 'Payment Failed / Rejected'
  | 'Refunded';

export type OrderStatusType =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface DeliveryTimeSlot {
  id: string;
  timeLabel: string; // e.g. "1:00 PM", "3:00 PM", "5:00 PM"
  fee: number; // 0 for Free
  active: boolean;
  order?: number;
}

export interface DeliverySettings {
  slots: DeliveryTimeSlot[];
  urgentDelivery: {
    enabled: boolean;
    fee: number; // e.g. 30.00
    label: string; // e.g. "Urgent Delivery (15-25 mins)"
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  deliveryFees: number;
  deliveryType?: 'scheduled' | 'urgent';
  deliverySlot?: string;
  codCharge?: number;
  total: number;
  estimatedDelivery: string;
  paymentMethod: PaymentMethodType;
  paymentStatus?: PaymentStatusType;
  status: OrderStatusType;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  upiTransactionNote?: string;
  rejectionReason?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface PaymentRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Refunded';
  date: string;
  transactionRef?: string;
}

export interface UpiPaymentConfig {
  enabled: boolean;
  vpaId: string;
  merchantName: string;
  upiId?: string;
  googlePayName?: string;
  qrCodeUrl?: string;
  qrCodeImageUrl?: string;
  instructions: string;
}

export interface CardPaymentConfig {
  enabled: boolean;
  provider: 'stripe' | 'razorpay' | 'mock';
  gatewayName?: 'razorpay' | 'stripe' | 'standard';
  publishableKey?: string;
  testMode: boolean;
  instructions?: string;
}

export interface CodPaymentConfig {
  enabled: boolean;
  extraFee: number;
  codCharge?: number;
  minOrder?: number;
  maxOrder?: number;
  maxOrderLimit: number;
  instructions: string;
}

export interface PaymentSettings {
  upi: UpiPaymentConfig;
  card: CardPaymentConfig;
  cod: CodPaymentConfig;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  senderId?: string;
  senderName?: string;
  senderType?: 'customer' | 'admin' | 'staff';
  messageType?: 'text' | 'audio' | 'image';
  text?: string;
  audioUrl?: string; // Base64 data URI or audio file path
  audioDuration?: number; // duration in seconds
  image?: string;
  time: string;
  timestamp?: number;
  read?: boolean;
}

export interface SupportConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  orderId?: string;
  orderNumber?: string;
  status: 'Open' | 'Resolved';
  lastMessage: string;
  updatedAt: string;
  unreadCountCustomer?: number;
  unreadCountAdmin?: number;
  messages: ChatMessage[];
}

export type AppScreen =
  | 'splash'
  | 'home'
  | 'product-detail'
  | 'customize'
  | 'cart'
  | 'payment'
  | 'profile'
  | 'edit-profile'
  | 'payment-methods'
  | 'order-history'
  | 'support';
