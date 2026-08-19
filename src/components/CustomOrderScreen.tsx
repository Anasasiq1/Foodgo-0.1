import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Minus,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Star,
  CheckCircle,
  Soup,
  RotateCcw,
} from 'lucide-react';
import {
  Product,
  CustomizationSection,
  CustomizationSectionItem,
  CartItem,
  SelectedSectionChoice,
  SelectedCurrySnapshot,
  CurryOption,
} from '../types';

export const CustomOrderScreen: React.FC = () => {
  const {
    products,
    curries,
    goBack,
    navigateTo,
    addToCart,
    setDirectCheckoutItem,
    cartCount,
  } = useApp();

  // Filter products that have customOrderEnabled or customizationSections
  const customOrderProducts = useMemo(() => {
    const list = products.filter(
      (p) => p.available !== false && (p.customOrderEnabled !== false || (p.customizationSections && p.customizationSections.length > 0))
    );
    return list.length > 0 ? list : products;
  }, [products]);

  // Current active carousel index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentProduct: Product = customOrderProducts[currentIndex] || customOrderProducts[0];

  // Portion and spice level for current product (Only in Custom Order Flow)
  const [portion, setPortion] = useState<number>(1);
  const [spiceLevel, setSpiceLevel] = useState<number>(50);

  // Curry / Salna Level state
  const availableCurries = useMemo<CurryOption[]>(() => {
    const active = (curries || []).filter((c) => c.active !== false);
    if (!currentProduct || !currentProduct.curryConfig) return active;
    const allowed = currentProduct.curryConfig.allowedCurryIds;
    if (Array.isArray(allowed) && allowed.length > 0) {
      return active.filter((c) => allowed.includes(c.id));
    }
    return active;
  }, [curries, currentProduct]);

  const [selectedCurryId, setSelectedCurryId] = useState<string>('');
  // Units of curry per dish/product
  const [curryUnitsPerDish, setCurryUnitsPerDish] = useState<number>(1);
  const [isManualCurryOverride, setIsManualCurryOverride] = useState<boolean>(false);

  // Selected customization items mapped by sectionId -> Array of itemId
  const [selectedSectionItems, setSelectedSectionItems] = useState<{ [sectionId: string]: string[] }>({});

  // Toast feedback state
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Reset/initialize selections whenever active product changes
  useEffect(() => {
    if (!currentProduct) return;
    setPortion(currentProduct.defaultPortion || 1);
    setSpiceLevel(currentProduct.defaultSpice || 50);
    setIsManualCurryOverride(false);

    // Initialize Curry if available
    const curryCfg = currentProduct.curryConfig;
    const isCurryEnabled = curryCfg ? curryCfg.enabled !== false : true;

    if (isCurryEnabled && availableCurries.length > 0) {
      const defId = curryCfg?.defaultCurryId;
      const initialCurry = availableCurries.find((c) => c.id === defId) || availableCurries[0];
      setSelectedCurryId(initialCurry ? initialCurry.id : '');
      const defaultUnits = curryCfg?.defaultCurryPerItem ?? curryCfg?.defaultUnits ?? 1;
      setCurryUnitsPerDish(defaultUnits);
    } else {
      setSelectedCurryId('');
      setCurryUnitsPerDish(0);
    }

    const initialSelections: { [sectionId: string]: string[] } = {};
    if (currentProduct.customizationSections && currentProduct.customizationSections.length > 0) {
      currentProduct.customizationSections.forEach((sec) => {
        const defaultItems = sec.items.filter((it) => it.isDefault && it.available !== false);
        if (defaultItems.length > 0) {
          initialSelections[sec.id] = defaultItems.map((it) => it.id);
        } else if (sec.required && sec.items.length > 0) {
          const firstAvail = sec.items.find((it) => it.available !== false) || sec.items[0];
          if (firstAvail) {
            initialSelections[sec.id] = [firstAvail.id];
          }
        } else {
          initialSelections[sec.id] = [];
        }
      });
    }
    setSelectedSectionItems(initialSelections);
  }, [currentProduct?.id, availableCurries]);

  // Selected Curry Object
  const selectedCurryObj = useMemo(() => {
    if (!selectedCurryId || availableCurries.length === 0) return null;
    return availableCurries.find((c) => c.id === selectedCurryId) || null;
  }, [selectedCurryId, availableCurries]);

  // Handle portion increase/decrease with auto curry synchronization
  const handlePortionChange = (newPortion: number) => {
    const validPortion = Math.max(1, newPortion);
    setPortion(validPortion);
    // If not manually overridden, keep default curry per dish
    if (!isManualCurryOverride && currentProduct) {
      const defUnits = currentProduct.curryConfig?.defaultCurryPerItem ?? currentProduct.curryConfig?.defaultUnits ?? 1;
      setCurryUnitsPerDish(defUnits);
    }
  };

  // Handle manual curry unit adjustment
  const handleCurryUnitsChange = (newUnits: number) => {
    const min = currentProduct?.curryConfig?.minUnits ?? 0;
    const max = currentProduct?.curryConfig?.maxUnits ?? 20;
    const clamped = Math.max(min, Math.min(max, newUnits));
    setCurryUnitsPerDish(clamped);
    setIsManualCurryOverride(true);
  };

  // Reset curry units to product default
  const handleResetCurryToDefault = () => {
    const defUnits = currentProduct?.curryConfig?.defaultCurryPerItem ?? currentProduct?.curryConfig?.defaultUnits ?? 1;
    setCurryUnitsPerDish(defUnits);
    setIsManualCurryOverride(false);
  };

  // Total curry units across all portions
  const totalCurryUnits = curryUnitsPerDish * portion;

  // Curry Snapshot & Price
  const currySnapshot = useMemo<SelectedCurrySnapshot | undefined>(() => {
    if (!selectedCurryObj || curryUnitsPerDish === 0) {
      return undefined;
    }
    const pricePerUnit = selectedCurryObj.pricePerUnit;
    const unitsPerProduct = curryUnitsPerDish;
    const totalUnits = totalCurryUnits;
    const totalPrice = Number((pricePerUnit * totalUnits).toFixed(2));

    return {
      enabled: true,
      curryId: selectedCurryObj.id,
      curryName: selectedCurryObj.name,
      pricePerUnit,
      unitLabel: selectedCurryObj.unitLabel || 'Spoon',
      unitsPerProduct,
      totalUnits,
      totalPrice,
    };
  }, [selectedCurryObj, curryUnitsPerDish, totalCurryUnits]);

  // Carousel navigation handlers
  const handlePrevProduct = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : customOrderProducts.length - 1));
  };

  const handleNextProduct = () => {
    setCurrentIndex((prev) => (prev < customOrderProducts.length - 1 ? prev + 1 : 0));
  };

  // Toggle selection for a section item
  const handleToggleItem = (section: CustomizationSection, item: CustomizationSectionItem) => {
    if (item.available === false) return;

    setSelectedSectionItems((prev) => {
      const currentSelected = prev[section.id] || [];

      if (section.selectionType === 'single') {
        if (currentSelected.includes(item.id)) {
          if (section.required) return prev;
          return { ...prev, [section.id]: [] };
        }
        return { ...prev, [section.id]: [item.id] };
      } else {
        if (currentSelected.includes(item.id)) {
          if (section.required && currentSelected.length <= (section.minSelections || 1)) {
            return prev;
          }
          return {
            ...prev,
            [section.id]: currentSelected.filter((id) => id !== item.id),
          };
        } else {
          const max = section.maxSelections || 99;
          if (currentSelected.length >= max) return prev;
          return {
            ...prev,
            [section.id]: [...currentSelected, item.id],
          };
        }
      }
    });
  };

  // Calculate live single item price and total price
  const { singleItemPrice, totalPrice, chosenSectionChoices } = useMemo(() => {
    if (!currentProduct) {
      return { singleItemPrice: 0, totalPrice: 0, chosenSectionChoices: [] };
    }

    let base = currentProduct.price;
    let addOns = 0;
    const choices: SelectedSectionChoice[] = [];

    if (currentProduct.customizationSections) {
      currentProduct.customizationSections.forEach((sec) => {
        const selectedIds = selectedSectionItems[sec.id] || [];
        selectedIds.forEach((itemId) => {
          const it = sec.items.find((item) => item.id === itemId);
          if (it) {
            choices.push({
              sectionId: sec.id,
              sectionName: sec.name,
              itemId: it.id,
              itemName: it.name,
              price: it.price,
              priceType: it.priceType || 'adjustment',
              image: it.image,
            });

            if (it.priceType === 'fixed') {
              base = it.price;
            } else {
              addOns += it.price;
            }
          }
        });
      });
    }

    // Add curry per-item cost if selected
    const curryPerItem = selectedCurryObj && curryUnitsPerDish > 0 ? selectedCurryObj.pricePerUnit * curryUnitsPerDish : 0;
    const single = base + addOns + curryPerItem;
    const total = Number((single * portion).toFixed(2));

    return {
      singleItemPrice: single,
      totalPrice: total,
      chosenSectionChoices: choices,
    };
  }, [currentProduct, selectedSectionItems, portion, selectedCurryObj, curryUnitsPerDish]);

  // Construct CartItem representation
  const buildCartItem = (): CartItem => {
    const subtitleDetails = chosenSectionChoices.length > 0
      ? chosenSectionChoices.map((c) => c.itemName).slice(0, 3).join(', ') + (chosenSectionChoices.length > 3 ? ` +${chosenSectionChoices.length - 3} more` : '')
      : currentProduct.subtitle || currentProduct.category;

    return {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId: currentProduct.id,
      name: currentProduct.name,
      subtitle: subtitleDetails,
      image: currentProduct.image,
      basePrice: currentProduct.price,
      unitPrice: singleItemPrice,
      portion,
      spiceLevel,
      curry: currySnapshot,
      selectedSections: chosenSectionChoices,
      totalPrice,
      isCustom: true,
    };
  };

  const handleAddToCart = () => {
    const item = buildCartItem();
    addToCart(item);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleOrderNow = () => {
    const item = buildCartItem();
    addToCart(item);
    setDirectCheckoutItem(item);
  };

  if (!currentProduct) {
    return (
      <div className="w-full min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 text-center">
        <p className="text-sm font-bold text-gray-500">No products available for custom order.</p>
      </div>
    );
  }

  const isCurryEnabled = currentProduct.curryConfig ? currentProduct.curryConfig.enabled !== false : true;

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between pb-28 relative">
      {/* Added to Cart Floating Toast Notification */}
      {addedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#322A2E] text-white text-xs font-bold flex items-center gap-2.5 shadow-2xl animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Added customized "{currentProduct.name}" to cart!</span>
        </div>
      )}

      <div>
        {/* Top Bar */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#EF2A39]">
              Custom Order Experience
            </span>
            <h1 className="text-sm font-black text-[#322A2E]">
              Explore & Customize
            </h1>
          </div>

          <button
            onClick={() => navigateTo('payment')}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 relative cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF2A39] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Swipeable Carousel Container (ONE main product at a time) */}
        <div className="px-6 pt-3">
          <div className="relative bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Carousel Navigation Arrows */}
            {customOrderProducts.length > 1 && (
              <>
                <button
                  onClick={handlePrevProduct}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-[#322A2E] hover:bg-[#EF2A39] hover:text-white shadow-md flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  onClick={handleNextProduct}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 text-[#322A2E] hover:bg-[#EF2A39] hover:text-white shadow-md flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                  aria-label="Next product"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </>
            )}

            {/* Product Card Content */}
            <div className="flex flex-col items-center text-center">
              {/* Product Image */}
              <div className="relative w-44 h-44 my-1 flex items-center justify-center">
                <img
                  key={currentProduct.id}
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover rounded-3xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)] transition-all duration-300 transform hover:scale-105"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Product Badges & Metadata */}
              <div className="flex items-center gap-3 mt-3 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black flex items-center gap-1 border border-amber-200/50">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{currentProduct.rating || 4.9}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>{currentProduct.prepTime || '20 mins'}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-[#EF2A39]/10 text-[#EF2A39] text-[10px] font-black uppercase">
                  {currentProduct.category}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl font-black text-[#322A2E] mt-1">
                {currentProduct.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium max-w-xs mt-0.5">
                {currentProduct.subtitle || currentProduct.description}
              </p>

              {/* Price */}
              <div className="mt-2 text-base font-black text-[#EF2A39]">
                Base: ₹{currentProduct.price.toFixed(2)}
              </div>

              {/* Carousel Pagination Dots */}
              {customOrderProducts.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {customOrderProducts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'w-6 bg-[#EF2A39]'
                          : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls: Spice Level & Portion Counter (Exclusively inside + Customization Flow) */}
        <div className="px-6 mt-4 grid grid-cols-2 gap-3">
          {/* Spicy Slider Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black text-[#322A2E]">
                Spicy Level
              </span>
              <span className={`text-[10px] font-black ${spiceLevel > 60 ? 'text-[#EF2A39]' : 'text-emerald-600'}`}>
                {spiceLevel}% {spiceLevel > 60 ? 'Hot' : spiceLevel > 30 ? 'Medium' : 'Mild'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(Number(e.target.value))}
              className="spice-slider w-full accent-[#EF2A39]"
            />
            <div className="flex justify-between text-[9px] font-bold mt-1 text-gray-400">
              <span className="text-emerald-600">Mild</span>
              <span className="text-[#EF2A39]">Extra Hot</span>
            </div>
          </div>

          {/* Portion Counter Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-black text-[#322A2E]">
              Portions / Quantity
            </span>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => handlePortionChange(portion - 1)}
                className="w-8 h-8 rounded-xl bg-[#EF2A39] hover:bg-[#D81C2B] text-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Decrease portion"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>

              <span className="text-base font-black text-[#322A2E]">
                {portion}
              </span>

              <button
                onClick={() => handlePortionChange(portion + 1)}
                className="w-8 h-8 rounded-xl bg-[#EF2A39] hover:bg-[#D81C2B] text-white flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Increase portion"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* Salna / Curry Level Section (Exclusively inside + Customization Flow) */}
        {isCurryEnabled && availableCurries.length > 0 && (
          <div className="px-6 mt-4">
            <div className="bg-gradient-to-br from-orange-50/70 to-white rounded-3xl p-4 border border-orange-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EF2A39] flex items-center justify-center shadow-2xs">
                    <Soup className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#322A2E] uppercase tracking-wide">
                      Salna / Curry Level
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium">Select gravy & adjust portion amount with slider</p>
                  </div>
                </div>
                {selectedCurryObj && curryUnitsPerDish > 0 ? (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    +₹{(selectedCurryObj.pricePerUnit * curryUnitsPerDish).toFixed(2)} / dish
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    No Gravy
                  </span>
                )}
              </div>

              {/* Curry Options Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {/* Option: No Curry */}
                <div
                  onClick={() => {
                    setSelectedCurryId('');
                    setCurryUnitsPerDish(0);
                    setIsManualCurryOverride(true);
                  }}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                    !selectedCurryId || curryUnitsPerDish === 0
                      ? 'bg-white border-gray-400 shadow-xs ring-1 ring-gray-400'
                      : 'bg-white/80 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="truncate pr-1">
                    <h4 className="text-[11px] font-extrabold text-[#322A2E] truncate">
                      No Salna / Curry
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold">
                      ₹0.00
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      !selectedCurryId || curryUnitsPerDish === 0
                        ? 'bg-gray-700 border-gray-700 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {(!selectedCurryId || curryUnitsPerDish === 0) && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                  </div>
                </div>

                {availableCurries.map((curry) => {
                  const isSelected = selectedCurryId === curry.id && curryUnitsPerDish > 0;
                  return (
                    <div
                      key={curry.id}
                      onClick={() => {
                        setSelectedCurryId(curry.id);
                        if (curryUnitsPerDish === 0) {
                          const defUnits = currentProduct.curryConfig?.defaultCurryPerItem ?? currentProduct.curryConfig?.defaultUnits ?? 1;
                          setCurryUnitsPerDish(defUnits);
                        }
                      }}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-white border-[#EF2A39] shadow-xs ring-1 ring-[#EF2A39]'
                          : 'bg-white/80 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <h4 className="text-[11px] font-extrabold text-[#322A2E] truncate">
                          {curry.name}
                        </h4>
                        <span className="text-[10px] text-[#EF2A39] font-black">
                          ₹{curry.pricePerUnit.toFixed(2)} / {curry.unitLabel || 'Spoon'}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#EF2A39] border-[#EF2A39] text-white' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Curry Amount Selector with Stepper & Slider */}
              {selectedCurryObj && (
                <div className="mt-3.5 pt-3 border-t border-orange-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-[#322A2E]">
                        Curry Quantity:
                      </span>
                      {isManualCurryOverride && (
                        <button
                          onClick={handleResetCurryToDefault}
                          className="text-[9px] text-orange-700 hover:text-orange-900 bg-orange-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold transition-colors cursor-pointer"
                          title="Reset to default formula"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Auto</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-orange-200 rounded-xl p-0.5 shadow-2xs">
                        <button
                          onClick={() => handleCurryUnitsChange(curryUnitsPerDish - 1)}
                          className="w-6 h-6 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 flex items-center justify-center text-xs font-bold cursor-pointer"
                          aria-label="Decrease curry spoon"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-[#322A2E]">
                          {curryUnitsPerDish}
                        </span>
                        <button
                          onClick={() => handleCurryUnitsChange(curryUnitsPerDish + 1)}
                          className="w-6 h-6 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 flex items-center justify-center text-xs font-bold cursor-pointer"
                          aria-label="Increase curry spoon"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Curry Amount Range Slider */}
                  <input
                    type="range"
                    min={currentProduct.curryConfig?.minUnits ?? 0}
                    max={currentProduct.curryConfig?.maxUnits ?? 10}
                    step="1"
                    value={curryUnitsPerDish}
                    onChange={(e) => handleCurryUnitsChange(Number(e.target.value))}
                    className="w-full accent-[#EF2A39] h-2 bg-orange-200 rounded-lg cursor-pointer transition-all"
                  />

                  {/* Dynamic Calculation breakdown badge */}
                  <div className="mt-2 p-2 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-between text-[10px]">
                    <div className="text-orange-950 font-medium">
                      {portion} dish{portion > 1 ? 'es' : ''} × {curryUnitsPerDish} {selectedCurryObj.unitLabel || 'Spoon'}{curryUnitsPerDish !== 1 ? 's' : ''} = <strong className="font-black text-[#EF2A39]">{totalCurryUnits} {selectedCurryObj.unitLabel || 'Spoon'}{totalCurryUnits !== 1 ? 's' : ''}</strong>
                    </div>
                    <div className="font-black text-[#EF2A39]">
                      {totalCurryUnits === 0 ? '₹0.00' : `${totalCurryUnits} × ₹${selectedCurryObj.pricePerUnit.toFixed(2)} = ₹${(selectedCurryObj.pricePerUnit * totalCurryUnits).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Customization Sections */}
        <div className="px-6 mt-6 space-y-6">
          {currentProduct.customizationSections && currentProduct.customizationSections.length > 0 ? (
            currentProduct.customizationSections.map((section) => {
              const selectedIds = selectedSectionItems[section.id] || [];

              return (
                <div key={section.id} className="space-y-3">
                  {/* Section Title & Subtitle */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#322A2E] flex items-center gap-1.5">
                        <span>{section.name}</span>
                        {section.required ? (
                          <span className="text-[9px] font-black text-[#EF2A39] bg-[#EF2A39]/10 px-1.5 py-0.5 rounded-sm uppercase">
                            Required
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm uppercase">
                            Optional
                          </span>
                        )}
                      </h3>
                      {section.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {section.description}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold shrink-0">
                      {section.selectionType === 'single' ? 'Pick 1' : 'Choose any'}
                    </span>
                  </div>

                  {/* Section Items Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {section.items.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      const isOutOfStock = item.available === false;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(section, item)}
                          className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                            isOutOfStock
                              ? 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#322A2E] text-white border-[#322A2E] shadow-sm transform scale-[1.02]'
                              : 'bg-white text-[#322A2E] border-gray-100 hover:border-gray-200 shadow-2xs'
                          }`}
                        >
                          {/* Item Thumbnail Image if available */}
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                                isSelected ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              <Sparkles className="w-4 h-4 text-[#EF2A39]" />
                            </div>
                          )}

                          {/* Item Info */}
                          <div className="truncate flex-1">
                            <h4
                              className={`text-xs font-extrabold truncate ${
                                isSelected ? 'text-white' : 'text-[#322A2E]'
                              }`}
                            >
                              {item.name}
                            </h4>

                            <p
                              className={`text-[10px] font-bold mt-0.5 ${
                                isSelected ? 'text-white/80' : 'text-gray-500'
                              }`}
                            >
                              {item.price > 0
                                ? item.priceType === 'fixed'
                                  ? `₹${item.price.toFixed(2)} Fixed`
                                  : `+₹${item.price.toFixed(2)}`
                                : 'Included'}
                            </p>
                          </div>

                          {/* Selection Radio / Checkbox Indicator */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#EF2A39] text-white'
                                : 'border border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-5 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-xs text-gray-400">
                Standard recipe prepared with signature ingredients.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Order Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block leading-tight">
              Total Price
            </span>
            <div className="text-xl font-black text-[#322A2E]">
              ₹{totalPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-1 justify-end">
            <button
              onClick={handleAddToCart}
              className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#322A2E] text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#EF2A39]" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleOrderNow}
              className="px-6 py-3 rounded-2xl bg-[#EF2A39] hover:bg-[#d92231] text-white text-xs font-black shadow-[0_6px_20px_rgba(239,42,57,0.35)] transition-all active:scale-95 cursor-pointer"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
