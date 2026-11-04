import React from 'react';
import { Award, Sparkles, Heart, ShieldCheck, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { StoreSettings } from '../types';

interface AboutPageProps {
  settings: StoreSettings | null;
  onExplore: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onExplore }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right space-y-16">
      {/* Intro Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#F0F9FF] via-[#FAF9F5] to-[#F5EBE1] border border-sky-100 p-8 sm:p-14 text-center max-w-4xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-[#D4AF37]/50 text-slate-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>قصة التميز والفخامة</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          سنتر العسال لتجارة المفروشات
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          انطلقت علامتنا التجارية من قلب الإسكندرية لتصبح المقصد الأول لكل من يبحث عن الفخامة والراحة الحقيقية في عالم المفروشات المنزلية وأطقم العرائس الراقية.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">أصالة القطن المصري</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            نعتمد في ملاياتنا ومفارش العرائس على أجود ألياف القطن المصري طويل التيلة، المشهود له عالمياً بالنعومة الفائقة والمتانة العالية التي لا تفنى بمرور السنوات.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">عناية خاصة بجهاز العروسة</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            نوفر تشكيلات مخصصة ومصممة بأحدث صيحات التطريز والجاكار والألوان الهادئة التي تمنح منزل الزوجية لمسة ملكية ساحرة تليق بأجمل البدايات.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">ثقة وأمان في التعامل</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            خدمة شحن سريعة مع إمكانية الفحص الكامل للمنتج قبل السداد، وسياسة استبدال واسترجاع مرنة تضمن رضا عميلنا التام واطمئنانه.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
        <h3 className="text-2xl font-black text-slate-900">هل ترغب في تجديد غرفتك اليوم؟</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          استكشف أرقى الملايات والبطاطين والألحفة المتوفرة للشحن الفوري لجميع المحافظات.
        </p>
        <button
          onClick={onExplore}
          className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
        >
          تصفح كتالوج 2026 الآن
        </button>
      </div>
    </div>
  );
};
