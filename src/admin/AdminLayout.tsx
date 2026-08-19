import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  CreditCard,
  Sparkles,
  Sliders,
  MessageSquare,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Bell,
  Search,
  Soup,
  Layers,
} from 'lucide-react';
import {
  AdminTab,
  AdminUser,
  DashboardStats,
  AdminProductItem,
  CategoryItem,
  CurryOption,
  CustomerRecord,
  PaymentRecord,
  SupportConversation,
  StoreSettings,
  AuditLogItem,
  AppModule,
} from './types';
import { Order } from '../types';

import { AdminDashboardTab } from './tabs/AdminDashboardTab';
import { AdminModulesTab } from './tabs/AdminModulesTab';
import { AdminProductsTab } from './tabs/AdminProductsTab';
import { AdminCurriesTab } from './tabs/AdminCurriesTab';
import { AdminCategoriesTab } from './tabs/AdminCategoriesTab';
import { AdminOrdersTab } from './tabs/AdminOrdersTab';
import { AdminCustomersTab } from './tabs/AdminCustomersTab';
import { AdminPaymentsTab } from './tabs/AdminPaymentsTab';
import { AdminFavoritesTab } from './tabs/AdminFavoritesTab';
import { AdminCustomOrderTab } from './tabs/AdminCustomOrderTab';
import { AdminSupportTab } from './tabs/AdminSupportTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import { AdminAuditLogsTab } from './tabs/AdminAuditLogsTab';

interface AdminLayoutProps {
  admin: AdminUser;
  onLogout: () => void;
  stats: DashboardStats | null;
  modules?: AppModule[];
  products: AdminProductItem[];
  curries?: CurryOption[];
  categories: CategoryItem[];
  orders: Order[];
  customers: CustomerRecord[];
  payments: PaymentRecord[];
  conversations: SupportConversation[];
  settings: StoreSettings | null;
  logs: AuditLogItem[];
  onRefreshData: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  admin,
  onLogout,
  stats,
  modules = [],
  products,
  curries = [],
  categories,
  orders,
  customers,
  payments,
  conversations,
  settings,
  logs,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'modules', label: 'Service Modules', icon: Layers, badge: modules.length },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'curries', label: 'Salna / Curry Level', icon: Soup, badge: curries.length },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: stats?.pendingOrders || 0 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'custom-order', label: 'Custom Order (Plus)', icon: Sliders },
    { id: 'favorites', label: 'Favorites / Popular', icon: Sparkles },
    { id: 'support', label: 'Customer Support', icon: MessageSquare, badge: conversations.filter(c => c.status === 'Open').length },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'audit-logs', label: 'Security & Audit', icon: Activity },
  ];

  const handleNavClick = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] flex text-[#322A2E] antialiased">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#322A2E] text-white flex-col justify-between p-5 shrink-0 select-none shadow-xl">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-[#EF2A39] flex items-center justify-center font-black text-xl italic shadow-md">
              FG
            </div>
            <div>
              <h2 className="font-black italic text-lg tracking-wider text-white leading-tight">
                Foodgo
              </h2>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EF2A39] text-white shadow-[0_4px_16px_rgba(239,42,57,0.35)]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? 'bg-white text-[#EF2A39]'
                          : 'bg-white/15 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-xs">
              AA
            </div>
            <div className="truncate">
              <p className="text-xs font-extrabold text-white truncate">{admin.name}</p>
              <p className="text-[10px] text-white/50 font-mono truncate">@{admin.username}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-white/10 hover:bg-red-600/80 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative w-72 bg-[#322A2E] text-white flex flex-col justify-between p-5 z-10 shadow-2xl h-full overflow-y-auto">
            <div>
              <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EF2A39] flex items-center justify-center font-black text-lg italic">
                    FG
                  </div>
                  <div>
                    <h2 className="font-black text-base text-white">Foodgo</h2>
                    <span className="text-[9px] uppercase font-bold text-white/50">
                      Admin
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                        isActive
                          ? 'bg-[#EF2A39] text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-sm font-black text-[#322A2E] capitalize hidden sm:inline">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          {/* Right Topbar actions */}
          <div className="flex items-center gap-3">
            {/* Live Store status pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{settings?.storeOpen ? 'Store Accepting Orders' : 'Store Paused'}</span>
            </div>

            {/* Quick Open Customer Site in new tab */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#F4F5F7] hover:bg-gray-200 text-[#322A2E] text-xs font-extrabold flex items-center gap-1.5 transition-colors"
              title="Preview Customer Website in new tab"
            >
              <span>View Customer App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* User Avatar Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#EF2A39] text-white flex items-center justify-center font-black text-xs shadow-xs">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              stats={stats}
              recentOrders={orders.slice(0, 6)}
              bestSellers={stats ? (stats as any).bestSellers || [] : []}
              onNavigateTab={handleNavClick}
              onViewOrder={(order) => setSelectedOrderModal(order)}
            />
          )}

          {activeTab === 'modules' && (
            <AdminModulesTab
              modules={modules}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              categories={categories}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'curries' && (
            <AdminCurriesTab
              curries={curries}
              products={products}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={categories}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              onRefresh={onRefreshData}
              selectedOrderModal={selectedOrderModal}
              onCloseOrderModal={() => setSelectedOrderModal(null)}
              onOpenOrderModal={(order) => setSelectedOrderModal(order)}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomersTab customers={customers} />
          )}

          {activeTab === 'payments' && (
            <AdminPaymentsTab payments={payments} />
          )}

          {activeTab === 'custom-order' && (
            <AdminCustomOrderTab
              products={products}
              curries={curries}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'favorites' && (
            <AdminFavoritesTab
              products={products}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'support' && (
            <AdminSupportTab
              conversations={conversations}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              settings={settings}
              onRefresh={onRefreshData}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AdminAuditLogsTab logs={logs} onRefresh={onRefreshData} />
          )}
        </main>
      </div>
    </div>
  );
};
