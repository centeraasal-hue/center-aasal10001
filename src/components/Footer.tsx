import React from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  Mail,
  ExternalLink,
  Heart
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings | null;
  onNavigate: (page: string, params?: any) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenAdmin }) => {
  const currentYear = new Date().getFullYear();
  const phone1 = settings?.contactPhones?.[0] || '01277714100';
  const phone2 = settings?.contactPhones?.[1] || '01279207793';
  const whatsappNum = settings?.whatsappNumber || '01277714100';

  return (
    <footer className="bg-gradient-to-b from-[#FAF9F5] via-[#F5EBE1]/40 to-[#F0F9FF]/60 border-t border-slate-200 text-slate-700 pt-16 pb-8">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-200/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">توصيل سريع لجميع المحافظات</h4>
              <p className="text-[11px] text-slate-500">معاينة وفحص المنتج قبل الاستلام</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">قطن مصري 100% وفاخر</h4>
              <p className="text-[11px] text-slate-500">أرقى الخامات المعتمدة عالمياً</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">استبدال واسترجاع 14 يوماً</h4>
              <p className="text-[11px] text-slate-500">ضمان الرضا التام والراحة</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">طرق دفع آمنة ومرنة</h4>
              <p className="text-[11px] text-slate-500">كاش عند الاستلام، إنستاباي، والمحافظ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo customLogoUrl={settings?.logoUrl} size="lg" />
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              سنتر العسال لتجارة المفروشات هو وجهتكم الرائدة لأفخم أطقم الملايات، البطاطين، واللحاف، والمفارش الراقية. نحرص على تقديم أعلى مستويات الفخامة والأناقة لنمنح كل منزل مصري راحة استثنائية وأناقة تدوم لسنوات.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/2${whatsappNum}?text=${encodeURIComponent('مرحباً سنتر العسال، أود الاستفسار عن المفروشات')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>محادثة واتساب مباشرة</span>
              </a>
              <button
                onClick={() => onNavigate('track')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold hover:bg-sky-100 transition-colors shadow-xs cursor-pointer"
              >
                <span>تتبع حالة شحنتك</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide border-b border-sky-200 pb-2 inline-block">
              أقسام المتجر
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'cat-sheets' })}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  أطقم الملايات الفاخرة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'cat-blankets' })}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  البطاطين الحفر والمورا
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'cat-duvets' })}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  ألحفة المايكروفايبر والفيبر
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'cat-bedspreads' })}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  مفارش العرائس والجاكار
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products', { category: 'cat-towels' })}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  الفوط والبشاكير القطنية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers')}
                  className="text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  العروض والتخفيضات 🔥
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide border-b border-sky-200 pb-2 inline-block">
              خدمة العملاء
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  تتبع الطلب بكود الشحنة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  الأسئلة الشائعة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('policies')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  سياسة الاستبدال والاسترجاع
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('policies')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  سياسة الخصوصية والشحن
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  عن سنتر العسال
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  اتصل بنا
                </button>
              </li>
            </ul>
          </div>

          {/* Branches & Contact Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide border-b border-sky-200 pb-2 inline-block">
              فروعنا وأرقامنا
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-sky-800 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>المعرض الرئيسي</span>
                </div>
                <p className="text-slate-600 pr-5">8 شارع أنور السادات</p>
                <div className="pr-5 mt-1">
                  <a
                    href={`tel:${phone1}`}
                    className="text-slate-800 font-bold hover:text-sky-600 transition-colors inline-flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-sky-500" />
                    <span>{phone1}</span>
                  </a>
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-sky-800 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>فرع عمود السواري</span>
                </div>
                <p className="text-slate-600 pr-5">95 عمود السواري – كرموز</p>
                <div className="pr-5 mt-1">
                  <a
                    href={`tel:${phone2}`}
                    className="text-slate-800 font-bold hover:text-sky-600 transition-colors inline-flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-sky-500" />
                    <span>{phone2}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>مواعيد العمل: يومياً 10 ص حتى 11 م</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>جميع الحقوق محفوظة © {currentYear}</span>
          <span className="font-bold text-slate-700">سنتر العسال لتجارة المفروشات</span>
          <span>(CENTER AL ASSAL)</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>الدفع عند الاستلام | InstaPay | فودافون كاش</span>
          </div>

          <button
            onClick={onOpenAdmin}
            className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة الأدمن</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
