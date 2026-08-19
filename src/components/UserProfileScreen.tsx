import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Settings, ChevronRight, Edit3, LogOut } from 'lucide-react';
import { BottomNavigation } from './BottomNavigation';

export const UserProfileScreen: React.FC = () => {
  const { user, goBack, navigateTo, resetToDefaults } = useApp();

  const handleLogout = () => {
    resetToDefaults();
    navigateTo('splash');
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between pb-28">
      <div>
        {/* Top Red Curve Header */}
        <div className="relative w-full h-[170px] bg-[#EF2A39] rounded-b-[40px] px-6 pt-7 pb-4 flex items-start justify-between shadow-[0_6px_24px_rgba(239,42,57,0.3)]">
          {/* Subtle background food motifs */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-b-[40px]" />

          {/* Back Button */}
          <button
            onClick={goBack}
            className="relative z-10 w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigateTo('edit-profile')}
            className="relative z-10 w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Overlapping Avatar */}
          <div className="absolute left-1/2 -bottom-14 -translate-x-1/2 z-20 cursor-pointer" onClick={() => navigateTo('edit-profile')}>
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl p-1 bg-white shadow-[0_10px_25px_rgba(239,42,57,0.25)] border-[3px] border-[#EF2A39]/80 overflow-hidden transition-transform group-hover:scale-105">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#322A2E] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:bg-[#EF2A39] transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Space for overlapping avatar */}
        <div className="h-16" />

        {/* Profile Form Fields Display */}
        <div className="px-6 space-y-4 pt-2">
          {/* Name Field */}
          <div className="relative bg-white border border-gray-200/90 rounded-2xl px-5 pt-3 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <label className="text-[11px] font-bold text-[#8E8E93] block leading-none mb-1">
              Name
            </label>
            <div className="text-[15px] font-extrabold text-[#322A2E]">
              {user.name}
            </div>
          </div>

          {/* Email Field */}
          <div className="relative bg-white border border-gray-200/90 rounded-2xl px-5 pt-3 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <label className="text-[11px] font-bold text-[#8E8E93] block leading-none mb-1">
              Email
            </label>
            <div className="text-[14px] font-bold text-[#322A2E]">
              {user.email}
            </div>
          </div>

          {/* Delivery Address Field */}
          <div className="relative bg-white border border-gray-200/90 rounded-2xl px-5 pt-3 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <label className="text-[11px] font-bold text-[#8E8E93] block leading-none mb-1">
              Delivery address
            </label>
            <div className="text-[14px] font-bold text-[#322A2E] leading-snug">
              {user.address}
            </div>
          </div>

          {/* Password Field */}
          <div className="relative bg-white border border-gray-200/90 rounded-2xl px-5 pt-3 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <label className="text-[11px] font-bold text-[#8E8E93] flex items-center gap-1 leading-none mb-1">
              <span>Password</span>
              <span>🔒</span>
            </label>
            <div className="text-[16px] tracking-widest font-extrabold text-[#322A2E]">
              {user.passwordMasked}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6 my-5">
          <div className="border-t border-gray-200/70" />
        </div>

        {/* Navigation Rows */}
        <div className="px-6 space-y-1">
          {/* Payment Details */}
          <button
            onClick={() => navigateTo('payment-methods')}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50/80 rounded-xl px-2 transition-colors active:scale-[0.99]"
          >
            <span className="text-[15px] font-bold text-[#6A6A6A]">
              Payment Details
            </span>
            <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
          </button>

          {/* Order history */}
          <button
            onClick={() => navigateTo('order-history')}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50/80 rounded-xl px-2 transition-colors active:scale-[0.99]"
          >
            <span className="text-[15px] font-bold text-[#6A6A6A]">
              Order history
            </span>
            <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
          </button>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          {/* Edit Profile Button (Dark) */}
          <button
            onClick={() => navigateTo('edit-profile')}
            className="flex-1 h-[54px] bg-[#322A2E] hover:bg-[#231C20] text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold shadow-[0_6px_16px_rgba(50,42,46,0.25)] transition-transform active:scale-95"
          >
            <span>Edit Profile</span>
            <Edit3 className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Log out Button (White with red border) */}
          <button
            onClick={handleLogout}
            className="flex-1 h-[54px] bg-white border-2 border-[#EF2A39] hover:bg-[#EF2A39]/5 text-[#EF2A39] rounded-2xl flex items-center justify-center gap-2 text-sm font-extrabold transition-transform active:scale-95"
          >
            <span>Log out</span>
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Fixed bottom navigation */}
      <BottomNavigation />
    </div>
  );
};
