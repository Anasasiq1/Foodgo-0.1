import { Product, ToppingItem, SideItem, UserProfile, PaymentCard, ChatMessage, Order } from '../types';

import cheeseburgerImg from '../assets/images/cheeseburger_wendy_1787081698053.jpg';
import veggieBurgerImg from '../assets/images/veggie_burger_1787081712713.jpg';
import chickenBurgerImg from '../assets/images/chicken_burger_1787081726601.jpg';
import friedChickenBurgerImg from '../assets/images/fried_chicken_burger_1787081743782.jpg';
import explodedBurgerImg from '../assets/images/exploded_burger_1787081759363.jpg';
import userAvatarImg from '../assets/images/user_avatar_1787081773481.jpg';

export const BURGER_IMAGES = {
  cheeseburger: cheeseburgerImg,
  veggie: veggieBurgerImg,
  chicken: chickenBurgerImg,
  friedChicken: friedChickenBurgerImg,
  exploded: explodedBurgerImg,
  userAvatar: userAvatarImg,
};

export const PRODUCTS: Product[] = [
  {
    id: 'cheeseburger-wendy',
    name: 'Cheeseburger',
    subtitle: "Wendy's Burger",
    category: 'All',
    price: 8.24,
    rating: 4.9,
    prepTime: '26 mins',
    description:
      "The Cheeseburger Wendy's Burger is a classic fast food burger that packs a punch of flavor in every bite. Made with a juicy beef patty cooked to perfection, it's topped with melted American cheese, crispy lettuce, ripe tomato, and crunchy pickles.",
    image: cheeseburgerImg,
    defaultSpice: 55,
    defaultPortion: 2,
  },
  {
    id: 'hamburger-veggie',
    name: 'Hamburger',
    subtitle: 'Veggie Burger',
    category: 'Sliders',
    price: 9.99,
    rating: 4.8,
    prepTime: '14 mins',
    description:
      'Enjoy our delicious Hamburger Veggie Burger, made with a savory blend of fresh vegetables and herbs, topped with crisp lettuce, juicy tomatoes, and tangy pickles, all served on a soft, toasted bun.',
    image: veggieBurgerImg,
    defaultSpice: 60,
    defaultPortion: 1,
  },
  {
    id: 'hamburger-chicken',
    name: 'Hamburger',
    subtitle: 'Chicken Burger',
    category: 'Combos',
    price: 12.48,
    rating: 4.6,
    prepTime: '42 mins',
    description:
      'Our chicken burger is a delicious and healthier alternative to traditional beef burgers, perfect for those looking for a lighter meal option. Try it today and experience the mouth-watering flavors of our Hamburger Chicken Burger!',
    image: chickenBurgerImg,
    defaultSpice: 50,
    defaultPortion: 2,
  },
  {
    id: 'fried-chicken-burger',
    name: 'Hamburger',
    subtitle: 'Fried Chicken Burger',
    category: 'Classic',
    price: 26.99,
    rating: 4.5,
    prepTime: '14 mins',
    description:
      'Indulge in our crispy and savory Fried Chicken Burger, made with a juicy chicken patty, hand-breaded and deep-fried to perfection, served on a warm bun with lettuce, tomato, and a creamy sauce.',
    image: friedChickenBurgerImg,
    defaultSpice: 45,
    defaultPortion: 4,
  },
];

export const TOPPINGS: ToppingItem[] = [
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

export const SIDES: SideItem[] = [
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

export const INITIAL_USER: UserProfile = {
  name: 'Sophia Patel',
  email: 'sophiapatel@gmail.com',
  address: '123 Main St Apartment 4A,New York, NY',
  passwordMasked: '••••••••',
  avatar: userAvatarImg,
  phone: '+1 (555) 234-5678',
};

export const INITIAL_PAYMENT_CARDS: PaymentCard[] = [
  {
    id: 'mastercard-1',
    type: 'mastercard',
    numberMasked: '5105 **** **** 0505',
    holderName: 'Sophia Patel',
    expiry: '09/28',
    isDefault: true,
  },
  {
    id: 'visa-1',
    type: 'visa',
    numberMasked: '3566 **** **** 0505',
    holderName: 'Sophia Patel',
    expiry: '11/27',
    isDefault: false,
  },
  {
    id: 'upi-1',
    type: 'upi',
    numberMasked: 'sophia@okaxis',
    upiId: 'sophia@okaxis',
    holderName: 'Sophia Patel',
    expiry: 'Instant UPI',
    isDefault: false,
  },
];

export const INITIAL_SUPPORT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'agent',
    text: 'Hi, how can I help you?',
    time: '28 mins ago',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Hello, I ordered two fried chicken burgers. can I know how much time it will get to arrive?',
    time: '27 mins ago',
  },
  {
    id: 'msg-3',
    sender: 'agent',
    text: 'Ok, please let me check!',
    time: '26 mins ago',
  },
  {
    id: 'msg-4',
    sender: 'user',
    text: 'Sure...',
    time: '26 mins ago',
  },
  {
    id: 'msg-5',
    sender: 'agent',
    text: 'It’ll get 25 minutes to arrive to your address',
    time: '26 mins ago',
  },
  {
    id: 'msg-6',
    sender: 'user',
    text: 'Ok, thanks you for your support',
    time: 'Just now',
  },
];

export const INITIAL_ORDERS: Order[] = [
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
        image: cheeseburgerImg,
        basePrice: 8.24,
        portion: 2,
        spiceLevel: 55,
        selectedToppings: [],
        selectedSides: [],
        totalPrice: 16.48,
      },
    ],
    subtotal: 16.48,
    taxes: 0.3,
    deliveryFees: 1.5,
    total: 18.19,
    estimatedDelivery: '15 - 30mins',
    paymentMethod: 'mastercard',
    status: 'In Transit',
  },
];
