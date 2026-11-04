import React from 'react';
import {
  Sparkles,
  ArrowLeft,
  Star,
  CheckCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Award,
  ChevronLeft
} from 'lucide-react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { BranchesSection } from '../components/BranchesSection';
import { Product, ProductCategory, StoreSettings } from '../types';

interface HomePageProps {
  settings: StoreSettings | null;
  products: Product[];
  categories: ProductCategory[];
  onOpenProduct: (product: Product) => void;
  onNavigate: (page: string, params?: any) => void;
  onOpenAi: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  products,
  categories,
  onOpenProduct,
  onNavigate,
  onOpenAi,
}) => {
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const discounted = products
    .filter(p => (p.originalPrice && p.originalPrice > p.price) || (p.discountPercent && p.discountPercent > 0))
    .slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <Hero
        settings={settings}
        onExplore={() => onNavigate('products')}
        onOffers={() => onNavigate('offers')}
        onOpenAi={onOpenAi}
      />

      {/* 2. Discover Our Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              تشكيلات سنتر العسال
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              اكتشف أقسام المفروشات
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              مجموعات منتقاة بعناية تلبي جميع أذواق منازلكم الراقية
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.id })}
              className="group relative flex flex-col items-center bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden text-center"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#FAF9F5]">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-sky-950/10 group-hover:bg-transparent transition-colors" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-sky-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals (أحدث المنتجات) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="text-xs font-bold text-slate-400">إصدارات جديدة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              أحدث تشكيلات 2026
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { newArrival: true })}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
          >
            <span>شاهد كل الجديد</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(newArrivals.length > 0 ? newArrivals : products.slice(0, 4)).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenProduct}
            />
          ))}
        </div>
      </section>

      {/* 4. Luxury Promotional Banner (أطقم العرائس) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F0F9FF] via-[#FAF9F5] to-[#F5EBE1] border border-[#D4AF37]/30 shadow-md p-8 sm:p-12 text-right">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>جهاز العروسة بأفخم الخامات</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
              أطقم مفارش وملايات العرائس الملكية
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              جهّزي منزلك الجديد بأرقى تشكيلات القطن المصري المطرز والجاكار التركي والبطاطين الحفر بأفضل الأسعار وبخصومات تصل إلى 25% مع هدايا خاصة عند الطلب.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('products', { category: 'cat-bedspreads' })}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                تصفح تشكيلة العرائس
              </button>
              <button
                onClick={onOpenAi}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition-all cursor-pointer"
              >
                استفسر من ASSAL AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers (الأكثر مبيعاً) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              اختيارات العملاء المفضلة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              المنتجات الأكثر طلباً ومبيعاً
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products', { bestSeller: true })}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(bestSellers.length > 0 ? bestSellers : products.slice(0, 4)).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={onOpenProduct}
            />
          ))}
        </div>
      </section>

      {/* 6. Why Choose CENTER AL ASSAL (لماذا تختار سنتر العسال؟) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-right">
          <div className="max-w-2xl mx-auto text-center mb-10 space-y-2">
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              ثقة وفخامة متوارثة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              لماذا يختار عملاؤنا سنتر العسال؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              نلتزم بتقديم تجربة تسوق استثنائية ترتكز على الجودة المطلقة والشفافية التامة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold border border-sky-100">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">خامات أصلية 100%</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                نستخدم أفضل خيوط القطن المصري المعالج والخامات المستوردة التي لا تتأثر بالغسيل المتكرر ولا تفقد بريقها ونعومتها أبداً.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">فحص ومعاينة عند الاستلام</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                لك كامل الحق في فحص الشحنة وملمس القماش والتأكد من المقاسات والألوان أمام مندوب الشحن قبل دفع أي مبلغ.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-slate-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">ضمان استبدال 14 يوماً</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                إذا لم يكن المنتج مطابقاً لتطلعاتك بنسبة 100%، يمكنك استبداله أو استرجاعه بكل سهولة عبر خدمة عملائنا السريعة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            آراء وتجارب حقيقية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            ماذا يقول عملاؤنا عن سنتر العسال؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              "طقم الملايات الرويال القطن المصري تحفة بجد! القماش ناعم جداً على البشرة ومش بيوبر بعد الغسيل، والتطريز في منتهى الشياكة."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">مدام ميادة فهمي</h4>
                <p className="text-[10px] text-slate-400">الإسكندرية - سموحة</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                شراء مؤكد
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              "اشتريت لحاف مايكروفايبر وبطانية مورا لجهاز أختي، بجد جودة محترمة جداً وسعر منافس، وخدمة التوصيل كانت في أقل من 24 ساعة."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">أحمد عبد العزيز</h4>
                <p className="text-[10px] text-slate-400">القاهرة - التجمع</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                شراء مؤكد
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              "معاملة راقية جداً في فرع المعرض الرئيسي بأنور السادات ومساعد الذكاء الاصطناعي في الموقع رشحلي المقاس الصح بالظبط لسراير أطفالي."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">سارة النجار</h4>
                <p className="text-[10px] text-slate-400">الإسكندرية</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                شراء مؤكد
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Branches Section */}
      <BranchesSection settings={settings} />
    </div>
  );
};
