import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  X,
  Sliders,
  QrCode,
  Truck,
  ShieldCheck,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PaymentRecord, PaymentSettings } from '../../types';
import { adminFetch } from '../adminApi';

interface AdminPaymentsTabProps {
  payments: PaymentRecord[];
}

export const AdminPaymentsTab: React.FC<AdminPaymentsTabProps> = ({ payments }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'gateways'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Gateway settings state
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await adminFetch('/api/admin/payment-settings');
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.data);
      }
    } catch (e) {
      console.error('Failed to load payment settings', e);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSavingSettings(true);
    try {
      const res = await adminFetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update payment settings');
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      alert(e.message || 'Failed to save gateway settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Sub-tab Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#322A2E]">
            Payment & Gateway Management
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Configure UPI parameters, QR codes, Credit Card gateway simulations, and view financial ledger.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F4F5F7] p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'ledger'
                ? 'bg-[#322A2E] text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Transaction Ledger
          </button>
          <button
            onClick={() => setActiveSubTab('gateways')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'gateways'
                ? 'bg-[#322A2E] text-white shadow-xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gateway Configs</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'gateways' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] max-w-4xl">
          {isLoadingSettings || !settings ? (
            <div className="py-16 text-center text-gray-400 font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading payment configurations...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* UPI Configuration Section */}
              <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                      UPI
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#322A2E]">
                        UPI / Direct Payment (Google Pay, PhonePe, Paytm)
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Allow customers to scan dynamic/static QR or enter UPI VPA for instant direct bank settlement.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.upi.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          upi: { ...settings.upi, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {settings.upi.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Merchant UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={settings.upi.vpaId}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            upi: { ...settings.upi, vpaId: e.target.value },
                          })
                        }
                        placeholder="e.g. foodgo@upi"
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Merchant Display Name (Google Pay)
                      </label>
                      <input
                        type="text"
                        value={settings.upi.merchantName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            upi: { ...settings.upi, merchantName: e.target.value },
                          })
                        }
                        placeholder="e.g. Foodgo Burgers"
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Store QR Code Image URL (Static fallback)
                      </label>
                      <input
                        type="text"
                        value={settings.upi.qrCodeImageUrl || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            upi: { ...settings.upi, qrCodeImageUrl: e.target.value },
                          })
                        }
                        placeholder="https://.../qr.png or leave empty for auto-generated"
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Customer Checkout Instructions
                      </label>
                      <input
                        type="text"
                        value={settings.upi.instructions}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            upi: { ...settings.upi, instructions: e.target.value },
                          })
                        }
                        placeholder="Pay via Google Pay and submit 12-digit UTR ref"
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Gateway Section */}
              <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#322A2E]">
                        Credit / Debit Card Online Payment
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Supports Visa, Mastercard, RuPay, Amex with PCI-compliant tokenization & instant settlement.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.card.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          card: { ...settings.card, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.card.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Gateway Provider
                      </label>
                      <select
                        value={settings.card.provider}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            card: { ...settings.card, provider: e.target.value as any },
                          })
                        }
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none cursor-pointer"
                      >
                        <option value="mock">Simulated Payment Gateway (Instant Demo Verification)</option>
                        <option value="stripe">Stripe Payment Gateway</option>
                        <option value="razorpay">Razorpay Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Mode
                      </label>
                      <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#322A2E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.card.testMode}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                card: { ...settings.card, testMode: e.target.checked },
                              })
                            }
                            className="rounded text-blue-600"
                          />
                          <span>Enable Test / Sandbox Simulation Mode</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cash On Delivery Section */}
              <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#322A2E]">
                        Cash on Delivery (COD)
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Allow customers to pay via cash or delivery UPI when driver arrives at their address.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.cod.enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cod: { ...settings.cod, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {settings.cod.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Extra COD Handling Fee ($)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.cod.extraFee}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cod: { ...settings.cod, extraFee: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        Max Order Limit for COD ($)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={settings.cod.maxOrderLimit || 100}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cod: { ...settings.cod, maxOrderLimit: parseFloat(e.target.value) || 100 },
                          })
                        }
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">
                        COD Customer Note / Instructions
                      </label>
                      <input
                        type="text"
                        value={settings.cod.instructions}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            cod: { ...settings.cod, instructions: e.target.value },
                          })
                        }
                        className="w-full bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] border border-gray-200 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-2xl bg-[#EF2A39] hover:bg-[#D92230] text-white text-xs font-black flex items-center gap-2 shadow-[0_4px_16px_rgba(239,42,57,0.25)] transition-all cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Gateways...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Payment Gateways</span>
                    </>
                  )}
                </button>

                {saveSuccess && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl">
                    <Check className="w-4 h-4" />
                    <span>Payment gateways saved successfully!</span>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      ) : (
        <>
          {/* Filter & Search */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 flex items-center bg-[#F4F5F7] rounded-2xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Payment ID, Order #, Customer..."
                className="w-full text-xs font-semibold text-[#322A2E] bg-transparent outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {['All', 'Paid', 'Pending', 'Refunded'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#322A2E] text-white shadow-xs'
                      : 'bg-[#F4F5F7] text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-3xl border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[#8E8E93] uppercase font-bold tracking-wider border-b border-gray-100">
                    <th className="py-4 px-5">Payment ID</th>
                    <th className="py-4 px-4">Order Ref</th>
                    <th className="py-4 px-4">Customer Name</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Payment Method</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Date Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-[#322A2E]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                        No payment records match criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Payment ID */}
                        <td className="py-4 px-5 font-mono font-bold text-xs text-[#322A2E]">
                          {pay.id}
                        </td>

                        {/* Order Ref */}
                        <td className="py-4 px-4 font-mono font-black text-xs text-[#EF2A39]">
                          {pay.orderNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4 font-extrabold text-[#322A2E]">
                          {pay.customerName}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 font-black text-sm text-[#322A2E]">
                          ${pay.amount.toFixed(2)}
                        </td>

                        {/* Method */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                            <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                            <span>{pay.paymentMethod}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              pay.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : pay.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{pay.status}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-5 text-right text-gray-500 font-semibold text-[11px]">
                          {pay.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
