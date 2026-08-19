import React from 'react';
import { Star, Flame, Sparkles, Check, X } from 'lucide-react';
import { AdminProductItem } from '../types';
import { adminFetch } from '../adminApi';

interface AdminFavoritesTabProps {
  products: AdminProductItem[];
  onRefresh: () => void;
}

export const AdminFavoritesTab: React.FC<AdminFavoritesTabProps> = ({
  products,
  onRefresh,
}) => {
  const handleToggle = async (prod: AdminProductItem, field: 'featured' | 'popular') => {
    try {
      await adminFetch(`/api/admin/products/${prod.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const featuredProducts = products.filter((p) => p.featured);
  const popularProducts = products.filter((p) => p.popular);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-[#322A2E]">
          Featured & Popular Showcase Curation
        </h2>
        <p className="text-xs text-[#8E8E93] mt-0.5">
          Curate which burgers receive homepage spotlight badges and higher customer visibility.
        </p>
      </div>

      {/* Featured Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#322A2E]">
                Featured Hero Showcase ({featuredProducts.length})
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Highlighted prominently with special promotion styling.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((prod) => (
            <div
              key={'feat-' + prod.id}
              className={`rounded-3xl p-4 border transition-all ${
                prod.featured
                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                  : 'bg-[#F8F9FA] border-gray-200/80 opacity-75'
              }`}
            >
              <div className="w-full h-28 rounded-2xl overflow-hidden bg-white mb-3 border border-gray-200/60">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h4 className="text-xs font-black text-[#322A2E] truncate">
                {prod.name}
              </h4>
              <p className="text-[11px] text-[#8E8E93] truncate mb-3">
                {prod.subtitle} • ${prod.price.toFixed(2)}
              </p>

              <button
                onClick={() => handleToggle(prod, 'featured')}
                className={`w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  prod.featured
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {prod.featured ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Featured Active</span>
                  </>
                ) : (
                  <span>Set as Featured</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Section */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#EF2A39] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#322A2E]">
                Popular & Trending Badges ({popularProducts.length})
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Displays flame tag on customer home product cards.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((prod) => (
            <div
              key={'pop-' + prod.id}
              className={`rounded-3xl p-4 border transition-all ${
                prod.popular
                  ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400/20 shadow-xs'
                  : 'bg-[#F8F9FA] border-gray-200/80 opacity-75'
              }`}
            >
              <div className="w-full h-28 rounded-2xl overflow-hidden bg-white mb-3 border border-gray-200/60">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h4 className="text-xs font-black text-[#322A2E] truncate">
                {prod.name}
              </h4>
              <p className="text-[11px] text-[#8E8E93] truncate mb-3">
                {prod.subtitle} • ${prod.price.toFixed(2)}
              </p>

              <button
                onClick={() => handleToggle(prod, 'popular')}
                className={`w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  prod.popular
                    ? 'bg-[#EF2A39] hover:bg-[#D81C2B] text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {prod.popular ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Popular Active</span>
                  </>
                ) : (
                  <span>Mark as Popular</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
