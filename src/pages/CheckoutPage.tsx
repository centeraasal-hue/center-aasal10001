import React, { useState } from 'react';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Upload,
  Check,
  AlertCircle,
  FileCheck,
  Phone,
  ArrowRight,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Order, PaymentMethod, StoreSettings } from '../types';

interface CheckoutPageProps {
  settings: StoreSettings | null;
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  settings,
  onOrderSuccess,
  onBackToCart,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [governorate, setGovernorate] = useState(
    settings?.shippingSettings?.governorates?.[0]?.name || 'الإسكندرية'
  );
  const [area, setArea] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [receiptImageBase64, setReceiptImageBase64] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate shipping cost based on governorate and threshold
  const freeThreshold = settings?.shippingSettings?.freeShippingThreshold || 1500;
  const isFreeShipping = subtotal >= freeThreshold;

  const currentGov = settings?.shippingSettings?.governorates?.find(g => g.name === governorate);
  const shippingCost = isFreeShipping
    ? 0
    : currentGov?.cost ?? (settings?.shippingSettings?.defaultShippingCost || 45);

  const grandTotal = subtotal + shippingCost;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت', 'error');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImageBase64(reader.result as string);
      showToast('تم إرفاق صورة إشعار التحويل بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !detailedAddress.trim()) {
      showToast('يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، العنوان بالتفصيل)', 'error');
      return;
    }

    if (paymentMethod !== 'cod' && !receiptImageBase64) {
      showToast('يرجى إرفاق صورة إشعار التحويل لتأكيد الطلب عبر إنستاباي أو المحفظة', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        governorate,
        area: area.trim(),
        detailedAddress: detailedAddress.trim(),
        notes: notes.trim(),
        items: items.map(item => ({
          productId: item.productId,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.size,
          selectedColor: item.color.name,
          image: item.image,
        })),
        subtotal,
        shippingCost,
        total: grandTotal,
        paymentMethod,
        paymentReceiptImage: receiptImageBase64,
      };

      const result = await api.createOrder(orderPayload);
      clearCart();
      showToast(result.message, 'success');
      onOrderSuccess(result.order);
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-right space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">إتمام الطلب (Checkout)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            الشراء متاح كضيف دون الحاجة لإنشاء حساب أو كلمة مرور
          </p>
        </div>
        <button
          onClick={onBackToCart}
          className="flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع إلى السلة</span>
        </button>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Information & Address Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>بيانات العميل والشحن</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الاسم بالكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد محمد عبد العال"
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="مثال: 01234567890"
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المحافظة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={governorate}
                  onChange={e => setGovernorate(e.target.value)}
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white cursor-pointer"
                >
                  {settings?.shippingSettings?.governorates?.map(gov => (
                    <option key={gov.name} value={gov.name}>
                      {gov.name} (شحن {gov.cost} ج.م - خلال {gov.deliveryDays})
                    </option>
                  )) || (
                    <>
                      <option value="الإسكندرية">الإسكندرية (شحن 35 ج.م)</option>
                      <option value="القاهرة">القاهرة (شحن 45 ج.م)</option>
                      <option value="الجيزة">الجيزة (شحن 45 ج.م)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المنطقة أو الحي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="مثال: سموحة، المنتزه، مصر الجديدة..."
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  العنوان بالتفصيل (الشارع، رقم العمارة، رقم الشقة) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={detailedAddress}
                  onChange={e => setDetailedAddress(e.target.value)}
                  placeholder="مثال: 15 شارع الحرية، برج النور، الدور الرابع، شقة 8"
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إضافية للتوصيل (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، أو التسليم بعد الساعة 4 عصراً"
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>طريقة الدفع</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Cash on delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-5 h-5 text-sky-600" />
                    {paymentMethod === 'cod' && (
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-600 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">الدفع عند الاستلام</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    فحص ومعاينة المنتج أولاً ثم السداد للمندوب
                  </p>
                </div>
              </div>

              {/* Option 2: InstaPay */}
              <div
                onClick={() => setPaymentMethod('instapay')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'instapay'
                    ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-sky-600" />
                    {paymentMethod === 'instapay' && (
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-600 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">InstaPay</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    تحويل بنكي فوري عبر تطبيق إنستاباي
                  </p>
                </div>
              </div>

              {/* Option 3: Electronic Wallets */}
              <div
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'wallet'
                    ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Phone className="w-5 h-5 text-sky-600" />
                    {paymentMethod === 'wallet' && (
                      <span className="w-3.5 h-3.5 rounded-full bg-sky-600 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">المحافظ الإلكترونية</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    فودافون كاش، أورنج كاش، اتصالات، وي
                  </p>
                </div>
              </div>
            </div>

            {/* InstaPay Details & Receipt Upload */}
            {paymentMethod === 'instapay' && (
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sky-200 space-y-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">تعليمات تحويل InstaPay:</p>
                    <p className="mt-1">
                      معرّف إنستاباي (IPA):{' '}
                      <strong className="text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 font-mono text-sm select-all">
                        {settings?.paymentSettings?.instaPayHandle || 'alassal.center@instapay'}
                      </strong>
                    </p>
                    <p className="mt-1">
                      اسم المستفيد:{' '}
                      <strong>{settings?.paymentSettings?.instaPayAccountName || 'سنتر العسال للمفروشات'}</strong>
                    </p>
                    <p className="mt-1 text-slate-500">
                      يرجى تحويل مبلغ <strong className="text-slate-800">{grandTotal.toLocaleString('ar-EG')} ج.م</strong>، ثم التقاط لقطة شاشة لإشعار التحويل وإرفاقها بالأسفل لمراجعتها من قبل الإدارة.
                    </p>
                  </div>
                </div>

                {/* Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    إرفاق إثبات التحويل (صورة الإشعار) <span className="text-rose-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-300 rounded-xl bg-white hover:bg-sky-50/40 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-sky-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">اضغط لرفع لقطة الشاشة أو الصورة</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP حتى 8 ميجابايت</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {receiptFileName && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>تم إرفاق: {receiptFileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Details & Receipt Upload */}
            {paymentMethod === 'wallet' && (
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-sky-200 space-y-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">تعليمات تحويل المحفظة الإلكترونية:</p>
                    <p className="mt-1">
                      رقم المحفظة (فودافون كاش / إنستاباي):{' '}
                      <strong className="text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200 font-mono text-sm select-all">
                        {settings?.paymentSettings?.walletNumber || '01277714100'}
                      </strong>
                    </p>
                    <p className="mt-1">
                      المستفيد: <strong>{settings?.paymentSettings?.walletAccountName || 'سنتر العسال'}</strong>
                    </p>
                    <p className="mt-1 text-slate-500">
                      حول مبلغ <strong className="text-slate-800">{grandTotal.toLocaleString('ar-EG')} ج.م</strong> ثم ارفع صورة إشعار التحويل.
                    </p>
                  </div>
                </div>

                {/* Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    إرفاق إثبات التحويل (صورة الإشعار) <span className="text-rose-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-300 rounded-xl bg-white hover:bg-sky-50/40 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-sky-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">اضغط لرفع لقطة الشاشة أو الصورة</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP حتى 8 ميجابايت</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {receiptFileName && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>تم إرفاق: {receiptFileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Final Submit Button */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 sticky top-28">
            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
              مراجعة وتأكيد الطلب
            </h3>

            {/* Items mini list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-xs border-b border-slate-100 pb-2.5">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 truncate">{item.name}</h5>
                    <p className="text-slate-400 text-[10px]">
                      {item.size} • {item.color.name} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs sm:text-sm pt-2">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي للسلع:</span>
                <span className="font-bold text-slate-800">{subtotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>تكلفة الشحن ({governorate}):</span>
                <span className="font-bold text-slate-800">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-black">مجاني 🎉</span>
                  ) : (
                    <span>{shippingCost} ج.م</span>
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-base">الإجمالي النهائي المستحق:</span>
                <div className="text-left">
                  <span className="text-2xl font-black text-sky-700">{grandTotal.toLocaleString('ar-EG')}</span>
                  <span className="text-xs font-bold text-slate-500 mr-1">ج.م</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-base shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>جاري تسجيل الطلب وإصدار الكود...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>تأكيد الطلب الآن</span>
                </>
              )}
            </button>

            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-bold text-slate-700">
                سيتم إصدار كود فريد لطلبك تلقائياً
              </p>
              <p className="text-[10px] text-slate-500">
                مثال: CAA-2026-00001 لمتابعة وتتبع شحنتك لحظة بلحظة
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
