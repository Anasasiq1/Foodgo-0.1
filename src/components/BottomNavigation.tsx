import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, ShoppingCart, Heart, Receipt, Plus } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { screen, navigateTo, favorites, cartCount } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto pointer-events-none">
      <div className="relative pointer-events-auto px-0 pb-1">
        {/* Custom Red Curved Bottom Bar */}
        <div className="relative bg-[#EF2A39] text-white h-[68px] rounded-t-[32px] shadow-[0_-4px_24px_rgba(239,42,57,0.25)] flex items-center justify-between px-6">
          {/* Left Side: Home & Cart */}
          <div className="flex items-center gap-8 pl-1">
            {/* Home Tab */}
            <button
              onClick={() => navigateTo('home')}
              className="flex flex-col items-center justify-center p-2 text-white transition-transform active:scale-90 cursor-pointer"
              aria-label="Home"
            >
              <Home
                className={`w-6 h-6 transition-opacity ${
                  screen === 'home' ? 'opacity-100 fill-white' : 'opacity-80'
                }`}
                strokeWidth={screen === 'home' ? 2.5 : 2}
              />
              {screen === 'home' && (
                <span className="w-1.5 h-1.5 bg-white rounded-full mt-0.5"></span>
              )}
            </button>

            {/* Cart Tab (Replaced Profile) */}
            <button
              onClick={() => navigateTo('cart')}
              className="flex flex-col items-center justify-center p-2 text-white transition-transform active:scale-90 relative cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart
                className={`w-6 h-6 transition-opacity ${
                  screen === 'cart'
                    ? 'opacity-100 fill-white/25'
                    : 'opacity-80'
                }`}
                strokeWidth={screen === 'cart' ? 2.5 : 2}
              />
              {/* Dynamic Cart Badge: Shows total item count (e.g. 3) */}
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-[#322A2E] text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-[#EF2A39] shadow-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              {screen === 'cart' && (
                <span className="w-1.5 h-1.5 bg-white rounded-full mt-0.5"></span>
              )}
            </button>
          </div>

          {/* Central Floating Custom Order / Plus Button */}
          <div className="absolute left-1/2 -top-5 -translate-x-1/2">
            <button
              onClick={() => navigateTo('customize')}
              className="relative w-14 h-14 bg-[#EF2A39] text-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(239,42,57,0.45)] border-[4px] border-white transition-transform hover:scale-105 active:scale-95 group cursor-pointer"
              aria-label="Custom Order Food"
              title="Custom Order Food"
            >
              <Plus className="w-7 h-7 stroke-[3] transition-transform group-hover:rotate-90 duration-300" />
            </button>
          </div>

          {/* Right Side: Order History & Favorites */}
          <div className="flex items-center gap-8 pr-1">
            {/* Orders Tab */}
            <button
              onClick={() => navigateTo('order-history')}
              className="flex flex-col items-center justify-center p-2 text-white transition-transform active:scale-90 cursor-pointer"
              aria-label="Orders History"
            >
              <Receipt
                className={`w-6 h-6 transition-opacity ${
                  screen === 'order-history' ? 'opacity-100 fill-white/20' : 'opacity-80'
                }`}
                strokeWidth={2}
              />
              {screen === 'order-history' && (
                <span className="w-1.5 h-1.5 bg-white rounded-full mt-0.5"></span>
              )}
            </button>

            {/* Favorites Tab */}
            <button
              onClick={() => navigateTo('home')}
              className="flex flex-col items-center justify-center p-2 text-white transition-transform active:scale-90 relative cursor-pointer"
              aria-label="Favorites"
            >
              <Heart
                className={`w-6 h-6 transition-opacity ${
                  favorites.length > 0 ? 'opacity-100 fill-white' : 'opacity-80'
                }`}
                strokeWidth={2}
              />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#322A2E] text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

