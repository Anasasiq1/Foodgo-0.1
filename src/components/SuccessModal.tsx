import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, Clock, Truck, Layers, QrCode } from 'lucide-react';

export const SuccessModal: React.FC = () => {
  const { isSuccessModalOpen, closeSuccessModal, lastPlacedOrder } = useApp();

  if (!isSuccessModalOpen) return null;

  const isUpi = lastPlacedOrder?.paymentMethod === 'upi';
  const isCod = lastPlacedOrder?.paymentMethod === 'cod';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[360px] bg-white rounded-[32px] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.18)] text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
        {/* Big Status Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white mb-5 shadow-lg ${
          isUpi
            ? 'bg-purple-600 shadow-purple-600/30'
            : isCod
            ? 'bg-emerald-600 shadow-emerald-600/30'
            : 'bg-[#EF2A39] shadow-[0_8px_20px_rgba(239,42,57,0.35)]'
        }`}>
          {isUpi ? (
            <QrCode className="w-9 h-9" />
          ) : isCod ? (
            <Truck className="w-9 h-9" />
          ) : (
            <Check className="w-10 h-10 stroke-[3.5]" />
          )}
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-black text-[#322A2E] mb-1 tracking-tight">
          {isUpi ? 'Payment Submitted!' : isCod ? 'Order Placed!' : 'Payment Success!'}
        </h2>

        {lastPlacedOrder && (
          <span className="text-xs font-mono font-black text-[#EF2A39] bg-red-50 px-3 py-1 rounded-full mb-3">
            {lastPlacedOrder.orderNumber}
          </span>
        )}

        {/* Description */}
        <p className="text-[#8E8E93] text-xs leading-relaxed mb-6 px-1 font-medium">
          {isUpi
            ? 'Your UPI transaction reference has been recorded. Our kitchen is preparing your customized burger order!'
            : isCod
            ? 'Your cash on delivery burger order has been confirmed! Please keep cash ready when the driver arrives.'
            : 'Your card payment was authorized successfully. Your delicious meal is heading to the kitchen!'}
        </p>

        {/* Button */}
        <button
          onClick={closeSuccessModal}
          className="w-full py-3.5 px-6 bg-[#322A2E] hover:bg-black text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-[0_6px_20px_rgba(50,42,46,0.25)] transition-all active:scale-98 cursor-pointer"
        >
          Track My Order
        </button>
      </div>
    </div>
  );
};
