import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { AdminUser } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      const user = await api.adminLogin(password.trim());
      showToast('تم تسجيل الدخول إلى لوحة تحكم سنتر العسال بنجاح', 'success');
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'كلمة المرور غير صحيحة', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 text-right space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            CENTER AL ASSAL ADMIN
          </h2>
          <p className="text-xs text-slate-500">
            تسجيل الدخول إلى لوحة إدارة سنتر العسال
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة مرور الأدمن:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الخاصة بك"
                className="w-full bg-[#FAF9F5] text-slate-800 text-sm rounded-xl pl-10 pr-10 py-3 border border-slate-200 focus:outline-sky-500"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              (كلمة المرور الافتراضية للنظام: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">alassal2026</code> مع إمكانية تغييرها من الإعدادات)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>جاري التحقق...</span> : <span>تسجيل الدخول للوحة التحكم</span>}
          </button>
        </form>
      </div>
    </div>
  );
};
