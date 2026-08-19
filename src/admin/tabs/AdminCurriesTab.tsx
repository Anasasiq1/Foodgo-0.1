import React, { useState } from 'react';
import {
  Soup,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  Flame,
  Layers,
  ArrowUpDown,
  Utensils,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { CurryOption, AdminProductItem } from '../types';
import { adminFetch } from '../adminApi';

interface AdminCurriesTabProps {
  curries: CurryOption[];
  products?: AdminProductItem[];
  onRefresh: () => void;
}

export const AdminCurriesTab: React.FC<AdminCurriesTabProps> = ({
  curries,
  products = [],
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'instock' | 'outofstock'>('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurry, setEditingCurry] = useState<CurryOption | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('5.00');
  const [unitLabel, setUnitLabel] = useState('Spoon');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [curryToDelete, setCurryToDelete] = useState<CurryOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered curries
  const filteredCurries = curries.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStock =
      filterStock === 'all'
        ? true
        : filterStock === 'instock'
        ? c.active !== false
        : c.active === false;
    return matchesSearch && matchesStock;
  });

  const openAddModal = () => {
    setEditingCurry(null);
    setName('');
    setPricePerUnit('5.00');
    setUnitLabel('Spoon');
    setImage('https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&auto=format&fit=crop&q=80');
    setDescription('Aromatic layered street-style gravy');
    setActive(true);
    setOrder(curries.length + 1);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (curry: CurryOption) => {
    setEditingCurry(curry);
    setName(curry.name);
    setPricePerUnit(curry.pricePerUnit.toString());
    setUnitLabel(curry.unitLabel || 'Spoon');
    setImage(curry.image || '');
    setDescription(curry.description || '');
    setActive(curry.active !== false);
    setOrder(curry.order || 1);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (curry: CurryOption) => {
    try {
      const res = await adminFetch(`/api/admin/curries/${curry.id}/toggle`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(data.error || 'Failed to update curry status');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while updating curry status');
    }
  };

  const handleSaveCurry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Curry name is required');
      return;
    }

    const parsedPrice = parseFloat(pricePerUnit);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be a non-negative number');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        name: name.trim(),
        pricePerUnit: parsedPrice,
        unitLabel: unitLabel.trim() || 'Spoon',
        image: image.trim() || undefined,
        description: description.trim() || undefined,
        active,
        isCurryLevelOption: true,
        order: Number(order) || curries.length + 1,
      };

      let res;
      if (editingCurry) {
        res = await adminFetch(`/api/admin/curries/${editingCurry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await adminFetch('/api/admin/curries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        onRefresh();
      } else {
        setFormError(data.error || 'Failed to save curry option');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Server error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCurry = async () => {
    if (!curryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/curries/${curryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCurryToDelete(null);
        onRefresh();
      } else {
        alert(data.error || 'Failed to delete curry');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting curry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Products using a curry
  const getProductsUsingCurry = (curryId: string) => {
    return products.filter((p) => {
      const cfg = p.curryConfig;
      if (!cfg || !cfg.enabled) return false;
      if (cfg.defaultCurryId === curryId) return true;
      if (cfg.allowedCurryIds && cfg.allowedCurryIds.includes(curryId)) return true;
      return false;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EF2A39] flex items-center justify-center font-bold">
              <Soup className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#322A2E]">Salna Level & Curry Engine</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
                  (Curry Level)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                Manage distinct curry gravies, per-spoon pricing (e.g. Salna ₹5, Kutton Chaps ₹10), and real-time stock availability.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-[#EF2A39] hover:bg-[#d92231] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Curry Option</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Curry Options</p>
            <p className="text-2xl font-black text-[#322A2E] mt-1">{curries.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#322A2E] flex items-center justify-center">
            <Soup className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">In Stock / Active</p>
            <p className="text-2xl font-black text-green-600 mt-1">
              {curries.filter((c) => c.active !== false).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Out of Stock / Paused</p>
            <p className="text-2xl font-black text-red-500 mt-1">
              {curries.filter((c) => c.active === false).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search curry name, gravies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] rounded-xl text-xs text-[#322A2E] placeholder-gray-400 border border-transparent focus:border-gray-300 focus:bg-white transition-all outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-bold hidden sm:inline">Stock Filter:</span>
          <div className="flex items-center p-1 bg-[#F8F9FA] rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setFilterStock('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-colors ${
                filterStock === 'all' ? 'bg-white text-[#322A2E] shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All ({curries.length})
            </button>
            <button
              onClick={() => setFilterStock('instock')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-colors ${
                filterStock === 'instock' ? 'bg-white text-green-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setFilterStock('outofstock')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-colors ${
                filterStock === 'outofstock' ? 'bg-white text-red-500 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Curries Grid / Cards */}
      {filteredCurries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mx-auto mb-3">
            <Soup className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-[#322A2E]">No Curry Options Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery || filterStock !== 'all'
              ? 'No curry options match your search or stock filter criteria.'
              : 'Add your first curry option (e.g. Salna, Kutton Chaps, Chicken Gravy) to enable Salna Level selection for products.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-[#EF2A39] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Curry Option</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCurries.map((curry) => {
            const mappedProds = getProductsUsingCurry(curry.id);
            const isAvailable = curry.active !== false;

            return (
              <div
                key={curry.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isAvailable ? 'border-gray-100' : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div>
                  {/* Card Header with Image & Badge */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {curry.image ? (
                          <img
                            src={curry.image}
                            alt={curry.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold shrink-0">
                            <Soup className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-sm text-[#322A2E] leading-snug">{curry.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-[#EF2A39]">
                              ₹{curry.pricePerUnit.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">
                              / {curry.unitLabel || 'Spoon'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Switch Pill */}
                      <button
                        onClick={() => handleToggleActive(curry)}
                        title={isAvailable ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 transition-all ${
                          isAvailable
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-red-500'}`} />
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>

                    {curry.description && (
                      <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 font-normal">
                        {curry.description}
                      </p>
                    )}
                  </div>

                  {/* Customer Preview Snapshot */}
                  <div className="mx-5 my-2 p-3 bg-[#F8F9FA] rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Customer View</span>
                      <span className="font-bold text-[#322A2E] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        Salna Level (Curry Level)
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                      <span className="text-xs font-bold text-[#322A2E]">{curry.name}</span>
                      <span className="text-xs font-black text-gray-700">
                        ₹{curry.pricePerUnit.toFixed(2)} × 1 {curry.unitLabel || 'Spoon'}
                      </span>
                    </div>
                  </div>

                  {/* Mapped Products Tag */}
                  <div className="px-5 py-2">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      Active on Products ({mappedProds.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {mappedProds.length > 0 ? (
                        mappedProds.map((prod) => (
                          <span
                            key={prod.id}
                            className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[11px] font-bold border border-orange-100"
                          >
                            {prod.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">
                          Not assigned as default to any product yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 mt-2">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Order: #{curry.order || 1}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(curry)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-[#322A2E] text-xs font-bold border border-gray-200 flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCurryToDelete(curry)}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-red-500 text-xs transition-colors"
                      title="Delete Curry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT CURRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#EF2A39] flex items-center justify-center font-bold">
                  <Soup className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#322A2E]">
                    {editingCurry ? 'Edit Curry Option' : 'Create New Curry Option'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Used for "Salna Level (Curry Level)" on items like Porotta & Pazhampori
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCurry} className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Curry Name */}
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">
                  Curry Name * <span className="text-gray-400 font-normal">(e.g. Salna, Kutton Chaps, Chicken Salna)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EF2A39] focus:ring-1 focus:ring-[#EF2A39] text-sm text-[#322A2E] outline-hidden font-bold"
                />
              </div>

              {/* Price Per Unit & Unit Label */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">
                    Price Per Unit (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      required
                      placeholder="5.00"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EF2A39] focus:ring-1 focus:ring-[#EF2A39] text-sm text-[#322A2E] outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">
                    Unit Label
                  </label>
                  <input
                    type="text"
                    placeholder="Spoon / Cup"
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EF2A39] focus:ring-1 focus:ring-[#EF2A39] text-sm text-[#322A2E] outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#EF2A39] focus:ring-1 focus:ring-[#EF2A39] text-xs text-[#322A2E] outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the curry taste profile..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-[#EF2A39] focus:ring-1 focus:ring-[#EF2A39] text-xs text-[#322A2E] outline-hidden resize-none"
                />
              </div>

              {/* Stock Status & Order */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">
                    Initial Stock Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      active
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? 'bg-green-600' : 'bg-red-500'}`} />
                    <span>{active ? 'In Stock (Available)' : 'Out of Stock (Disabled)'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#EF2A39] focus:ring-1 focus:ring-[#EF2A39] text-sm text-[#322A2E] outline-hidden font-bold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#EF2A39] hover:bg-[#d92231] text-white text-xs font-black shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingCurry ? 'Update Curry Option' : 'Create Curry Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {curryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-[#322A2E]">Delete Curry Option?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to remove <span className="font-black text-[#322A2E]">"{curryToDelete.name}"</span>? Products using this curry will no longer offer it.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setCurryToDelete(null)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCurry}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
