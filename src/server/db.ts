import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  AppModule,
  Product,
  CurryOption,
  ProductCurryConfig,
  SelectedCurrySnapshot,
  ToppingItem,
  SideItem,
  Order,
  ChatMessage,
  PaymentCard,
  UserProfile,
  OptionGroup,
  ProductOption,
  OptionGroupTemplate,
  PaymentSettings,
  PaymentMethodType,
  PaymentStatusType,
  OrderStatusType,
  DeliveryTimeSlot,
  DeliverySettings,
} from '../types';

export interface AdminUser {
  username: string;
  passwordHash: string;
  name: string;
  role: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  order: number;
  active: boolean;
  moduleId?: string;
}

export interface AdminProduct extends Product {
  available: boolean;
  featured: boolean;
  popular: boolean;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  optionGroups?: OptionGroup[];
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
  customerId?: string;
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
  deliverySettings: DeliverySettings;
}

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  admin: string;
  timestamp: string;
  ip?: string;
}

export interface DbSchema {
  admins: AdminUser[];
  sessions: { [token: string]: { username: string; expiresAt: number; createdAt: number } };
  modules: AppModule[];
  categories: CategoryItem[];
  products: AdminProduct[];
  curries: CurryOption[];
  optionTemplates: OptionGroupTemplate[];
  toppings: ToppingItem[];
  sides: SideItem[];
  orders: Order[];
  customers: CustomerRecord[];
  payments: PaymentRecord[];
  supportConversations: SupportConversation[];
  settings: StoreSettings;
  auditLogs: AuditLogItem[];
}

// Initial Admin Password Hash for "Anasasiq4302@"
const INITIAL_ADMIN_PASSWORD_HASH = bcrypt.hashSync('Anasasiq4302@', 10);

const DB_FILE_PATH = path.resolve(process.cwd(), 'database.json');

export const INITIAL_MODULES: AppModule[] = [
  {
    id: 'food',
    name: 'Food',
    title: 'HM-Q Foodgo',
    subtitle: 'Powered by HM-Q',
    tagline: 'Order your favourite food!',
    icon: '🍔',
    order: 1,
    active: true,
    bannerTitle: 'Customize Your Burger',
    bannerSubtitle: 'Choose your toppings, sides & spice',
    bannerAction: 'Build Now →',
    bannerBadge: 'Burger Builder',
  },
  {
    id: 'grocery',
    name: 'Grocery',
    title: 'HM-Q Grocery',
    subtitle: 'Powered by HM-Q',
    tagline: 'Shop groceries near you',
    icon: '🛒',
    order: 2,
    active: true,
    bannerTitle: 'Fresh Daily Essentials',
    bannerSubtitle: 'Farm fresh produce delivered in 15 mins',
    bannerAction: 'Shop Now →',
    bannerBadge: 'Fresh Groceries',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    title: 'HM-Q Pharmacy',
    subtitle: 'Powered by HM-Q',
    tagline: 'Medicines & healthcare delivered',
    icon: '💊',
    order: 3,
    active: true,
    bannerTitle: 'Healthcare & Wellness',
    bannerSubtitle: '100% genuine medicines & first aid',
    bannerAction: 'Explore →',
    bannerBadge: 'Certified Meds',
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics',
    title: 'HM-Q Cosmetics',
    subtitle: 'Powered by HM-Q',
    tagline: 'Beauty, skincare & perfumes',
    icon: '💄',
    order: 4,
    active: true,
    bannerTitle: 'Luxury Glow Boutique',
    bannerSubtitle: 'Premium organic beauty & skincare',
    bannerAction: 'Discover →',
    bannerBadge: 'Top Brands',
  },
  {
    id: 'stationery',
    name: 'Stationery',
    title: 'HM-Q Stationery',
    subtitle: 'Powered by HM-Q',
    tagline: 'Office supplies & books',
    icon: '📦',
    order: 5,
    active: true,
    bannerTitle: 'Office & Study Supplies',
    bannerSubtitle: 'Notebooks, pens & craft supplies',
    bannerAction: 'Browse →',
    bannerBadge: 'Back to School',
  },
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  // Food Categories
  { id: 'all', name: 'All', order: 1, active: true, moduleId: 'food' },
  { id: 'porotta', name: 'Porotta', order: 2, active: true, moduleId: 'food' },
  { id: 'biriyani', name: 'Biriyani', order: 3, active: true, moduleId: 'food' },
  { id: 'fried-items', name: 'Fried Items', order: 4, active: true, moduleId: 'food' },
  { id: 'snacks', name: 'Snacks', order: 5, active: true, moduleId: 'food' },
  { id: 'burgers', name: 'Burgers', order: 6, active: true, moduleId: 'food' },
  { id: 'drinks', name: 'Drinks', order: 7, active: true, moduleId: 'food' },
  { id: 'combos', name: 'Combos', order: 8, active: true, moduleId: 'food' },

  // Grocery Categories
  { id: 'g-all', name: 'All', order: 1, active: true, moduleId: 'grocery' },
  { id: 'g-dairy', name: 'Dairy & Eggs', order: 2, active: true, moduleId: 'grocery' },
  { id: 'g-produce', name: 'Produce', order: 3, active: true, moduleId: 'grocery' },
  { id: 'g-pantry', name: 'Pantry Staples', order: 4, active: true, moduleId: 'grocery' },
  { id: 'g-beverages', name: 'Beverages', order: 5, active: true, moduleId: 'grocery' },

  // Pharmacy Categories
  { id: 'ph-all', name: 'All', order: 1, active: true, moduleId: 'pharmacy' },
  { id: 'ph-first-aid', name: 'First Aid', order: 2, active: true, moduleId: 'pharmacy' },
  { id: 'ph-vitamins', name: 'Vitamins', order: 3, active: true, moduleId: 'pharmacy' },
  { id: 'ph-wellness', name: 'Wellness', order: 4, active: true, moduleId: 'pharmacy' },

  // Cosmetics Categories
  { id: 'cos-all', name: 'All', order: 1, active: true, moduleId: 'cosmetics' },
  { id: 'cos-skincare', name: 'Skincare', order: 2, active: true, moduleId: 'cosmetics' },
  { id: 'cos-makeup', name: 'Makeup', order: 3, active: true, moduleId: 'cosmetics' },
  { id: 'cos-fragrance', name: 'Fragrances', order: 4, active: true, moduleId: 'cosmetics' },

  // Stationery Categories
  { id: 'st-all', name: 'All', order: 1, active: true, moduleId: 'stationery' },
  { id: 'st-notebooks', name: 'Notebooks', order: 2, active: true, moduleId: 'stationery' },
  { id: 'st-pens', name: 'Pens & Markers', order: 3, active: true, moduleId: 'stationery' },
  { id: 'st-art', name: 'Art Supplies', order: 4, active: true, moduleId: 'stationery' },
  { id: 'st-desk', name: 'Desk Accessories', order: 5, active: true, moduleId: 'stationery' },
];

export const INITIAL_CURRIES: CurryOption[] = [
  {
    id: 'curry-salna',
    name: 'Salna',
    pricePerUnit: 5.00,
    unitLabel: 'Spoon',
    active: true,
    isCurryLevelOption: true,
    order: 1,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop&q=80',
    description: 'Aromatic layered Malabar street-style salna gravy',
  },
  {
    id: 'curry-kutton-chaps',
    name: 'Kutton Chaps Curry',
    pricePerUnit: 10.00,
    unitLabel: 'Spoon',
    active: true,
    isCurryLevelOption: true,
    order: 2,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    description: 'Rich spiced mutton chaps slow-simmered gravy',
  },
  {
    id: 'curry-chicken-salna',
    name: 'Chicken Salna',
    pricePerUnit: 10.00,
    unitLabel: 'Spoon',
    active: true,
    isCurryLevelOption: true,
    order: 3,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80',
    description: 'Zesty pepper and roasted coriander chicken gravy',
  },
  {
    id: 'curry-fish-salna',
    name: 'Fish Salna',
    pricePerUnit: 12.00,
    unitLabel: 'Spoon',
    active: true,
    isCurryLevelOption: true,
    order: 4,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&auto=format&fit=crop&q=80',
    description: 'Tangy Kudampuli kokum seer fish gravy',
  },
  {
    id: 'curry-beef-gravy',
    name: 'Beef Gravy',
    pricePerUnit: 10.00,
    unitLabel: 'Spoon',
    active: true,
    isCurryLevelOption: true,
    order: 5,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80',
    description: 'Roasted beef shallot dark caramelized gravy',
  },
  {
    id: 'curry-veg-kurma',
    name: 'Vegetable Kurma',
    pricePerUnit: 4.00,
    unitLabel: 'Spoon',
    active: true,
    isCurryLevelOption: true,
    order: 6,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80',
    description: 'Mild coconut and cashew vegetable kurma',
  },
];

const INITIAL_OPTION_TEMPLATES: OptionGroupTemplate[] = [
  {
    id: 'tpl-portion-size',
    name: 'Biriyani & Meal Sizes (Half / Full / 1 KG)',
    group: {
      id: 'grp-tpl-size',
      name: 'Choose Size',
      description: 'Select your preferred portion serving size',
      required: true,
      selectionType: 'single',
      minSelections: 1,
      maxSelections: 1,
      options: [
        { id: 'opt-half', name: 'Half', price: 7.99, priceType: 'fixed', available: true },
        { id: 'opt-full', name: 'Full', price: 11.99, priceType: 'fixed', available: true, isDefault: true },
        { id: 'opt-single-piece', name: 'Single Piece', price: 5.50, priceType: 'fixed', available: true },
        { id: 'opt-1kg', name: '1 KG', price: 24.99, priceType: 'fixed', available: false, description: 'Family party pack (Pre-order required)' },
      ],
    },
  },
  {
    id: 'tpl-curry-choice',
    name: 'Curry Options (Chicken / Beef / Fish / Veg)',
    group: {
      id: 'grp-tpl-curry',
      name: 'Choose Your Curry',
      description: 'Select your signature curry accompaniment',
      required: true,
      selectionType: 'single',
      minSelections: 1,
      maxSelections: 1,
      options: [
        { id: 'curry-chicken', name: 'Chicken Curry', price: 4.50, priceType: 'adjustment', available: true, isDefault: true },
        { id: 'curry-beef', name: 'Beef Curry', price: 5.20, priceType: 'adjustment', available: true },
        { id: 'curry-fish', name: 'Fish Curry', price: 5.00, priceType: 'adjustment', available: true },
        { id: 'curry-egg', name: 'Egg Curry', price: 3.50, priceType: 'adjustment', available: true },
        { id: 'curry-veg', name: 'Vegetable Kurma', price: 3.00, priceType: 'adjustment', available: true },
      ],
    },
  },
  {
    id: 'tpl-biriyani-addons',
    name: 'Biriyani Add-ons & Accompaniments',
    group: {
      id: 'grp-tpl-biriyani-add',
      name: 'Add-ons & Extras',
      description: 'Enhance your feast with delicious additions',
      required: false,
      selectionType: 'multiple',
      minSelections: 0,
      maxSelections: 6,
      options: [
        { id: 'opt-egg', name: 'Boiled Egg', price: 1.00, priceType: 'adjustment', available: true },
        { id: 'opt-chicken-piece', name: 'Extra Chicken Piece', price: 3.50, priceType: 'adjustment', available: true },
        { id: 'opt-raita', name: 'Special Raita Cup', price: 1.20, priceType: 'adjustment', available: true },
        { id: 'opt-extra-rice', name: 'Extra Spiced Rice', price: 3.99, priceType: 'adjustment', available: true },
        { id: 'opt-salan', name: 'Extra Salan Gravy', price: 1.50, priceType: 'adjustment', available: true },
      ],
    },
  },
  {
    id: 'tpl-burger-size',
    name: 'Burger Patty & Size Options',
    group: {
      id: 'grp-tpl-burger-patty',
      name: 'Choose Burger Size',
      description: 'Select patty count & thickness',
      required: true,
      selectionType: 'single',
      minSelections: 1,
      maxSelections: 1,
      options: [
        { id: 'opt-b-single', name: 'Single Patty (Regular)', price: 8.24, priceType: 'fixed', available: true, isDefault: true },
        { id: 'opt-b-double', name: 'Double Patty (Large)', price: 11.49, priceType: 'fixed', available: true },
        { id: 'opt-b-triple', name: 'Monster Triple Patty', price: 14.99, priceType: 'fixed', available: true },
        { id: 'opt-b-mega', name: 'Mega Giant Challenge', price: 24.99, priceType: 'fixed', available: false, description: 'Limited batch' },
      ],
    },
  },
  {
    id: 'tpl-burger-addons',
    name: 'Gourmet Burger Cheeses & Add-ons',
    group: {
      id: 'grp-tpl-b-addons',
      name: 'Extra Toppings & Cheeses',
      description: 'Customize with gourmet cheeses and crispy toppings',
      required: false,
      selectionType: 'multiple',
      minSelections: 0,
      maxSelections: 5,
      options: [
        { id: 'opt-cheddar', name: 'Melted Aged Cheddar', price: 1.25, priceType: 'adjustment', available: true },
        { id: 'opt-bacon', name: 'Crispy Smoked Bacon', price: 1.85, priceType: 'adjustment', available: true },
        { id: 'opt-jalapeno', name: 'Pickled Jalapeños', price: 0.50, priceType: 'adjustment', available: true },
        { id: 'opt-grilled-onion', name: 'Caramelized Onions', price: 0.65, priceType: 'adjustment', available: true },
        { id: 'opt-truffle', name: 'Truffle Aioli Drizzle', price: 0.95, priceType: 'adjustment', available: true },
      ],
    },
  },
];

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'kerala-porotta',
    name: 'Porotta',
    subtitle: 'Kerala Layered Flaky Porotta',
    category: 'Porotta',
    price: 12.00,
    rating: 4.9,
    prepTime: '10 mins',
    description:
      'Golden-brown, crispy and ultra-flaky Kerala layered flatbread freshly tossed on a hot griddle. Pair it with authentic regional curries and spicy fries for the ultimate feast.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 50,
    defaultPortion: 2,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 1,
    reviewCount: 312,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    curryConfig: {
      enabled: true,
      defaultCurryId: 'curry-salna',
      defaultUnits: 1,
      minUnits: 1,
      maxUnits: 5,
      allowCurryChange: true,
      allowedCurryIds: ['curry-salna', 'curry-kutton-chaps', 'curry-chicken-salna', 'curry-fish-salna', 'curry-beef-gravy', 'curry-veg-kurma'],
    },
    optionGroups: [
      {
        id: 'grp-porotta-addons',
        name: 'Best With / Add-ons',
        description: 'Add delicious side curries & dishes',
        required: false,
        selectionType: 'multiple',
        minSelections: 0,
        maxSelections: 5,
        options: [
          { id: 'opt-chicken-curry', name: 'Chicken Curry', price: 80.00, priceType: 'adjustment', available: true, description: 'Kerala style slow cooked chicken curry' },
          { id: 'opt-beef-roast', name: 'Beef Roast', price: 120.00, priceType: 'adjustment', available: true, description: 'Spicy caramelized beef fry roast' },
          { id: 'opt-egg-curry', name: 'Egg Curry', price: 60.00, priceType: 'adjustment', available: true, description: 'Traditional egg roast masala' },
          { id: 'opt-fish-curry', name: 'Fish Curry', price: 90.00, priceType: 'adjustment', available: true, description: 'Kudampuli spicy fish curry' },
        ],
      },
    ],
    customizationSections: [
      {
        id: 'sec-porotta-curry',
        name: 'Choose Your Curry',
        description: 'Select your signature curry accompaniment (Required)',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'pc-chicken', name: 'Chicken Curry', price: 4.50, priceType: 'adjustment', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop&q=80', description: 'Rich coconut gravy with spiced chicken' },
          { id: 'pc-beef', name: 'Beef Curry', price: 5.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80', description: 'Slow-cooked beef in roasted coriander masala' },
          { id: 'pc-fish', name: 'Fish Curry', price: 5.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&auto=format&fit=crop&q=80', description: 'Tangy Kudampuli fish curry with raw mango' },
          { id: 'pc-egg', name: 'Egg Curry', price: 3.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80', description: 'Boiled eggs in caramelized onion masala' },
          { id: 'pc-veg', name: 'Vegetable Kurma', price: 3.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80', description: 'Mixed vegetables in aromatic coconut milk' },
        ],
      },
      {
        id: 'sec-porotta-sides',
        name: 'Extra Side Dishes',
        description: 'Add signature roasted meats and crispy fries',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 4,
        items: [
          { id: 'ps-beef-fry', name: 'Spicy Beef Fry', price: 6.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80', description: 'Coconut oil fried beef with shallots' },
          { id: 'ps-chicken-fry', name: 'Kerala Chicken Fry', price: 5.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80', description: 'Crispy curry leaf spiced chicken' },
          { id: 'ps-egg-roast', name: 'Egg Roast', price: 3.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80', description: 'Spiced onion-tomato masala eggs' },
          { id: 'ps-fish-fry', name: 'Crispy Fish Fry', price: 6.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&auto=format&fit=crop&q=80', description: 'Shallot and red chilli marinated seer fish' },
        ],
      },
      {
        id: 'sec-porotta-extra',
        name: 'Add Something Extra',
        description: 'Crisps, salads & condiments',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 4,
        items: [
          { id: 'pe-salad', name: 'Onion Tomato Salad', price: 0.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80' },
          { id: 'pe-pickle', name: 'Kerala Lime Pickle', price: 0.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'pe-papad', name: 'Crispy Papad (2 pcs)', price: 0.75, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80' },
          { id: 'pe-gravy', name: 'Extra Curry Gravy Cup', price: 1.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-porotta-drinks',
        name: 'Drinks',
        description: 'Hot brews and refreshing cool drinks',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        items: [
          { id: 'pd-tea', name: 'Kerala Milk Tea', price: 1.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
          { id: 'pd-coffee', name: 'Filter Coffee', price: 1.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80' },
          { id: 'pd-lime', name: 'Fresh Lime Soda', price: 2.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&auto=format&fit=crop&q=80' },
          { id: 'pd-soda', name: 'Chilled Cola', price: 1.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'kerala-pazhampori',
    name: 'Pazhampori',
    subtitle: 'Crispy Kerala Banana Fritters',
    category: 'Snacks',
    price: 15.00,
    rating: 4.8,
    prepTime: '12 mins',
    description:
      'Sweet ripe Nendran bananas sliced length-wise, dipped in a delicate golden batter, and fried till crisp on the outside and tender inside. Try the famous cult combination with spicy beef fry!',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 20,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 2,
    reviewCount: 198,
    createdAt: '2026-08-01T08:30:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    curryConfig: {
      enabled: true,
      defaultCurryId: 'curry-beef-gravy',
      defaultUnits: 1,
      minUnits: 1,
      maxUnits: 5,
      allowCurryChange: true,
      allowedCurryIds: ['curry-beef-gravy', 'curry-salna', 'curry-chicken-salna'],
    },
    optionGroups: [
      {
        id: 'grp-pazhampori-addons',
        name: 'Best With / Cult Combo',
        description: 'Add classic accompaniments',
        required: false,
        selectionType: 'multiple',
        minSelections: 0,
        maxSelections: 3,
        options: [
          { id: 'opt-pzc-beef-fry', name: 'Spicy Beef Fry', price: 90.00, priceType: 'adjustment', available: true, description: 'Legendary Pazhampori + Beef Fry combo' },
          { id: 'opt-pzc-chicken-fry', name: 'Chicken Pepper Fry', price: 85.00, priceType: 'adjustment', available: true, description: 'Crispy fried chicken with curry leaves' },
        ],
      },
    ],
    customizationSections: [
      {
        id: 'sec-pazhampori-combo',
        name: 'Best With / Cult Combo',
        description: 'Experience Kerala’s famous sweet & spicy pairings',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'pzc-beef-fry', name: 'Spicy Beef Fry', price: 6.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80', description: 'The legendary Pazhampori + Beef Fry combo' },
          { id: 'pzc-chicken-fry', name: 'Chicken Pepper Fry', price: 5.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80', description: 'Crispy fried chicken with curry leaves' },
          { id: 'pzc-egg-roast', name: 'Egg Roast Masala', price: 3.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80', description: 'Thick onion tomato roast gravy' },
        ],
      },
      {
        id: 'sec-pazhampori-dips',
        name: 'Side Dips & Crunch',
        description: 'Sweet banana dip & savory chutneys',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'pzd-honey', name: 'Honey Banana Cream Dip', price: 1.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'pzd-mint', name: 'Fresh Mint Chutney', price: 0.90, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80' },
          { id: 'pzd-chilli', name: 'Green Chilli Jam', price: 0.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-pazhampori-drinks',
        name: 'Drinks',
        description: 'Hot tea & refreshing juices',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        items: [
          { id: 'pzd-chai', name: 'Hot Kerala Chai', price: 1.50, priceType: 'adjustment', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
          { id: 'pzd-coffee', name: 'Filter Coffee', price: 1.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80' },
          { id: 'pzd-lime', name: 'Sweet Fresh Lime', price: 2.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'chicken-biriyani-special',
    name: 'Chicken Biriyani',
    subtitle: 'Thalassery Dum Biriyani',
    category: 'Biriyani',
    price: 11.99,
    rating: 4.9,
    prepTime: '20 mins',
    description:
      'Authentic fragrant Kaima rice layered with tender marinated chicken, golden fried cashews, sultanas, mint, and secret roasted spices. Served with raita and date pickle.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 70,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 3,
    reviewCount: 420,
    createdAt: '2026-08-01T11:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-cb-size',
        name: 'Choose Size',
        description: 'Select your preferred portion serving size (Required)',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'cb-half', name: 'Half Portion', price: 7.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', description: 'Single serving with 1 chicken piece' },
          { id: 'cb-full', name: 'Full Portion', price: 11.99, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', description: 'Generous serving with 2 chicken pieces' },
          { id: 'cb-1kg', name: '1 KG Party Pack', price: 24.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', description: 'Feast for 3-4 people with 6 chicken pieces' },
        ],
      },
      {
        id: 'sec-cb-addons',
        name: 'Extra Items & Add-ons',
        description: 'Enhance your feast with boiled eggs, extra meat & rice',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 5,
        items: [
          { id: 'cba-piece', name: 'Extra Fried Chicken Piece', price: 3.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'cba-egg', name: 'Boiled Egg', price: 1.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80' },
          { id: 'cba-raita', name: 'Cucumber Onion Raita', price: 1.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80' },
          { id: 'cba-pickle', name: 'Malabar Date Pickle', price: 0.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'cba-rice', name: 'Extra Kaima Dum Rice', price: 3.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80' },
          { id: 'cba-gravy', name: 'Extra Biriyani Gravy', price: 1.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-cb-drinks',
        name: 'Drinks & Sweets',
        description: 'Authentic Sulaimani tea & mango desserts',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'cbd-sulaimani', name: 'Sulaimani Black Tea', price: 1.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
          { id: 'cbd-lassi', name: 'Mango Lassi', price: 3.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
          { id: 'cbd-pudding', name: 'Tender Coconut Pudding', price: 3.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'beef-biriyani-special',
    name: 'Beef Biriyani',
    subtitle: 'Malabar Spiced Dum Biriyani',
    category: 'Biriyani',
    price: 13.49,
    rating: 4.9,
    prepTime: '22 mins',
    description:
      'Tender slow-cooked beef cubes infused with roasted garam masala, mint, fried onions, and pure ghee, layered with premium short-grain Kaima rice.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 75,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 4,
    reviewCount: 285,
    createdAt: '2026-08-01T11:30:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-bb-size',
        name: 'Choose Size',
        description: 'Select your preferred portion serving size (Required)',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'bb-half', name: 'Half Portion', price: 8.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80' },
          { id: 'bb-full', name: 'Full Portion', price: 13.49, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80' },
          { id: 'bb-1kg', name: '1 KG Mega Feast', price: 27.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-bb-addons',
        name: 'Extra Items & Add-ons',
        description: 'Extra beef, egg, raita & papad',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 5,
        items: [
          { id: 'bba-beef', name: 'Extra Tender Beef Chunks', price: 4.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80' },
          { id: 'bba-egg', name: 'Boiled Egg', price: 1.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=200&auto=format&fit=crop&q=80' },
          { id: 'bba-raita', name: 'Spiced Onion Raita', price: 1.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80' },
          { id: 'bba-pickle', name: 'Malabar Lime Pickle', price: 0.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'bba-papad', name: 'Crispy Papad (2 pcs)', price: 0.75, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-bb-drinks',
        name: 'Drinks',
        description: 'Chilled drinks & warm digestive tea',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        items: [
          { id: 'bbd-sulaimani', name: 'Sulaimani Lemon Tea', price: 1.20, priceType: 'adjustment', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
          { id: 'bbd-lime', name: 'Fresh Mint Lime Soda', price: 2.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'cheeseburger-wendy',
    name: 'Cheeseburger',
    subtitle: "Wendy's Burger",
    category: 'Burgers',
    price: 8.24,
    rating: 4.9,
    prepTime: '26 mins',
    description:
      "The Cheeseburger Wendy's Burger is a classic fast food burger that packs a punch of flavor in every bite. Made with a juicy beef patty cooked to perfection, it's topped with melted American cheese, crispy lettuce, ripe tomato, and crunchy pickles.",
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 55,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 5,
    reviewCount: 128,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-wendy-patty',
        name: 'Choose Patty Size',
        description: 'Select your burger size & patty stack (Required)',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'w-reg', name: 'Regular (Single Patty)', price: 8.24, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80' },
          { id: 'w-dbl', name: 'Double Stack (2 Patties)', price: 11.49, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=80' },
          { id: 'w-trp', name: 'Triple Tower (3 Patties)', price: 14.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-wendy-toppings',
        name: 'Extra Cheese & Toppings',
        description: 'Personalize with melted cheese and crispy bacon',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 4,
        items: [
          { id: 'w-cheese', name: 'Extra Melted Cheddar', price: 1.25, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&auto=format&fit=crop&q=80' },
          { id: 'w-bacon', name: 'Crispy Bacon Strips', price: 1.85, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&auto=format&fit=crop&q=80' },
          { id: 'w-jalapeno', name: 'Pickled Jalapeños', price: 0.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80' },
          { id: 'w-onions', name: 'Grilled Caramelized Onions', price: 0.65, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-wendy-sides',
        name: 'Side Dishes',
        description: 'Golden fries & crispy onion rings',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'ws-fries', name: 'Golden French Fries', price: 2.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80' },
          { id: 'ws-rings', name: 'Crispy Onion Rings', price: 3.20, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1639024471287-032f66e51c8b?w=200&auto=format&fit=crop&q=80' },
          { id: 'ws-loaded', name: 'Cheese Loaded Fries', price: 4.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-wendy-drinks',
        name: 'Drinks',
        description: 'Shakes and cold drinks',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        items: [
          { id: 'wd-shake', name: 'Vanilla Milkshake', price: 3.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&auto=format&fit=crop&q=80' },
          { id: 'wd-coke', name: 'Coke Zero', price: 1.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'chicken-shawarma-roll',
    name: 'Chicken Shawarma',
    subtitle: 'Lebanese Grilled Wrap',
    category: 'Snacks',
    price: 6.99,
    rating: 4.8,
    prepTime: '15 mins',
    description:
      'Tender shredded marinated chicken rolled inside a toasted flatbread with fragrant garlic toum dip, pickles, and crispy potatoes.',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 50,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 6,
    reviewCount: 164,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-shawarma-style',
        name: 'Meat & Filling Style',
        description: 'Choose your wrap thickness and stuffing',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'sh-classic', name: 'Classic Chicken Shawarma', price: 6.99, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&auto=format&fit=crop&q=80' },
          { id: 'sh-extra', name: 'Extra Meat Loaded', price: 8.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&auto=format&fit=crop&q=80' },
          { id: 'sh-whole', name: 'Whole Meat (No Fries/Veggies)', price: 9.49, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-shawarma-sauces',
        name: 'Special Sauces & Dips',
        description: 'Add extra garlic toum, tahini & spicy dip',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'shs-toum', name: 'Garlic Toum Sauce', price: 1.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'shs-tahini', name: 'Spicy Tahini Dip', price: 1.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'shs-pickles', name: 'Extra Pickled Cucumbers', price: 0.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-shawarma-sides',
        name: 'Sides & Drinks',
        description: 'Crispy fries & fresh mint lime juice',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 2,
        items: [
          { id: 'shd-fries', name: 'Hot French Fries', price: 2.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80' },
          { id: 'shd-lime', name: 'Fresh Mint Lime', price: 2.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'kerala-beef-fry',
    name: 'Kerala Beef Fry',
    subtitle: 'Slow-Roasted Ularthiyathu',
    category: 'Fried Items',
    price: 7.99,
    rating: 4.9,
    prepTime: '18 mins',
    description:
      'Succulent beef pieces slow-roasted in pure coconut oil with cracked black pepper, shallots, garlic, and crunchy browned coconut slivers.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 80,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 7,
    reviewCount: 350,
    createdAt: '2026-08-01T13:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-bf-breads',
        name: 'Accompaniments',
        description: 'Choose your signature bread or rice to go with Beef Fry',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'bfb-porotta', name: '2x Kerala Porotta', price: 2.99, priceType: 'adjustment', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80' },
          { id: 'bfb-appam', name: 'Appam (2 pcs)', price: 2.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80' },
          { id: 'bfb-ghee-rice', name: 'Fragrant Ghee Rice', price: 3.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-bf-extras',
        name: 'Garnish & Extras',
        description: 'Extra roasted coconut & salad',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 2,
        items: [
          { id: 'bfe-coconut', name: 'Fried Coconut Chips & Curry Leaves', price: 1.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80' },
          { id: 'bfe-onions', name: 'Sliced Red Onions & Lime', price: 0.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-bf-drinks',
        name: 'Drinks',
        description: 'Lime soda & digestive black tea',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        items: [
          { id: 'bfd-lime', name: 'Fresh Lime Juice', price: 2.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&auto=format&fit=crop&q=80' },
          { id: 'bfd-tea', name: 'Sulaimani Spiced Tea', price: 1.20, priceType: 'adjustment', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'crispy-chicken-fry',
    name: 'Chicken Fry',
    subtitle: 'Kerala Spiced Chicken Fry',
    category: 'Fried Items',
    price: 6.99,
    rating: 4.7,
    prepTime: '16 mins',
    description:
      'Chicken cuts marinated in fiery crushed chilli, fennel, ginger-garlic paste, and curry leaves, crisp fried in hot oil.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 75,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 8,
    reviewCount: 210,
    createdAt: '2026-08-01T13:30:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-cf-style',
        name: 'Spice & Preparation',
        description: 'Select your preferred seasoning style',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'cfs-malabar', name: 'Malabar Spicy Roast', price: 6.99, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'cfs-pepper', name: 'Crispy Pepper Fry', price: 6.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80' },
          { id: 'cfs-dragon', name: 'Dragon Chicken Glaze', price: 7.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-cf-pair',
        name: 'Pairs Best With',
        description: 'Porotta, roti & dips',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'cfp-porotta', name: '2x Hot Porotta', price: 2.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80' },
          { id: 'cfp-ghee', name: 'Ghee Rice Bowl', price: 3.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80' },
          { id: 'cfp-mayo', name: 'Garlic Mayonnaise Dip', price: 0.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-cf-drinks',
        name: 'Drinks',
        description: 'Mango lassi & refreshing drinks',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        items: [
          { id: 'cfd-lassi', name: 'Mango Lassi', price: 3.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
          { id: 'cfd-mojito', name: 'Fresh Mojito', price: 3.00, priceType: 'adjustment', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'hamburger-veggie',
    name: 'Hamburger',
    subtitle: 'Veggie Burger',
    category: 'Burgers',
    price: 9.99,
    rating: 4.8,
    prepTime: '14 mins',
    description:
      'Enjoy our delicious Hamburger Veggie Burger, made with a savory blend of fresh vegetables and herbs, topped with crisp lettuce, juicy tomatoes, and tangy pickles, all served on a soft, toasted bun.',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 60,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 9,
    reviewCount: 94,
    createdAt: '2026-08-02T11:30:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-vg-patty',
        name: 'Patty Choice',
        description: 'Select your signature vegetarian patty',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'vgp-garden', name: 'Herb Garden Veg Patty', price: 9.99, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=200&auto=format&fit=crop&q=80' },
          { id: 'vgp-bean', name: 'Spicy Black Bean Patty', price: 10.49, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=200&auto=format&fit=crop&q=80' },
          { id: 'vgp-paneer', name: 'Crispy Paneer Patty', price: 11.20, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-vg-toppings',
        name: 'Gourmet Toppings',
        description: 'Fresh avocado & sautéed mushrooms',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'vgt-guac', name: 'Fresh Guacamole', price: 1.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80' },
          { id: 'vgt-cheese', name: 'Vegan Cheddar Slice', price: 1.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&auto=format&fit=crop&q=80' },
          { id: 'vgt-mushrooms', name: 'Sautéed Garlic Mushrooms', price: 1.25, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-vg-sides',
        name: 'Sides & Drinks',
        description: 'Sweet potato fries & organic smoothies',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 2,
        items: [
          { id: 'vgs-fries', name: 'Sweet Potato Fries', price: 3.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80' },
          { id: 'vgs-smoothie', name: 'Green Detox Smoothie', price: 4.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'fried-chicken-burger',
    name: 'Hamburger',
    subtitle: 'Fried Chicken Burger',
    category: 'Burgers',
    price: 12.48,
    rating: 4.5,
    prepTime: '14 mins',
    description:
      'Indulge in our crispy and savory Fried Chicken Burger, made with a juicy chicken patty, hand-breaded and deep-fried to perfection, served on a warm bun with lettuce, tomato, and a creamy sauce.',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 45,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 10,
    reviewCount: 112,
    createdAt: '2026-08-04T14:20:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-fcb-glaze',
        name: 'Flavor Glaze & Coating',
        description: 'Choose your signature glaze style',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'fcg-nashville', name: 'Nashville Hot Chilli', price: 12.48, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=200&auto=format&fit=crop&q=80' },
          { id: 'fcg-honey', name: 'Honey Mustard Glaze', price: 12.48, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=200&auto=format&fit=crop&q=80' },
          { id: 'fcg-garlic', name: 'Korean Garlic BBQ', price: 12.99, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-fcb-addons',
        name: 'Loaded Add-ons',
        description: 'Double cheese melt & smoked bacon',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        items: [
          { id: 'fca-cheese', name: 'Double Cheddar Melt', price: 1.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&auto=format&fit=crop&q=80' },
          { id: 'fca-bacon', name: 'Crispy Smoked Bacon', price: 1.85, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&auto=format&fit=crop&q=80' },
          { id: 'fca-slaw', name: 'Creamy Coleslaw Cup', price: 0.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-fcb-sides',
        name: 'Sides & Drinks',
        description: 'Waffle fries & chocolate milkshakes',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 2,
        items: [
          { id: 'fcs-waffle', name: 'Waffle Fries', price: 3.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80' },
          { id: 'fcs-sticks', name: 'Mozzarella Sticks (4 pcs)', price: 4.50, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da410?w=200&auto=format&fit=crop&q=80' },
          { id: 'fcs-shake', name: 'Chocolate Shake', price: 3.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'mango-lassi-special',
    name: 'Mango Lassi',
    subtitle: 'Alphonso Mango & Yogurt',
    category: 'Drinks',
    price: 3.50,
    rating: 4.9,
    prepTime: '5 mins',
    description:
      'Thick, velvety churned Indian yogurt blended with pure Alphonso mango pulp, a hint of green cardamom, and crushed pistachios.',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 11,
    reviewCount: 175,
    createdAt: '2026-08-04T15:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-lassi-sweetness',
        name: 'Sweetness & Style',
        description: 'Choose sugar preference',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'ls-reg', name: 'Regular Sweet', price: 3.50, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
          { id: 'ls-less', name: 'Less Sugar', price: 3.50, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
          { id: 'ls-honey', name: 'Organic Honey Sweetened', price: 4.00, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-lassi-nuts',
        name: 'Nuts & Toppings',
        description: 'Pistachio, almond and saffron garnish',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 2,
        items: [
          { id: 'lsn-pista', name: 'Crushed Pistachios & Almonds', price: 0.80, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
          { id: 'lsn-saffron', name: 'Kashmiri Saffron Strand', price: 1.00, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  {
    id: 'kerala-milk-tea',
    name: 'Kerala Milk Tea',
    subtitle: 'Malabar DUM Chai',
    category: 'Drinks',
    price: 1.50,
    rating: 4.9,
    prepTime: '5 mins',
    description:
      'Frothy, fragrant Malabar spiced milk tea aerated from height for a rich velvety top layer. Perfect companion for afternoon snacks.',
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 10,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    customOrderEnabled: true,
    customOrderSortOrder: 12,
    reviewCount: 380,
    createdAt: '2026-08-04T15:30:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    customizationSections: [
      {
        id: 'sec-chai-style',
        name: 'Chai Flavor',
        description: 'Select your spice blend',
        selectionType: 'single',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        items: [
          { id: 'chs-cardamom', name: 'Classic Cardamom Chai', price: 1.50, priceType: 'fixed', isDefault: true, available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
          { id: 'chs-ginger', name: 'Fresh Ginger Chai', price: 1.75, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
          { id: 'chs-sulaimani', name: 'Black Sulaimani with Mint', price: 1.20, priceType: 'fixed', available: true, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&auto=format&fit=crop&q=80' },
        ],
      },
      {
        id: 'sec-chai-snacks',
        name: 'Pair With Snacks',
        description: 'Fresh hot fritters & samosas',
        selectionType: 'multiple',
        required: false,
        minSelections: 0,
        maxSelections: 2,
        items: [
          { id: 'chsn-pazhampori', name: 'Pazhampori Fritter', price: 2.49, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=200&auto=format&fit=crop&q=80' },
          { id: 'chsn-samosa', name: 'Crispy Samosa (2 pcs)', price: 1.99, priceType: 'adjustment', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80' },
        ],
      },
    ],
  },
  // GROCERY PRODUCTS
  {
    id: 'groc-milk-1l',
    moduleId: 'grocery',
    name: 'Farm Fresh Whole Milk (1L)',
    subtitle: '100% Pure Organic Dairy',
    category: 'Dairy & Eggs',
    price: 2.49,
    rating: 4.9,
    prepTime: '15 mins',
    description: 'Pasteurized, homogenized whole cow milk sourced directly from local dairy farms.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 142,
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'groc-basmati-rice',
    moduleId: 'grocery',
    name: 'Royal Basmati Rice (5kg)',
    subtitle: 'Extra Long Grain Aromatic',
    category: 'Pantry Staples',
    price: 14.99,
    rating: 4.8,
    prepTime: '15 mins',
    description: 'Aged Himalayan long-grain aromatic basmati rice for royal biriyanis and daily meals.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 98,
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'groc-avocado-pack',
    moduleId: 'grocery',
    name: 'Organic Hass Avocados (Pack of 3)',
    subtitle: 'Ripe & Ready to Eat',
    category: 'Produce',
    price: 4.99,
    rating: 4.7,
    prepTime: '15 mins',
    description: 'Creamy Hass avocados rich in healthy fats, perfect for toasts, salads, and smoothies.',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    reviewCount: 65,
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'groc-olive-oil',
    moduleId: 'grocery',
    name: 'Extra Virgin Olive Oil (500ml)',
    subtitle: 'First Cold Pressed Mediterranean',
    category: 'Pantry Staples',
    price: 8.99,
    rating: 4.9,
    prepTime: '15 mins',
    description: 'Rich, peppery cold-pressed olive oil ideal for dressings, marinades, and gourmet cooking.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: false,
    reviewCount: 81,
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },

  // PHARMACY PRODUCTS
  {
    id: 'pharm-thermometer',
    moduleId: 'pharmacy',
    name: 'Digital Fast Thermometer',
    subtitle: '10-Second Accurate Reading',
    category: 'First Aid',
    price: 12.99,
    rating: 4.9,
    prepTime: '15 mins',
    description: 'Medical-grade waterproof digital thermometer with fever alert and memory recall.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 210,
    createdAt: '2026-08-11T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'pharm-vit-c-zinc',
    moduleId: 'pharmacy',
    name: 'Vitamin C 1000mg + Zinc (60 Tabs)',
    subtitle: 'Immunity & Antioxidant Booster',
    category: 'Vitamins',
    price: 9.49,
    rating: 4.8,
    prepTime: '15 mins',
    description: 'Daily effervescent immune defense formula with high-potency Vitamin C and Zinc.',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 175,
    createdAt: '2026-08-11T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'pharm-first-aid-kit',
    moduleId: 'pharmacy',
    name: 'Complete Emergency First Aid Kit',
    subtitle: 'Compact 85-Piece Medical Bag',
    category: 'First Aid',
    price: 18.50,
    rating: 4.9,
    prepTime: '15 mins',
    description: 'Essential emergency kit containing bandages, antiseptics, scissors, tape, and sterile gauze.',
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    reviewCount: 88,
    createdAt: '2026-08-11T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },

  // COSMETICS PRODUCTS
  {
    id: 'cosm-matte-lipstick',
    moduleId: 'cosmetics',
    name: 'Velvet Matte Ruby Lipstick',
    subtitle: 'Long-Wear Hydrating Formula',
    category: 'Makeup',
    price: 16.50,
    rating: 4.9,
    prepTime: '20 mins',
    description: 'Ultra-pigmented velvety matte finish enriched with Shea butter and Vitamin E for 12hr wear.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 154,
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'cosm-hydra-serum',
    moduleId: 'cosmetics',
    name: 'Hydra-Glow Vitamin E Facial Serum',
    subtitle: 'Anti-Aging & Deep Moisturization',
    category: 'Skincare',
    price: 24.00,
    rating: 4.8,
    prepTime: '20 mins',
    description: 'Lightweight hyaluronic acid and botanical antioxidant serum for radiant, plump glass skin.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 198,
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'cosm-eyeshadow-palette',
    moduleId: 'cosmetics',
    name: 'Rose Gold Eyeshadow Palette',
    subtitle: '12 Shimmer & Matte Shades',
    category: 'Makeup',
    price: 21.90,
    rating: 4.7,
    prepTime: '20 mins',
    description: 'Blendable high-impact pigments with warm neutrals, rose gold metallics, and rich berries.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: false,
    reviewCount: 76,
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },

  // STATIONERY PRODUCTS
  {
    id: 'stat-journal-notebook',
    moduleId: 'stationery',
    name: 'Executive Hardcover Journal (A5)',
    subtitle: '160gsm Thick Bleedproof Pages',
    category: 'Notebooks',
    price: 11.50,
    rating: 4.9,
    prepTime: '20 mins',
    description: 'Lay-flat vegan leather binding with ribbon bookmark, pen loop, and inner expandable pocket.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 220,
    createdAt: '2026-08-13T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'stat-gel-pens',
    moduleId: 'stationery',
    name: 'Fineliner Archival Gel Pens (Set of 8)',
    subtitle: '0.5mm Smooth Quick-Dry Black & Color',
    category: 'Pens & Markers',
    price: 9.80,
    rating: 4.8,
    prepTime: '20 mins',
    description: 'Japanese water-based pigment ink pens that will not smear, fade, or bleed through pages.',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: true,
    popular: true,
    reviewCount: 164,
    createdAt: '2026-08-13T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'stat-sticky-notes',
    moduleId: 'stationery',
    name: 'Pastel Sticky Notes & Index Tabs',
    subtitle: 'Self-Adhesive Organizer Bundle',
    category: 'Desk Accessories',
    price: 4.50,
    rating: 4.7,
    prepTime: '20 mins',
    description: 'Morandi aesthetic color tabs and sticky memo pads for planning, studying, and office notes.',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    defaultSpice: 0,
    defaultPortion: 1,
    available: true,
    featured: false,
    popular: true,
    reviewCount: 92,
    createdAt: '2026-08-13T08:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
  },
];

const INITIAL_TOPPINGS: ToppingItem[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    price: 0.75,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'onions',
    name: 'Onions',
    price: 0.50,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pickles',
    name: 'Pickles',
    price: 0.65,
    image: 'https://images.unsplash.com/photo-1589135233689-d49fa21d60ec?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'bacons',
    name: 'Bacons',
    price: 1.85,
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&auto=format&fit=crop&q=80',
  },
];

const INITIAL_SIDES: SideItem[] = [
  {
    id: 'fries',
    name: 'Fries',
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'coleslaw',
    name: 'Coleslaw',
    price: 1.95,
    image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'salad',
    name: 'Salad',
    price: 2.25,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'onion',
    name: 'Onion',
    price: 2.75,
    image: 'https://images.unsplash.com/photo-1639024471287-032f66e51c8b?w=200&auto=format&fit=crop&q=80',
  },
];

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Sophia Patel',
    email: 'sophiapatel@gmail.com',
    phone: '+1 (555) 234-5678',
    address: '123 Main St Apartment 4A, New York, NY',
    totalOrders: 3,
    totalSpent: 54.57,
    registeredAt: '2026-07-15T08:30:00.000Z',
    status: 'Active',
  },
  {
    id: 'cust-2',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+1 (555) 891-2345',
    address: '742 Evergreen Terrace, Brooklyn, NY',
    totalOrders: 1,
    totalSpent: 26.99,
    registeredAt: '2026-08-10T14:12:00.000Z',
    status: 'Active',
  },
  {
    id: 'cust-3',
    name: 'Maria Garcia',
    email: 'm.garcia@outlook.com',
    phone: '+1 (555) 442-9988',
    address: '450 Lexington Ave, New York, NY',
    totalOrders: 2,
    totalSpent: 38.45,
    registeredAt: '2026-08-12T19:40:00.000Z',
    status: 'Active',
  },
];

const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  upi: {
    enabled: true,
    vpaId: 'foodgo@icici',
    upiId: 'foodgo@icici',
    merchantName: 'Foodgo Gourmet Kitchen',
    googlePayName: 'Foodgo Kitchen & Burgers',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dfoodgo%40icici%26pn%3DFoodgo%2520Kitchen%26cu%3DINR',
    qrCodeImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dfoodgo%40icici%26pn%3DFoodgo%2520Kitchen%26cu%3DINR',
    instructions: 'Scan the QR code with any UPI app (GPay, PhonePe, Paytm, BHIM) or tap "Pay with UPI App". Once paid, submit your 12-digit UTR reference.',
  },
  card: {
    enabled: true,
    provider: 'mock',
    gatewayName: 'standard',
    publishableKey: 'pk_live_foodgo_standard_sec_7894',
    testMode: true,
    instructions: 'Pay instantly and securely using Debit / Credit card with 256-bit SSL encryption.',
  },
  cod: {
    enabled: true,
    extraFee: 0,
    codCharge: 0,
    minOrder: 5,
    maxOrder: 500,
    maxOrderLimit: 500,
    instructions: 'Pay cash directly to the delivery driver upon receiving your hot meal.',
  },
};

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-101',
    orderId: 'order-101',
    orderNumber: '#FG-89421',
    customerName: 'Sophia Patel',
    amount: 18.19,
    paymentMethod: 'card',
    status: 'Paid',
    date: '2026-08-18 12:15 PM',
    details: 'Online Card Payment verified',
  },
  {
    id: 'pay-102',
    orderId: 'order-102',
    orderNumber: '#FG-77312',
    customerName: 'Alex Johnson',
    amount: 28.79,
    paymentMethod: 'upi',
    status: 'Paid',
    date: '2026-08-17 07:45 PM',
    details: 'UPI Transaction #UPI98472910 confirmed by Admin',
  },
];

const INITIAL_SUPPORT_CONVERSATIONS: SupportConversation[] = [
  {
    id: 'conv-sophia',
    customerName: 'Sophia Patel',
    customerEmail: 'sophiapatel@gmail.com',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'Open',
    lastMessage: 'Ok, thanks you for your support',
    updatedAt: '2026-08-18T12:20:00.000Z',
    messages: [
      { id: 'msg-1', sender: 'agent', text: 'Hi, how can I help you?', time: '28 mins ago' },
      { id: 'msg-2', sender: 'user', text: 'Hello, I ordered two fried chicken burgers. can I know how much time it will get to arrive?', time: '27 mins ago' },
      { id: 'msg-3', sender: 'agent', text: 'Ok, please let me check!', time: '26 mins ago' },
      { id: 'msg-4', sender: 'user', text: 'Sure...', time: '26 mins ago' },
      { id: 'msg-5', sender: 'agent', text: 'It’ll get 25 minutes to arrive to your address', time: '26 mins ago' },
      { id: 'msg-6', sender: 'user', text: 'Ok, thanks you for your support', time: 'Just now' },
    ],
  },
];

const INITIAL_ORDERS_LIST: Order[] = [
  {
    id: 'order-101',
    orderNumber: '#FG-89421',
    date: 'Today, 12:15 PM',
    items: [
      {
        id: 'cart-init-1',
        productId: 'cheeseburger-wendy',
        name: 'Cheeseburger',
        subtitle: "Wendy's Burger",
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        basePrice: 8.24,
        portion: 2,
        spiceLevel: 55,
        unitPrice: 8.24,
        totalPrice: 16.48,
        selectedVariant: {
          groupId: 'wendy-size-group',
          groupName: 'Choose Size',
          optionId: 'w-reg',
          optionName: 'Regular (Single Patty)',
          price: 8.24,
          priceType: 'fixed',
        },
        selectedOptions: [],
      },
    ],
    subtotal: 16.48,
    taxes: 0.3,
    deliveryFees: 1.5,
    total: 18.19,
    estimatedDelivery: '15 - 30mins',
    paymentMethod: 'card',
    paymentStatus: 'Paid',
    status: 'In Transit',
    customerName: 'Sophia Patel',
    customerEmail: 'sophiapatel@gmail.com',
    customerPhone: '+1 (555) 234-5678',
    customerAddress: '123 Main St Apartment 4A, New York, NY',
  },
  {
    id: 'order-102',
    orderNumber: '#FG-77312',
    date: 'Yesterday, 07:45 PM',
    items: [
      {
        id: 'cart-init-2',
        productId: 'fried-chicken-burger',
        name: 'Hamburger',
        subtitle: 'Fried Chicken Burger',
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
        basePrice: 26.99,
        portion: 1,
        spiceLevel: 45,
        unitPrice: 26.99,
        totalPrice: 26.99,
        selectedVariant: {
          groupId: 'fried-size-group',
          groupName: 'Combo Portions',
          optionId: 'fc-duo',
          optionName: 'Duo Feast (2 Burgers + Large Fries)',
          price: 26.99,
          priceType: 'fixed',
        },
        selectedOptions: [],
      },
    ],
    subtotal: 26.99,
    taxes: 0.3,
    deliveryFees: 1.5,
    total: 28.79,
    estimatedDelivery: 'Delivered',
    paymentMethod: 'upi',
    paymentStatus: 'Paid',
    status: 'Delivered',
    customerName: 'Alex Johnson',
    customerEmail: 'alex.j@example.com',
    customerPhone: '+1 (555) 891-2345',
    customerAddress: '742 Evergreen Terrace, Brooklyn, NY',
  },
];

export const INITIAL_DELIVERY_SETTINGS: DeliverySettings = {
  slots: [
    { id: 'slot-1', timeLabel: '1:00 PM', fee: 0, active: true, order: 1 },
    { id: 'slot-2', timeLabel: '3:00 PM', fee: 0, active: true, order: 2 },
    { id: 'slot-3', timeLabel: '5:00 PM', fee: 0, active: true, order: 3 },
  ],
  urgentDelivery: {
    enabled: true,
    fee: 30.00,
    label: 'Urgent Delivery (15-25 mins)',
  },
};

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Foodgo',
  storeOpen: true,
  deliveryFee: 0,
  taxRate: 0.30,
  minOrder: 5.00,
  currency: '₹',
  contactEmail: 'support@foodgo.com',
  contactPhone: '+91 98765 43210',
  address: 'Foodgo Gourmet Kitchen, Main Road, Calicut, Kerala',
  paymentSettings: INITIAL_PAYMENT_SETTINGS,
  deliverySettings: INITIAL_DELIVERY_SETTINGS,
};

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    action: 'SYSTEM_INITIALIZATION',
    details: 'Foodgo Admin System initialized with payment gateway & dynamic variants engine',
    admin: 'System',
    timestamp: '2026-08-18 09:00:00',
  },
];

class Database {
  private data: DbSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DbSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure admin user
        parsed.admins = [
          {
            username: 'Anasasiq',
            passwordHash: INITIAL_ADMIN_PASSWORD_HASH,
            name: 'Anas Asiq',
            role: 'Super Administrator',
          },
        ];

        // Ensure optionTemplates exists
        if (!parsed.optionTemplates || parsed.optionTemplates.length === 0) {
          parsed.optionTemplates = INITIAL_OPTION_TEMPLATES;
        }

        // Ensure paymentSettings exists
        if (!parsed.settings.paymentSettings) {
          parsed.settings.paymentSettings = INITIAL_PAYMENT_SETTINGS;
        }

        // Ensure deliverySettings exists
        if (!parsed.settings.deliverySettings) {
          parsed.settings.deliverySettings = INITIAL_DELIVERY_SETTINGS;
        }

        // Ensure products have option groups & customization sections if missing
        if (parsed.products && parsed.products.length > 0) {
          parsed.products.forEach((p: AdminProduct) => {
            const matchedInit = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
            if (!p.optionGroups && matchedInit?.optionGroups) {
              p.optionGroups = matchedInit.optionGroups;
            }
            if ((!p.customizationSections || p.customizationSections.length === 0) && matchedInit?.customizationSections) {
              p.customizationSections = matchedInit.customizationSections;
            }
            if (p.customOrderEnabled === undefined && matchedInit?.customOrderEnabled !== undefined) {
              p.customOrderEnabled = matchedInit.customOrderEnabled;
            }
            if (p.customOrderSortOrder === undefined && matchedInit?.customOrderSortOrder !== undefined) {
              p.customOrderSortOrder = matchedInit.customOrderSortOrder;
            }
            if (!p.curryConfig && matchedInit?.curryConfig) {
              p.curryConfig = matchedInit.curryConfig;
            }
          });

          // Ensure any initial products (like Porotta, Pazhampori, Biriyani, Shawarma, and multi-module items) exist
          INITIAL_PRODUCTS.forEach((initProd) => {
            const existing = parsed.products.find((p: AdminProduct) => p.id === initProd.id);
            if (!existing) {
              parsed.products.push(initProd);
            } else {
              if (!existing.moduleId && initProd.moduleId) existing.moduleId = initProd.moduleId;
              if (!existing.curryConfig && initProd.curryConfig) existing.curryConfig = initProd.curryConfig;
            }
          });

          parsed.products.forEach((p: AdminProduct) => {
            if (!p.moduleId) p.moduleId = 'food';
          });
        } else {
          parsed.products = INITIAL_PRODUCTS;
        }

        // Ensure curries exist and are synced
        if (Array.isArray(parsed.curries)) {
          INITIAL_CURRIES.forEach((initCurry) => {
            const existing = parsed.curries.find((c: CurryOption) => c.id === initCurry.id);
            if (!existing) {
              parsed.curries.push(initCurry);
            }
          });
        } else {
          parsed.curries = INITIAL_CURRIES;
        }

        // Ensure modules exist and are synced
        if (Array.isArray(parsed.modules)) {
          INITIAL_MODULES.forEach((initMod) => {
            const existing = parsed.modules.find((m: AppModule) => m.id === initMod.id);
            if (!existing) {
              parsed.modules.push(initMod);
            }
          });
        } else {
          parsed.modules = INITIAL_MODULES;
        }

        // Ensure all initial categories exist
        if (Array.isArray(parsed.categories)) {
          INITIAL_CATEGORIES.forEach((initCat) => {
            const existing = parsed.categories.find((c: CategoryItem) => c.id === initCat.id);
            if (!existing) {
              parsed.categories.push(initCat);
            } else if (!existing.moduleId && initCat.moduleId) {
              existing.moduleId = initCat.moduleId;
            }
          });
          parsed.categories.forEach((c: CategoryItem) => {
            if (!c.moduleId) c.moduleId = 'food';
          });
        } else {
          parsed.categories = INITIAL_CATEGORIES;
        }

        return parsed;
      }
    } catch (e) {
      console.error('Error loading database.json, initializing fresh store', e);
    }

    const defaultDb: DbSchema = {
      admins: [
        {
          username: 'Anasasiq',
          passwordHash: INITIAL_ADMIN_PASSWORD_HASH,
          name: 'Anas Asiq',
          role: 'Super Administrator',
        },
      ],
      sessions: {},
      modules: INITIAL_MODULES,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      curries: INITIAL_CURRIES,
      optionTemplates: INITIAL_OPTION_TEMPLATES,
      toppings: INITIAL_TOPPINGS,
      sides: INITIAL_SIDES,
      orders: INITIAL_ORDERS_LIST,
      customers: INITIAL_CUSTOMERS,
      payments: INITIAL_PAYMENTS,
      supportConversations: INITIAL_SUPPORT_CONVERSATIONS,
      settings: INITIAL_SETTINGS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };

    this.saveData(defaultDb);
    return defaultDb;
  }

  private saveData(dataToSave: DbSchema) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing database.json', e);
    }
  }

  public getDb(): DbSchema {
    return this.data;
  }

  public save(): void {
    this.saveData(this.data);
  }

  public addAuditLog(action: string, details: string, admin: string = 'Anasasiq', ip?: string) {
    const log: AuditLogItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      details,
      admin,
      timestamp: new Date().toLocaleString(),
      ip,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
  }
}

export const db = new Database();

