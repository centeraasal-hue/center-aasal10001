import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  Mail,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { StoreSettings } from '../types';
import { useToast } from '../context/ToastContext';

interface ContactPageProps {
  settings: StoreSettings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const phone1 = settings?.contactPhones?.[0] || '01277714100';
  const phone2 = settings?.contactPhones?.[1] || '01279207793';
  const whatsappNum = settings?.whatsappNumber || '01277714100';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    setSent(true);
    showToast('شكراً لتواصلك! سيقوم فريق سنتر العسال بالرد عليك سريعاً', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          خدمة عملاء سنتر العسال
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          تواصل معنا وشرفنا بزيارتك
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          نحن في خدمتكم دائماً للإجابة عن أي استفسار أو طلب خاص لأجهزة العرائس
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact info cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Direct Call Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-sky-600" />
              <span>أرقام الهواتف والاتصال المباشر:</span>
            </h3>

            <div className="space-y-2.5">
              <a
                href={`tel:${phone1}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-sky-50 border border-slate-200 hover:border-sky-200 transition-colors"
              >
                <div>
                  <span className="text-[11px] text-slate-400 block">الخط الرئيسي / واتساب:</span>
                  <span className="font-bold text-base text-slate-900 font-mono">{phone1}</span>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-white px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
                  اتصال الآن
                </span>
              </a>

              <a
                href={`tel:${phone2}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-sky-50 border border-slate-200 hover:border-sky-200 transition-colors"
              >
                <div>
                  <span className="text-[11px] text-slate-400 block">الخط الثاني:</span>
                  <span className="font-bold text-base text-slate-900 font-mono">{phone2}</span>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-white px-3 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
                  اتصال الآن
                </span>
              </a>
            </div>

            <a
              href={`https://wa.me/2${whatsappNum}?text=${encodeURIComponent(
                'مرحباً سنتر العسال، أود الاستفسار عن المفروشات والأسعار'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل فوري عبر الواتساب ({whatsappNum})</span>
            </a>
          </div>

          {/* Branches details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              <span>فروع المعارض:</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">الفرع الأول – المعرض الرئيسي</h4>
                  <a
                    href="https://maps.google.com/?q=8+شارع+أنور+السادات"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    <span>الخريطة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-600">8 شارع أنور السادات - الإسكندرية</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>يومياً من 10:00 صباحاً حتى 11:00 مساءً</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">الفرع الثاني – كرموز</h4>
                  <a
                    href="https://maps.google.com/?q=95+عمود+السواري+كرموز"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                  >
                    <span>الخريطة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-600">95 عمود السواري – كرموز - الإسكندرية</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>يومياً من 11:00 صباحاً حتى 11:00 مساءً</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
              أرسل لنا استفسارك أو طلبك
            </h3>

            {sent ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">تم استلام رسالتك بنجاح!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  شكراً لتواصلك مع سنتر العسال. سنقوم بمراجعة طلبك والاتصال بك على {phone}.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
                >
                  إرسال استفسار آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الاسم بالكامل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="اكتب اسمك هنا"
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رقم الهاتف أو الواتساب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رسالتك أو تفاصيل الطلب <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="اكتب استفسارك عن المقاسات، الأسعار، أو تشكيلات العرائس..."
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 rotate-180" />
                  <span>إرسال الرسالة إلى الإدارة</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
