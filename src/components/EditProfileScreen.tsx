import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Save, Check, Camera, Upload, RefreshCw } from 'lucide-react';

export const EditProfileScreen: React.FC = () => {
  const { user, updateUser, goBack } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size exceeds 5MB limit. Please choose a smaller picture.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64Url = event.target.result as string;
        setAvatar(base64Url);
        // Instantly reflect in global user state so header & profile update in real time
        updateUser({ avatar: base64Url });
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      address,
      phone,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      goBack();
    }, 700);
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
            Edit Profile
          </h2>

          <div className="w-8" />
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="px-6 pt-5 space-y-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative group cursor-pointer" onClick={handleTriggerUpload}>
              <div className="w-28 h-28 rounded-3xl p-1 bg-white shadow-[0_8px_24px_rgba(239,42,57,0.22)] border-[3px] border-[#EF2A39] overflow-hidden transition-transform group-hover:scale-105">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Camera Action Badge */}
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-[#EF2A39] text-white flex items-center justify-center shadow-lg border-2 border-white group-hover:bg-[#D81C2B] transition-colors">
                <Camera className="w-4 h-4 stroke-[2.5]" />
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="profile-image-upload"
              />
            </div>

            <button
              type="button"
              onClick={handleTriggerUpload}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#EF2A39] bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>

            {imageError && (
              <p className="text-xs text-red-500 font-bold mt-2 text-center">
                {imageError}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#EF2A39] shadow-xs">
            <label className="text-[11px] font-bold text-[#8E8E93] block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm font-bold text-[#322A2E] bg-transparent outline-none mt-1"
              required
            />
          </div>

          {/* Email */}
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#EF2A39] shadow-xs">
            <label className="text-[11px] font-bold text-[#8E8E93] block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm font-bold text-[#322A2E] bg-transparent outline-none mt-1"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#EF2A39] shadow-xs">
            <label className="text-[11px] font-bold text-[#8E8E93] block">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-sm font-bold text-[#322A2E] bg-transparent outline-none mt-1"
            />
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#EF2A39] shadow-xs">
            <label className="text-[11px] font-bold text-[#8E8E93] block">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full text-sm font-bold text-[#322A2E] bg-transparent outline-none mt-1 resize-none"
              required
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-[54px] bg-[#EF2A39] hover:bg-[#D81C2B] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(239,42,57,0.3)] transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-5 h-5 stroke-[2.2]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
