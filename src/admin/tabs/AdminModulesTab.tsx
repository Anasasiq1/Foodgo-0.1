import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { AppModule } from '../types';
import { adminFetch } from '../adminApi';

interface AdminModulesTabProps {
  modules: AppModule[];
  onRefresh: () => void;
}

export const AdminModulesTab: React.FC<AdminModulesTabProps> = ({
  modules,
  onRefresh,
}) => {
  const [editingModule, setEditingModule] = useState<AppModule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Powered by HM-Q');
  const [tagline, setTagline] = useState('');
  const [icon, setIcon] = useState('🛍️');
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState<number>(1);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerAction, setBannerAction] = useState('Shop Now →');

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingModule(null);
    setName('');
    setTitle('HM-Q ');
    setSubtitle('Powered by HM-Q');
    setTagline('Order your favourite items');
    setIcon('🛍️');
    setActive(true);
    setOrder(modules.length + 1);
    setBannerTitle('Special Offers & Deals');
    setBannerSubtitle('Fast delivery straight to your door');
    setBannerBadge('Featured Service');
    setBannerAction('Shop Now →');
  };

  const handleOpenEdit = (mod: AppModule) => {
    setIsCreating(false);
    setEditingModule(mod);
    setName(mod.name);
    setTitle(mod.title);
    setSubtitle(mod.subtitle || 'Powered by HM-Q');
    setTagline(mod.tagline || '');
    setIcon(mod.icon || '🛍️');
    setActive(mod.active !== false);
    setOrder(mod.order || 1);
    setBannerTitle(mod.bannerTitle || '');
    setBannerSubtitle(mod.bannerSubtitle || '');
    setBannerBadge(mod.bannerBadge || '');
    setBannerAction(mod.bannerAction || 'Shop Now →');
  };

  const handleToggleModuleActive = async (mod: AppModule) => {
    try {
      const res = await adminFetch(`/api/admin/modules/${mod.id}/toggle`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(`Module "${mod.name}" is now ${data.module.active ? 'Active' : 'Disabled'}`);
        onRefresh();
      } else {
        throw new Error(data.error || 'Failed to toggle module');
      }
    } catch (e: any) {
      alert(e.message || 'Error toggling module');
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (isCreating) {
        const res = await adminFetch('/api/admin/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            title: title.trim() || `HM-Q ${name.trim()}`,
            subtitle: subtitle.trim() || 'Powered by HM-Q',
            tagline: tagline.trim(),
            icon: icon.trim() || '🛍️',
            active,
            order: Number(order) || modules.length + 1,
            bannerTitle: bannerTitle.trim() || undefined,
            bannerSubtitle: bannerSubtitle.trim() || undefined,
            bannerBadge: bannerBadge.trim() || undefined,
            bannerAction: bannerAction.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create module');
        }

        showFeedback(`Module "${name}" created successfully!`);
        setIsCreating(false);
        onRefresh();
      } else if (editingModule) {
        const res = await adminFetch(`/api/admin/modules/${editingModule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            title: title.trim(),
            subtitle: subtitle.trim(),
            tagline: tagline.trim(),
            icon: icon.trim(),
            active,
            order: Number(order) || editingModule.order,
            bannerTitle: bannerTitle.trim() || undefined,
            bannerSubtitle: bannerSubtitle.trim() || undefined,
            bannerBadge: bannerBadge.trim() || undefined,
            bannerAction: bannerAction.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update module');
        }

        showFeedback(`Module "${name}" updated successfully!`);
        setEditingModule(null);
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'Error saving module');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (mod: AppModule) => {
    if (mod.id === 'food') {
      alert('The primary Food module cannot be deleted, but you can toggle its active status.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete module "${mod.name}"?`)) {
      return;
    }

    try {
      const res = await adminFetch(`/api/admin/modules/${mod.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(`Module "${mod.name}" deleted`);
        onRefresh();
      } else {
        throw new Error(data.error || 'Failed to delete module');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting module');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#322A2E] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#EF2A39]" />
            <span>Service Modules (Multi-Service Ecosystem)</span>
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Configure multi-service modules (Food, Grocery, Pharmacy, Cosmetics, Stationery). Active modules immediately sync to the customer header switcher.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#EF2A39] hover:bg-[#D81C2B] text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Module</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200/80 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Create / Edit Modal / Inline Drawer */}
      {(isCreating || editingModule) && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#EF2A39]/30 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <h3 className="text-sm font-black text-[#322A2E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EF2A39]" />
              <span>{isCreating ? 'Create New Service Module' : `Edit Module: ${editingModule?.name}`}</span>
            </h3>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingModule(null);
              }}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveModule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Module Name (e.g. Food, Grocery, Pet Care) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (isCreating && (!title || title.startsWith('HM-Q '))) {
                      setTitle(`HM-Q ${e.target.value}`);
                    }
                  }}
                  placeholder="e.g. Grocery"
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Header Brand Title (e.g. HM-Q Grocery)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="HM-Q Grocery"
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Emoji Icon (e.g. 🍔, 🛒, 💊, 💄, 📦)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                  placeholder="🛒"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Subtitle (Default: Powered by HM-Q)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Powered by HM-Q"
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Tagline (e.g. Shop groceries near you)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Order fresh groceries fast"
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8E8E93] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#F4F5F7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#322A2E] outline-none"
                />
              </div>
            </div>

            {/* Banner Customization */}
            <div className="bg-[#F8F9FA] p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-[#322A2E]">
                Home Banner Customization
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8E93] mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Fresh Daily Essentials"
                    className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8E93] mb-1">
                    Banner Subtitle
                  </label>
                  <input
                    type="text"
                    value={bannerSubtitle}
                    onChange={(e) => setBannerSubtitle(e.target.value)}
                    placeholder="Farm fresh produce delivered in 15 mins"
                    className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8E8E93] mb-1">
                    Banner Action Text
                  </label>
                  <input
                    type="text"
                    value={bannerAction}
                    onChange={(e) => setBannerAction(e.target.value)}
                    placeholder="Shop Now →"
                    className="w-full bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#322A2E] outline-none border border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-[#EF2A39] focus:ring-[#EF2A39]"
                />
                <span className="text-xs font-bold text-[#322A2E]">
                  Active & Visible in Customer Module Switcher
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingModule(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#322A2E] hover:bg-[#201A1D] text-white text-xs font-black shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modules Table List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#322A2E] uppercase tracking-wider">
              Installed Service Modules
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F4F5F7] text-[#8E8E93]">
              {modules.length} Total
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600">
            {modules.filter((m) => m.active !== false).length} Active Live
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {modules.map((mod) => {
            const isActive = mod.active !== false;
            return (
              <div
                key={mod.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  isActive ? 'bg-white' : 'bg-gray-50/70 opacity-75'
                }`}
              >
                {/* Module Details */}
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] border border-gray-100 flex items-center justify-center text-2xl shadow-xs shrink-0">
                    {mod.icon || '🛍️'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-[#322A2E]">
                        {mod.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                        ID: {mod.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isActive ? '● Active in Customer App' : '○ Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-[#8E8E93] font-medium mt-0.5">
                      <strong className="text-[#322A2E] font-bold">{mod.title}</strong> — {mod.tagline || 'No tagline'}
                    </p>
                  </div>
                </div>

                {/* Actions & Toggles */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Quick Active Toggle Button */}
                  <button
                    onClick={() => handleToggleModuleActive(mod)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={isActive ? 'Disable module from customer app' : 'Enable module for customer app'}
                  >
                    {isActive ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-gray-500" />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(mod)}
                    className="p-2 rounded-xl bg-[#F4F5F7] hover:bg-gray-200 text-[#322A2E] transition-colors"
                    title="Edit Module Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {mod.id !== 'food' && (
                    <button
                      onClick={() => handleDeleteModule(mod)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
