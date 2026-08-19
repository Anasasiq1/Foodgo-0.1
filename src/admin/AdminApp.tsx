import React, { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { adminFetch } from './adminApi';
import {
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

export const AdminApp: React.FC = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Loaded data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [curries, setCurries] = useState<CurryOption[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  // Check current session
  const checkAuth = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/me');
      const data = await res.json();
      if (res.ok && data.authenticated && data.admin) {
        setAdmin(data.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Fetch all administrative dataset
  const fetchAllData = useCallback(async () => {
    try {
      const [
        statsRes,
        modRes,
        prodRes,
        curryRes,
        catRes,
        ordRes,
        custRes,
        payRes,
        suppRes,
        settRes,
        logRes,
      ] = await Promise.all([
        adminFetch('/api/admin/stats').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/modules').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/products').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/curries').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/categories').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/orders').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/customers').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/payments').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/support').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/settings').then((r) => r.json()).catch(() => ({})),
        adminFetch('/api/admin/audit-logs').then((r) => r.json()).catch(() => ({})),
      ]);

      if (statsRes?.success) setStats(statsRes.stats);
      if (modRes?.success) setModules(modRes.modules);
      if (prodRes?.success) setProducts(prodRes.products);
      if (curryRes?.success) setCurries(curryRes.curries);
      if (catRes?.success) setCategories(catRes.categories);
      if (ordRes?.success) setOrders(ordRes.orders);
      if (custRes?.success) setCustomers(custRes.customers);
      if (payRes?.success) setPayments(payRes.payments);
      if (suppRes?.success) setConversations(suppRes.conversations);
      if (settRes?.success) setSettings(settRes.settings);
      if (logRes?.success) setLogs(logRes.logs);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (admin) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 8000);
      return () => clearInterval(interval);
    }
  }, [admin, fetchAllData]);

  const handleLogout = async () => {
    try {
      await adminFetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('foodgo_admin_token');
      setAdmin(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#EF2A39] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#8E8E93]">
            Verifying Admin Security Token...
          </span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLoginSuccess={(ad) => setAdmin(ad)} />;
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      stats={stats}
      modules={modules}
      products={products}
      curries={curries}
      categories={categories}
      orders={orders}
      customers={customers}
      payments={payments}
      conversations={conversations}
      settings={settings}
      logs={logs}
      onRefreshData={fetchAllData}
    />
  );
};
