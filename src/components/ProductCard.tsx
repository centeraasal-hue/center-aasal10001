import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'مقاس قياسي');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'عاجي', hex: '#FAF9F5' });
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, selectedSize, selectedColor, 1);
    showToast(`تمت إضافة "${product.name}" إلى السلة بنجاح!`, 'success');
    setTimeout(() => setIsAdding(false), 800);
  };

  const discountAmount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discountPercent;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FAF9F5]">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-gradient-to-r from-sky-600 to-sky-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              جديد 2026
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              الأكثر مبيعاً
            </span>
          )}
          {discountAmount && discountAmount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs self-start">
              خصم {discountAmount}%
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute left-3 top-3 w-8 h-8 rounded-full bg-white/90 text-slate-700 hover:text-sky-600 hover:bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="معاينة سريعة"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Stock Alert */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
            متبقي {product.stock} قطع فقط
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-4 text-right">
        {/* Category & Material Tag */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span className="text-sky-700 font-semibold">{product.categoryName || 'مفروشات راقية'}</span>
          {product.fabric && (
            <span className="bg-[#FAF9F5] border border-slate-200/60 px-1.5 py-0.5 rounded text-[10px] text-slate-600 truncate max-w-[120px]">
              {product.fabric}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-sky-700 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-500 text-[11px] font-medium">({product.reviewCount || 18})</span>
        </div>

        {/* Color Choices Mini-preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3" onClick={e => e.stopPropagation()}>
            <span className="text-[11px] text-slate-400">الألوان:</span>
            <div className="flex items-center gap-1">
              {product.colors.map(col => (
                <button
                  key={col.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(col);
                  }}
                  title={col.name}
                  style={{ backgroundColor: col.hex }}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    selectedColor.name === col.name
                      ? 'ring-2 ring-sky-500 scale-110 border-white'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">
                {product.price.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs font-semibold text-slate-500">ج.م</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {product.originalPrice.toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.isAvailable || product.stock === 0}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              !product.isAvailable || product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-500/20'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
