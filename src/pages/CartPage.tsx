import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { StoreSettings } from '../types';

interface CartPageProps {
  settings: StoreSettings | null;
  onNavigateToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  settings,
  onNavigateToCheckout,
  onContinueShopping,
}) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, itemCount } = useCart();
  const { showToast } = useToast();

  // Deletion modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    itemId?: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: 'single',
  });

  const handleConfirmDelete = () => {
    if (deleteModalState.type === 'single' && deleteModalState.itemId) {
      removeFromCart(deleteModalState.itemId);
      showToast(`تمت إزالة "${deleteModalState.itemName || 'المنتج'}" من السلة`, 'success');
    } else if (deleteModalState.type === 'all') {
      clearCart();
      showToast('تم تفريغ سلة المشتريات بالكامل بنجاح', 'success');
    }
    setDeleteModalState({ isOpen: false, type: 'single' });
  };

  const handleCancelDelete = () => {
    setDeleteModalState({ isOpen: false, type: 'single' });
  };

  const freeShippingThreshold = settings?.shippingSettings?.freeShippingThreshold || 1500;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">سلة مشترياتك فارغة حالياً</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          لم تقم بإضافة أي مفروشات بعد. استكشف مجموعتنا الفاخرة من أطقم الملايات، البطاطين، واللحاف.
        </p>
        <button
          onClick={onContinueShopping}
          className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          ابدأ التسوق الآن
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-right space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">سلة المشتريات</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">لديك {itemCount} منتجات في السلة</p>
        </div>
        <button
          onClick={() =>
            setDeleteModalState({
              isOpen: true,
              type: 'all',
              itemName: 'كافة المنتجات الموجودة بالسلة',
            })
          }
          className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تفريغ السلة</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-800">
            {isFreeShipping ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                تهانينا! طلبيتك مؤهلة للشحن المجاني لجميع المحافظات 🎉
              </span>
            ) : (
              <span>
                أضف بقيمة <strong className="text-sky-600">{remainingForFreeShipping.toLocaleString('ar-EG')} ج.م</strong> إضافية للحصول على شحن مجاني!
              </span>
            )}
          </span>
          <span className="text-slate-400">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4 justify-between"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200/60"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="bg-[#FAF9F5] px-2 py-0.5 rounded border border-slate-200">
                      المقاس: {item.size}
                    </span>
                    <span className="flex items-center gap-1 bg-[#FAF9F5] px-2 py-0.5 rounded border border-slate-200">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: item.color.hex }}
                      />
                      <span>{item.color.name}</span>
                    </span>
                  </div>
                  <div className="text-sm font-bold text-sky-700">
                    {item.price.toLocaleString('ar-EG')} ج.م للقطعة
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-xl bg-[#FAF9F5] overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-slate-200/80 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-slate-200/80 text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900">
                    {(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <button
                  onClick={() =>
                    setDeleteModalState({
                      isOpen: true,
                      type: 'single',
                      itemId: item.id,
                      itemName: `${item.name} (${item.size} - ${item.color.name})`,
                    })
                  }
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="حذف من السلة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={onContinueShopping}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>متابعة التسوق وإضافة المزيد</span>
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5 sticky top-28">
            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
              ملخص الطلب
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي ({itemCount} قطع):</span>
                <span className="font-bold text-slate-800">{subtotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>تكلفة الشحن التقديرية:</span>
                <span className="font-bold text-slate-800">
                  {isFreeShipping ? (
                    <span className="text-emerald-600 font-black">مجاني 🎉</span>
                  ) : (
                    <span>تُحسب عند اختيار المحافظة</span>
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-800">الإجمالي المبدئي:</span>
                <div className="text-left">
                  <span className="text-2xl font-black text-slate-900">{subtotal.toLocaleString('ar-EG')}</span>
                  <span className="text-xs font-bold text-slate-500 mr-1">ج.م</span>
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToCheckout}
              className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>متابعة إتمام الطلب (Checkout)</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>معاينة وفحص الطلب قبل الدفع عند الاستلام</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.type === 'all' ? 'تأكيد تفريغ سلة المشتريات' : 'تأكيد إزالة المنتج من السلة'}
        message={
          deleteModalState.type === 'all'
            ? 'هل أنت متأكد أنك تريد تفريغ سلة المشتريات بالكامل وإزالة جميع المنتجات منها؟'
            : 'هل أنت متأكد أنك تريد حذف هذا المنتج من سلة مشترياتك؟'
        }
        itemName={deleteModalState.itemName}
        confirmText={deleteModalState.type === 'all' ? 'نعم، تفريغ السلة بالكامل' : 'نعم، إزالة من السلة'}
        cancelText="تراجع (إلغاء)"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
