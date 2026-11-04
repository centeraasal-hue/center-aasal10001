import React from 'react';
import { Sparkles, ArrowLeft, ShieldCheck, Heart, Truck, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroProps {
  settings: StoreSettings | null;
  onExplore: () => void;
  onOffers: () => void;
  onOpenAi: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExplore, onOffers, onOpenAi }) => {
  const heroBadge = settings?.heroBadge || 'كولكشن 2026 الحصري – فخامة وأناقة تدوم';
  const heroTitle = settings?.heroTitle || 'فخامة المفروشات العصرية لمنزل الأحلام';
  const heroSubtitle =
    settings?.heroSubtitle ||
    'ننتقي لكم أرقى خامات القطن المصري والمفروشات الفاخرة التي تمنح غرفتكم الدفء والأناقة والراحة المطلقة بأعلى معايير الجودة والتصنيع.';
  const heroImage =
    settings?.heroImage ||
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F0F9FF]/70 via-[#FAF9F5] to-[#FAF9F5] py-12 md:py-20 border-b border-slate-200/60">
      {/* Subtle luxury background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E0F2FE]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#F5EBE1]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Exclusive Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#D4AF37]/50 shadow-xs backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide">
                {heroBadge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-600/20 hover:shadow-sky-600/30 transition-all cursor-pointer"
              >
                <span>تسوق الكولكشن الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOffers}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
              >
                <span>عروض العرائس والخصومات 🔥</span>
              </button>

              <button
                onClick={onOpenAi}
                className="flex items-center gap-2 px-4 py-4 rounded-2xl bg-[#E0F2FE]/70 hover:bg-[#E0F2FE] text-sky-800 font-semibold text-xs sm:text-sm border border-sky-200 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>استشر ASSAL AI</span>
              </button>
            </div>

            {/* Quality Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/70 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium">قطن مصري أصلي</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">24-48h</p>
                <p className="text-xs text-slate-500 font-medium">توصيل سريع للباب</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">14 يوم</p>
                <p className="text-xs text-slate-500 font-medium">استبدال واسترجاع</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow & Border Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-4/3 sm:aspect-5/4">
                <img
                  src={heroImage}
                  alt="مفروشات سنتر العسال"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Floating Glassmorphism Tag 1 */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-md flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">أطقم العرائس الملكية</h5>
                    <p className="text-[10px] text-slate-500">تطريز يدوي وخامات مستوردة</p>
                  </div>
                </div>

                {/* Floating Glassmorphism Tag 2 */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md py-1.5 px-3 rounded-full border border-slate-200/80 shadow-sm flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>معاينة قبل الدفع</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
