import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Search,
  Star,
  Minus,
  Plus,
  Check,
  Layers,
} from 'lucide-react';
import { CartItem, Product, OptionGroup, ProductOption, SelectedOptionItem } from '../types';

export const ProductDetailScreen: React.FC = () => {
  const {
    products,
    selectedProductId,
    goBack,
    navigateTo,
    setDirectCheckoutItem,
    addToCart,
  } = useApp();

  const product: Product =
    products.find((p) => p.id === selectedProductId) || products[0];

  const [portion, setPortion] = useState<number>(product?.defaultPortion || 1);

  // Dynamic Option Groups state: map of groupId -> array of selected optionIds
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string[]>>({});

  // Initialize default selections when product changes
  useEffect(() => {
    if (!product) return;
    setPortion(product.defaultPortion || 1);

    const initialSelections: Record<string, string[]> = {};
    if (product.optionGroups && product.optionGroups.length > 0) {
      product.optionGroups.forEach((grp) => {
        const defaultOpt = grp.options.find((o) => o.isDefault && o.available !== false) ||
          (grp.required ? grp.options.find((o) => o.available !== false) : undefined);
        if (defaultOpt) {
          initialSelections[grp.id] = [defaultOpt.id];
        } else {
          initialSelections[grp.id] = [];
        }
      });
    }
    setSelectedOptionIds(initialSelections);
  }, [product?.id]);

  // Handle single and multiple selections for Option Groups
  const handleSelectOption = (group: OptionGroup, option: ProductOption) => {
    if (option.available === false) return;

    setSelectedOptionIds((prev) => {
      const currentSelected = prev[group.id] || [];

      if (group.selectionType === 'single') {
        if (group.required) {
          return { ...prev, [group.id]: [option.id] };
        } else {
          const isSelected = currentSelected.includes(option.id);
          return { ...prev, [group.id]: isSelected ? [] : [option.id] };
        }
      } else {
        const isSelected = currentSelected.includes(option.id);
        if (isSelected) {
          if (group.required && currentSelected.length <= (group.minSelections || 1)) {
            return prev;
          }
          return {
            ...prev,
            [group.id]: currentSelected.filter((id) => id !== option.id),
          };
        } else {
          if (group.maxSelections && currentSelected.length >= group.maxSelections) {
            if (group.maxSelections === 1) {
              return { ...prev, [group.id]: [option.id] };
            }
            return prev;
          }
          return {
            ...prev,
            [group.id]: [...currentSelected, option.id],
          };
        }
      }
    });
  };

  // Calculate Unit Price based on base product + selected variants & modifiers
  const { unitPrice, selectedVariantSnapshot, selectedOptionsList } = useMemo(() => {
    if (!product) {
      return { unitPrice: 0, selectedVariantSnapshot: undefined, selectedOptionsList: [] };
    }

    let effectiveBasePrice = product.price;
    let addOnsPrice = 0;
    let mainVariant: SelectedOptionItem | undefined = undefined;
    const allOptions: SelectedOptionItem[] = [];

    if (product.optionGroups) {
      product.optionGroups.forEach((grp) => {
        const selectedIds = selectedOptionIds[grp.id] || [];
        selectedIds.forEach((optId) => {
          const opt = grp.options.find((o) => o.id === optId);
          if (opt) {
            const snap: SelectedOptionItem = {
              groupId: grp.id,
              groupName: grp.name,
              optionId: opt.id,
              optionName: opt.name,
              price: opt.price,
              priceType: opt.priceType,
            };
            allOptions.push(snap);

            if (opt.priceType === 'fixed') {
              effectiveBasePrice = opt.price;
              mainVariant = snap;
            } else {
              addOnsPrice += opt.price;
            }
          }
        });
      });
    }

    const calculatedUnit = Number((effectiveBasePrice + addOnsPrice).toFixed(2));
    return {
      unitPrice: calculatedUnit,
      selectedVariantSnapshot: mainVariant,
      selectedOptionsList: allOptions,
    };
  }, [product, selectedOptionIds]);

  const totalPrice = Number((unitPrice * portion).toFixed(2));

  // Check required groups constraint
  const isMissingRequired = useMemo(() => {
    if (!product?.optionGroups) return false;
    for (const grp of product.optionGroups) {
      if (grp.required) {
        const sel = selectedOptionIds[grp.id] || [];
        const min = grp.minSelections || 1;
        if (sel.length < min) return true;
      }
    }
    return false;
  }, [product, selectedOptionIds]);

  const handleOrderNow = () => {
    if (!product) return;
    if (isMissingRequired) {
      alert('Please select the required options before placing order.');
      return;
    }

    const item: CartItem = {
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      image: product.image,
      basePrice: product.price,
      portion,
      selectedVariant: selectedVariantSnapshot,
      selectedOptions: selectedOptionsList,
      unitPrice,
      totalPrice,
      isCustom: false,
    };

    addToCart(item);
    setDirectCheckoutItem(item);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (isMissingRequired) {
      alert('Please select the required options before adding to cart.');
      return;
    }

    const item: CartItem = {
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      image: product.image,
      basePrice: product.price,
      portion,
      selectedVariant: selectedVariantSnapshot,
      selectedOptions: selectedOptionsList,
      unitPrice,
      totalPrice,
      isCustom: false,
    };

    addToCart(item);
    navigateTo('home');
  };

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 text-center">
        <p className="text-sm font-bold text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between pb-6">
      {/* Main Content Area */}
      <div className="pb-28">
        {/* Top Bar */}
        <div className="px-6 pt-7 pb-2 flex items-center justify-between">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Hero Product Image */}
        <div className="w-full px-6 pt-2 pb-5 flex items-center justify-center">
          <div className="w-[280px] h-[240px] flex items-center justify-center relative">
            <img
              src={product.image}
              alt={`${product.name} ${product.subtitle}`}
              className="max-w-full max-h-full object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.18)] transition-transform hover:scale-105 duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Product Header Info */}
        <div className="px-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-[26px] font-extrabold text-[#322A2E] leading-tight">
                {product.name} {product.subtitle}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Star className="w-4 h-4 fill-[#FA9E14] text-[#FA9E14]" />
                <span className="text-sm font-bold text-[#322A2E]">
                  {product.rating}
                </span>
                <span className="text-sm text-[#8E8E93] font-medium">—</span>
                <span className="text-sm font-semibold text-[#8E8E93]">
                  {product.prepTime}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-gray-400 font-bold block">Base Price</span>
              <span className="text-lg font-black text-[#EF2A39]">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3.5 text-[13.5px] leading-relaxed text-[#6A6A6A] font-normal">
            {product.description}
          </p>

          {/* Product Option Groups (e.g. Size, Drinks, Add-ons) */}
          {product.optionGroups && product.optionGroups.length > 0 && (
            <div className="mt-6 space-y-5">
              {product.optionGroups.map((group) => {
                const selectedIds = selectedOptionIds[group.id] || [];
                return (
                  <div
                    key={group.id}
                    className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 shadow-xs"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#EF2A39]" />
                        <h3 className="text-xs font-black text-[#322A2E] uppercase tracking-wide">
                          {group.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {group.required ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-[#EF2A39]">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">
                            Optional
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {group.selectionType === 'single'
                            ? '(Select 1)'
                            : `(Up to ${group.maxSelections || 'unlimited'})`}
                        </span>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-[11px] text-gray-500 mb-3">
                        {group.description}
                      </p>
                    )}

                    {/* Option Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map((opt) => {
                        const isSelected = selectedIds.includes(opt.id);
                        const isUnavailable = opt.available === false;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(group, opt)}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                              isUnavailable
                                ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-white border-[#EF2A39] shadow-[0_2px_10px_rgba(239,42,57,0.12)] ring-1 ring-[#EF2A39]'
                                : 'bg-white/80 border-gray-200/80 hover:border-gray-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-${
                                  group.selectionType === 'single' ? 'full' : 'md'
                                } border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-[#EF2A39] border-[#EF2A39] text-white'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-[#322A2E] leading-tight">
                                  {opt.name}
                                </h4>
                                {opt.description && (
                                  <p className="text-[10px] text-gray-400">
                                    {opt.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              {isUnavailable ? (
                                <span className="text-[10px] font-bold text-gray-400">
                                  Sold Out
                                </span>
                              ) : opt.priceType === 'fixed' ? (
                                <span className="text-xs font-extrabold text-[#322A2E]">
                                  ${opt.price.toFixed(2)}
                                </span>
                              ) : opt.price > 0 ? (
                                <span className="text-xs font-bold text-[#EF2A39]">
                                  +${opt.price.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-600">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Clean Portion Counter for standard products (no spicy level here) */}
          <div className="mt-6 flex items-center justify-between bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100/90 shadow-xs">
            <div>
              <span className="block text-xs font-black text-[#322A2E]">
                Quantity / Portions
              </span>
              <span className="text-[11px] text-[#8E8E93] font-medium">
                Standard dish portion count
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPortion((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-xl bg-[#EF2A39] hover:bg-[#D81C2B] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(239,42,57,0.3)] transition-transform active:scale-90 cursor-pointer"
                aria-label="Decrease portion"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <span className="text-base font-extrabold text-[#322A2E] min-w-[20px] text-center">
                {portion}
              </span>

              <button
                onClick={() => setPortion((p) => p + 1)}
                className="w-9 h-9 rounded-xl bg-[#EF2A39] hover:bg-[#D81C2B] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(239,42,57,0.3)] transition-transform active:scale-90 cursor-pointer"
                aria-label="Increase portion"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] z-20">
        <div className="flex items-center gap-3">
          {/* Price Badge */}
          <div className="h-[52px] px-5 bg-[#EF2A39] text-white rounded-2xl flex flex-col items-center justify-center shadow-[0_6px_20px_rgba(239,42,57,0.3)] shrink-0">
            <span className="text-[10px] font-bold leading-none opacity-90">Total</span>
            <span className="text-lg font-black leading-tight">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isMissingRequired}
            className="h-[52px] px-4 bg-[#F4F5F7] hover:bg-gray-200 text-[#322A2E] rounded-2xl flex items-center justify-center text-xs font-black tracking-wide transition-colors cursor-pointer"
          >
            + Cart
          </button>

          {/* Order Now Button */}
          <button
            onClick={handleOrderNow}
            disabled={isMissingRequired}
            className={`flex-1 h-[52px] rounded-2xl flex items-center justify-center text-xs font-extrabold tracking-wider uppercase transition-all shadow-[0_6px_20px_rgba(50,42,46,0.25)] active:scale-[0.98] cursor-pointer ${
              isMissingRequired
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-[#322A2E] hover:bg-[#251E22] text-white'
            }`}
          >
            ORDER NOW
          </button>
        </div>
      </div>
    </div>
  );
};
