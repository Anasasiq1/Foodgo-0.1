import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, SlidersHorizontal, Star, Heart, MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { motion, AnimatePresence } from 'motion/react';

export const HomeScreen: React.FC = () => {
  const {
    products,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    openProductDetail,
    isFavorite,
    toggleFavorite,
    user,
    navigateTo,
    unreadSupportCount,
    modules,
    activeModule,
    setActiveModuleId,
  } = useApp();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };

    if (isSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSwitcherOpen]);

  // Active modules from backend (filtered for active !== false)
  const activeModulesList = useMemo(() => {
    return (modules || [])
      .filter((m) => m.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [modules]);

  // Derive categories for the current active module
  const moduleCategories = useMemo(() => {
    // 1. From backend categories
    const backendCats = (categories || [])
      .filter(
        (c) =>
          c.active !== false &&
          (c.moduleId === activeModule?.id || (!c.moduleId && (activeModule?.id === 'food' || !activeModule)))
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((c) => c.name);

    if (backendCats.length > 0) {
      return backendCats.includes('All') ? backendCats : ['All', ...backendCats];
    }

    // 2. Extract from products belonging to this module
    const currentModuleProds = products.filter(
      (p) => p.moduleId === activeModule?.id || (!p.moduleId && (activeModule?.id === 'food' || !activeModule))
    );
    const uniqueCats = Array.from(new Set(currentModuleProds.map((p) => p.category))).filter(Boolean);
    if (uniqueCats.length > 0) {
      return ['All', ...uniqueCats];
    }

    return ['All', 'Combos', 'Sliders', 'Classic'];
  }, [categories, products, activeModule]);

  // Filter products by active module, category, and search query
  const moduleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesModule =
        p.moduleId === activeModule?.id || (!p.moduleId && (activeModule?.id === 'food' || !activeModule));
      return matchesModule && p.available !== false;
    });
  }, [products, activeModule]);

  const filteredProducts = useMemo(() => {
    return moduleProducts.filter((p) => {
      const matchesCategory =
        activeCategory === 'All' ||
        p.category.toLowerCase() === activeCategory.toLowerCase() ||
        (activeCategory === 'Combos' && p.id.includes('chicken'));

      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [moduleProducts, activeCategory, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col pb-28">
      {/* Top Header with Inline Module Switcher */}
      <div className="px-6 pt-7 pb-3 flex items-start justify-between">
        <div>
          {/* Line 1: Brand Title */}
          <h1 className="text-[32px] leading-tight font-logo text-[#322A2E] tracking-tight">
            {activeModule?.title || 'HM-Q Foodgo'}
          </h1>

          {/* Line 2: Tagline / Subtitle */}
          <p className="text-sm font-semibold text-[#8E8E93] mt-0.5">
            {activeModule?.tagline || 'Order your favourite food!'}
          </p>

          {/* Line 3: Clickable Module Switcher Dropdown Button */}
          <div className="relative inline-block mt-2" ref={switcherRef}>
            <button
              id="header-module-switcher-btn"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#EF2A39] bg-red-50 hover:bg-red-100/80 active:bg-red-200/60 border border-red-100/80 transition-all cursor-pointer select-none group shadow-2xs"
              aria-label="Switch service module"
              aria-expanded={isSwitcherOpen}
            >
              <span className="flex items-center gap-1">
                <span className="text-[13px]">{activeModule?.icon || '🍔'}</span>
                <span>{activeModule?.name || 'Food'}</span>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#EF2A39] transition-transform duration-200 ${
                  isSwitcherOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            <AnimatePresence>
              {isSwitcherOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-8 z-50 mt-1 w-64 bg-white rounded-2xl p-2 shadow-[0_12px_32px_rgba(0,0,0,0.14)] border border-gray-100/90"
                >
                  <div className="px-3 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E8E93]">
                      Select Service
                    </span>
                    <span className="text-[10px] font-bold text-[#EF2A39]">
                      {activeModulesList.length} Services
                    </span>
                  </div>

                  <div className="space-y-0.5 max-h-60 overflow-y-auto no-scrollbar">
                    {activeModulesList.map((m) => {
                      const isCurrent = (activeModule?.id || 'food') === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setActiveModuleId(m.id);
                            setIsSwitcherOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-red-50 text-[#EF2A39] font-black'
                              : 'text-[#322A2E] hover:bg-gray-50 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base shrink-0">{m.icon || '🛍️'}</span>
                            <div className="truncate">
                              <p className={`text-xs truncate ${isCurrent ? 'text-[#EF2A39] font-black' : 'text-[#322A2E]'}`}>
                                {m.name}
                              </p>
                              <p className="text-[10px] text-[#8E8E93] truncate font-medium">
                                {m.subtitle || 'Powered by HM-Q'}
                              </p>
                            </div>
                          </div>

                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-[#EF2A39] shrink-0 shadow-xs" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Profile Avatar & Support */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => navigateTo('support')}
            className="relative w-10 h-10 rounded-full bg-[#F4F5F7] hover:bg-[#ECEEF2] flex items-center justify-center text-[#322A2E] transition-all active:scale-95 shadow-xs"
            title="Customer Support Chat"
            aria-label="Customer Support"
          >
            <MessageCircle className="w-5 h-5 text-[#322A2E]" />
            {unreadSupportCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF2A39] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {unreadSupportCount > 9 ? '9+' : unreadSupportCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => navigateTo('profile')}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-transform active:scale-95 focus:outline-none"
            aria-label="Sophia Patel Profile"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="px-6 py-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[54px] bg-white rounded-2xl px-4 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100/70 focus-within:border-[#EF2A39]/50 transition-all">
            <Search className="w-5 h-5 text-[#322A2E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeModule?.name || 'menu'}...`}
              className="w-full bg-transparent text-sm font-medium text-[#322A2E] placeholder-[#9CA3AF] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Red Filter Button: Cycles Categories */}
          <button
            onClick={() => {
              const idx = moduleCategories.indexOf(activeCategory);
              const nextCat = moduleCategories[(idx + 1) % moduleCategories.length];
              setActiveCategory(nextCat);
            }}
            className="w-[54px] h-[54px] bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl flex items-center justify-center shadow-[0_6px_16px_rgba(239,42,57,0.35)] transition-transform active:scale-95 cursor-pointer"
            aria-label="Filter Options"
            title="Filter Category"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Dynamic Category Pills Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {moduleCategories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-[#EF2A39] text-white shadow-[0_4px_14px_rgba(239,42,57,0.35)]'
                    : 'bg-[#F4F5F7] text-[#6A6A6A] hover:bg-[#EBEEF2]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Module Banner Card */}
      <div className="px-6 pb-4">
        <div
          onClick={() => {
            if (activeModule?.id === 'food' || !activeModule) {
              navigateTo('customize');
            } else if (filteredProducts.length > 0) {
              openProductDetail(filteredProducts[0].id);
            }
          }}
          className="w-full bg-[#322A2E] text-white rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_20px_rgba(50,42,46,0.2)] cursor-pointer hover:bg-[#2A2327] transition-all group active:scale-[0.99]"
        >
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 text-[#EF2A39] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeModule?.bannerBadge || (activeModule?.id === 'food' || !activeModule ? 'Burger Builder' : `${activeModule?.name} Special`)}</span>
            </div>
            <h3 className="text-base font-bold text-white leading-tight">
              {activeModule?.bannerTitle || (activeModule?.id === 'food' || !activeModule ? 'Customize Your Burger' : `Explore ${activeModule?.name || 'Items'}`)}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              {activeModule?.bannerSubtitle || (activeModule?.id === 'food' || !activeModule ? 'Choose your toppings, sides & spice' : (activeModule?.tagline || 'Fast delivery to your doorstep'))}
            </p>
          </div>
          <span className="px-3.5 py-2 bg-[#EF2A39] group-hover:bg-[#D81C2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0">
            {activeModule?.bannerAction || (activeModule?.id === 'food' || !activeModule ? 'Build Now →' : 'Shop Now →')}
          </span>
        </div>
      </div>

      {/* Products Two-Column Grid */}
      <div className="px-6 pt-1">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#8E8E93] text-base font-semibold">
              No items found in {activeModule?.name || 'service'} for "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-3 text-sm text-[#EF2A39] font-bold underline cursor-pointer"
            >
              Show all items
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredProducts.map((product) => {
              const favorite = isFavorite(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => openProductDetail(product.id)}
                  className="bg-white rounded-[26px] p-3 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100/80 cursor-pointer hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all active:scale-[0.98] group"
                >
                  {/* Item Image */}
                  <div className="w-full aspect-square flex items-center justify-center p-1.5 overflow-hidden rounded-2xl bg-gray-50/50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)] transition-transform group-hover:scale-105 duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Info Area */}
                  <div className="mt-2">
                    <h3 className="text-[15px] font-extrabold text-[#322A2E] leading-tight truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#8E8E93] font-medium mt-0.5 truncate">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Rating & Favorite Heart Bottom Row */}
                  <div className="mt-3 pt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#FA9E14] text-[#FA9E14]" />
                      <span className="text-xs font-extrabold text-[#322A2E]">
                        {product.rating}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="p-1 rounded-full text-[#322A2E] hover:text-[#EF2A39] transition-transform active:scale-125 cursor-pointer"
                      aria-label="Toggle Favorite"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          favorite
                            ? 'fill-[#EF2A39] text-[#EF2A39]'
                            : 'text-[#322A2E]'
                        }`}
                        strokeWidth={favorite ? 2.5 : 2}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

