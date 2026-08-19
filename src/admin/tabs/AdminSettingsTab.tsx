import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Check,
  Save,
  Clock,
  Truck,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { StoreSettings, DeliveryTimeSlot, DeliverySettings } from '../types';
import { adminFetch } from '../adminApi';

interface AdminSettingsTabProps {
  settings: StoreSettings | null;
  onRefresh: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onRefresh,
}) => {
  const [storeName, setStoreName] = useState(settings?.storeName || 'Foodgo');
  const [storeOpen, setStoreOpen] = useState(settings?.storeOpen ?? true);
  const [deliveryFee, setDeliveryFee] = useState(settings?.deliveryFee?.toString() || '0');
  const [taxRate, setTaxRate] = useState(settings?.taxRate?.toString() || '0.30');
  const [minOrder, setMinOrder] = useState(settings?.minOrder?.toString() || '5.00');
  const [currency, setCurrency] = useState(settings?.currency || '₹');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || 'support@foodgo.com');
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || '+91 98765 43210');
  const [address, setAddress] = useState(settings?.address || 'Foodgo Gourmet Kitchen, Main Road, Calicut, Kerala');

  // Delivery Slots & Urgent Delivery State
  const [deliverySlots, setDeliverySlots] = useState<DeliveryTimeSlot[]>(
    settings?.deliverySettings?.slots || [
      { id: 'slot-1', timeLabel: '1:00 PM', fee: 0, active: true, order: 1 },
      { id: 'slot-2', timeLabel: '3:00 PM', fee: 0, active: true, order: 2 },
      { id: 'slot-3', timeLabel: '5:00 PM', fee: 0, active: true, order: 3 },
    ]
  );
  const [urgentEnabled, setUrgentEnabled] = useState(settings?.deliverySettings?.urgentDelivery?.enabled ?? true);
  const [urgentFee, setUrgentFee] = useState(settings?.deliverySettings?.urgentDelivery?.fee?.toString() || '30');
  const [urgentLabel, setUrgentLabel] = useState(settings?.deliverySettings?.urgentDelivery?.label || 'Urgent Delivery (15-25 mins)');
  const [newSlotLabel, setNewSlotLabel] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName);
      setStoreOpen(settings.storeOpen);
      setDeliveryFee(settings.deliveryFee.toString());
      setTaxRate(settings.taxRate.toString());
      setMinOrder(settings.minOrder.toString());
      setCurrency(settings.currency);
      setContactEmail(settings.contactEmail);
      setContactPhone(settings.contactPhone);
      setAddress(settings.address);

      if (settings.deliverySettings) {
        setDeliverySlots(settings.deliverySettings.slots || []);
        setUrgentEnabled(settings.deliverySettings.urgentDelivery?.enabled ?? true);
        setUrgentFee(settings.deliverySettings.urgentDelivery?.fee?.toString() || '30');
        setUrgentLabel(settings.deliverySettings.urgentDelivery?.label || 'Urgent Delivery (15-25 mins)');
      }
    }
  }, [settings]);

  const handleAddSlot = () => {
    if (!newSlotLabel.trim()) return;
    const newSlot: DeliveryTimeSlot = {
      id: `slot-${Date.now()}`,
      timeLabel: newSlotLabel.trim(),
      fee: 0,
      active: true,
      order: deliverySlots.length + 1,
    };
    setDeliverySlots([...deliverySlots, newSlot]);
    setNewSlotLabel('');
  };

  const handleRemoveSlot = (id: string) => {
    setDeliverySlots(deliverySlots.filter((s) => s.id !== id));
  };

  const handleToggleSlot = (id: string) => {
    setDeliverySlots(
      deliverySlots.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const deliverySettingsPayload: DeliverySettings = {
        slots: deliverySlots,
        urgentDelivery: {
          enabled: urgentEnabled,
          fee: parseFloat(urgentFee) || 30,
          label: urgentLabel.trim() || 'Urgent Delivery (15-25 mins)',
        },
      };

      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          storeOpen,
          deliveryFee: parseFloat(deliveryFee) || 0,
          taxRate: parseFloat(taxRate) || 0.3,
          minOrder: parseFloat(minOrder) || 5.0,
          currency,
          contactEmail,
          contactPhone,
          address,
          deliverySettings: deliverySettingsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-[#322A2E]">
          Restaurant & Platform Settings
        </h2>
        <p className="text-xs text-[#8E8E93] mt-0.5">
          Configure restaurant availability, delivery time slots, urgent delivery surcharges, and customer contact parameters.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Store Availability Toggle */}
          <div className="bg-[#F8F9FA] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#EF2A39]">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#322A2E]">
                  Store Ordering Status
                </h4>
                <p className="text-[11px] text-[#8E8E93]">
                  Accepting live customer orders on the website & mobile app
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={storeOpen}
                onChange={(e) => setStoreOpen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Delivery Time Slots & Urgent Delivery (User Requested) */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#322A2E]">
                  Delivery Slots & Urgent Delivery Settings
                </h4>
                <p className="text-[11px] text-[#8E8E93]">
                  Configure free scheduled time slots and fast urgent dispatch fees
                </p>
              </div>
            </div>

            {/* Scheduled Free Slots List */}
            <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#322A2E] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Scheduled Delivery Slots (Free Delivery)
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Free ₹0.00
                </span>
              </div>

              <div className="space-y-2">
                {deliverySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 border border-gray-200 shadow-2xs text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleSlot(slot.id)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                          slot.active ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                        }`}
                      >
                        {slot.active && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className={`font-bold ${slot.active ? 'text-[#322A2E]' : 'text-gray-400 line-through'}`}>
                        {slot.timeLabel}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {slot.fee === 0 ? 'Free' : `₹${slot.fee}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Time Slot */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g. 7:00 PM or 8:30 PM"
                  value={newSlotLabel}
                  onChange={(e) => setNewSlotLabel(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none focus:border-[#EF2A39]"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3.5 py-2 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Slot</span>
                </button>
              </div>
            </div>

            {/* Urgent Delivery Box */}
            <div className="bg-gradient-to-br from-red-50/60 to-orange-50/40 rounded-2xl p-4 border border-red-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#EF2A39] fill-[#EF2A39]" />
                  <div>
                    <h5 className="text-xs font-black text-[#322A2E]">
                      Urgent Delivery Option
                    </h5>
                    <p className="text-[10px] text-gray-500">
                      Priority fast preparation & express courier dispatch
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urgentEnabled}
                    onChange={(e) => setUrgentEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EF2A39]"></div>
                </label>
              </div>

              {urgentEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Urgent Extra Fee (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={urgentFee}
                      onChange={(e) => setUrgentFee(e.target.value)}
                      className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Display Label / Time Estimate
                    </label>
                    <input
                      type="text"
                      value={urgentLabel}
                      onChange={(e) => setUrgentLabel(e.target.value)}
                      className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E8E93]">
              General Store Info
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Brand / Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Primary Currency Symbol
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkout & Pricing Rules */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E8E93]">
              Taxes & Minimums
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Estimated Tax (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Min Order Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8E8E93]">
              Customer Support & Contact Info
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Support Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                Kitchen / Store Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Settings updated and synced successfully!</span>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3.5 bg-[#322A2E] hover:bg-[#201A1D] text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
