import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  UserProfile,
  PaymentCard,
  Order,
  ChatMessage,
  AppScreen,
  AppModule,
  CurryOption,
} from '../types';
import {
  PRODUCTS as DEFAULT_PRODUCTS,
  INITIAL_USER,
  INITIAL_PAYMENT_CARDS,
  INITIAL_SUPPORT_MESSAGES,
  INITIAL_ORDERS,
} from '../data/products';

export interface CategoryItem {
  id: string;
  name: string;
  order: number;
  active: boolean;
  moduleId?: string;
}

const DEFAULT_MODULES: AppModule[] = [
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

interface AppContextType {
  screen: AppScreen;
  screenHistory: AppScreen[];
  navigateTo: (screen: AppScreen, clearHistory?: boolean) => void;
  goBack: () => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  openProductDetail: (id: string) => void;

  // Modules & Multi-Service Switching
  modules: AppModule[];
  activeModuleId: string;
  activeModule: AppModule | null;
  setActiveModuleId: (id: string) => void;
  refreshModules: () => Promise<void>;
  
  // Curries & Salna Level
  curries: CurryOption[];
  refreshCurries: () => Promise<void>;

  // Products & Filter
  products: Product[];
  categories: CategoryItem[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshProducts: () => void;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, portion: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Active Pending Item for Checkout/Direct Order
  pendingOrder: {
    items: CartItem[];
    subtotal: number;
    taxes: number;
    deliveryFees: number;
    total: number;
    estimatedDelivery: string;
  } | null;
  setDirectCheckoutItem: (item: CartItem) => void;
  
  // User & Cards
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  paymentCards: PaymentCard[];
  selectedCardType: 'mastercard' | 'visa' | 'upi';
  setSelectedCardType: (type: 'mastercard' | 'visa' | 'upi') => void;
  addPaymentCard: (card: Omit<PaymentCard, 'id'>) => void;
  deletePaymentCard: (id: string) => void;
  saveCardForFuture: boolean;
  setSaveCardForFuture: (save: boolean) => void;
  
  // Orders
  orders: Order[];
  createOrder: () => Promise<Order>;
  lastPlacedOrder: Order | null;
  
  // Success Modal
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (open: boolean) => void;
  closeSuccessModal: () => void;
  
  // Chat Support
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  sendTextMessage: (text: string, orderId?: string, orderNumber?: string) => Promise<void>;
  sendVoiceMessage: (audioUrl: string, duration: number, orderId?: string, orderNumber?: string) => Promise<void>;
  markSupportAsRead: () => Promise<void>;
  fetchSupportMessages: () => Promise<void>;
  unreadSupportCount: number;
  
  // Reset demo
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Splash starts first, then auto-transitions to home
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [screenHistory, setScreenHistory] = useState<AppScreen[]>(['home']);
  const [selectedProductId, setSelectedProductId] = useState<string>('cheeseburger-wendy');
  
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [curries, setCurries] = useState<CurryOption[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modules & Multi-Service State
  const [modules, setModules] = useState<AppModule[]>(DEFAULT_MODULES);
  const [activeModuleId, setActiveModuleIdState] = useState<string>(() => {
    try {
      return localStorage.getItem('foodgo_active_module') || 'food';
    } catch {
      return 'food';
    }
  });

  const setActiveModuleId = useCallback((id: string) => {
    setActiveModuleIdState(id);
    setActiveCategory('All');
    try {
      localStorage.setItem('foodgo_active_module', id);
    } catch {
      // Ignore
    }
  }, []);

  const activeModule = modules.find((m) => m.id === activeModuleId && m.active !== false) ||
    modules.find((m) => m.active !== false) ||
    modules[0] ||
    null;
  
  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('foodgo_favs');
      return saved ? JSON.parse(saved) : ['cheeseburger-wendy'];
    } catch {
      return ['cheeseburger-wendy'];
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('foodgo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('foodgo_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('foodgo_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Cards
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(() => {
    try {
      const saved = localStorage.getItem('foodgo_cards');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_CARDS;
    } catch {
      return INITIAL_PAYMENT_CARDS;
    }
  });
  const [selectedCardType, setSelectedCardType] = useState<'mastercard' | 'visa' | 'upi'>('mastercard');
  const [saveCardForFuture, setSaveCardForFuture] = useState<boolean>(true);

  // Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Direct checkout item
  const [directCheckoutItem, setDirectCheckoutItemState] = useState<CartItem | null>(null);

  // Chat & Support
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('foodgo_chat');
      return saved ? JSON.parse(saved) : INITIAL_SUPPORT_MESSAGES;
    } catch {
      return INITIAL_SUPPORT_MESSAGES;
    }
  });
  const [unreadSupportCount, setUnreadSupportCount] = useState<number>(0);

  // Fetch live support messages from backend
  const fetchSupportMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/support?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
          if (typeof data.unreadCountCustomer === 'number') {
            setUnreadSupportCount(data.unreadCountCustomer);
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }, [user.email, user.name]);

  // Mark support messages as read
  const markSupportAsRead = useCallback(async () => {
    setUnreadSupportCount(0);
    try {
      await fetch('/api/support/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer' }),
      });
    } catch {
      // Ignore
    }
  }, []);

  // Fetch live products from backend
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      }
    } catch {
      // Fallback already in state
    }
  }, []);

  // Fetch live modules from backend
  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch('/api/modules');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.modules) && data.modules.length > 0) {
          setModules(data.modules);
        }
      }
    } catch {
      // Fallback in state
    }
  }, []);

  // Fetch live categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Fetch live active curries from backend (Salna level system)
  const fetchCurries = useCallback(async () => {
    try {
      const res = await fetch('/api/curries');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.curries)) {
          setCurries(data.curries);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Fetch live orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Periodic load & polling for live updates
  useEffect(() => {
    fetchModules();
    fetchProducts();
    fetchCategories();
    fetchCurries();
    fetchOrders();
    fetchSupportMessages();

    const interval = setInterval(() => {
      fetchModules();
      fetchProducts();
      fetchCurries();
      fetchOrders();
      fetchSupportMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchModules, fetchProducts, fetchCategories, fetchCurries, fetchOrders, fetchSupportMessages]);

  // Persist storage
  useEffect(() => {
    localStorage.setItem('foodgo_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('foodgo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('foodgo_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('foodgo_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('foodgo_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('foodgo_cards', JSON.stringify(paymentCards));
  }, [paymentCards]);

  // Navigation handlers
  const navigateTo = (newScreen: AppScreen, clearHistory = false) => {
    if (newScreen === screen) return;
    if (clearHistory) {
      setScreenHistory([newScreen]);
    } else {
      setScreenHistory((prev) => [...prev, newScreen]);
    }
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setScreen(prevScreen || 'home');
    } else {
      setScreen('home');
      setScreenHistory(['home']);
    }
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    navigateTo('product-detail');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setCart((prev) => [...prev, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, portion: number) => {
    if (portion <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const singleItemPrice = item.totalPrice / item.portion;
          return {
            ...item,
            portion,
            totalPrice: Number((singleItemPrice * portion).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setDirectCheckoutItemState(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.portion, 0);

  const setDirectCheckoutItem = (item: CartItem) => {
    setDirectCheckoutItemState(item);
    navigateTo('payment');
  };

  // Calculate order preview
  const pendingOrder = (() => {
    if (directCheckoutItem) {
      const subtotal = directCheckoutItem.totalPrice;
      const taxes = 0.3;
      const deliveryFees = 1.5;
      const total = Number((subtotal + taxes + deliveryFees).toFixed(2));
      return {
        items: [directCheckoutItem],
        subtotal,
        taxes,
        deliveryFees,
        total,
        estimatedDelivery: '15 - 30mins',
      };
    }
    if (cart.length > 0) {
      const subtotal = Number(cartTotal.toFixed(2));
      const taxes = 0.3;
      const deliveryFees = 1.5;
      const total = Number((subtotal + taxes + deliveryFees).toFixed(2));
      return {
        items: cart,
        subtotal,
        taxes,
        deliveryFees,
        total,
        estimatedDelivery: '15 - 30mins',
      };
    }
    const defaultProduct = products[0] || DEFAULT_PRODUCTS[0];
    const defaultItem: CartItem = {
      id: 'default-cart-item',
      productId: defaultProduct.id,
      name: defaultProduct.name,
      subtitle: defaultProduct.subtitle,
      image: defaultProduct.image,
      basePrice: defaultProduct.price,
      portion: 2,
      spiceLevel: 55,
      selectedToppings: [],
      selectedSides: [],
      totalPrice: Number((defaultProduct.price * 2).toFixed(2)),
    };
    return {
      items: [defaultItem],
      subtotal: Number((defaultProduct.price * 2).toFixed(2)),
      taxes: 0.3,
      deliveryFees: 1.5,
      total: Number((defaultProduct.price * 2 + 1.8).toFixed(2)),
      estimatedDelivery: '15 - 30mins',
    };
  })();

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const addPaymentCard = (cardData: Omit<PaymentCard, 'id'>) => {
    const newCard: PaymentCard = {
      ...cardData,
      id: 'method-' + Date.now(),
    };
    setPaymentCards((prev) => [...prev, newCard]);
    setSelectedCardType(newCard.type);
  };

  const deletePaymentCard = (id: string) => {
    setPaymentCards((prev) => prev.filter((c) => c.id !== id));
  };

  const createOrder = async (): Promise<Order> => {
    const orderNum = '#FG-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: 'order-' + Date.now(),
      orderNumber: orderNum,
      date: 'Just now',
      items: pendingOrder.items,
      subtotal: pendingOrder.subtotal,
      taxes: pendingOrder.taxes,
      deliveryFees: pendingOrder.deliveryFees,
      total: pendingOrder.total,
      estimatedDelivery: pendingOrder.estimatedDelivery,
      paymentMethod: selectedCardType,
      status: 'In Transit',
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pendingOrder.items,
          subtotal: pendingOrder.subtotal,
          taxes: pendingOrder.taxes,
          deliveryFees: pendingOrder.deliveryFees,
          total: pendingOrder.total,
          paymentMethod: selectedCardType,
          customerName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => [data.order, ...prev]);
        setLastPlacedOrder(data.order);
        setIsSuccessModalOpen(true);
        clearCart();
        return data.order;
      }
    } catch {
      // Fallback local save
    }

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    setIsSuccessModalOpen(true);
    clearCart();
    return newOrder;
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigateTo('home', true);
  };

  const sendTextMessage = async (text: string, orderId?: string, orderNumber?: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderType: 'customer',
      senderName: user.name,
      messageType: 'text',
      text: text.trim(),
      time: timeFormatted,
      timestamp: Date.now(),
      read: true,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Send to backend support endpoint
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'text',
          text: text.trim(),
          customerName: user.name,
          customerEmail: user.email,
          customerAvatar: user.avatar,
          orderId,
          orderNumber,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          // Update message with server ID if available
          setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? data.message : m)));
        }
      }
    } catch {
      // Offline fallback
    }
  };

  const sendVoiceMessage = async (
    audioUrl: string,
    duration: number,
    orderId?: string,
    orderNumber?: string
  ) => {
    if (!audioUrl) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderType: 'customer',
      senderName: user.name,
      messageType: 'audio',
      audioUrl,
      audioDuration: duration,
      text: 'Voice message',
      time: timeFormatted,
      timestamp: Date.now(),
      read: true,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'audio',
          audioUrl,
          audioDuration: duration,
          customerName: user.name,
          customerEmail: user.email,
          customerAvatar: user.avatar,
          orderId,
          orderNumber,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? data.message : m)));
        }
      }
    } catch {
      // Offline fallback
    }
  };

  const sendMessage = (text: string) => {
    sendTextMessage(text);
  };

  const resetToDefaults = () => {
    setUser(INITIAL_USER);
    setFavorites(['cheeseburger-wendy']);
    setCart([]);
    setOrders(INITIAL_ORDERS);
    setMessages(INITIAL_SUPPORT_MESSAGES);
    setSelectedCardType('mastercard');
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        screenHistory,
        navigateTo,
        goBack,
        selectedProductId,
        setSelectedProductId,
        openProductDetail,
        modules,
        activeModuleId,
        activeModule,
        setActiveModuleId,
        refreshModules: fetchModules,
        curries,
        refreshCurries: fetchCurries,
        products,
        categories,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        refreshProducts: fetchProducts,
        favorites,
        toggleFavorite,
        isFavorite,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        cartCount,
        pendingOrder,
        setDirectCheckoutItem,
        user,
        updateUser,
        paymentCards,
        selectedCardType,
        setSelectedCardType,
        addPaymentCard,
        deletePaymentCard,
        saveCardForFuture,
        setSaveCardForFuture,
        orders,
        createOrder,
        lastPlacedOrder,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        closeSuccessModal,
        messages,
        sendMessage,
        sendTextMessage,
        sendVoiceMessage,
        markSupportAsRead,
        fetchSupportMessages,
        unreadSupportCount,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
