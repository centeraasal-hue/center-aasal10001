import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'تأكيد الحذف',
  message = 'هل أنت متأكد أنك تريد حذف هذا العنصر؟',
  itemName,
  confirmText = 'نعم، حذف نهائياً',
  cancelText = 'إلغاء',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden text-right p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Item preview badge if provided */}
        {itemName && (
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-rose-900 text-xs font-bold break-all flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">العنصر المحدد: {itemName}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500">
          ⚠️ تنبيه: هذه العملية نهائية وسيتم حذف هذا السجل بشكل لا يمكن التراجع عنه.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>جاري الحذف...</span>
              </span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
