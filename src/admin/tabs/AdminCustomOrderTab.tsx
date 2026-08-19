import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  ArrowUpDown,
  Image as ImageIcon,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Soup,
  Check,
} from 'lucide-react';
import { AdminProductItem } from '../types';
import { CustomizationSection, CustomizationSectionItem, CurryOption, ProductCurryConfig } from '../../types';
import { adminFetch } from '../adminApi';

interface AdminCustomOrderTabProps {
  products: AdminProductItem[];
  curries?: CurryOption[];
  onRefresh: () => void;
}

export const AdminCustomOrderTab: React.FC<AdminCustomOrderTabProps> = ({
  products,
  curries = [],
  onRefresh,
}) => {
  // Active selected product for custom order section configuration
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [editingSections, setEditingSections] = useState<CustomizationSection[]>([]);
  const [customOrderEnabled, setCustomOrderEnabled] = useState<boolean>(true);
  const [customOrderSortOrder, setCustomOrderSortOrder] = useState<number>(1);
  const [curryConfig, setCurryConfig] = useState<ProductCurryConfig>({
    enabled: true,
    defaultCurryId: '',
    defaultCurryPerItem: 1,
    minUnits: 0,
    maxUnits: 10,
    allowCurryChange: true,
    allowedCurryIds: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Section modal / editor state
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(0);
  const [editingItemModal, setEditingItemModal] = useState<{
    sectionIndex: number;
    itemIndex: number | null;
    item: Partial<CustomizationSectionItem>;
  } | null>(null);

  // When selected product changes, load its custom order sections and curry config
  React.useEffect(() => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      setEditingSections(prod.customizationSections ? JSON.parse(JSON.stringify(prod.customizationSections)) : []);
      setCustomOrderEnabled(prod.customOrderEnabled !== false);
      setCustomOrderSortOrder(prod.customOrderSortOrder || 1);
      setCurryConfig({
        enabled: prod.curryConfig?.enabled !== false,
        defaultCurryId: prod.curryConfig?.defaultCurryId || (curries[0]?.id || ''),
        defaultCurryPerItem: prod.curryConfig?.defaultCurryPerItem ?? prod.curryConfig?.defaultUnits ?? 1,
        minUnits: prod.curryConfig?.minUnits ?? 0,
        maxUnits: prod.curryConfig?.maxUnits ?? 10,
        allowCurryChange: prod.curryConfig?.allowCurryChange !== false,
        allowedCurryIds: Array.isArray(prod.curryConfig?.allowedCurryIds) ? prod.curryConfig.allowedCurryIds : [],
      });
    }
  }, [selectedProductId, products, curries]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Save changes for the selected product
  const handleSaveChanges = async () => {
    if (!selectedProductId) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const res = await adminFetch(`/api/admin/products/${selectedProductId}/customization-sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customizationSections: editingSections,
          customOrderEnabled,
          customOrderSortOrder,
          curryConfig,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Custom Order sections and Salna/Curry settings saved successfully!');
        onRefresh();
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        setSaveErrorMsg(data.error || 'Failed to save sections');
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Error communicating with server');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new customization section to the active product
  const handleAddSection = () => {
    const newSection: CustomizationSection = {
      id: `sec-${Date.now()}`,
      name: 'New Customization Section',
      description: 'Select your preferred options',
      selectionType: 'single',
      required: false,
      minSelections: 0,
      maxSelections: 1,
      items: [
        {
          id: `item-${Date.now()}-1`,
          name: 'Option 1',
          price: 0,
          priceType: 'adjustment',
          available: true,
          isDefault: true,
        },
      ],
    };

    const updated = [...editingSections, newSection];
    setEditingSections(updated);
    setActiveSectionIndex(updated.length - 1);
  };

  // Remove a section
  const handleRemoveSection = (secIdx: number) => {
    const updated = editingSections.filter((_, i) => i !== secIdx);
    setEditingSections(updated);
    if (activeSectionIndex === secIdx) {
      setActiveSectionIndex(updated.length > 0 ? 0 : null);
    } else if (activeSectionIndex !== null && activeSectionIndex > secIdx) {
      setActiveSectionIndex(activeSectionIndex - 1);
    }
  };

  // Move section up/down
  const handleMoveSection = (secIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? secIdx - 1 : secIdx + 1;
    if (targetIdx < 0 || targetIdx >= editingSections.length) return;

    const copy = [...editingSections];
    const temp = copy[secIdx];
    copy[secIdx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setEditingSections(copy);
    setActiveSectionIndex(targetIdx);
  };

  // Update section metadata
  const handleUpdateSectionMeta = (
    secIdx: number,
    field: keyof CustomizationSection,
    value: any
  ) => {
    const copy = [...editingSections];
    copy[secIdx] = {
      ...copy[secIdx],
      [field]: value,
    };
    if (field === 'selectionType' && value === 'single') {
      copy[secIdx].maxSelections = 1;
    }
    setEditingSections(copy);
  };

  // Add Item to a section
  const handleAddItem = (secIdx: number) => {
    setEditingItemModal({
      sectionIndex: secIdx,
      itemIndex: null,
      item: {
        id: `item-${Date.now()}`,
        name: '',
        price: 0,
        priceType: 'adjustment',
        available: true,
        isDefault: false,
        image: '',
        description: '',
      },
    });
  };

  // Edit existing item
  const handleEditItem = (secIdx: number, itemIdx: number) => {
    const item = editingSections[secIdx].items[itemIdx];
    setEditingItemModal({
      sectionIndex: secIdx,
      itemIndex: itemIdx,
      item: { ...item },
    });
  };

  // Delete item from section
  const handleDeleteItem = (secIdx: number, itemIdx: number) => {
    const copy = [...editingSections];
    copy[secIdx].items = copy[secIdx].items.filter((_, i) => i !== itemIdx);
    setEditingSections(copy);
  };

  // Save item from modal
  const handleSaveItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemModal || !editingItemModal.item.name?.trim()) return;

    const copy = [...editingSections];
    const sec = copy[editingItemModal.sectionIndex];
    const newItem: CustomizationSectionItem = {
      id: editingItemModal.item.id || `item-${Date.now()}`,
      name: String(editingItemModal.item.name).trim(),
      price: Number(editingItemModal.item.price) || 0,
      priceType: editingItemModal.item.priceType || 'adjustment',
      available: editingItemModal.item.available !== false,
      isDefault: Boolean(editingItemModal.item.isDefault),
      image: editingItemModal.item.image?.trim() || undefined,
      description: editingItemModal.item.description?.trim() || undefined,
    };

    if (editingItemModal.itemIndex !== null) {
      // If setting this to default in a single-choice section, uncheck other defaults
      if (sec.selectionType === 'single' && newItem.isDefault) {
        sec.items.forEach((it, i) => {
          if (i !== editingItemModal.itemIndex) it.isDefault = false;
        });
      }
      sec.items[editingItemModal.itemIndex] = newItem;
    } else {
      if (sec.selectionType === 'single' && newItem.isDefault) {
        sec.items.forEach((it) => {
          it.isDefault = false;
        });
      }
      sec.items.push(newItem);
    }

    setEditingSections(copy);
    setEditingItemModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-2xl bg-[#EF2A39]/10 text-[#EF2A39]">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#322A2E]">
              Custom Order & Dynamic Customization
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
            Manage the dedicated full-screen Plus (+) Custom Order experience. Define dynamic sections (e.g. Curry choices, Fried Sides, Extra Add-ons, Drinks, Portions) for each product dynamically without hardcoding.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || !selectedProductId}
            className="px-6 py-3 rounded-2xl bg-[#EF2A39] hover:bg-[#d92231] disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-[0_8px_20px_rgba(239,42,57,0.25)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save All Sections'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left product selector & Right customization section builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selector & Custom Order Enabled Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-[#322A2E] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#EF2A39]" />
                Select Product ({products.length})
              </h2>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {products.map((prod) => {
                const isSelected = prod.id === selectedProductId;
                const secCount = prod.customizationSections?.length || 0;
                const isEnabled = prod.customOrderEnabled !== false;

                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#322A2E] text-white border-[#322A2E] shadow-md'
                        : 'bg-[#F8F9FA] hover:bg-gray-100 text-[#322A2E] border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-200"
                        crossOrigin="anonymous"
                      />
                      <div className="truncate">
                        <h4 className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-[#322A2E]'}`}>
                          {prod.name}
                        </h4>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                          {prod.subtitle || prod.category}
                        </p>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-[#EF2A39]' : 'text-gray-500'}`}>
                          ${prod.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${
                          secCount > 0
                            ? isSelected
                              ? 'bg-[#EF2A39] text-white'
                              : 'bg-emerald-100 text-emerald-700'
                            : isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {secCount} {secCount === 1 ? 'Section' : 'Sections'}
                      </span>
                      <p className={`text-[9px] mt-1 ${isEnabled ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {isEnabled ? '● Active in Carousel' : '○ Disabled'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Settings in Custom Order Mode */}
          {selectedProduct && (
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-[#322A2E] uppercase tracking-wider">
                Carousel Settings for "{selectedProduct.name}"
              </h3>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                <div>
                  <label className="text-xs font-black text-[#322A2E] block">
                    Show in Custom Order Carousel
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Include in the full-screen horizontal swipe view
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomOrderEnabled(!customOrderEnabled)}
                  className="cursor-pointer"
                >
                  {customOrderEnabled ? (
                    <ToggleRight className="w-8 h-8 text-[#EF2A39]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Carousel Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={customOrderSortOrder}
                  onChange={(e) => setCustomOrderSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Lower numbers appear first in the horizontal swipe carousel.
                </span>
              </div>
            </div>
          )}

          {/* Salna & Curry Level Engine Settings for Selected Product */}
          {selectedProduct && (
            <div className="bg-white rounded-3xl p-5 border border-orange-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#322A2E] uppercase tracking-wider flex items-center gap-2">
                  <Soup className="w-4 h-4 text-[#EF2A39]" />
                  Salna / Curry Engine Settings
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Reactive Sync
                </span>
              </div>

              {/* Enable / Disable Curry Option for this dish */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
                <div>
                  <label className="text-xs font-black text-[#322A2E] block">
                    Salna / Curry Level Enabled
                  </label>
                  <span className="text-[10px] text-gray-500">
                    Enable gravy selection & quantity sliders in Customizer
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurryConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  className="cursor-pointer"
                >
                  {curryConfig.enabled ? (
                    <ToggleRight className="w-8 h-8 text-[#EF2A39]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              </div>

              {curryConfig.enabled && (
                <div className="space-y-3.5 pt-2 border-t border-gray-100">
                  {/* Default Curry Option */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Default Curry / Salna
                    </label>
                    <select
                      value={curryConfig.defaultCurryId || ''}
                      onChange={(e) => setCurryConfig((prev) => ({ ...prev, defaultCurryId: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] bg-white focus:outline-none focus:border-[#EF2A39]"
                    >
                      <option value="">-- No Default Curry --</option>
                      {curries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (₹{c.pricePerUnit.toFixed(2)} / {c.unitLabel || 'Spoon'}) {c.active === false ? '[Out of Stock]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Formula Defaults */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">
                        Default / Dish
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={curryConfig.defaultCurryPerItem ?? 1}
                        onChange={(e) => setCurryConfig((prev) => ({ ...prev, defaultCurryPerItem: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">
                        Min Spoons
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={curryConfig.minUnits ?? 0}
                        onChange={(e) => setCurryConfig((prev) => ({ ...prev, minUnits: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">
                        Max Spoons
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={curryConfig.maxUnits ?? 10}
                        onChange={(e) => setCurryConfig((prev) => ({ ...prev, maxUnits: Math.max(1, parseInt(e.target.value) || 10) }))}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                      />
                    </div>
                  </div>

                  {/* Allowed Curries Restriction */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Allowed Gravies for this Dish ({curries.length})
                    </label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {curries.map((curry) => {
                        const isAllowed =
                          !curryConfig.allowedCurryIds ||
                          curryConfig.allowedCurryIds.length === 0 ||
                          curryConfig.allowedCurryIds.includes(curry.id);

                        return (
                          <div
                            key={curry.id}
                            onClick={() => {
                              setCurryConfig((prev) => {
                                const currentAllowed = prev.allowedCurryIds || [];
                                if (currentAllowed.length === 0) {
                                  // currently all allowed, unchecking this one means all others allowed
                                  return {
                                    ...prev,
                                    allowedCurryIds: curries.filter((c) => c.id !== curry.id).map((c) => c.id),
                                  };
                                }
                                if (currentAllowed.includes(curry.id)) {
                                  return {
                                    ...prev,
                                    allowedCurryIds: currentAllowed.filter((id) => id !== curry.id),
                                  };
                                } else {
                                  const updated = [...currentAllowed, curry.id];
                                  return {
                                    ...prev,
                                    allowedCurryIds: updated.length === curries.length ? [] : updated,
                                  };
                                }
                              });
                            }}
                            className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isAllowed
                                ? 'bg-orange-50/50 border-orange-200 text-[#322A2E]'
                                : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                            }`}
                          >
                            <span className="font-bold truncate">{curry.name} (₹{curry.pricePerUnit.toFixed(2)})</span>
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isAllowed ? 'bg-[#EF2A39] border-[#EF2A39] text-white' : 'border-gray-300'
                              }`}
                            >
                              {isAllowed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Customization Sections Builder */}
        <div className="lg:col-span-8 space-y-6">
          {selectedProduct ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              {/* Product Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-gray-100"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <h2 className="text-lg font-black text-[#322A2E]">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Base Price: <strong className="text-[#EF2A39]">${selectedProduct.price.toFixed(2)}</strong> • Category: {selectedProduct.category}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddSection}
                  className="px-4 py-2.5 rounded-2xl bg-[#322A2E] hover:bg-black text-white text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#EF2A39]" />
                  <span>Add New Section</span>
                </button>
              </div>

              {/* Sections List */}
              {editingSections.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl bg-[#F8F9FA] border border-dashed border-gray-200">
                  <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-black text-gray-700 mb-1">
                    No Customization Sections Added Yet
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                    Create sections like "Choose Your Curry", "Side Dishes", "Add Something Extra", or "Drinks" so customers can craft their perfect custom meal.
                  </p>
                  <button
                    onClick={handleAddSection}
                    className="px-5 py-2.5 rounded-2xl bg-[#EF2A39] text-white text-xs font-bold inline-flex items-center gap-2 hover:bg-[#d92231] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Section</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {editingSections.map((sec, secIdx) => {
                    const isExpanded = activeSectionIndex === secIdx;

                    return (
                      <div
                        key={sec.id || secIdx}
                        className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-xs"
                      >
                        {/* Section Header Accordion */}
                        <div
                          className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isExpanded ? 'bg-gray-50 border-b border-gray-100' : 'hover:bg-gray-50/50'
                          }`}
                          onClick={() =>
                            setActiveSectionIndex(isExpanded ? null : secIdx)
                          }
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#EF2A39] text-white font-black text-xs flex items-center justify-center shrink-0">
                              {secIdx + 1}
                            </span>
                            <div className="truncate">
                              <h3 className="text-xs font-black text-[#322A2E] truncate">
                                {sec.name}
                              </h3>
                              <p className="text-[10px] text-gray-400 truncate">
                                {sec.selectionType === 'single' ? 'Single Choice (Radio)' : 'Multiple Choice (Checkbox)'} • {sec.required ? 'Required' : 'Optional'} • {sec.items.length} {sec.items.length === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleMoveSection(secIdx, 'up')}
                              disabled={secIdx === 0}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                              title="Move section up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveSection(secIdx, 'down')}
                              disabled={secIdx === editingSections.length - 1}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer"
                              title="Move section down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveSection(secIdx)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Section Details */}
                        {isExpanded && (
                          <div className="p-5 space-y-5 bg-white">
                            {/* Section Metadata Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-black text-gray-700 block mb-1">
                                  Section Title (e.g. Choose Curry, Extra Sides)
                                </label>
                                <input
                                  type="text"
                                  value={sec.name}
                                  onChange={(e) =>
                                    handleUpdateSectionMeta(secIdx, 'name', e.target.value)
                                  }
                                  placeholder="e.g. Choose Your Curry"
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-black text-gray-700 block mb-1">
                                  Description / Subtitle
                                </label>
                                <input
                                  type="text"
                                  value={sec.description || ''}
                                  onChange={(e) =>
                                    handleUpdateSectionMeta(secIdx, 'description', e.target.value)
                                  }
                                  placeholder="e.g. Select 1 signature curry"
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-black text-gray-700 block mb-1">
                                  Selection Type
                                </label>
                                <select
                                  value={sec.selectionType}
                                  onChange={(e) =>
                                    handleUpdateSectionMeta(
                                      secIdx,
                                      'selectionType',
                                      e.target.value as 'single' | 'multiple'
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                                >
                                  <option value="single">Single Choice (1 Option only)</option>
                                  <option value="multiple">Multiple Choice (Checkboxes)</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-4 pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={sec.required}
                                    onChange={(e) =>
                                      handleUpdateSectionMeta(secIdx, 'required', e.target.checked)
                                    }
                                    className="w-4 h-4 text-[#EF2A39] rounded border-gray-300 focus:ring-[#EF2A39]"
                                  />
                                  <span className="text-xs font-bold text-[#322A2E]">
                                    Required Section (User must select at least 1)
                                  </span>
                                </label>
                              </div>
                            </div>

                            {/* Items List in this section */}
                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-black text-[#322A2E] uppercase tracking-wider">
                                  Section Items ({sec.items.length})
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => handleAddItem(secIdx)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Item</span>
                                </button>
                              </div>

                              {sec.items.length === 0 ? (
                                <p className="text-xs text-gray-400 py-3 text-center bg-gray-50 rounded-xl">
                                  No items inside this section yet. Click "Add Item" above.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {sec.items.map((item, itemIdx) => (
                                    <div
                                      key={item.id || itemIdx}
                                      className="p-3 rounded-2xl border border-gray-100 bg-[#F8F9FA] hover:bg-white flex items-center justify-between gap-3 shadow-2xs transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-200"
                                            crossOrigin="anonymous"
                                          />
                                        ) : (
                                          <div className="w-9 h-9 rounded-lg bg-gray-200 text-gray-400 flex items-center justify-center shrink-0">
                                            <ImageIcon className="w-4 h-4" />
                                          </div>
                                        )}
                                        <div className="truncate">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-extrabold text-[#322A2E] truncate">
                                              {item.name}
                                            </p>
                                            {item.isDefault && (
                                              <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[8px] font-black uppercase">
                                                Default
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-gray-500 font-bold">
                                            {item.price > 0
                                              ? item.priceType === 'fixed'
                                                ? `$${item.price.toFixed(2)} (Fixed Total)`
                                                : `+$${item.price.toFixed(2)}`
                                              : 'Free ($0.00)'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleEditItem(secIdx, itemIdx)}
                                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
                                          title="Edit item"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteItem(secIdx, itemIdx)}
                                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                          title="Delete item"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-gray-400">
              Please select a product on the left to configure its Custom Order sections.
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-[#322A2E]">
                {editingItemModal.itemIndex !== null ? 'Edit Section Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => setEditingItemModal(null)}
                className="text-gray-400 hover:text-gray-600 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemModal} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-gray-700 block mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItemModal.item.name || ''}
                  onChange={(e) =>
                    setEditingItemModal({
                      ...editingItemModal,
                      item: { ...editingItemModal.item, name: e.target.value },
                    })
                  }
                  placeholder="e.g. Chicken Curry, Beef Fry, Boiled Egg"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-gray-700 block mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingItemModal.item.price !== undefined ? editingItemModal.item.price : 0}
                    onChange={(e) =>
                      setEditingItemModal({
                        ...editingItemModal,
                        item: { ...editingItemModal.item, price: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-gray-700 block mb-1">
                    Price Type
                  </label>
                  <select
                    value={editingItemModal.item.priceType || 'adjustment'}
                    onChange={(e) =>
                      setEditingItemModal({
                        ...editingItemModal,
                        item: {
                          ...editingItemModal.item,
                          priceType: e.target.value as 'fixed' | 'adjustment',
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                  >
                    <option value="adjustment">Add-on (+Price)</option>
                    <option value="fixed">Fixed Serving Price</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-700 block mb-1">
                  Item Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingItemModal.item.image || ''}
                  onChange={(e) =>
                    setEditingItemModal({
                      ...editingItemModal,
                      item: { ...editingItemModal.item, image: e.target.value },
                    })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-700 block mb-1">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  value={editingItemModal.item.description || ''}
                  onChange={(e) =>
                    setEditingItemModal({
                      ...editingItemModal,
                      item: { ...editingItemModal.item, description: e.target.value },
                    })
                  }
                  placeholder="e.g. Slow-cooked in coconut milk with curry leaves"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#322A2E] focus:outline-none focus:border-[#EF2A39]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItemModal.item.isDefault)}
                    onChange={(e) =>
                      setEditingItemModal({
                        ...editingItemModal,
                        item: { ...editingItemModal.item, isDefault: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#EF2A39] rounded border-gray-300 focus:ring-[#EF2A39]"
                  />
                  <span className="text-xs font-bold text-[#322A2E]">
                    Pre-selected (Default)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItemModal.item.available !== false}
                    onChange={(e) =>
                      setEditingItemModal({
                        ...editingItemModal,
                        item: { ...editingItemModal.item, available: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-[#EF2A39] rounded border-gray-300 focus:ring-[#EF2A39]"
                  />
                  <span className="text-xs font-bold text-[#322A2E]">
                    Available in Stock
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingItemModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#EF2A39] text-white text-xs font-black hover:bg-[#d92231] shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
