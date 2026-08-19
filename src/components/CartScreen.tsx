import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  Soup,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  Truck,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';
import { DeliverySettings, DeliveryTimeSlot } from '../types';

export const CartScreen: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    cartTotal,
    cartCount,
    navigateTo,
    goBack,
    user,
    createOrder,
  } = useApp();

  // Delivery Settings state
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [deliveryType, setDeliveryType] = useState<'scheduled' | 'urgent'>('scheduled');
  const [selectedSlot, setSelectedSlot] = useState<string>('1:00 PM');

  // UPI Verification state
  const [isProcessingUpi, setIsProcessingUpi] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiUtr, setUpiUtr] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Fetch Delivery Settings on mount
  useEffect(() => {
    fetch('/api/delivery-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDeliverySettings(data.data);
          const firstSlot = data.data.slots?.find((s: DeliveryTimeSlot) => s.active);
          if (firstSlot) {
            setSelectedSlot(firstSlot.timeLabel);
          }
        }
      })
      .catch(() => {
        // Fallback default
      });
  }, []);

  const taxes = 0.3;

  // Calculate delivery fee based on selection
  const urgentFee = deliverySettings?.urgentDelivery?.fee ?? 30;
  const activeSlots = deliverySettings?.slots?.filter((s) => s.active) || [
    { id: '1', timeLabel: '1:00 PM', fee: 0, active: true },
    { id: '2', timeLabel: '3:00 PM', fee: 0, active: true },
    { id: '3', timeLabel: '5:00 PM', fee: 0, active: true },
  ];

  let deliveryFees = 0;
  if (cart.length > 0) {
    if (deliveryType === 'urgent') {
      deliveryFees = urgentFee;
    } else {
      const currentSlotObj = activeSlots.find((s) => s.timeLabel === selectedSlot);
      deliveryFees = currentSlotObj ? currentSlotObj.fee : 0;
    }
  }

  const finalTotal = Number((cartTotal + taxes + deliveryFees).toFixed(2));

  // Configured Merchant UPI ID from environment or default
  const merchantUpiId = (import.meta as any).env?.VITE_MERCHANT_UPI_ID || 'foodgo@upi';
  const merchantName = 'Foodgo Gourmet';

  // Standard UPI Intent URL for triggering the OS Native App Chooser
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${finalTotal.toFixed(2)}&cu=INR&tn=Foodgo%20Order`;

  // Trigger Native App Chooser
  const handleLaunchUpi = () => {
    if (cart.length === 0) return;
    setOrderError(null);

    // Trigger native OS App Chooser (GPay, PhonePe, Paytm, etc.)
    try {
      window.location.href = upiIntentUrl;
    } catch {
      // Fallback
    }

    // Open verification dialog
    setShowUpiModal(true);
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  // Submit Payment for Verification
  const handleSubmitPaymentForVerification = async () => {
    const trimmedUtr = upiUtr.trim();
    if (!trimmedUtr || trimmedUtr.length < 6) {
      setOrderError('Please enter a valid 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    setIsProcessingUpi(true);
    setOrderError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal: cartTotal,
          taxes,
          deliveryFees,
          total: finalTotal,
          paymentMethod: 'upi',
          upiTransactionNote: trimmedUtr,
          deliveryType,
          deliverySlot: deliveryType === 'urgent' ? 'Urgent Delivery' : selectedSlot,
          customerName: user.name,
          customerPhone: user.phone || '+91 98765 43210',
          customerAddress: user.address,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit order for verification');
      }

      setSubmittedSuccess(true);
      await createOrder();
    } catch (e: any) {
      setOrderError(e.message || 'Payment submission failed. Please try again.');
      setIsProcessingUpi(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between pb-28">
      <div>
        {/* Top Header */}
        <div className="px-6 pt-7 pb-3 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-black text-[#322A2E]">
              My Cart
            </h1>
            <p className="text-[11px] font-bold text-[#8E8E93]">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
            </p>
          </div>

          {cart.length > 0 ? (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-[#EF2A39] hover:text-[#D81C2B] p-1 cursor-pointer transition-colors"
              title="Clear all items in cart"
            >
              Clear
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Cart Content Area */}
        <div className="px-6 pt-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-red-50 text-[#EF2A39] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
                <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#322A2E]">
                Your cart is empty
              </h3>
              <p className="text-xs font-medium text-[#8E8E93] max-w-[240px] mx-auto mt-1.5 leading-relaxed">
                Add delicious food, gourmet burgers, or customized dishes from our menu!
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="mt-6 px-7 py-3.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white text-xs font-extrabold rounded-2xl shadow-[0_6px_20px_rgba(239,42,57,0.35)] transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Item Cards */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-3 relative"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-2xl bg-[#F8F9FA] p-1.5 flex items-center justify-center shrink-0 border border-gray-100/80">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain drop-shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs font-extrabold text-[#322A2E] truncate">
                        {item.name}
                      </h4>

                      {/* Selected Variant */}
                      {item.selectedVariant && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#EF2A39] mt-0.5">
                          <Layers className="w-3 h-3" />
                          <span>{item.selectedVariant.optionName}</span>
                        </div>
                      )}

                      {/* Salna Level / Curry Snapshot */}
                      {item.curry && item.curry.enabled && (
                        <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 mt-0.5">
                          <Soup className="w-3 h-3" />
                          <span>
                            Salna: {item.curry.curryName} ({item.curry.unitsPerProduct} {item.curry.unitLabel || 'Spoon'}{item.curry.unitsPerProduct > 1 ? 's' : ''} × ₹{item.curry.pricePerUnit.toFixed(2)})
                          </span>
                        </div>
                      )}

                      {/* Dynamic Customization Sections */}
                      {item.selectedSections && item.selectedSections.length > 0 && (
                        <div className="text-[10px] font-semibold text-gray-600 line-clamp-1 mt-0.5">
                          {item.selectedSections.map((s) => s.itemName).join(' • ')}
                        </div>
                      )}

                      {/* Selected Add-ons */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                          +{item.selectedOptions.map((o) => o.optionName).join(', ')}
                        </div>
                      )}

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-black text-[#EF2A39]">
                          ₹{item.totalPrice.toFixed(2)}
                        </span>

                        <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-xl px-2 py-1 border border-gray-200/60">
                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.portion - 1)
                            }
                            className="w-6 h-6 rounded-lg bg-white text-[#322A2E] hover:bg-gray-100 flex items-center justify-center transition-transform active:scale-90 shadow-xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>

                          <span className="text-xs font-black text-[#322A2E] min-w-[14px] text-center">
                            {item.portion}
                          </span>

                          <button
                            onClick={() =>
                              updateCartItemQuantity(item.id, item.portion + 1)
                            }
                            className="w-6 h-6 rounded-lg bg-[#EF2A39] text-white hover:bg-[#D81C2B] flex items-center justify-center transition-transform active:scale-90 shadow-xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Option Selector (Scheduled Free vs Urgent) */}
              <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-3xl p-4 border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#322A2E] uppercase tracking-wide">
                        Delivery Option
                      </h4>
                      <p className="text-[10px] text-gray-500">Choose free scheduled slot or urgent delivery</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Type Switcher */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('scheduled')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-start transition-all cursor-pointer select-none ${
                      deliveryType === 'scheduled'
                        ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white/80 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-black text-[#322A2E] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        Scheduled Slots
                      </span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                        FREE
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">Free delivery on time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('urgent')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-start transition-all cursor-pointer select-none ${
                      deliveryType === 'urgent'
                        ? 'bg-white border-[#EF2A39] shadow-xs ring-1 ring-[#EF2A39]'
                        : 'bg-white/80 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-black text-[#322A2E] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#EF2A39] fill-[#EF2A39]" />
                        Urgent Delivery
                      </span>
                      <span className="text-[9px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded-md">
                        +₹{urgentFee}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">Fast 15-25 mins</span>
                  </button>
                </div>

                {/* If Scheduled is chosen, show active slots pills */}
                {deliveryType === 'scheduled' && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-[11px] font-bold text-gray-700 block mb-2">
                      Select Delivery Slot (Free):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.timeLabel;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot.timeLabel)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{slot.timeLabel}</span>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details Summary */}
              <div className="bg-[#F8F9FA] rounded-3xl p-4 space-y-2.5 border border-gray-100 text-xs">
                <h4 className="text-xs font-black text-[#322A2E] uppercase tracking-wider mb-2">
                  Bill Summary
                </h4>

                <div className="flex justify-between items-center text-[#6A6A6A] font-medium">
                  <span>Item Total</span>
                  <span className="text-[#322A2E] font-bold">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#6A6A6A] font-medium">
                  <span>Taxes & GST</span>
                  <span className="text-[#322A2E] font-bold">
                    ₹{taxes.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#6A6A6A] font-medium">
                  <span>
                    Delivery Fee ({deliveryType === 'urgent' ? 'Urgent' : `Slot: ${selectedSlot}`})
                  </span>
                  <span className={`font-bold ${deliveryFees === 0 ? 'text-emerald-600' : 'text-[#322A2E]'}`}>
                    {deliveryFees === 0 ? 'FREE (₹0.00)' : `₹${deliveryFees.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-gray-200/80 pt-2.5 flex justify-between items-center text-sm font-extrabold text-[#322A2E]">
                  <span>To Pay</span>
                  <span className="text-base font-black text-[#EF2A39]">
                    ₹{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Direct UPI Payment & Checkout Section */}
              <div className="pt-2 space-y-2.5">
                {/* 1. Primary Direct Native UPI Payment Button */}
                <button
                  onClick={handleLaunchUpi}
                  className="w-full h-14 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white rounded-2xl flex items-center justify-between px-5 text-sm font-black tracking-wide shadow-[0_8px_24px_rgba(147,51,234,0.38)] transition-all active:scale-[0.98] cursor-pointer ring-2 ring-purple-400/40"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white text-purple-700 flex items-center justify-center font-black text-xs shadow-xs">
                      UPI
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold">UPI Payment</span>
                        <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          GPay • PhonePe • Paytm
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-100 font-medium">
                        Instant App Chooser & UTR Verification
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-black">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
                  </div>
                </button>

                {/* 2. Secondary Traditional Checkout (Cards & COD) */}
                <button
                  onClick={() => navigateTo('payment')}
                  className="w-full h-11 bg-white hover:bg-gray-50 border border-gray-200 text-[#322A2E] rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                >
                  <span>More Payment Options (Card / Cash on Delivery)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPI Payment & UTR Verification Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-2xl text-left animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {submittedSuccess ? (
              <div className="text-center py-4 space-y-3 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-[#322A2E]">
                  Payment Submitted for Verification!
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed px-2">
                  Your order has been received with status <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Pending Verification</span>.
                  The restaurant will verify UTR: <span className="font-mono font-bold text-purple-900">{upiUtr}</span> and start preparing your meal!
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setShowUpiModal(false);
                      navigateTo('order-history');
                    }}
                    className="w-full py-3.5 bg-[#322A2E] hover:bg-[#201A1D] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    View Order in History
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 mx-auto shadow-xs">
                  <Smartphone className="w-6 h-6 animate-bounce" />
                </div>

                <h3 className="text-lg font-extrabold text-[#322A2E] text-center mb-1">
                  UPI Payment Verification
                </h3>
                <p className="text-xs text-[#8E8E93] text-center mb-4">
                  Pay in your UPI App (GPay / PhonePe / Paytm) and submit the 12-digit UTR below for verification.
                </p>

                <div className="bg-purple-50/80 rounded-2xl p-3.5 border border-purple-200 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Payable Amount:</span>
                    <span className="font-black text-purple-900 text-sm">₹{finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Merchant Name:</span>
                    <span className="font-bold text-purple-900">{merchantName}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Merchant UPI ID:</span>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      className="flex items-center gap-1 font-mono text-purple-900 text-[11px] font-bold hover:text-purple-700 cursor-pointer bg-purple-100/70 px-2 py-0.5 rounded-md"
                    >
                      <span>{merchantUpiId}</span>
                      <Copy className="w-3 h-3" />
                      {copiedVpa && <span className="text-[9px] text-emerald-600 font-bold">Copied!</span>}
                    </button>
                  </div>
                </div>

                {/* Mandatory UTR Input */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-extrabold text-[#322A2E]">
                      12-Digit UPI Reference / UTR Number: <span className="text-[#EF2A39]">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={upiUtr}
                    onChange={(e) => setUpiUtr(e.target.value)}
                    placeholder="Enter 12-digit UTR from GPay / PhonePe"
                    className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-3 text-xs font-mono font-bold text-[#322A2E] outline-none border border-gray-200 focus:border-purple-600 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Found in your UPI app payment receipt (e.g. 423819284729)
                  </p>
                </div>

                {orderError && (
                  <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleSubmitPaymentForVerification}
                    disabled={isProcessingUpi}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-[0_4px_16px_rgba(147,51,234,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{isProcessingUpi ? 'Submitting Verification...' : 'Submit Payment for Verification'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchUpi}
                    className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Re-open UPI App Chooser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUpiModal(false)}
                    className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold text-xs text-center cursor-pointer"
                  >
                    Back to Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
