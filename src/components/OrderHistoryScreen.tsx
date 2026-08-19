import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Clock, ShoppingBag, ArrowRight, Layers, CreditCard, QrCode, Truck, Soup, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';

export const OrderHistoryScreen: React.FC = () => {
  const { orders, goBack, navigateTo, setDirectCheckoutItem } = useApp();

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

          <h2 className="text-base font-extrabold text-[#322A2E]">
            Order History & Status
          </h2>

          <div className="w-8" />
        </div>

        {/* Orders List */}
        <div className="px-6 pt-4 space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#8E8E93]">No past orders yet.</p>
              <button
                onClick={() => navigateTo('home')}
                className="mt-4 px-6 py-2.5 bg-[#EF2A39] text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer"
              >
                Order Now
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-gray-100/90"
              >
                {/* Order Top Line */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-[#EF2A39]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#8E8E93] block mt-0.5">
                      {order.date}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {order.status}
                    </span>

                    {/* Payment Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black flex items-center gap-1 ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100/80 text-emerald-800'
                          : order.paymentStatus === 'Pending Verification'
                          ? 'bg-amber-100/80 text-amber-800'
                          : 'bg-red-100/80 text-red-800'
                      }`}
                    >
                      {order.paymentStatus === 'Pending Verification' ? (
                        <Clock className="w-2.5 h-2.5 animate-pulse" />
                      ) : order.paymentStatus === 'Paid' ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : null}
                      <span>{order.paymentStatus || 'Pending Verification'}</span>
                    </span>
                  </div>
                </div>

                {/* Delivery details snapshot */}
                {(order.deliverySlot || order.deliveryType) && (
                  <div className="mb-2.5 px-2.5 py-1.5 bg-gray-50 rounded-xl flex items-center justify-between text-[11px] font-bold text-gray-700 border border-gray-100">
                    <span className="flex items-center gap-1.5">
                      {order.deliveryType === 'urgent' ? (
                        <Zap className="w-3.5 h-3.5 text-[#EF2A39] fill-[#EF2A39]" />
                      ) : (
                        <Truck className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <span>
                        {order.deliveryType === 'urgent'
                          ? 'Urgent Delivery'
                          : `Delivery Slot: ${order.deliverySlot || 'Scheduled'}`}
                      </span>
                    </span>
                    {order.deliveryFees && order.deliveryFees > 0 ? (
                      <span className="text-[10px] text-gray-500">₹{order.deliveryFees.toFixed(2)}</span>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">FREE</span>
                    )}
                  </div>
                )}

                {/* UPI UTR Reference Note */}
                {order.upiTransactionNote && (
                  <div className="mb-2.5 px-2.5 py-1 bg-purple-50 rounded-lg text-[10px] font-mono text-purple-900 flex items-center justify-between border border-purple-100">
                    <span className="font-semibold">UPI UTR / Ref:</span>
                    <span className="font-bold">{order.upiTransactionNote}</span>
                  </div>
                )}

                {/* Items in this order */}
                <div className="space-y-2.5 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between text-xs">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-contain rounded-lg border border-gray-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-extrabold text-[#322A2E] leading-tight">
                            {item.portion}x {item.name}
                          </p>

                          {/* Selected Variant */}
                          {item.selectedVariant && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#EF2A39] mt-0.5">
                              <Layers className="w-3 h-3" />
                              <span>{item.selectedVariant.optionName}</span>
                            </div>
                          )}

                          {/* Salna Level / Curry Snapshot */}
                          {item.curry && item.curry.enabled && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 mt-0.5">
                              <Soup className="w-3 h-3" />
                              <span>
                                Salna Level: {item.curry.curryName} ({item.curry.unitsPerProduct} {item.curry.unitLabel || 'Spoon'}{item.curry.unitsPerProduct > 1 ? 's' : ''} × ₹{item.curry.pricePerUnit.toFixed(2)})
                              </span>
                            </div>
                          )}

                          {/* Selected Customization Sections */}
                          {item.selectedSections && item.selectedSections.length > 0 && (
                            <p className="text-[10px] font-semibold text-gray-600 mt-0.5">
                              {item.selectedSections.map((s) => s.itemName).join(', ')}
                            </p>
                          )}

                          {/* Selected Add-ons */}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              + {item.selectedOptions.map((o) => o.optionName).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="font-extrabold text-[#322A2E]">
                        ₹{item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Reorder Button */}
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-[#8E8E93] font-semibold">Total</span>
                    <p className="text-base font-black text-[#322A2E] leading-tight">
                      ₹{order.total.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (order.items.length > 0) {
                        setDirectCheckoutItem(order.items[0]);
                      }
                    }}
                    className="px-4 py-2 bg-[#322A2E] hover:bg-[#201A1D] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Reorder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};
