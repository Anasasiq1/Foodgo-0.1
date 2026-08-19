import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CreditCard, Plus, Check, Trash2, Smartphone, QrCode, ShieldCheck } from 'lucide-react';

export const PaymentMethodsScreen: React.FC = () => {
  const {
    paymentCards,
    selectedCardType,
    setSelectedCardType,
    addPaymentCard,
    deletePaymentCard,
    user,
    goBack,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'card' | 'upi'>('upi');

  // Card form state
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(user.name || '');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardType, setNewCardType] = useState<'mastercard' | 'visa'>('mastercard');

  // UPI form state
  const [newUpiId, setNewUpiId] = useState('');
  const [newUpiHolder, setNewUpiHolder] = useState(user.name || '');
  const [formError, setFormError] = useState<string | null>(null);

  const popularUpiSuffixes = ['@okaxis', '@okhdfcbank', '@okicici', '@paytm', '@ybl', '@upi'];

  const handleAppendSuffix = (suffix: string) => {
    const base = newUpiId.includes('@') ? newUpiId.split('@')[0] : newUpiId;
    setNewUpiId((base.trim() || 'user') + suffix);
  };

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (modalTab === 'card') {
      const cleanNum = newCardNumber.replace(/\s/g, '');
      if (cleanNum.length < 12) {
        setFormError('Please enter a valid card number (at least 12 digits).');
        return;
      }
      const masked = `${cleanNum.slice(0, 4)} **** **** ${cleanNum.slice(-4)}`;
      addPaymentCard({
        type: newCardType,
        numberMasked: masked,
        holderName: newCardHolder.trim() || user.name,
        expiry: newCardExpiry.trim() || '12/28',
      });
    } else {
      const cleanUpi = newUpiId.trim();
      if (!cleanUpi.includes('@') || cleanUpi.length < 5) {
        setFormError('Please enter a valid UPI ID (e.g. name@okicici or 9876543210@paytm).');
        return;
      }
      addPaymentCard({
        type: 'upi',
        upiId: cleanUpi,
        numberMasked: cleanUpi,
        holderName: newUpiHolder.trim() || user.name,
        expiry: 'Instant UPI Deep Link',
      });
    }

    // Reset and close
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewUpiId('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between pb-6">
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

          <h2 className="text-base font-extrabold text-[#322A2E]">
            Payment Methods
          </h2>

          <div className="w-8" />
        </div>

        {/* Payment Methods List */}
        <div className="px-6 pt-5 space-y-4">
          <p className="text-xs text-[#8E8E93] font-semibold">
            Saved payment options for 1-click checkout:
          </p>

          {paymentCards.map((card) => {
            const isMastercard = card.type === 'mastercard';
            const isVisa = card.type === 'visa';
            const isUpi = card.type === 'upi';
            const isSelected = selectedCardType === card.type;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardType(card.type)}
                className={`relative w-full rounded-3xl p-5 cursor-pointer transition-all ${
                  isUpi
                    ? isSelected
                      ? 'bg-gradient-to-br from-[#4A154B] to-[#1E0938] text-white shadow-[0_8px_24px_rgba(74,21,75,0.35)] ring-2 ring-purple-400'
                      : 'bg-gradient-to-br from-purple-50 to-indigo-50/70 text-[#322A2E] shadow-sm border border-purple-200'
                    : isMastercard
                    ? isSelected
                      ? 'bg-[#322A2E] text-white shadow-[0_8px_24px_rgba(50,42,46,0.3)] ring-2 ring-red-400'
                      : 'bg-[#322A2E] text-white shadow-[0_8px_24px_rgba(50,42,46,0.3)]'
                    : isSelected
                    ? 'bg-[#F4F5F7] text-[#322A2E] shadow-sm border-2 border-[#1A1F71]'
                    : 'bg-[#F4F5F7] text-[#322A2E] shadow-sm border border-gray-200/70'
                }`}
              >
                <div className="flex justify-between items-start mb-5">
                  {isUpi ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-black">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-sm font-extrabold tracking-wider">
                        UPI / VPA Auto-Pay
                      </span>
                    </div>
                  ) : isMastercard ? (
                    <div className="w-12 h-7 relative flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-90 absolute left-0" />
                      <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-90 absolute left-3.5" />
                    </div>
                  ) : (
                    <span className="text-xl font-extrabold italic text-[#1A1F71] tracking-wider">
                      VISA
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Select Radio */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isMastercard || (isUpi && isSelected)
                          ? 'border-white'
                          : isSelected
                          ? 'border-[#322A2E]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isMastercard || (isUpi && isSelected) ? 'bg-white' : 'bg-[#322A2E]'
                          }`}
                        />
                      )}
                    </div>

                    {/* Delete button (if more than 1 item) */}
                    {paymentCards.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePaymentCard(card.id);
                        }}
                        className="p-1 rounded-lg hover:bg-black/10 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove method"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p
                    className={`text-[10px] uppercase font-bold ${
                      isMastercard || (isUpi && isSelected) ? 'text-white/70' : 'text-[#8E8E93]'
                    }`}
                  >
                    {isUpi ? 'UPI Virtual ID' : 'Card Number'}
                  </p>
                  <p className="text-sm font-mono font-bold tracking-wider">
                    {card.upiId || card.numberMasked}
                  </p>
                </div>

                <div className="flex justify-between items-end mt-4 pt-2 border-t border-white/10">
                  <div>
                    <span
                      className={`text-[9px] uppercase font-semibold block ${
                        isMastercard || (isUpi && isSelected) ? 'text-white/60' : 'text-[#8E8E93]'
                      }`}
                    >
                      Holder
                    </span>
                    <span className="text-xs font-bold">{card.holderName}</span>
                  </div>

                  <div>
                    <span
                      className={`text-[9px] uppercase font-semibold block ${
                        isMastercard || (isUpi && isSelected) ? 'text-white/60' : 'text-[#8E8E93]'
                      }`}
                    >
                      {isUpi ? 'Deep Link' : 'Expires'}
                    </span>
                    <span className="text-xs font-bold">{card.expiry}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#EF2A39] text-[#6A6A6A] hover:text-[#EF2A39] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Payment Method (UPI / Card)</span>
          </button>
        </div>
      </div>

      {/* Add New Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl text-left animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-[#322A2E] mb-1">
              Add Payment Method
            </h3>
            <p className="text-xs text-[#8E8E93] mb-4">
              Select UPI ID for mobile app auto-redirects or save a card.
            </p>

            {/* Modal Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setModalTab('upi');
                  setFormError(null);
                }}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'upi'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI ID</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalTab('card');
                  setFormError(null);
                }}
                className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalTab === 'card'
                    ? 'bg-[#322A2E] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-3">
              {modalTab === 'upi' ? (
                /* UPI Form */
                <>
                  <div>
                    <label className="text-[11px] font-bold text-[#8E8E93] block mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={newUpiId}
                      onChange={(e) => setNewUpiId(e.target.value)}
                      placeholder="e.g. anas@okicici or 9876543210@paytm"
                      className="w-full bg-[#F4F5F7] rounded-xl px-4 py-3 text-xs font-mono font-bold text-[#322A2E] outline-none border border-transparent focus:border-purple-500"
                      required
                    />
                  </div>

                  {/* Suffix Quick Buttons */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">
                      Quick Handle Suffix:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {popularUpiSuffixes.map((sfx) => (
                        <button
                          key={sfx}
                          type="button"
                          onClick={() => handleAppendSuffix(sfx)}
                          className="px-2 py-1 bg-gray-100 hover:bg-purple-100 text-purple-700 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
                        >
                          {sfx}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#8E8E93] block mb-1">
                      Account / Nickname
                    </label>
                    <input
                      type="text"
                      value={newUpiHolder}
                      onChange={(e) => setNewUpiHolder(e.target.value)}
                      placeholder="e.g. Sophia (Google Pay)"
                      className="w-full bg-[#F4F5F7] rounded-xl px-4 py-2.5 text-xs font-bold text-[#322A2E] outline-none border border-transparent focus:border-purple-500"
                    />
                  </div>
                </>
              ) : (
                /* Card Form */
                <>
                  <div>
                    <label className="text-[11px] font-bold text-[#8E8E93] block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value)}
                      placeholder="5105 4522 8931 0505"
                      className="w-full bg-[#F4F5F7] rounded-xl px-4 py-3 text-xs font-mono font-bold text-[#322A2E] outline-none border border-transparent focus:border-[#EF2A39]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCardType('mastercard')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        newCardType === 'mastercard'
                          ? 'bg-[#322A2E] text-white border-[#322A2E]'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      Mastercard
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCardType('visa')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        newCardType === 'visa'
                          ? 'bg-[#1A1F71] text-white border-[#1A1F71]'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      Visa
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-[#F4F5F7] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#322A2E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#8E8E93] block mb-1">
                        Cardholder
                      </label>
                      <input
                        type="text"
                        value={newCardHolder}
                        onChange={(e) => setNewCardHolder(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-[#F4F5F7] rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {formError && (
                <p className="text-xs text-red-500 font-bold mt-2">
                  {formError}
                </p>
              )}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer ${
                    modalTab === 'upi' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#EF2A39] hover:bg-[#D81C2B]'
                  }`}
                >
                  Save {modalTab === 'upi' ? 'UPI ID' : 'Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
