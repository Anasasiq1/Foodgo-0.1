import React from 'react';
import {
  Package,
  FolderTree,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Flame,
  Star,
  ChevronRight,
} from 'lucide-react';
import { DashboardStats, AdminProductItem, AdminTab } from '../types';
import { Order } from '../../types';

interface AdminDashboardTabProps {
  stats: DashboardStats | null;
  recentOrders: Order[];
  bestSellers: { name: string; count: number; revenue: number; image: string }[];
  onNavigateTab: (tab: AdminTab) => void;
  onViewOrder: (order: Order) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  stats,
  recentOrders,
  bestSellers,
  onNavigateTab,
  onViewOrder,
}) => {
  return (
    <div className="space-y-7">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-[#322A2E] to-[#45373E] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_8px_30px_rgba(50,42,46,0.15)] relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#EF2A39]" />
            <span>Store Overview & Live Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, Anas! 🍔
          </h1>
          <p className="text-white/70 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Monitor incoming customer burger orders, manage product catalog, track deliveries and review system activity in real time.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-5 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View All Orders</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93]">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#322A2E]">
            ${stats ? stats.totalRevenue.toFixed(2) : '0.00'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Today: ${stats ? stats.todayRevenue.toFixed(2) : '0.00'}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93]">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#EF2A39] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#322A2E]">
            {stats ? stats.totalOrders : 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#EF2A39] mt-2">
            <span>{stats ? stats.todayOrders : 0} placed today</span>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93]">Active Products</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#322A2E]">
            {stats ? stats.totalProducts : 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 mt-2">
            <span>{stats ? stats.totalCategories : 0} categories active</span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93]">Registered Customers</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#322A2E]">
            {stats ? stats.totalCustomers : 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 mt-2">
            <span>100% active retention</span>
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-amber-200/50 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#8E8E93] font-bold">Pending / In Transit</span>
            <p className="text-lg font-black text-[#322A2E]">
              {stats ? stats.pendingOrders : 0} Orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/50 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#8E8E93] font-bold">Completed & Delivered</span>
            <p className="text-lg font-black text-[#322A2E]">
              {stats ? stats.completedOrders : 0} Orders
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200/50 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#8E8E93] font-bold">Cancelled / Refunded</span>
            <p className="text-lg font-black text-[#322A2E]">
              {stats ? stats.cancelledOrders : 0} Orders
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-[#322A2E]">Recent Customer Orders</h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">Latest transactions submitted on the website</p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-extrabold text-[#EF2A39] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <p className="py-8 text-center text-xs font-bold text-gray-400">No orders registered yet</p>
              ) : (
                recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => onViewOrder(ord)}
                    className="py-3.5 flex items-center justify-between hover:bg-gray-50/60 rounded-xl px-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F5F7] flex items-center justify-center font-mono font-bold text-xs text-[#322A2E]">
                        {ord.paymentMethod === 'mastercard' ? 'MC' : 'VI'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#322A2E]">{ord.orderNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-600'
                                : ord.status === 'In Transit'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8E8E93] font-medium block mt-0.5">
                          {ord.items.length} item(s) • {ord.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-[#322A2E]">
                        ${ord.total.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-bold text-[#EF2A39] flex items-center justify-end gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Sellers (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-[#322A2E]">Popular Burgers</h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">Highest order volume</p>
              </div>
              <Flame className="w-5 h-5 text-[#EF2A39]" />
            </div>

            <div className="space-y-4">
              {bestSellers.length === 0 ? (
                <p className="py-8 text-center text-xs font-bold text-gray-400">No sales recorded yet</p>
              ) : (
                bestSellers.map((item, idx) => (
                  <div key={item.name + idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#322A2E] leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#8E8E93]">
                          {item.count} portions sold
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-black text-[#EF2A39]">
                      ${item.revenue.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('favorites')}
            className="w-full mt-6 py-2.5 bg-[#F4F5F7] hover:bg-[#EBEEF2] text-[#322A2E] text-xs font-bold rounded-2xl transition-colors text-center cursor-pointer"
          >
            Manage Featured Showcase
          </button>
        </div>
      </div>
    </div>
  );
};
