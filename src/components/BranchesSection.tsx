import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ExternalLink, Navigation, Sparkles } from 'lucide-react';
import { Branch, StoreSettings } from '../types';

interface BranchesSectionProps {
  settings: StoreSettings | null;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({ settings }) => {
  const branches = settings?.branches || [
    {
      id: 'b1',
      name: 'الفرع الأول – المعرض الرئيسي',
      address: '8 شارع أنور السادات',
      phone: '01277714100',
      whatsapp: '01277714100',
      workingHours: 'يومياً من الساعة 10:00 صباحاً حتى 11:00 مساءً',
      mapsUrl: 'https://maps.google.com/?q=8+شارع+أنور+السادات',
    },
    {
      id: 'b2',
      name: 'الفرع الثاني – كرموز',
      address: '95 عمود السواري – كرموز',
      phone: '01279207793',
      whatsapp: '01279207793',
      workingHours: 'يومياً من الساعة 11:00 صباحاً حتى 11:00 مساءً',
      mapsUrl: 'https://maps.google.com/?q=95+عمود+السواري+كرموز',
    },
  ];

  return (
    <section className="py-16 bg-[#FDFBF7] border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>فروع سنتر العسال بالإسكندرية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            تفضلوا بزيارتنا في معارضنا
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            نسعد باستقبالكم شخصياً لمعاينة أرقى الملايات والبطاطين واللحاف ومفارش العرائس وتجربة خاماتنا الفاخرة على أرض الواقع.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((branch, index) => (
            <div
              key={branch.id || index}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-right"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="bg-[#FAF9F5] text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                    الفرع {index === 0 ? 'الرئيسي' : 'الثاني'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {branch.name}
                </h3>

                <p className="text-base text-slate-700 font-medium flex items-center gap-2 mb-4">
                  <Navigation className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{branch.address}</span>
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/60">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{branch.workingHours || 'يومياً من 10:00 صباحاً حتى 11:00 مساءً'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100">
                <a
                  href={`tel:${branch.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>اتصال مباشر</span>
                </a>

                <a
                  href={`https://wa.me/2${branch.whatsapp || branch.phone}?text=${encodeURIComponent(
                    `مرحباً سنتر العسال، أود الاستفسار عن ${branch.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>واتساب</span>
                </a>

                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>على الخريطة</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
