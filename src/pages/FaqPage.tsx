import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';

interface FaqPageProps {
  settings: StoreSettings | null;
  onOpenAi: () => void;
}

const FAQS = [
  {
    q: 'ما هي جودة خامات القطن المستخدمة في أطقم ملايات سنتر العسال؟',
    a: 'جميع أطقم الملايات لدينا مصنعة من قطن مصري 100% طويل التيلة عالي الكثافة (300-400 غرزة) معالج بتقنية النعومة الفائقة ضد التوبير والانكماش، لتمنحك ملمساً حريرياً مريحاً يدوم مع كل غسلة.'
  },
  {
    q: 'هل يمكنني معاينة وفحص المفروشات عند الاستلام قبل دفع المبلغ؟',
    a: 'نعم بكل تأكيد! نحن في سنتر العسال نمنح جميع عملائنا حق فحص الشحنة والتأكد من ملمس القماش والمقاس والألوان أمام مندوب الشحن قبل سداد قيمة الطلب في خيار "الدفع عند الاستلام".'
  },
  {
    q: 'كم تستغرق مدة شحن وتوصيل الطلبات؟',
    a: 'يتم التوصيل داخل محافظة الإسكندرية والقاهرة الكبرى خلال 24 إلى 48 ساعة فقط، ولباقي محافظات الجمهورية خلال 48 إلى 72 ساعة كحد أقصى.'
  },
  {
    q: 'ما هي طرق الدفع المتاحة في المتجر؟',
    a: 'نوفر الدفع عند الاستلام نقداً للمندوب، بالإضافة إلى التحويل المباشر عبر InstaPay والمحافظ الإلكترونية (فودافون كاش، أورنج كاش، اتصالات كاش، وي باي).'
  },
  {
    q: 'ما هي سياسة الاستبدال والاسترجاع لديكم؟',
    a: 'يحق للعميل استبدال أو استرجاع أي منتج خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية وبتغليف المصنع ولم يتم استعماله أو غسله.'
  },
  {
    q: 'هل توفرون عروضاً خاصة وتجهيزاً كاملاً لأجهزة العرائس؟',
    a: 'نعم، يوفر سنتر العسال بكجات عرائس متكاملة تتضمن أطقم ملايات سرير كبير، بطاطين حفر طبقتين، ألحفة مايكروفايبر، مفارش جاكار فاخرة، وفوط وبشاكير قطنية بتخفيضات خاصة وهدايا قيمة.'
  },
  {
    q: 'أين تقع معارض سنتر العسال في الإسكندرية؟',
    a: 'لدينا فرعان رئيسيان: الفرع الأول (المعرض الرئيسي) في 8 شارع أنور السادات، والفرع الثاني في 95 عمود السواري – كرموز. نستقبلكم يومياً من الصباح وحتى المساء.'
  }
];

export const FaqPage: React.FC<FaqPageProps> = ({ settings, onOpenAi }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          إجابات سريعة وواضحة
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">الأسئلة الشائعة</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          كل ما تود معرفته عن منتجاتنا وخاماتنا وسياسات التوصيل والدفع
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-right flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-sky-700 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-sky-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ask AI Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">لم تجد إجابة لسؤالك؟</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          تحدث مع ASSAL AI مساعدنا الذكي فوراً للإجابة عن مقاسات محددة أو استفسارات ألوان وأسعار.
        </p>
        <button
          onClick={onOpenAi}
          className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          اسأل ASSAL AI الآن
        </button>
      </div>
    </div>
  );
};
