import React, { useState } from 'react';
import {
  X,
  Star,
  Check,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Heart
} from 'lucide-react';
import { Product, ProductColor } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToCheckout?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onNavigateToCheckout,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'مقاس قياسي');
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product.colors[0] || { name: 'عاجي', hex: '#FAF9F5' }
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    showToast(`تمت إضافة ${quantity} من "${product.name}" إلى السلة`, 'success');
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const discountAmount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discountPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-y-auto flex flex-col md:flex-row text-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-xs border border-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="w-full md:w-1/2 p-6 bg-[#FAF9F5] flex flex-col justify-between border-b md:border-b-0 md:border-l border-slate-200/80">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-xs border border-slate-200/60 mb-4">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountAmount && discountAmount > 0 && (
              <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                وفر {discountAmount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-sky-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust points */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
            <div className="p-2 rounded-xl bg-white/60 border border-slate-200/60 flex flex-col items-center">
              <Truck className="w-4 h-4 text-sky-600 mb-1" />
              <span>شحن سريع لجميع المحافظات</span>
            </div>
            <div className="p-2 rounded-xl bg-white/60 border border-slate-200/60 flex flex-col items-center">
              <RotateCcw className="w-4 h-4 text-emerald-600 mb-1" />
              <span>استبدال واسترجاع 14 يوماً</span>
            </div>
            <div className="p-2 rounded-xl bg-white/60 border border-slate-200/60 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-amber-600 mb-1" />
              <span>فحص عند الاستلام</span>
            </div>
          </div>
        </div>

        {/* Product Info & Controls Column */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                {product.categoryName || 'مفروشات راقية'}
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating || 5.0}</span>
                <span className="text-slate-400">({product.reviewCount || 20} تقييم)</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-[#F0F9FF]/60 border border-sky-100">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {product.price.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm font-bold text-slate-600">جنيه مصري</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {product.originalPrice.toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Fabric / Material */}
            {product.fabric && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF9F5] border border-slate-200 text-xs text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold">الخامة المصنوع منها:</span>
                <span>{product.fabric}</span>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  المقاس المتاح: <span className="text-sky-600">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  اللون: <span className="text-sky-600">{selectedColor.name}</span>
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {product.colors.map(col => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        selectedColor.name === col.name
                          ? 'border-sky-600 ring-2 ring-sky-100 bg-sky-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 pt-2">
              <label className="text-xs font-bold text-slate-700">الكمية:</label>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 20, quantity + 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400">
                (المتوفر بالمخزن: {product.stock} قطعة)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-xs cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-600/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تمت الإضافة للسلة</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة إلى السلة</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all shadow-xs cursor-pointer"
            >
              شراء فوري الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
