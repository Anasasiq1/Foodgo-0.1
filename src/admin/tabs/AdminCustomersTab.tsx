import React, { useState } from 'react';
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, X } from 'lucide-react';
import { CustomerRecord } from '../types';

interface AdminCustomersTabProps {
  customers: CustomerRecord[];
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#322A2E]">
          Customer Directory & Loyalty
        </h2>
        <p className="text-xs text-[#8E8E93] mt-0.5">
          View customer accounts, contact details, delivery addresses and cumulative spend statistics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="relative flex-1 flex items-center bg-[#F4F5F7] rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email address, or city..."
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
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs font-bold text-gray-400">
            No customers match the search criteria.
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#322A2E] text-white flex items-center justify-center font-black text-base shadow-xs">
                    {cust.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                    {cust.status}
                  </span>
                </div>

                <h3 className="text-sm font-black text-[#322A2E] leading-tight">
                  {cust.name}
                </h3>

                <div className="space-y-1.5 mt-3 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{cust.phone}</span>
                  </div>

                  <div className="flex items-start gap-2 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EF2A39] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug line-clamp-2">
                      {cust.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8E8E93] block">
                    Orders
                  </span>
                  <span className="font-black text-[#322A2E]">
                    {cust.totalOrders} Placed
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8E8E93] block">
                    Total Spent
                  </span>
                  <span className="font-black text-[#EF2A39]">
                    ${cust.totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
