import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronDown,
  X,
  CreditCard,
  MapPin,
  Flame,
  Check,
  AlertTriangle,
  QrCode,
  Layers,
  Soup,
} from 'lucide-react';
import { Order } from '../../types';
import { adminFetch } from '../adminApi';

interface AdminOrdersTabProps {
  orders: Order[];
  onRefresh: () => void;
  selectedOrderModal: Order | null;
  onCloseOrderModal: () => void;
  onOpenOrderModal: (order: Order) => void;
}

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
] as const;

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onRefresh,
  selectedOrderModal,
  onCloseOrderModal,
  onOpenOrderModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error updating order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to confirm payment');
      }
      alert('Payment successfully verified and marked as Paid!');
      onRefresh();
      if (selectedOrderModal && selectedOrderModal.id === orderId) {
        onCloseOrderModal();
      }
    } catch (e: any) {
      alert(e.message || 'Error verifying payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    const reason = prompt('Please enter the rejection reason (e.g. UTR not found in bank account):');
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject payment');
      }
      alert('Payment rejected and order cancelled.');
      onRefresh();
      if (selectedOrderModal && selectedOrderModal.id === orderId) {
        onCloseOrderModal();
      }
    } catch (e: any) {
      alert(e.message || 'Error rejecting payment');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#322A2E]">
          Order Processing & Live Dispatch
        </h2>
        <p className="text-xs text-[#8E8E93] mt-0.5">
          Verify UPI receipts, check portions & customizations, and control live fulfillment workflow.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 flex items-center bg-[#F4F5F7] rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #FG-..., item name, customer..."
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

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Pending', 'In Transit', 'Preparing', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
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

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] text-[#8E8E93] uppercase font-bold tracking-wider border-b border-gray-100">
                <th className="py-4 px-5">Order #</th>
                <th className="py-4 px-4">Date & Time</th>
                <th className="py-4 px-4">Customer & Items</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Payment & Verification</th>
                <th className="py-4 px-4">Order Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-[#322A2E]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-bold">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Order Number */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-mono font-black text-xs text-[#EF2A39]">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {ord.estimatedDelivery || '30 mins'}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-gray-600 font-semibold">
                      {ord.date}
                    </td>

                    {/* Customer & Items Summary */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="font-bold text-[#322A2E] block">
                          {ord.customer?.name || 'Customer'}
                        </span>
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          {ord.items.map((it) => (
                            <span key={it.id} className="mr-1.5 inline-block">
                              {it.portion}x {it.name}
                              {it.selectedVariant ? ` (${it.selectedVariant.optionName})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-black text-sm text-[#322A2E]">
                      <div>
                        <span>₹{ord.total.toFixed(2)}</span>
                        {ord.deliveryType && (
                          <div className="text-[10px] text-gray-500 font-normal">
                            {ord.deliveryType === 'urgent' ? '⚡ Urgent' : `Slot: ${ord.deliverySlot || 'Scheduled'}`}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Payment & Verification status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 uppercase font-bold text-[10px] text-gray-600">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          <span>{ord.paymentMethod}</span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.paymentStatus === 'Pending Verification'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.paymentStatus === 'Payment Failed / Rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {ord.paymentStatus || (ord.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Paid')}
                        </span>

                        {ord.paymentMethod === 'upi' && ord.paymentStatus === 'Pending Verification' && (
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={() => handleConfirmPayment(ord.id)}
                              disabled={actionLoading}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-extrabold cursor-pointer"
                              title="Verify & Confirm Receipt"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleRejectPayment(ord.id)}
                              disabled={actionLoading}
                              className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-[10px] font-extrabold cursor-pointer"
                              title="Reject Payment"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Order Status selector */}
                    <td className="py-4 px-4">
                      <div className="relative inline-block">
                        <select
                          value={ord.status}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className={`appearance-none px-3 py-1.5 pr-7 rounded-full text-[11px] font-extrabold border outline-none cursor-pointer ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'In Transit' || ord.status === 'Out for Delivery'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => onOpenOrderModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-[#F4F5F7] hover:bg-[#322A2E] hover:text-white text-[#322A2E] text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-6 max-h-[90vh] flex flex-col">
            <button
              onClick={onCloseOrderModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-black text-[#EF2A39]">
                {selectedOrderModal.orderNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedOrderModal.status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-700'
                    : selectedOrderModal.status === 'Cancelled'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {selectedOrderModal.status}
              </span>
            </div>

            <h3 className="text-xl font-black text-[#322A2E]">
              Order Information
            </h3>
            <p className="text-xs text-[#8E8E93] mb-4">
              Submitted: {selectedOrderModal.date} • Est. Time: {selectedOrderModal.estimatedDelivery}
            </p>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Delivery Address & Customer Info */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-[#322A2E]">
                  <MapPin className="w-4 h-4 text-[#EF2A39] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Delivery Address:</span>
                    <p className="text-gray-600 font-medium">
                      {selectedOrderModal.customer?.address || '123 Gourmet Ave'} ({selectedOrderModal.customer?.name || 'Customer'})
                    </p>
                    {selectedOrderModal.customer?.phone && (
                      <p className="text-gray-500 text-[11px]">
                        Phone: {selectedOrderModal.customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-2 border-t border-gray-200/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">Delivery Preference:</span>
                    <span className="font-bold text-[#322A2E]">
                      {selectedOrderModal.deliveryType === 'urgent'
                        ? '⚡ Urgent Delivery'
                        : `Scheduled Slot: ${selectedOrderModal.deliverySlot || 'Standard'}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">Payment Method:</span>
                    <span className="font-bold uppercase text-[#322A2E]">
                      {selectedOrderModal.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700">Payment Status:</span>
                    <span
                      className={`font-extrabold text-[11px] px-2 py-0.5 rounded-full ${
                        selectedOrderModal.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrderModal.paymentStatus === 'Pending Verification'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {selectedOrderModal.paymentStatus || 'Paid'}
                    </span>
                  </div>

                  {selectedOrderModal.upiTransactionNote && (
                    <div className="bg-amber-50 p-2.5 rounded-xl text-amber-900 text-[11px] mt-1 border border-amber-200">
                      <span className="font-bold">Customer UPI Ref / UTR:</span> {selectedOrderModal.upiTransactionNote}
                    </div>
                  )}

                  {selectedOrderModal.paymentMethod === 'upi' && selectedOrderModal.paymentStatus === 'Pending Verification' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleConfirmPayment(selectedOrderModal.id)}
                        disabled={actionLoading}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirm UPI Payment Received
                      </button>
                      <button
                        onClick={() => handleRejectPayment(selectedOrderModal.id)}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-[#8E8E93] uppercase tracking-wider">
                  Configured Items & Customizations
                </h4>
                {selectedOrderModal.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200/80 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 object-cover rounded-xl border border-gray-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h5 className="text-xs font-black text-[#322A2E]">
                          {item.portion}x {item.name}
                        </h5>

                        {/* Selected Variant snapshot */}
                        {item.selectedVariant && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#EF2A39]">
                            <Layers className="w-3 h-3" />
                            <span>{item.selectedVariant.groupName}: {item.selectedVariant.optionName}</span>
                          </div>
                        )}

                        {/* Curry / Salna Level snapshot */}
                        {item.curry && item.curry.enabled && (
                          <div className="flex items-center gap-1 text-[10.5px] font-black text-orange-600">
                            <Soup className="w-3 h-3" />
                            <span>
                              Salna Level: {item.curry.curryName} ({item.curry.unitsPerProduct} {item.curry.unitLabel || 'Spoon'}{item.curry.unitsPerProduct > 1 ? 's' : ''} × ₹{item.curry.pricePerUnit.toFixed(2)})
                            </span>
                          </div>
                        )}

                        {/* Selected Options / Addons */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-[10px] text-gray-600">
                            {item.selectedOptions.map((o) => (
                              <span key={o.optionId} className="mr-1.5 font-semibold">
                                + {o.optionName} (₹{o.price.toFixed(2)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-xs text-[#322A2E] block">
                        ₹{item.totalPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        (₹{item.unitPrice.toFixed(2)} ea)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (Server Calculated)</span>
                  <span className="font-bold">₹{selectedOrderModal.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span className="font-bold">₹{selectedOrderModal.taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold">₹{selectedOrderModal.deliveryFees.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-[#322A2E]">
                  <span>Total Amount</span>
                  <span className="text-[#EF2A39]">₹{selectedOrderModal.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Update Status Actions inside modal */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 shrink-0">
              <label className="text-xs font-bold text-[#8E8E93]">
                Change Order State:
              </label>
              <select
                value={selectedOrderModal.status}
                onChange={(e) => {
                  handleUpdateStatus(selectedOrderModal.id, e.target.value);
                  selectedOrderModal.status = e.target.value as any;
                }}
                className="bg-[#322A2E] text-white text-xs font-extrabold rounded-xl px-4 py-2.5 outline-none cursor-pointer"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
