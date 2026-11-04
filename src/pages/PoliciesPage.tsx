import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface PoliciesPageProps {
  settings: StoreSettings | null;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'return' | 'shipping' | 'privacy'>('return');

  const returnPolicy =
    settings?.policies?.returnPolicy ||
    'نحن نضمن رضاك التام عن كل قطعة. يحق للعميل استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون بحالته الأصلية وداخل تغليفه ولم يُستعمل أو يُغسل.';
  const shippingPolicy =
    settings?.policies?.shippingPolicy ||
    'تصل شحنتك خلال 24 - 48 ساعة في الإسكندرية والقاهرة الكبرى، وخلال 2 - 3 أيام لباقي المحافظات. يتاح للعميل معاينة المنتجات وفحصها عند الاستلام قبل الدفع.';
  const privacyPolicy =
    settings?.policies?.privacyPolicy ||
    'نلتزم بحماية خصوصية بياناتك ومعلوماتك الشخصية. لا نستخدم أرقام الهواتف أو العناوين إلا لغرض إتمام وتوصيل طلبك عبر مندوبي الشحن المعتمدين لدينا.';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          الشفافية والأمان
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          سياسات سنتر العسال
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          حقوقك وضماناتك عند التسوق معنا
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('return')}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'return'
              ? 'border-sky-600 text-sky-700 bg-sky-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>سياسة الاستبدال والاسترجاع</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'shipping'
              ? 'border-sky-600 text-sky-700 bg-sky-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>سياسة الشحن والتوصيل</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'privacy'
              ? 'border-sky-600 text-sky-700 bg-sky-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>سياسة الخصوصية</span>
        </button>
      </div>

      {/* Policy content box */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed">
        {activeTab === 'return' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              <span>ضمان الاستبدال والاسترجاع خلال 14 يوماً</span>
            </h2>
            <p className="text-slate-600">{returnPolicy}</p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
              <li>يجب أن يكون المنتج في حالته الجديدة غير المستعملة وبنفس التغليف الكرتوني والداخلي.</li>
              <li>في حالة وجود أي عيب مصنعي، يتحمل المتجر كافة تكاليف الشحن ذهاباً وإياباً.</li>
              <li>يتم استرداد المبلغ بنفس طريقة السداد أو عبر تحويل فودافون كاش / إنستاباي فور فحص المنتج المرتجع.</li>
            </ul>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" />
              <span>مواعيد الشحن والتوصيل</span>
            </h2>
            <p className="text-slate-600">{shippingPolicy}</p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
              <li>الإسكندرية: توصيل فوري خلال 24 ساعة (35 ج.م).</li>
              <li>القاهرة الكبرى والجيزة: خلال 24 - 48 ساعة (45 ج.م).</li>
              <li>شحن مجاني لكافة محافظات مصر للطلبات التي تزيد عن 1500 جنيه.</li>
              <li>يتصل بك المندوب هاتفياً لتحديد الميعاد الأنسب لاستلام شحنتك.</li>
            </ul>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <span>أمان وسرية بيانات العملاء</span>
            </h2>
            <p className="text-slate-600">{privacyPolicy}</p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
              <li>نحن لا نبيع أو نؤجر أي بيانات شخصية أو أرقام تواصل لأي أطراف إعلانية خارجية.</li>
              <li>يتم استخدام رقم الهاتف فقط لإرسال إشعارات كود الطلب وتنسيق التوصيل.</li>
              <li>إثباتات التحويل عبر إنستاباي والمحافظ الإلكترونية تُحفظ بأمان وتُحذف بعد مراجعة الدفع.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
