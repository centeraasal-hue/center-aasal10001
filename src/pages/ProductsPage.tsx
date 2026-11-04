import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles, X, ChevronDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductCategory } from '../types';

interface ProductsPageProps {
  products: Product[];
  categories: ProductCategory[];
  initialCategory?: string;
  initialSearch?: string;
  onOpenProduct: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  initialCategory = 'all',
  initialSearch = '',
  onOpenProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [onlyBestSeller, setOnlyBestSeller] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesFabric = p.fabric ? p.fabric.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDesc && !matchesFabric) {
          return false;
        }
      }

      // Discount filter
      if (onlyDiscounted) {
        const hasDiscount = (p.originalPrice && p.originalPrice > p.price) || (p.discountPercent && p.discountPercent > 0);
        if (!hasDiscount) return false;
      }

      // Best seller filter
      if (onlyBestSeller && !p.isBestSeller) {
        return false;
      }

      // Max price filter
      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, sortOption, onlyDiscounted, onlyBestSeller, maxPrice]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortOption('featured');
    setOnlyDiscounted(false);
    setOnlyBestSeller(false);
    setMaxPrice(5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-right space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            جميع منتجات سنتر العسال
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            استعرض {filteredProducts.length} من أرقى المفروشات المنزلية والقطن المصري الأصلي
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">الترتيب حسب:</span>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
          >
            <option value="featured">المميز والأحدث</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Bar + Quick toggles */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الخامة (مثال: قطن مصري، قطيفة، كينج...)"
              className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 border border-slate-200 focus:outline-sky-500"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setOnlyDiscounted(!onlyDiscounted)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                onlyDiscounted
                  ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              العروض والخصومات فقط 🔥
            </button>

            <button
              onClick={() => setOnlyBestSeller(!onlyBestSeller)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                onlyBestSeller
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              الأكثر مبيعاً ⭐
            </button>

            {(selectedCategory !== 'all' || searchQuery || onlyDiscounted || onlyBestSeller || maxPrice < 5000) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs text-sky-600 hover:underline font-bold"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-[#FAF9F5] hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            جميع الأقسام ({products.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-[#FAF9F5] hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">لم نجد منتجات تطابق بحثك</h3>
          <p className="text-xs text-slate-500">
            جرب البحث بكلمات عامة أو تصفح الأقسام الرئيسية مباشرة.
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-colors shadow-xs"
          >
            إظهار كافة المنتجات
          </button>
        </div>
      )}
    </div>
  );
};
