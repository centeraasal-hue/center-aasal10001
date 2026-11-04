import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { useToast } from '../context/ToastContext';

interface OrderTrackPageProps {
  initialCode?: string;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'تم استلام الطلب', desc: 'الطلب قيد المراجعة من الإدارة' },
  { key: 'confirmed', label: 'تم تأكيد الطلب', desc: 'تم قبول الطلب واعتماده' },
  { key: 'processing', label: 'جاري التجهيز', desc: 'تجهيز وتغليف المفروشات بعناية' },
  { key: 'shipped', label: 'تم الشحن', desc: 'الشحنة مع مندوب التوصيل في طريقها إليك' },
  { key: 'delivered', label: 'تم التوصيل', desc: 'تم تسليم الشحنة بنجاح للعميل' },
];

export const OrderTrackPage: React.FC<OrderTrackPageProps> = ({ initialCode = '' }) => {
  const { showToast } = useToast();
  const [orderCode, setOrderCode] = useState(initialCode);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCode) {
      handleTrack(initialCode);
    }
  }, [initialCode]);

  const handleTrack = async (codeToSearch?: string) => {
    const code = codeToSearch || orderCode.trim();
    if (!code) {
      showToast('يرجى كتابة كود الطلب', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const fetchedOrder = await api.trackOrder(code, phone.trim() || undefined);
      setOrder(fetchedOrder);
      showToast('تم العثور على بيانات شحنتك', 'success');
    } catch (err: any) {
      setOrder(null);
      showToast(err.message || 'لم نتمكن من العثور على الطلب', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const currentStepIndex = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-right space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto shadow-xs">
          <Package className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          تتبع حالة شحنتك
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          أدخل كود الطلب الذي حصلت عليه بعد الشراء لمتابعة مسار شحنتك لحظة بلحظة
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleTrack();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              كود الطلب (مثل CAA-2026-00001) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={orderCode}
              onChange={e => setOrderCode(e.target.value.toUpperCase())}
              placeholder="CAA-2026-XXXXX"
              className="w-full bg-[#FAF9F5] text-slate-800 font-mono text-sm uppercase rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رقم الهاتف (اختياري للتحقق)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="012XXXXXXXX"
              className="w-full bg-[#FAF9F5] text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>جاري البحث...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>تتبع</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results View */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-8 animate-in fade-in">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-400">طلب رقم:</span>
              <h2 className="text-2xl font-black font-mono text-sky-700">{order.orderCode}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  order.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : order.status === 'shipped'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : order.status === 'cancelled'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {order.status === 'cancelled'
                  ? 'تم إلغاء الطلب'
                  : STATUS_STEPS.find(s => s.key === order.status)?.label || 'قيد المتابعة'}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">مراحل تنفيذ وتوصيل الطلب:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 ${
                        isCurrent
                          ? 'bg-sky-50 border-sky-300 shadow-xs'
                          : isDone
                          ? 'bg-white border-emerald-200 text-slate-700'
                          : 'bg-[#FAF9F5] border-slate-200 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{step.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>هذا الطلب ملغي. لمزيد من الاستفسار يرجى التواصل مع إدارة سنتر العسال.</span>
            </div>
          )}

          {/* Summary info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF9F5] space-y-1.5">
              <span className="font-bold text-slate-700 block">بيانات العميل:</span>
              <p className="text-slate-600">الاسم: {order.customerName}</p>
              <p className="text-slate-600">الهاتف: {order.customerPhone}</p>
              <p className="text-slate-600">
                العنوان: {order.governorate}، {order.area} - {order.detailedAddress}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] space-y-1.5">
              <span className="font-bold text-slate-700 block">الدفع والإجمالي:</span>
              <p className="text-slate-600">
                طريقة الدفع:{' '}
                {order.paymentMethod === 'cod'
                  ? 'الدفع عند الاستلام'
                  : order.paymentMethod === 'instapay'
                  ? 'InstaPay'
                  : 'محفظة إلكترونية'}
              </p>
              <p className="text-slate-600">
                حالة السداد:{' '}
                {order.paymentStatus === 'confirmed'
                  ? 'مؤكد ومقبول ✅'
                  : order.paymentStatus === 'pending_review'
                  ? 'قيد مراجعة التحويل ⏳'
                  : 'عند الاستلام 🚚'}
              </p>
              <p className="font-bold text-slate-900 text-sm pt-1">
                الإجمالي المستحق: {order.total.toLocaleString('ar-EG')} ج.م
              </p>
            </div>
          </div>

          {/* Need help footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>هل لديك أي استفسار حول شحنتك؟</span>
            <div className="flex gap-2">
              <a
                href="tel:01277714100"
                className="flex items-center gap-1 font-bold text-sky-700 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>01277714100</span>
              </a>
              <span>|</span>
              <a
                href={`https://wa.me/201277714100?text=${encodeURIComponent(
                  `مرحباً، أود الاستفسار عن طلبي كود ${order.orderCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-bold text-emerald-700 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {searched && !order && !loading && (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 max-w-md mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">لم يتم العثور على هذا الطلب</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            يرجى التأكد من كتابة كود الطلب بالكامل مثل CAA-2026-00001 ومطابقة رقم الهاتف إن تم إدخاله.
          </p>
        </div>
      )}
    </div>
  );
};
