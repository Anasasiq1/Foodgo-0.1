import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Search,
  Check,
  CreditCard,
  QrCode,
  Truck,
  Copy,
  CheckCheck,
  AlertCircle,
  ShieldCheck,
  Lock,
  Sparkles,
  Smartphone,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { PaymentMethodType, PaymentSettings } from '../types';

export const PaymentScreen: React.FC = () => {
  const {
    goBack,
    navigateTo,
    pendingOrder,
    user,
    paymentCards,
    createOrder,
    orders,
  } = useApp();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  
  // Saved UPI Methods selection
  const savedUpiMethods = paymentCards.filter((c) => c.type === 'upi');
  const [selectedSavedUpiId, setSelectedSavedUpiId] = useState<string>(
    savedUpiMethods.length > 0 ? (savedUpiMethods[0].upiId || savedUpiMethods[0].numberMasked) : ''
  );

  // Card Form State
  const [cardHolder, setCardHolder] = useState(user.name || 'Sophia Patel');
  const [cardNumber, setCardNumber] = useState('5105 4522 8931 0505');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);

  // UPI State & Modal
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUpiConfirmDialog, setShowUpiConfirmDialog] = useState(false);

  // Loading & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch payment gateway configuration from server
  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings?.payment) {
          setPaymentSettings(data.settings.payment);
          // Set initial default method based on what's enabled
          if (data.settings.payment.upi?.enabled) {
            setSelectedMethod('upi');
          } else if (data.settings.payment.card?.enabled) {
            setSelectedMethod('card');
          } else if (data.settings.payment.cod?.enabled) {
            setSelectedMethod('cod');
          }
        }
      }
    } catch {
      // Fallback defaults
    }
  };

  const activeUpi = paymentSettings?.upi || {
    enabled: true,
    vpaId: 'foodgo@upi',
    merchantName: 'Foodgo Gourmet Burgers',
    instructions: 'Scan QR or pay to UPI ID via Google Pay, PhonePe, or Paytm.',
  };

  const activeCard = paymentSettings?.card || {
    enabled: true,
    provider: 'mock' as const,
    testMode: true,
  };

  const activeCod = paymentSettings?.cod || {
    enabled: true,
    extraFee: 0,
    maxOrderLimit: 250,
    instructions: 'Pay cash or scan driver QR when food is delivered.',
  };

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(activeUpi.vpaId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Calculate dynamic COD surcharge if COD is selected
  const codFee = selectedMethod === 'cod' ? (activeCod.extraFee || 0) : 0;
  const currentSubtotal = pendingOrder?.subtotal || 0;
  const currentTaxes = pendingOrder?.taxes || 0.3;
  const currentDelivery = pendingOrder?.deliveryFees || 1.5;
  const finalTotal = Number((currentSubtotal + currentTaxes + currentDelivery + codFee).toFixed(2));

  // Standard UPI Intent URL format requested:
  // upi://pay?pa=yourmerchant@upi&pn=HM-Q&am={finalTotal}&cu=INR
  const merchantVpa = activeUpi.vpaId || 'hmqfoodgo@upi';
  const merchantName = 'HM-Q';
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${finalTotal}&cu=INR&tn=Foodgo%20Order%20Payment`;

  // Specific App Deep Link URIs
  const gpayIntentUrl = `gpay://upi/pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${finalTotal}&cu=INR&tn=Foodgo%20Order`;
  const phonepeIntentUrl = `phonepe://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${finalTotal}&cu=INR&tn=Foodgo%20Order`;
  const paytmIntentUrl = `paytmmp://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${finalTotal}&cu=INR&tn=Foodgo%20Order`;

  // Trigger UPI App Intent & Open seamless Confirmation Dialog
  const triggerUpiDeepLink = (specificUrl?: string) => {
    const targetUrl = specificUrl || upiIntentUrl;
    
    // Attempt standard intent launch
    try {
      window.location.href = targetUrl;
    } catch {
      // Fallback
    }

    // Immediately open confirmation prompt for seamless completion
    setShowUpiConfirmDialog(true);
  };

  // Final Order Submission Handler
  const handleFinalOrderSubmit = async (customNote?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const transactionNote = customNote || (selectedMethod === 'upi' ? (upiUtr.trim() || `UPI-Auto-${Date.now()}`) : undefined);

    try {
      // Direct API call to backend order creation
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pendingOrder?.items || [],
          subtotal: currentSubtotal,
          taxes: currentTaxes,
          deliveryFees: currentDelivery,
          codCharge: codFee,
          total: finalTotal,
          paymentMethod: selectedMethod,
          upiTransactionNote: transactionNote,
          customerName: user.name,
          customerPhone: user.phone || '+91 98765 43210',
          customerAddress: user.address,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process order');
      }

      setShowUpiConfirmDialog(false);
      // Trigger app context completion
      await createOrder();
    } catch (e: any) {
      setErrorMessage(e.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle Pay Now / Place Order
  const handlePayNow = async () => {
    setErrorMessage(null);

    if (selectedMethod === 'upi') {
      // Fire the UPI intent link directly and show confirmation modal
      triggerUpiDeepLink(upiIntentUrl);
      return;
    }

    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 12) {
        setErrorMessage('Please enter a valid card number.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setErrorMessage('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMessage('Please enter a valid CVV.');
        return;
      }
    } else if (selectedMethod === 'cod') {
      if (activeCod.maxOrderLimit && finalTotal > activeCod.maxOrderLimit) {
        setErrorMessage(`Cash on Delivery is limited to orders up to $${activeCod.maxOrderLimit}. Please choose UPI or Card.`);
        return;
      }
    }

    await handleFinalOrderSubmit();
  };

  // QR Code generator URL (uses standard QR API)
  const upiQrString = upiIntentUrl;
  const qrImageUrl = activeUpi.qrCodeImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between pb-6">
      <div className="pb-24">
        {/* Top Bar */}
        <div className="px-6 pt-7 pb-2 flex items-center justify-between">
          <button
            onClick={goBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <span className="text-sm font-extrabold text-[#322A2E]">
            Secure Checkout
          </span>

          <button
            onClick={() => navigateTo('home')}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Order Summary Section */}
        <div className="px-6 pt-3">
          <h2 className="text-[20px] font-extrabold text-[#322A2E] mb-3">
            Order summary
          </h2>

          <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2 text-xs border border-gray-100">
            {/* List configured items */}
            {pendingOrder?.items && pendingOrder.items.length > 0 && (
              <div className="pb-2 mb-2 border-b border-gray-200/70 space-y-1.5">
                {pendingOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-[#322A2E]">
                    <div className="flex-1 pr-2">
                      <span className="font-bold">{it.portion}x {it.name}</span>
                      {it.selectedVariant && (
                        <span className="text-[#EF2A39] font-bold text-[11px] block">
                          • {it.selectedVariant.optionName}
                        </span>
                      )}
                      {it.selectedSections && it.selectedSections.length > 0 && (
                        <span className="text-gray-600 font-semibold text-[10px] block">
                          {it.selectedSections.map((s) => `${s.sectionName}: ${s.itemName}`).join(' • ')}
                        </span>
                      )}
                      {it.selectedOptions && it.selectedOptions.length > 0 && (
                        <span className="text-gray-500 text-[10px] block">
                          {it.selectedOptions.map((o) => `+${o.optionName}`).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-extrabold">${it.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center text-[#6A6A6A] font-medium">
              <span>Items Subtotal</span>
              <span className="text-[#322A2E] font-bold">
                ${currentSubtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-[#6A6A6A] font-medium">
              <span>Taxes & Restaurant GST</span>
              <span className="text-[#322A2E] font-bold">
                ${currentTaxes.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-[#6A6A6A] font-medium">
              <span>Delivery Fee</span>
              <span className="text-[#322A2E] font-bold">
                ${currentDelivery.toFixed(2)}
              </span>
            </div>

            {codFee > 0 && (
              <div className="flex justify-between items-center text-amber-700 font-medium">
                <span>COD Handling Surcharge</span>
                <span className="font-bold">+${codFee.toFixed(2)}</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200/80 pt-2 flex justify-between items-center text-[#322A2E] font-extrabold text-sm">
              <span>Total Payable:</span>
              <span className="text-base text-[#EF2A39]">
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold pt-1 text-gray-500">
              <span>Estimated Delivery:</span>
              <span className="text-[#322A2E]">
                {pendingOrder?.estimatedDelivery || '20 - 30 mins'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[19px] font-extrabold text-[#322A2E]">
              Select Payment Method
            </h2>
            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              100% Encrypted
            </span>
          </div>

          {/* Payment Method Cards */}
          <div className="space-y-3">
            {/* 1. UPI / Google Pay / PhonePe Option */}
            {activeUpi.enabled && (
              <div
                onClick={() => setSelectedMethod('upi')}
                className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'upi'
                    ? 'bg-purple-50/50 border-purple-600 shadow-[0_4px_16px_rgba(147,51,234,0.12)] ring-1 ring-purple-600'
                    : 'bg-[#F8F9FA] border-gray-200/80 hover:bg-gray-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      UPI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-[#322A2E]">
                          UPI / Google Pay / PhonePe / Paytm
                        </h4>
                        <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                          Fastest
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Instant scan & direct bank payment
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'upi'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedMethod === 'upi' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                {/* Expanded UPI Details */}
                {selectedMethod === 'upi' && (
                  <div className="mt-4 pt-3.5 border-t border-purple-200/60 space-y-3">
                    {/* Saved UPI Quick Chooser */}
                    {savedUpiMethods.length > 0 && (
                      <div className="bg-white rounded-xl p-2.5 border border-purple-200 shadow-2xs">
                        <label className="text-[10px] font-bold text-gray-400 block mb-1">
                          Saved UPI ID:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {savedUpiMethods.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSavedUpiId(m.upiId || m.numberMasked);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                selectedSavedUpiId === (m.upiId || m.numberMasked)
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-purple-50 text-purple-800 border border-purple-200'
                              }`}
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>{m.upiId || m.numberMasked}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick App Launcher Buttons */}
                    <div>
                      <span className="text-[11px] font-bold text-gray-700 block mb-1.5">
                        1-Click Launch on Mobile:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUpiDeepLink(gpayIntentUrl);
                          }}
                          className="py-2.5 px-2 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 text-[#322A2E] text-xs font-extrabold flex flex-col items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="text-sm">🔵</span>
                          <span>Google Pay</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUpiDeepLink(phonepeIntentUrl);
                          }}
                          className="py-2.5 px-2 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 text-[#322A2E] text-xs font-extrabold flex flex-col items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="text-sm">🟣</span>
                          <span>PhonePe</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUpiDeepLink(paytmIntentUrl);
                          }}
                          className="py-2.5 px-2 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 text-[#322A2E] text-xs font-extrabold flex flex-col items-center justify-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="text-sm">🔷</span>
                          <span>Paytm / UPI</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Code & Merchant details */}
                    <div className="bg-white rounded-xl p-3.5 border border-purple-100 flex flex-col items-center text-center shadow-xs">
                      <span className="text-[11px] font-bold text-gray-500 mb-2">
                        Scan QR code with Google Pay, PhonePe, or Paytm:
                      </span>
                      
                      <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-xs mb-2">
                        <img
                          src={qrImageUrl}
                          alt="Foodgo UPI QR"
                          className="w-32 h-32 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="w-full flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg mt-1">
                        <div className="text-left">
                          <span className="text-[10px] text-gray-500 block font-semibold">
                            Merchant UPI ID (HM-Q)
                          </span>
                          <span className="text-xs font-mono font-black text-purple-900">
                            {merchantVpa}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUpi();
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-700 text-[10px] font-extrabold rounded-md border border-purple-200 flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          {copiedUpi ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Credit / Debit Card Option */}
            {activeCard.enabled && (
              <div
                onClick={() => setSelectedMethod('card')}
                className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-[#322A2E] text-white shadow-[0_6px_20px_rgba(50,42,46,0.3)] border-[#322A2E]'
                    : 'bg-[#F8F9FA] text-[#322A2E] border-gray-200/80 hover:bg-gray-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                      selectedMethod === 'card' ? 'bg-white/15 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black leading-tight">
                          Credit / Debit Card (Visa, Mastercard, RuPay)
                        </h4>
                      </div>
                      <p className={`text-[11px] ${selectedMethod === 'card' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Instant online checkout
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'card'
                        ? 'border-white bg-white text-[#322A2E]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedMethod === 'card' && (
                      <div className="w-2 h-2 rounded-full bg-[#322A2E]"></div>
                    )}
                  </div>
                </div>

                {/* Expanded Card Form */}
                {selectedMethod === 'card' && (
                  <div className="mt-4 pt-3.5 border-t border-white/20 space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white border border-white/20 outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5105 4522 8931 0505"
                        className="w-full bg-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white border border-white/20 outline-none focus:border-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-300 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white border border-white/20 outline-none focus:border-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-300 mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white border border-white/20 outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        setSaveCardForFuture(!saveCardForFuture);
                      }}
                      className="flex items-center gap-2 pt-1 cursor-pointer select-none text-[11px] text-gray-300"
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${
                        saveCardForFuture ? 'bg-[#EF2A39] text-white' : 'border border-white/40'
                      }`}>
                        {saveCardForFuture && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>Save card securely for future purchases</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* 3. Cash on Delivery (COD) Option */}
            {activeCod.enabled && (
              <div
                onClick={() => setSelectedMethod('cod')}
                className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'cod'
                    ? 'bg-emerald-50/60 border-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.12)] ring-1 ring-emerald-600'
                    : 'bg-[#F8F9FA] border-gray-200/80 hover:bg-gray-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-[#322A2E]">
                          Cash on Delivery (COD)
                        </h4>
                        {activeCod.extraFee > 0 && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                            +${activeCod.extraFee} Fee
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Pay cash or scan QR when delivery driver arrives
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedMethod === 'cod' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                {selectedMethod === 'cod' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 text-[11px] text-emerald-900 bg-white/70 p-3 rounded-xl">
                    <p className="font-semibold">
                      {activeCod.instructions || 'Please keep exact change ready upon delivery driver arrival.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error message alert */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] z-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#8E8E93]">
              Total to pay
            </span>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold text-[#EF2A39]">₹</span>
              <span className="text-2xl font-black text-[#322A2E] tracking-tight">
                {finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay Now / Launch Intent Button */}
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className={`flex-1 max-w-[230px] h-[52px] rounded-2xl flex items-center justify-center text-xs font-black tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
              selectedMethod === 'upi'
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_6px_20px_rgba(147,51,234,0.35)]'
                : 'bg-[#322A2E] hover:bg-[#251E22] text-white shadow-[0_6px_20px_rgba(50,42,46,0.3)]'
            }`}
          >
            {isProcessing
              ? 'Processing Order...'
              : selectedMethod === 'upi'
              ? '🚀 Pay via UPI App'
              : selectedMethod === 'cod'
              ? 'Place COD Order'
              : 'Pay & Confirm'}
          </button>
        </div>
      </div>

      {/* UPI Intent Post-Launch Confirmation Dialog */}
      {showUpiConfirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-[380px] bg-white rounded-3xl p-6 shadow-2xl text-left animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 mx-auto shadow-xs">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-lg font-extrabold text-[#322A2E] text-center mb-1">
              UPI App Launched
            </h3>
            <p className="text-xs text-[#8E8E93] text-center mb-4">
              Complete your ₹{finalTotal.toFixed(2)} payment to <span className="font-bold text-purple-900">{merchantName}</span> in Google Pay, PhonePe, or Paytm.
            </p>

            <div className="bg-purple-50 rounded-2xl p-3.5 border border-purple-200 mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-700">
                <span>Amount:</span>
                <span className="font-black text-purple-900 text-sm">₹{finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>Merchant VPA:</span>
                <span className="font-mono font-bold text-purple-900">{merchantVpa}</span>
              </div>
            </div>

            {/* Optional UTR Input */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                UPI Reference / UTR Number (Optional):
              </label>
              <input
                type="text"
                value={upiUtr}
                onChange={(e) => setUpiUtr(e.target.value)}
                placeholder="e.g. 423819284729 or leave blank"
                className="w-full bg-[#F4F5F7] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#322A2E] outline-none border border-transparent focus:border-purple-600"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleFinalOrderSubmit(upiUtr.trim() || `UPI-Ref-${Date.now()}`)}
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isProcessing ? 'Confirming Order...' : 'Payment Done! Confirm Order'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerUpiDeepLink(upiIntentUrl)}
                className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Re-launch UPI App</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUpiConfirmDialog(false)}
                className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold text-xs text-center cursor-pointer"
              >
                Cancel & Change Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
