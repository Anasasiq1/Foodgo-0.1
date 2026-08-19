import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Flame,
  Clock,
  Sparkles,
  AlertTriangle,
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  Settings2,
  Copy,
  Eye,
  EyeOff,
  CheckSquare,
  CircleDot,
  Tag,
} from 'lucide-react';
import { AdminProductItem, CategoryItem, OptionGroup, ProductOption, OptionGroupTemplate } from '../types';
import { adminFetch } from '../adminApi';

interface AdminProductsTabProps {
  products: AdminProductItem[];
  categories: CategoryItem[];
  onRefresh: () => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'disabled'>('all');

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'variants' | 'display'>('basic');

  // Form fields
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Burger');
  const [price, setPrice] = useState('8.99');
  const [rating, setRating] = useState('4.8');
  const [prepTime, setPrepTime] = useState('20 mins');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [defaultSpice, setDefaultSpice] = useState(50);
  const [defaultPortion, setDefaultPortion] = useState(1);
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template state
  const [templates, setTemplates] = useState<OptionGroupTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<AdminProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load option templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await adminFetch('/api/admin/option-templates');
      const data = await res.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error('Error loading option templates', e);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSubtitle('Chef Special');
    setCategory(categories[0]?.name || 'Biriyani');
    setPrice('12.99');
    setRating('4.9');
    setPrepTime('20 mins');
    setDescription(
      'Handcrafted with gourmet ingredients, fresh organic produce, and our signature savory seasoning cooked to order.'
    );
    setImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80');
    setDefaultSpice(50);
    setDefaultPortion(1);
    setAvailable(true);
    setFeatured(false);
    setPopular(true);
    setOptionGroups([]);
    setActiveModalTab('basic');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (prod: AdminProductItem) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSubtitle(prod.subtitle);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setRating(prod.rating.toString());
    setPrepTime(prod.prepTime);
    setDescription(prod.description);
    setImage(prod.image);
    setDefaultSpice(prod.defaultSpice);
    setDefaultPortion(prod.defaultPortion);
    setAvailable(prod.available !== false);
    setFeatured(Boolean(prod.featured));
    setPopular(Boolean(prod.popular));
    // Clone option groups
    setOptionGroups(prod.optionGroups ? JSON.parse(JSON.stringify(prod.optionGroups)) : []);
    setActiveModalTab('basic');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  /* Option Groups Builder Handlers */
  const handleAddOptionGroup = () => {
    const newGroup: OptionGroup = {
      id: 'grp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      name: 'Choose Size',
      description: 'Select your preferred portion',
      required: true,
      selectionType: 'single',
      minSelections: 1,
      maxSelections: 1,
      options: [
        {
          id: 'opt-' + Date.now() + '-1',
          name: 'Regular',
          price: parseFloat(price) || 8.99,
          priceType: 'fixed',
          available: true,
          isDefault: true,
        },
        {
          id: 'opt-' + Date.now() + '-2',
          name: 'Large',
          price: (parseFloat(price) || 8.99) + 3.5,
          priceType: 'fixed',
          available: true,
        },
      ],
    };
    setOptionGroups([...optionGroups, newGroup]);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;

    const clonedGroup: OptionGroup = {
      ...JSON.parse(JSON.stringify(tpl.group)),
      id: 'grp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      options: tpl.group.options.map((opt) => ({
        ...opt,
        id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      })),
    };

    setOptionGroups([...optionGroups, clonedGroup]);
    setSelectedTemplateId('');
  };

  const handleSaveAsTemplate = async (group: OptionGroup) => {
    const templateName = prompt('Enter a name for this reusable template:', group.name);
    if (!templateName || !templateName.trim()) return;

    try {
      const res = await adminFetch('/api/admin/option-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          group,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Template "${templateName}" saved successfully!`);
        fetchTemplates();
      }
    } catch (e: any) {
      alert('Failed to save template: ' + e.message);
    }
  };

  const handleUpdateGroup = (groupIndex: number, updates: Partial<OptionGroup>) => {
    const updated = [...optionGroups];
    updated[groupIndex] = { ...updated[groupIndex], ...updates };
    setOptionGroups(updated);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    setOptionGroups(optionGroups.filter((_, idx) => idx !== groupIndex));
  };

  const handleAddOptionToGroup = (groupIndex: number) => {
    const updated = [...optionGroups];
    const group = updated[groupIndex];
    const newOption: ProductOption = {
      id: 'opt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      name: group.selectionType === 'single' ? 'Medium' : 'Extra Add-on',
      price: group.selectionType === 'single' ? parseFloat(price) || 9.99 : 1.5,
      priceType: group.selectionType === 'single' ? 'fixed' : 'adjustment',
      available: true,
    };
    group.options.push(newOption);
    setOptionGroups(updated);
  };

  const handleUpdateOption = (
    groupIndex: number,
    optionIndex: number,
    updates: Partial<ProductOption>
  ) => {
    const updated = [...optionGroups];
    const group = updated[groupIndex];
    group.options[optionIndex] = { ...group.options[optionIndex], ...updates };
    setOptionGroups(updated);
  };

  const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
    const updated = [...optionGroups];
    updated[groupIndex].options = updated[groupIndex].options.filter((_, idx) => idx !== optionIndex);
    setOptionGroups(updated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product title is required.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Please enter a valid non-negative price.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      subtitle: subtitle.trim(),
      category,
      price: numPrice,
      rating: parseFloat(rating) || 4.8,
      prepTime,
      description,
      image: image.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      defaultSpice,
      defaultPortion,
      available,
      featured,
      popular,
      optionGroups,
    };

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsFormModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (prod: AdminProductItem, field: 'available' | 'featured' | 'popular') => {
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

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }
      setProductToDelete(null);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Could not delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvail =
      selectedAvailability === 'all' ||
      (selectedAvailability === 'available' && p.available !== false) ||
      (selectedAvailability === 'disabled' && p.available === false);

    return matchesSearch && matchesCat && matchesAvail;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search & Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#322A2E]">
            Product Catalog & Dynamic Variants
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Configure flexible portions (Half/Full/1KG), add-on groups, real-time pricing & inventory status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(239,42,57,0.25)] transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>
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
            placeholder="Search by dish name, description, options or category..."
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

        {/* Category & Status dropdown filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F4F5F7] text-xs font-bold text-[#322A2E] rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer border border-transparent hover:border-gray-200"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value as any)}
            className="bg-[#F4F5F7] text-xs font-bold text-[#322A2E] rounded-2xl px-3.5 py-2.5 outline-none cursor-pointer border border-transparent hover:border-gray-200"
          >
            <option value="all">All Availability</option>
            <option value="available">Available in Store</option>
            <option value="disabled">Disabled / Hidden</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] text-[#8E8E93] uppercase font-bold tracking-wider border-b border-gray-100">
                <th className="py-4 px-5">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Base Price</th>
                <th className="py-4 px-4">Dynamic Variants</th>
                <th className="py-4 px-4 text-center">Featured</th>
                <th className="py-4 px-4 text-center">Popular</th>
                <th className="py-4 px-4 text-center">In Store</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-[#322A2E]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-bold">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Product Name & Image */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 shadow-xs">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#322A2E] leading-snug">
                            {prod.name}
                          </h4>
                          <span className="text-[11px] text-[#8E8E93] block">
                            {prod.subtitle}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[#322A2E] font-extrabold text-[10px]">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-black text-sm text-[#EF2A39]">
                      ${prod.price.toFixed(2)}
                    </td>

                    {/* Dynamic Variants summary badge */}
                    <td className="py-3.5 px-4">
                      {prod.optionGroups && prod.optionGroups.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <Layers className="w-3.5 h-3.5 text-[#EF2A39]" />
                            <span>{prod.optionGroups.length} Option Group{prod.optionGroups.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {prod.optionGroups.map((g) => (
                              <span
                                key={g.id}
                                className="text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-[#EF2A39] rounded-md"
                              >
                                {g.name} ({g.options.length})
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-400 italic">
                          Standard single size
                        </span>
                      )}
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(prod, 'featured')}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          prod.featured
                            ? 'bg-amber-100 text-amber-600'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                        title="Toggle Featured Spotlight"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Popular Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(prod, 'popular')}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          prod.popular
                            ? 'bg-red-100 text-[#EF2A39]'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                        title="Toggle Popular Badge"
                      >
                        <Flame className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Available in Store Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(prod, 'available')}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                          prod.available !== false
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {prod.available !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#322A2E] hover:text-white text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Product & Options"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Dynamic Option Groups Engine */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="shrink-0 mb-4">
              <h3 className="text-xl font-black text-[#322A2E]">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Create New Food Product'}
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Configure details, pricing, and custom portion variant options.
              </p>

              {/* Navigation Tabs inside modal */}
              <div className="flex items-center gap-2 mt-4 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('basic')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeModalTab === 'basic'
                      ? 'bg-[#322A2E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  1. Basic Details & Price
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('variants')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                    activeModalTab === 'variants'
                      ? 'bg-[#EF2A39] text-white'
                      : 'bg-red-50 text-[#EF2A39] hover:bg-red-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. Variants & Customization ({optionGroups.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('display')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    activeModalTab === 'display'
                      ? 'bg-[#322A2E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  3. Display & Badges
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold shrink-0">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* TAB 1: BASIC DETAILS */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Hyderabadi Chicken Biriyani or Cheeseburger"
                        className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none focus:ring-2 focus:ring-[#EF2A39]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                        Subtitle / Variety
                      </label>
                      <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="e.g. Dum Special / Wendy's Burger"
                        className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none focus:ring-2 focus:ring-[#EF2A39]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                        Base Price ($ / ₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none focus:ring-2 focus:ring-[#EF2A39]/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                        Prep Time
                      </label>
                      <input
                        type="text"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        placeholder="e.g. 20 mins"
                        className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                      Product Image URL
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                      />
                      {image && (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          <img
                            src={image}
                            alt="preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#F4F5F7] rounded-xl p-3 text-xs font-medium text-[#322A2E] outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC VARIANTS & OPTION GROUPS ENGINE */}
              {activeModalTab === 'variants' && (
                <div className="space-y-6">
                  {/* Preset Template Importer */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5" />
                        <span>Quick Load Preset Template</span>
                      </h4>
                      <p className="text-[11px] text-amber-700">
                        Choose preconfigured Portion Sizes (Half / Full / 1 KG) or Toppings.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="bg-white border border-amber-200 text-xs font-bold text-gray-800 rounded-xl px-3 py-2 outline-none"
                      >
                        <option value="">-- Select Template --</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleApplyTemplate}
                        disabled={!selectedTemplateId}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Option Groups List */}
                  {optionGroups.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-[#EF2A39] flex items-center justify-center mx-auto">
                        <Layers className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-[#322A2E]">
                        No Option Groups Configured
                      </h4>
                      <p className="text-xs text-[#8E8E93] max-w-md mx-auto">
                        Add option groups like "Choose Size" (Half, Full, 1 KG) or "Add-ons" (Extra Egg, Chicken Piece, Raita, Bacon).
                      </p>
                      <button
                        type="button"
                        onClick={handleAddOptionGroup}
                        className="px-4 py-2.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Create First Option Group</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {optionGroups.map((group, gIdx) => (
                        <div
                          key={group.id}
                          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3 relative"
                        >
                          {/* Group Header Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="w-6 h-6 rounded-full bg-red-100 text-[#EF2A39] text-xs font-black flex items-center justify-center shrink-0">
                                {gIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={group.name}
                                onChange={(e) => handleUpdateGroup(gIdx, { name: e.target.value })}
                                placeholder="Group Name (e.g. Choose Size, Add-ons)"
                                className="text-xs font-black text-[#322A2E] bg-[#F4F5F7] px-3 py-1.5 rounded-lg outline-none flex-1"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveAsTemplate(group)}
                                className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 cursor-pointer"
                                title="Save as reusable template for other dishes"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Save Template</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveGroup(gIdx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Delete Group"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Group Rules Configuration */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Selection Mode
                              </label>
                              <select
                                value={group.selectionType}
                                onChange={(e) =>
                                  handleUpdateGroup(gIdx, {
                                    selectionType: e.target.value as 'single' | 'multiple',
                                  })
                                }
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                              >
                                <option value="single">Single (Radio Selection)</option>
                                <option value="multiple">Multiple (Checkboxes)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Requirement
                              </label>
                              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={group.required}
                                  onChange={(e) => handleUpdateGroup(gIdx, { required: e.target.checked })}
                                  className="w-4 h-4 accent-[#EF2A39]"
                                />
                                <span className="text-xs font-bold text-gray-700">Required for checkout</span>
                              </label>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Selection Limits
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={group.minSelections || 0}
                                  onChange={(e) =>
                                    handleUpdateGroup(gIdx, { minSelections: parseInt(e.target.value) || 0 })
                                  }
                                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                                  title="Min Selections"
                                />
                                <span className="text-gray-400">to</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={group.maxSelections || 1}
                                  onChange={(e) =>
                                    handleUpdateGroup(gIdx, { maxSelections: parseInt(e.target.value) || 1 })
                                  }
                                  className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold"
                                  title="Max Selections"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Options Table for this group */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 px-1">
                              <span>Configured Options (Portions / Toppings)</span>
                              <button
                                type="button"
                                onClick={() => handleAddOptionToGroup(gIdx)}
                                className="text-[#EF2A39] hover:underline flex items-center gap-1 font-extrabold cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Option</span>
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {group.options.map((opt, oIdx) => (
                                <div
                                  key={opt.id}
                                  className="flex items-center gap-2 bg-gray-50/90 p-2 rounded-xl border border-gray-100 text-xs"
                                >
                                  {/* Name */}
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) =>
                                      handleUpdateOption(gIdx, oIdx, { name: e.target.value })
                                    }
                                    placeholder="Option name (e.g. Half, Full, 1 KG, Extra Cheese)"
                                    className="flex-1 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg font-bold text-gray-800"
                                  />

                                  {/* Price Type */}
                                  <select
                                    value={opt.priceType || 'fixed'}
                                    onChange={(e) =>
                                      handleUpdateOption(gIdx, oIdx, {
                                        priceType: e.target.value as 'fixed' | 'adjustment',
                                      })
                                    }
                                    className="w-28 bg-white border border-gray-200 px-2 py-1.5 rounded-lg font-semibold text-gray-700"
                                  >
                                    <option value="fixed">Fixed Price</option>
                                    <option value="adjustment">+ Add-on Price</option>
                                  </select>

                                  {/* Price */}
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-500">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={opt.price}
                                      onChange={(e) =>
                                        handleUpdateOption(gIdx, oIdx, {
                                          price: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-20 bg-white border border-gray-200 px-2 py-1.5 rounded-lg font-bold text-gray-800"
                                    />
                                  </div>

                                  {/* Default Toggle */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateOption(gIdx, oIdx, { isDefault: !opt.isDefault })
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                                      opt.isDefault
                                        ? 'bg-[#322A2E] text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                    title="Preselected by default"
                                  >
                                    Default
                                  </button>

                                  {/* Available Toggle */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateOption(gIdx, oIdx, { available: !opt.available })
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                                      opt.available !== false
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                    title={opt.available !== false ? 'In Stock' : 'Out of Stock (Shows Unavailable)'}
                                  >
                                    {opt.available !== false ? 'In Stock' : 'Out of Stock'}
                                  </button>

                                  {/* Delete option */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(gIdx, oIdx)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddOptionGroup}
                        className="w-full py-3 bg-red-50 hover:bg-red-100 border border-dashed border-[#EF2A39]/30 text-[#EF2A39] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Add Another Option Group</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DISPLAY & BADGES */}
              {activeModalTab === 'display' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        checked={available}
                        onChange={(e) => setAvailable(e.target.checked)}
                        className="w-5 h-5 accent-[#EF2A39] rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#322A2E] block">
                          Available for Online Customer Orders
                        </span>
                        <span className="text-[11px] text-gray-500">
                          When unchecked, this dish is immediately hidden from the customer menu.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-5 h-5 accent-[#EF2A39] rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#322A2E] block">
                          Featured Showcase Spotlight
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Highlights this dish on the main customer exploration slider.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        checked={popular}
                        onChange={(e) => setPopular(e.target.checked)}
                        className="w-5 h-5 accent-[#EF2A39] rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#322A2E] block">
                          Popular Customer Favorite Badge
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Displays the hot flame icon indicating top demand.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Save Product & Variants' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-[#322A2E] mb-1">
              Delete Product?
            </h3>
            <p className="text-xs text-[#8E8E93] mb-6">
              Are you sure you want to delete <span className="font-bold text-[#322A2E]">"{productToDelete.name}"</span>? This will immediately remove it from customer visibility.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

