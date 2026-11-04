import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Package,
  Calendar,
  MapPin,
  Phone,
  ArrowLeft,
  Printer,
  Share2
} from 'lucide-react';
import { Order } from '../types';
import { useToast } from '../context/ToastContext';

interface OrderSuccessPageProps {
  order: Order;
  onTrackOrder: (code: string) => void;
  onContinueShopping: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  onTrackOrder,
  onContinueShopping,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    showToast('تم نسخ كود الطلب بنجاح', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-right space-y-8 animate-in fade-in duration-300">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            تم تسجيل الطلب بنجاح في سنتر العسال
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            شكراً لك، {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            تم استلام طلبك ووصل إلى لوحة تحكم الإدارة. سيتواصل معك فريق خدمة العملاء لتأكيد تفاصيل الشحن.
          </p>
        </div>

        {/* Unique Order Code Box */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#F0F9FF] border-2 border-sky-300 shadow-xs flex items-center justify-between gap-4">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-500 block">كود الطلب الفريد الخاص بك:</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-800 tracking-wider">
              {order.orderCode}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200 shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
          </button>
        </div>
      </div>

      {/* Order Details Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
          تفاصيل الفاتورة والطلب
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-xs block">طريقة الدفع المختارة:</span>
            <strong className="text-slate-800">
              {order.paymentMethod === 'cod'
                ? 'الدفع عند الاستلام (معاينة وفحص المنتج)'
                : order.paymentMethod === 'instapay'
                ? 'تحويل عبر InstaPay (قيد المراجعة)'
                : 'تحويل محفظة إلكترونية (قيد المراجعة)'}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-xs block">عنوان التوصيل:</span>
            <strong className="text-slate-800">
              {order.governorate}، {order.area} - {order.detailedAddress}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-xs block">رقم هاتف المستلم:</span>
            <strong className="text-slate-800">{order.customerPhone}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-slate-200/60 space-y-1">
            <span className="text-slate-400 text-xs block">تاريخ وتوقيت الطلب:</span>
            <strong className="text-slate-800">
              {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-500">المنتجات المطلوبة:</h4>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#FAF9F5]">
              <div className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div>
                  <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{item.productName}</h5>
                  <p className="text-[11px] text-slate-500">
                    {item.selectedSize} {item.selectedColor ? `• ${item.selectedColor}` : ''} × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 pt-4 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-600">
            <span>المجموع الفرعي:</span>
            <span className="font-bold">{order.subtotal.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>تكلفة الشحن والتوصيل:</span>
            <span className="font-bold">
              {order.shippingCost === 0 ? 'مجاني' : `${order.shippingCost} ج.م`}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>إجمالي المبلغ المطلوب:</span>
            <span className="text-sky-700 font-black text-xl">{order.total.toLocaleString('ar-EG')} ج.م</span>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => onTrackOrder(order.orderCode)}
          className="flex-1 py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>تتبع حالة شحنتك الآن</span>
        </button>

        <button
          onClick={handlePrint}
          className="py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>طباعة الفاتورة</span>
        </button>

        <button
          onClick={onContinueShopping}
          className="py-4 px-6 rounded-2xl bg-[#FAF9F5] hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
        >
          العودة للتسوق
        </button>
      </div>
    </div>
  );
};
