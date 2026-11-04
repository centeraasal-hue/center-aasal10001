import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackPage } from './pages/OrderTrackPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginModal } from './pages/admin/AdminLoginModal';
import { ProductModal } from './components/ProductModal';
import { AssalAiAssistant } from './components/AssalAiAssistant';
import { CartProvider } from './context/CartContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { api } from './services/api';
import { AdminUser, Order, Product, ProductCategory, StoreSettings } from './types';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation
  const [activePage, setActivePage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  // Modals & Assistant
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('alassal_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, categoriesData, productsData] = await Promise.all([
          api.getSettings(),
          api.getCategories(),
          api.getProducts(),
        ]);
        setSettings(settingsData);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (err: any) {
        console.error('Failed to load store data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    setActivePage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('alassal_admin_user', JSON.stringify(user));
    setActivePage('admin');
  };

  const refreshStoreData = async () => {
    try {
      const [settingsData, categoriesData, productsData] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getProducts(),
      ]);
      setSettings(settingsData);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to refresh store data:', err);
    }
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('alassal_admin_user');
    setActivePage('home');
    showToast('تم تسجيل الخروج من لوحة الإدارة', 'info');
  };

  const handleOrderSuccess = (order: Order) => {
    setLastPlacedOrder(order);
    handleNavigate('order-success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold animate-pulse shadow-md">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </div>
        <p className="text-sm font-bold text-slate-700">جاري تحميل سنتر العسال للمفروشات...</p>
      </div>
    );
  }

  // If viewing admin panel and logged in
  if (activePage === 'admin' && adminUser) {
    return (
      <AdminDashboard
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        onNavigateToStore={() => {
          refreshStoreData();
          handleNavigate('home');
        }}
        onDataChanged={refreshStoreData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans selection:bg-sky-100 selection:text-sky-800">
      {/* Global Header */}
      <Header
        settings={settings}
        categories={categories}
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenAdmin={() => {
          if (adminUser) {
            setActivePage('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* Main Pages Outlet */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            settings={settings}
            products={products}
            categories={categories}
            onOpenProduct={product => setQuickViewProduct(product)}
            onNavigate={handleNavigate}
            onOpenAi={() => setIsAiOpen(true)}
          />
        )}

        {activePage === 'products' && (
          <ProductsPage
            products={products}
            categories={categories}
            initialCategory={pageParams?.category || 'all'}
            initialSearch={pageParams?.search || ''}
            onOpenProduct={product => setQuickViewProduct(product)}
          />
        )}

        {activePage === 'offers' && (
          <ProductsPage
            products={products.filter(
              p => (p.originalPrice && p.originalPrice > p.price) || (p.discountPercent && p.discountPercent > 0)
            )}
            categories={categories}
            initialCategory="all"
            onOpenProduct={product => setQuickViewProduct(product)}
          />
        )}

        {activePage === 'cart' && (
          <CartPage
            settings={settings}
            onNavigateToCheckout={() => handleNavigate('checkout')}
            onContinueShopping={() => handleNavigate('products')}
          />
        )}

        {activePage === 'checkout' && (
          <CheckoutPage
            settings={settings}
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => handleNavigate('cart')}
          />
        )}

        {activePage === 'order-success' && lastPlacedOrder && (
          <OrderSuccessPage
            order={lastPlacedOrder}
            onTrackOrder={code => handleNavigate('track', { code })}
            onContinueShopping={() => handleNavigate('home')}
          />
        )}

        {activePage === 'track' && (
          <OrderTrackPage initialCode={pageParams?.code || ''} />
        )}

        {activePage === 'branches' && (
          <div className="py-8">
            <ContactPage settings={settings} />
          </div>
        )}

        {activePage === 'about' && (
          <AboutPage settings={settings} onExplore={() => handleNavigate('products')} />
        )}

        {activePage === 'contact' && <ContactPage settings={settings} />}

        {activePage === 'faq' && (
          <FaqPage settings={settings} onOpenAi={() => setIsAiOpen(true)} />
        )}

        {activePage === 'policies' && <PoliciesPage settings={settings} />}
      </main>

      {/* Global Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
        onOpenAdmin={() => {
          if (adminUser) {
            setActivePage('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* Floating ASSAL AI Trigger Button (Available across all pages) */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-600/30 hover:scale-105 transition-all cursor-pointer"
          title="مساعد سنتر العسال الذكي"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
          </span>
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-amber-200" />
          <span>ASSAL AI</span>
        </button>
      )}

      {/* ASSAL AI Modal */}
      <AssalAiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        settings={settings}
        onOpenProduct={product => {
          setIsAiOpen(false);
          setQuickViewProduct(product);
        }}
        onNavigateToTrack={() => {
          setIsAiOpen(false);
          handleNavigate('track');
        }}
      />

      {/* Quick View Product Modal */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigateToCheckout={() => handleNavigate('checkout')}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </ToastProvider>
  );
}
