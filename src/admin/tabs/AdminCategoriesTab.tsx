import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X, Layers, AlertCircle } from 'lucide-react';
import { CategoryItem } from '../types';
import { adminFetch } from '../adminApi';

interface AdminCategoriesTabProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setActive(true);
    setOrder(categories.length + 1);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setActive(cat.active !== false);
    setOrder(cat.order);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), active, order: Number(order) }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete');
      }
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Could not delete category');
    }
  };

  const toggleActive = async (cat: CategoryItem) => {
    try {
      await adminFetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !cat.active }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#322A2E]">
            Menu Category Management
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Organize customer menu pills, sliders, and navigation groups.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(239,42,57,0.25)] transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-5 border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono font-bold text-[#8E8E93]">
                  Order #{cat.order || index + 1}
                </span>

                <button
                  onClick={() => toggleActive(cat)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                    cat.active !== false
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {cat.active !== false ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F4F5F7] flex items-center justify-center text-[#322A2E] font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#322A2E]">{cat.name}</h4>
                  <span className="text-[11px] text-[#8E8E93] font-mono">
                    Slug: {cat.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
              <button
                onClick={() => openEdit(cat)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#322A2E] hover:text-white text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-[#322A2E] mb-1">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <p className="text-xs text-[#8E8E93] mb-5">
              Categories filter food items on the Foodgo home screen.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sliders, Drinks, Combos"
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Display Order Position
                </label>
                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-[#F8F9FA] p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-[#EF2A39] rounded"
                  />
                  <span className="text-xs font-bold text-[#322A2E]">
                    Show in Customer App
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
