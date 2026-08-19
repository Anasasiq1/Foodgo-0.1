import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CustomizeBurgerScreen } from './components/CustomizeBurgerScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { CartScreen } from './components/CartScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { OrderHistoryScreen } from './components/OrderHistoryScreen';
import { PaymentMethodsScreen } from './components/PaymentMethodsScreen';
import { CustomerSupportScreen } from './components/CustomerSupportScreen';
import { SuccessModal } from './components/SuccessModal';
import { AdminApp } from './admin/AdminApp';

const AppContent: React.FC = () => {
  const { screen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen />;
      case 'home':
        return <HomeScreen />;
      case 'product-detail':
        return <ProductDetailScreen />;
      case 'customize':
        return <CustomizeBurgerScreen />;
      case 'cart':
        return <CartScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'profile':
        return <UserProfileScreen />;
      case 'edit-profile':
        return <EditProfileScreen />;
      case 'order-history':
        return <OrderHistoryScreen />;
      case 'payment-methods':
        return <PaymentMethodsScreen />;
      case 'support':
        return <CustomerSupportScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#EAEAEA] flex items-center justify-center sm:p-4 md:p-6 select-none">
      {/* Mobile Frame Container (430px max width to replicate mobile UI faithfully) */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[890px] sm:h-[932px] bg-[#FDFDFD] sm:rounded-[44px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:border-[8px] sm:border-[#222224] overflow-hidden flex flex-col relative sm:overflow-y-auto no-scrollbar">
        {/* Dynamic Screen View */}
        <div className="flex-1 flex flex-col w-full h-full relative">
          {renderScreen()}
        </div>

        {/* Global Payment Success Popup Modal */}
        <SuccessModal />
      </div>
    </main>
  );
};

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.includes('admin.html') ||
      path.includes('admin.php') ||
      path.includes('merchant.html') ||
      path.includes('delivery.html') ||
      path.startsWith('/admin') ||
      search.includes('admin=true') ||
      search.includes('portal=admin') ||
      search.includes('portal=merchant') ||
      search.includes('portal=delivery')
    );
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminRoute(
        path.includes('admin.html') ||
        path.includes('admin.php') ||
        path.includes('merchant.html') ||
        path.includes('delivery.html') ||
        path.startsWith('/admin') ||
        search.includes('admin=true') ||
        search.includes('portal=admin') ||
        search.includes('portal=merchant') ||
        search.includes('portal=delivery')
      );
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (isAdminRoute) {
    return <AdminApp />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
