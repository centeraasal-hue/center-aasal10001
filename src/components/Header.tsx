import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Phone,
  Menu,
  X,
  Compass,
  Package,
  Layers,
  ShieldCheck,
  MapPin,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../context/CartContext';
import { ProductCategory, StoreSettings } from '../types';

interface HeaderProps {
  settings: StoreSettings | null;
  categories: ProductCategory[];
  activePage: string;
  onNavigate: (page: string, params?: any) => void;
  onOpenAi: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  activePage,
  onNavigate,
  onOpenAi,
  onOpenAdmin,
}) => {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
      setMobileMenuOpen(false);
    }
  };

  const primaryPhone = settings?.contactPhones?.[0] || '01277714100';
  const whatsappNum = settings?.whatsappNumber || '01277714100';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-xs">
      {/* Top Luxury Announcement Bar */}
      {settings?.showAnnouncement && (
        <div className="bg-gradient-to-r from-[#F0F9FF] via-[#FAF9F5] to-[#F5EBE1] border-b border-sky-100 text-slate-700 py-1.5 px-4 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span>{settings.announcementText}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 text-[11px] hidden sm:flex">
              <a
                href={`https://wa.me/2${whatsappNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-600 transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-sky-500" />
                <span>واتساب: {whatsappNum}</span>
              </a>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => onNavigate('branches')}
                className="hover:text-sky-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-sky-500" />
                <span>فروع الإسكندرية (المعرض الرئيسي & كرموز)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer shrink-0 py-2"
          >
            <BrandLogo customLogoUrl={settings?.logoUrl} />
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أطقم ملايات، بطاطين، لحاف، مفارش..."
                className="w-full bg-[#FAF9F5] hover:bg-[#F3F4F6] focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm rounded-full pl-10 pr-12 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-medium shadow-xs"
              >
                بحث
              </button>
            </form>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAi}
              className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/80 hover:border-sky-400 text-sky-800 font-semibold text-xs sm:text-sm shadow-xs transition-all hover:shadow-md cursor-pointer"
              title="مساعد سنتر العسال الذكي"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <Sparkles className="w-4 h-4 text-sky-600 group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:inline">ASSAL AI</span>
            </button>

            {/* Quick Track Order */}
            <button
              onClick={() => onNavigate('track')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                activePage === 'track'
                  ? 'bg-sky-50 border-sky-300 text-sky-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-slate-500" />
              <span>تتبع الطلب</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 rounded-full text-slate-700 hover:text-sky-700 hover:bg-sky-50/80 transition-all border border-transparent hover:border-sky-100 cursor-pointer"
              title="سلة المشتريات"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Admin Discreet Button */}
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="لوحة تحكم الأدمن"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories Secondary Navbar (Desktop) */}
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-2.5 text-xs font-semibold">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activePage === 'home'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/60'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activePage === 'products'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/60'
              }`}
            >
              جميع المنتجات
            </button>

            {categories.slice(0, 7).map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('products', { category: cat.id })}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-sky-700 hover:bg-sky-50/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => onNavigate('offers')}
              className="px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50/70 hover:bg-amber-100/80 transition-colors cursor-pointer font-bold whitespace-nowrap"
            >
              العروض والخصومات 🔥
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500 shrink-0">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              فروعنا واتصل بنا
            </button>
            <span className="text-slate-300">|</span>
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center gap-1 text-sky-700 font-bold hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{primaryPhone}</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أطقم ملايات، بطاطين..."
              className="w-full bg-[#FAF9F5] text-slate-800 text-sm rounded-xl pl-10 pr-10 py-2.5 border border-slate-200 focus:outline-sky-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-right p-2.5 rounded-lg bg-slate-50 hover:bg-sky-50 font-medium text-slate-700"
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                onNavigate('products');
                setMobileMenuOpen(false);
              }}
              className="text-right p-2.5 rounded-lg bg-slate-50 hover:bg-sky-50 font-medium text-slate-700"
            >
              جميع المنتجات
            </button>
            <button
              onClick={() => {
                onNavigate('offers');
                setMobileMenuOpen(false);
              }}
              className="text-right p-2.5 rounded-lg bg-amber-50 text-amber-800 font-bold col-span-2"
            >
              العروض والخصومات الحصرية 🔥
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-400 mb-2">أقسام المفروشات:</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onNavigate('products', { category: cat.id });
                    setMobileMenuOpen(false);
                  }}
                  className="text-right p-2 rounded hover:bg-slate-50 text-slate-600 font-medium truncate"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('track');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 text-slate-700 font-medium text-sm hover:bg-slate-50 rounded-lg text-right"
            >
              <Package className="w-4 h-4 text-sky-600" />
              <span>تتبع شحنتك بكود الطلب</span>
            </button>
            <button
              onClick={() => {
                onNavigate('branches');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 text-slate-700 font-medium text-sm hover:bg-slate-50 rounded-lg text-right"
            >
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>فروع المعرض (أنور السادات & كرموز)</span>
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 text-slate-700 font-medium text-sm hover:bg-slate-50 rounded-lg text-right"
            >
              <HeartHandshake className="w-4 h-4 text-sky-600" />
              <span>من نحن وقصتنا</span>
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 text-slate-700 font-medium text-sm hover:bg-slate-50 rounded-lg text-right"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>لوحة تحكم الإدارة</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
