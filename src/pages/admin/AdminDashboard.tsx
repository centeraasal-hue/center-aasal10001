import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  Package,
  Layers,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Eye,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  MapPin,
  Phone,
  Save,
  Key,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import {
  AdminUser,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductCategory,
  StoreSettings
} from '../../types';
import { useToast } from '../../context/ToastContext';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

interface DeleteTarget {
  type: 'product' | 'category' | 'order' | 'product_image';
  id: string;
  name: string;
  extraIndex?: number;
}

interface AdminDashboardProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onNavigateToStore: () => void;
  onDataChanged?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout,
  onNavigateToStore,
  onDataChanged,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'settings' | 'security'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal / Editor states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<ProductCategory> | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [receiptModalImage, setReceiptModalImage] = useState<string | null>(null);

  // Security password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, categoriesData, settingsData] = await Promise.all([
        api.getAdminStats(adminUser.token),
        api.getOrders(adminUser.token),
        api.getProducts(),
        api.getCategories(),
        api.getSettings(),
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
      setSettings(settingsData);
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تحميل بيانات لوحة الإدارة', 'error');
      if (err.message && (err.message.includes('غير مصرح') || err.message.includes('انتهت صلاحية'))) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await api.updateOrder(orderId, { status }, adminUser.token);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      showToast(`تم تحديث حالة الطلب إلى "${status}"`, 'success');
      // Refresh stats
      const newStats = await api.getAdminStats(adminUser.token);
      setStats(newStats);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const updated = await api.updateOrder(orderId, { paymentStatus }, adminUser.token);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      showToast(
        paymentStatus === 'confirmed' ? 'تم تأكيد استلام الدفع بنجاح' : 'تم رفض إثبات الدفع',
        'success'
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // PRODUCT ACTIONS
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) {
      showToast('يرجى ملء اسم المنتج وسعره', 'error');
      return;
    }

    try {
      if (editingProduct.id) {
        // Update
        const updated = await api.updateProduct(editingProduct.id, editingProduct, adminUser.token);
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        showToast('تم تحديث المنتج بنجاح', 'success');
      } else {
        // Create
        const created = await api.createProduct(editingProduct, adminUser.token);
        setProducts(prev => [created, ...prev]);
        showToast('تمت إضافة المنتج الجديد بنجاح', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // REAL DELETION HANDLER WITH PROFESSIONAL MODAL CONFIRMATION
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'product') {
        await api.deleteProduct(deleteTarget.id, adminUser.token);
        setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
        setStats((prev: any) =>
          prev ? { ...prev, productCount: Math.max(0, (prev.productCount || 1) - 1) } : prev
        );
        onDataChanged?.();
        showToast(`تم حذف المنتج "${deleteTarget.name}" نهائياً بنجاح`, 'success');
      } else if (deleteTarget.type === 'category') {
        await api.deleteCategory(deleteTarget.id, adminUser.token);
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
        setStats((prev: any) =>
          prev ? { ...prev, categoryCount: Math.max(0, (prev.categoryCount || 1) - 1) } : prev
        );
        onDataChanged?.();
        showToast(`تم حذف القسم "${deleteTarget.name}" نهائياً بنجاح`, 'success');
      } else if (deleteTarget.type === 'order') {
        await api.deleteOrder(deleteTarget.id, adminUser.token);
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
        const updatedStats = await api.getAdminStats(adminUser.token);
        setStats(updatedStats);
        showToast(`تم حذف ${deleteTarget.name} نهائياً بنجاح`, 'success');
      } else if (deleteTarget.type === 'product_image') {
        if (typeof deleteTarget.extraIndex === 'number' && editingProduct) {
          const filtered = editingProduct.images?.filter((_, i) => i !== deleteTarget.extraIndex);
          setEditingProduct({ ...editingProduct, images: filtered });
          showToast('تمت إزالة الصورة من المعرض بنجاح', 'success');
        }
      }
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'فشلت عملية الحذف، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setEditingProduct(prev => ({
        ...prev,
        images: prev?.images ? [...prev.images, base64] : [base64],
      }));
      showToast('تم رفع الصورة بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  };

  // CATEGORY ACTIONS
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    try {
      if (editingCategory.id) {
        const updated = await api.updateCategory(editingCategory.id, editingCategory, adminUser.token);
        setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        showToast('تم تحديث القسم بنجاح', 'success');
      } else {
        const created = await api.createCategory(editingCategory, adminUser.token);
        setCategories(prev => [...prev, created]);
        showToast('تمت إضافة القسم الجديد بنجاح', 'success');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // SETTINGS ACTIONS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const updated = await api.updateSettings(settings, adminUser.token);
      setSettings(updated);
      showToast('تم حفظ كافة إعدادات وتعديلات الموقع بنجاح وتظهر الآن على المتجر', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSettings(prev => (prev ? { ...prev, logoUrl: base64 } : null));
      showToast('تم رفع الشعار بنجاح! اضغط حفظ التعديلات لاعتماده.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // SECURITY ACTIONS
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'error');
      return;
    }
    try {
      await api.updateAdminPassword(oldPassword, newPassword, adminUser.token);
      showToast('تم تغيير كلمة مرور الأدمن بنجاح', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-right font-sans text-slate-800 pb-16">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                CENTER AL ASSAL ADMIN PANEL
              </h1>
              <p className="text-[10px] text-sky-700 font-semibold">
                لوحة الإدارة والتحكم الكاملة بمتجر سنتر العسال
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToStore}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-colors cursor-pointer"
            >
              معاينة المتجر ↗
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 relative ${
              activeTab === 'orders'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>إدارة الطلبات</span>
            {stats?.pendingOrders > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إدارة المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إدارة الأقسام ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات المتجر والفروع والدفع</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>كلمة المرور</span>
          </button>
        </div>

        {/* ---------------- 1. OVERVIEW TAB ---------------- */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">إجمالي المبيعات</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {stats.totalSales.toLocaleString('ar-EG')} <span className="text-xs font-bold text-slate-500">ج.م</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">إجمالي عدد الطلبات</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">طلبات جديدة قيد المراجعة</span>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pendingOrders}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">إثباتات تحويل بانتظار التأكيد</span>
                  <h3 className="text-2xl font-black text-purple-600 mt-1">{stats.pendingPayments}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <FileCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg">أحدث الطلبات الواردة</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  عرض كافة الطلبات ({orders.length})
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">لا توجد طلبات مسجلة بعد في المتجر.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-3 px-2">كود الطلب</th>
                        <th className="py-3 px-2">العميل</th>
                        <th className="py-3 px-2">المحافظة</th>
                        <th className="py-3 px-2">المبلغ</th>
                        <th className="py-3 px-2">طريقة الدفع</th>
                        <th className="py-3 px-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-2 font-mono font-bold text-sky-700">{o.orderCode}</td>
                          <td className="py-3 px-2">{o.customerName}</td>
                          <td className="py-3 px-2">{o.governorate}</td>
                          <td className="py-3 px-2 font-bold text-slate-900">{o.total.toLocaleString('ar-EG')} ج.م</td>
                          <td className="py-3 px-2">
                            {o.paymentMethod === 'cod' ? 'عند الاستلام' : o.paymentMethod === 'instapay' ? 'InstaPay' : 'محفظة'}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- 2. ORDERS MANAGEMENT TAB ---------------- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">سجل وإدارة طلبات العملاء</h2>
                <p className="text-xs text-slate-500">
                  مراجعة تفاصيل الشحن، أكواد الطلبات، إثباتات الدفع، وتحديث الحالة
                </p>
              </div>
              <span className="text-xs font-bold bg-sky-50 text-sky-800 px-3 py-1.5 rounded-xl border border-sky-200 self-start">
                إجمالي الطلبات: {orders.length}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">لا توجد طلبات بعد</h4>
                <p className="text-xs text-slate-400">عندما يقوم العميل بإتمام الشراء ستظهر طلباته هنا فوراً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-[#FAF9F5]/50 space-y-4 hover:border-sky-300 transition-colors"
                  >
                    {/* Top Row: Code, Customer info, Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black font-mono text-sky-800 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                          {order.orderCode}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{order.customerName}</h4>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-mono"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Address & Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-500">عنوان التوصيل:</span>
                        <p className="text-slate-800 font-medium">
                          {order.governorate}، {order.area} - {order.detailedAddress}
                        </p>
                        {order.notes && (
                          <p className="text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-200">
                            ملاحظات العميل: "{order.notes}"
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-500">المنتجات المطلوبة ({order.items.length}):</span>
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-slate-700">
                              <span>
                                {item.productName} ({item.selectedSize || 'قياسي'}) × {item.quantity}
                              </span>
                              <span className="font-bold">{(item.price * item.quantity).toLocaleString('ar-EG')} ج.م</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Payment review & uploaded receipt image */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">طريقة الدفع:</span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold">
                          {order.paymentMethod === 'cod'
                            ? 'الدفع عند الاستلام'
                            : order.paymentMethod === 'instapay'
                            ? 'InstaPay'
                            : 'محفظة إلكترونية'}
                        </span>

                        <span className="font-bold text-slate-700 mr-2">حالة السداد:</span>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold ${
                            order.paymentStatus === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.paymentStatus === 'pending_review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.paymentStatus === 'confirmed'
                            ? 'تم التحقق والاعتماد ✅'
                            : order.paymentStatus === 'pending_review'
                            ? 'قيد مراجعة الإشعار ⏳'
                            : 'دفع عند الاستلام'}
                        </span>

                        {/* View Receipt Proof Button */}
                        {order.paymentReceiptImage && (
                          <button
                            onClick={() => setReceiptModalImage(order.paymentReceiptImage!)}
                            className="flex items-center gap-1 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة إشعار التحويل 📷</span>
                          </button>
                        )}
                      </div>

                      {/* Payment approval buttons */}
                      {order.paymentMethod !== 'cod' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdatePaymentStatus(order.id, 'confirmed')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                          >
                            قبول التحويل
                          </button>
                          <button
                            onClick={() => handleUpdatePaymentStatus(order.id, 'rejected')}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold border border-rose-200 transition-colors cursor-pointer"
                          >
                            رفض الإثبات
                          </button>
                        </div>
                      )}

                      <div className="font-black text-slate-900 text-sm">
                        المطلوب: {order.total.toLocaleString('ar-EG')} ج.م
                      </div>
                    </div>

                    {/* Status change actions & Order Deletion */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">تحديث حالة الشحن:</span>
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="pending">قيد المراجعة (Pending)</option>
                          <option value="confirmed">تم التأكيد (Confirmed)</option>
                          <option value="processing">جاري التجهيز والتغليف (Processing)</option>
                          <option value="shipped">تم الشحن مع المندوب (Shipped)</option>
                          <option value="delivered">تم التوصيل بنجاح (Delivered)</option>
                          <option value="cancelled">ملغي (Cancelled)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'order',
                            id: order.id,
                            name: `طلب ${order.orderCode} - العميل: ${order.customerName}`,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 transition-all cursor-pointer shadow-2xs"
                        title="حذف هذا الطلب نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الطلب نهائياً</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- 3. PRODUCTS MANAGEMENT TAB ---------------- */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">إدارة كتالوج المنتجات</h2>
                <p className="text-xs text-slate-500">
                  إضافة مفروشات جديدة من الصفر، رفع الصور من الجهاز، وتعديل الأسعار والمخزون
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    description: '',
                    categoryId: categories[0]?.id || 'cat-sheets',
                    price: 0,
                    originalPrice: 0,
                    stock: 15,
                    images: [],
                    sizes: ['سرير كبير (240x260)', 'كينج (260x280)'],
                    colors: [
                      { name: 'عاجي', hex: '#FAF9F5' },
                      { name: 'بيج', hex: '#EADCC9' },
                    ],
                    fabric: 'قطن مصري 100%',
                    isAvailable: true,
                    isNewArrival: true,
                    isBestSeller: false,
                    isFeatured: true,
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد من الصفر</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                    <th className="py-3 px-2">الصورة</th>
                    <th className="py-3 px-2">اسم المنتج</th>
                    <th className="py-3 px-2">القسم</th>
                    <th className="py-3 px-2">السعر</th>
                    <th className="py-3 px-2">الخامة</th>
                    <th className="py-3 px-2">المخزون</th>
                    <th className="py-3 px-2">الحالة</th>
                    <th className="py-3 px-2 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-2">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=150&q=80'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-900 max-w-[200px] truncate">
                        {p.name}
                      </td>
                      <td className="py-3 px-2 text-sky-700 font-semibold">{p.categoryName}</td>
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {p.price.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3 px-2 text-slate-500">{p.fabric || '—'}</td>
                      <td className="py-3 px-2 font-bold">
                        <span className={p.stock <= 5 ? 'text-rose-600' : 'text-emerald-600'}>
                          {p.stock} قطعة
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.isAvailable ? 'متاح للطلب' : 'غير متوفر'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="تعديل المنتج"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'product',
                                id: p.id,
                                name: p.name,
                              })
                            }
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف المنتج نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 4. CATEGORIES MANAGEMENT TAB ---------------- */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">أقسام المفروشات في المتجر</h2>
                <p className="text-xs text-slate-500">
                  إمكانية إنشاء أقسام جديدة، تعديلها، أو حذفها بالكامل
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory({
                    name: '',
                    description: '',
                    image: '',
                  });
                  setIsCategoryModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-[#FAF9F5] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=150&q=80'}
                      alt={cat.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'category',
                          id: cat.id,
                          name: cat.name,
                        })
                      }
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="حذف القسم نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 5. SETTINGS TAB ---------------- */}
        {activeTab === 'settings' && settings && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in">
            {/* Brand Logo & Presentation */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                شعار المتجر والهوية البصرية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رفع الشعار الخاص بك (Logo Upload):
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-sky-300 rounded-2xl bg-[#FAF9F5] hover:bg-sky-50/50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-sky-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">اضغط لاختيار صورة اللوجو من جهازك</span>
                      <span className="text-[10px] text-slate-400">PNG أو SVG مع خلفية شفافة مفضلة</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    أو رابط مباشر للشعار (Logo URL):
                  </label>
                  <input
                    type="url"
                    value={settings.logoUrl || ''}
                    onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * إذا تُرك فارغاً سيتم عرض شعار سنتر العسال الملكي المصمم تلقائياً.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Section & Announcement */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                الواجهة الرئيسية وشريط الإعلانات
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شارة الواجهة (Hero Badge):
                  </label>
                  <input
                    type="text"
                    value={settings.heroBadge}
                    onChange={e => setSettings({ ...settings, heroBadge: e.target.value })}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان الرئيسي (Hero Title):
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={e => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوصف التفصيلي (Hero Subtitle):
                  </label>
                  <textarea
                    rows={2}
                    value={settings.heroSubtitle}
                    onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رابط صورة الواجهة (Hero Image URL):
                  </label>
                  <input
                    type="url"
                    value={settings.heroImage}
                    onChange={e => setSettings({ ...settings, heroImage: e.target.value })}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نص الشريط الإعلاني العلوي (Announcement Bar):
                  </label>
                  <input
                    type="text"
                    value={settings.announcementText}
                    onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Phones & Branches */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                أرقام الهواتف وبيانات الفروع الرسمية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف والواتساب الأساسي:
                  </label>
                  <input
                    type="text"
                    value={settings.contactPhones[0] || '01277714100'}
                    onChange={e => {
                      const updated = [...settings.contactPhones];
                      updated[0] = e.target.value;
                      setSettings({ ...settings, contactPhones: updated, whatsappNumber: e.target.value });
                    }}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف الثاني:
                  </label>
                  <input
                    type="text"
                    value={settings.contactPhones[1] || '01279207793'}
                    onChange={e => {
                      const updated = [...settings.contactPhones];
                      updated[1] = e.target.value;
                      setSettings({ ...settings, contactPhones: updated });
                    }}
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Branch 1 */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] space-y-3 border border-slate-200">
                <h4 className="font-bold text-xs text-sky-800">بيانات الفرع الأول (المعرض الرئيسي):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={settings.branches[0]?.name || ''}
                    onChange={e => {
                      const b = [...settings.branches];
                      b[0] = { ...b[0], name: e.target.value };
                      setSettings({ ...settings, branches: b });
                    }}
                    placeholder="اسم الفرع"
                    className="bg-white text-xs rounded-lg p-2 border border-slate-200"
                  />
                  <input
                    type="text"
                    value={settings.branches[0]?.address || ''}
                    onChange={e => {
                      const b = [...settings.branches];
                      b[0] = { ...b[0], address: e.target.value };
                      setSettings({ ...settings, branches: b });
                    }}
                    placeholder="العنوان"
                    className="bg-white text-xs rounded-lg p-2 border border-slate-200"
                  />
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] space-y-3 border border-slate-200">
                <h4 className="font-bold text-xs text-sky-800">بيانات الفرع الثاني (كرموز):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={settings.branches[1]?.name || ''}
                    onChange={e => {
                      const b = [...settings.branches];
                      b[1] = { ...b[1], name: e.target.value };
                      setSettings({ ...settings, branches: b });
                    }}
                    placeholder="اسم الفرع"
                    className="bg-white text-xs rounded-lg p-2 border border-slate-200"
                  />
                  <input
                    type="text"
                    value={settings.branches[1]?.address || ''}
                    onChange={e => {
                      const b = [...settings.branches];
                      b[1] = { ...b[1], address: e.target.value };
                      setSettings({ ...settings, branches: b });
                    }}
                    placeholder="العنوان"
                    className="bg-white text-xs rounded-lg p-2 border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Payment & InstaPay Settings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                بيانات InstaPay والمحافظ الإلكترونية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    معرّف إنستاباي (InstaPay Handle):
                  </label>
                  <input
                    type="text"
                    value={settings.paymentSettings.instaPayHandle}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, instaPayHandle: e.target.value },
                      })
                    }
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم صاحب حساب إنستاباي:
                  </label>
                  <input
                    type="text"
                    value={settings.paymentSettings.instaPayAccountName}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, instaPayAccountName: e.target.value },
                      })
                    }
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم المحفظة الإلكترونية (فودافون كاش / اتصالات / وي):
                  </label>
                  <input
                    type="text"
                    value={settings.paymentSettings.walletNumber}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, walletNumber: e.target.value },
                      })
                    }
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم صاحب المحفظة:
                  </label>
                  <input
                    type="text"
                    value={settings.paymentSettings.walletAccountName}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        paymentSettings: { ...settings.paymentSettings, walletAccountName: e.target.value },
                      })
                    }
                    className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* AI Assistant & Policies */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                مساعد الذكاء الاصطناعي (ASSAL AI)
              </h3>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="aiEnabled"
                  checked={settings.aiAssistantEnabled}
                  onChange={e => setSettings({ ...settings, aiAssistantEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="aiEnabled" className="text-xs font-bold text-slate-700 cursor-pointer">
                  تشغيل مساعد الذكاء الاصطناعي ASSAL AI في المتجر
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رسالة الترحيب الخاصة بالمساعد الذكي:
                </label>
                <textarea
                  rows={2}
                  value={settings.aiWelcomeMessage}
                  onChange={e => setSettings({ ...settings, aiWelcomeMessage: e.target.value })}
                  className="w-full bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-2 border border-slate-200"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="sticky bottom-6 z-20">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-black text-base shadow-xl shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كافة التعديلات والإعدادات وتطبيقها فوراً</span>
              </button>
            </div>
          </form>
        )}

        {/* ---------------- 6. SECURITY TAB ---------------- */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-md mx-auto animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">تغيير كلمة مرور الأدمن</h3>
              <p className="text-xs text-slate-400">احرص على اختيار كلمة مرور قوية وغير متوقعة</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الحالية:</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full bg-[#FAF9F5] text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full bg-[#FAF9F5] text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                تحديث كلمة المرور
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ---------------- PRODUCT MODAL (Add / Edit) ---------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-y-auto p-6 sm:p-8 space-y-6 text-right">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
              {editingProduct.id ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المنتج <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="مثال: طقم ملاية رويال قطن مصري 100% تطريز ناعم"
                  className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم التابع له:</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الخامة:</label>
                  <input
                    type="text"
                    value={editingProduct.fabric || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                    placeholder="مثال: قطن مصري 100%، قطيفة، مايكروفايبر"
                    className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر الحالي (ج.م) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    السعر قبل الخصم (اختياري):
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, originalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الكمية المتوفرة (المخزون):</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 10}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المقاسات (مفصولة بفاصلة):</label>
                  <input
                    type="text"
                    value={editingProduct.sizes?.join('، ') || ''}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        sizes: e.target.value.split(/[,،]/).map(s => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="مثال: سرير كبير (240x260)، كينج (260x280)"
                    className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف تفصيلي للمنتج:</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="اكتب تفاصيل ومزايا المنتج..."
                  className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                />
              </div>

              {/* Image Upload for Product */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  صور المنتج (رفع من الجهاز أو إدخال روابط):
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-sky-300 bg-[#FAF9F5] hover:bg-sky-50 text-sky-800 text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>رفع صورة من جهازك</span>
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                  </label>

                  {/* Images preview */}
                  <div className="flex gap-2 overflow-x-auto">
                    {editingProduct.images?.map((img, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: 'product_image',
                              id: 'img',
                              name: `صورة المنتج رقم ${idx + 1}`,
                              extraIndex: idx,
                            })
                          }
                          className="absolute inset-0 bg-rose-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="إزالة هذه الصورة"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNewArrival || false}
                    onChange={e => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 cursor-pointer"
                  />
                  <span>تمييز كمنتج جديد 2026</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller || false}
                    onChange={e => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                  />
                  <span>تمييز كأكثر مبيعاً</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable !== false}
                    onChange={e => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                  <span>متاح للبيع والشراء الآن</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  حفظ المنتج في المتجر
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- CATEGORY MODAL (Add / Edit) ---------------- */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-right">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-2">
              {editingCategory.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم القسم باللغة العربية:</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="مثال: أطقم الملايات، الستائر..."
                  className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف مختصر:</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="وصف مختصر للقسم..."
                  className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة القسم:</label>
                <input
                  type="url"
                  value={editingCategory.image || ''}
                  onChange={e => setEditingCategory({ ...editingCategory, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FAF9F5] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  حفظ القسم
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- RECEIPT ZOOM MODAL ---------------- */}
      {receiptModalImage && (
        <div
          onClick={() => setReceiptModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 overflow-hidden text-right space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">إشعار تحويل الدفع (Receipt Proof)</h4>
              <button
                onClick={() => setReceiptModalImage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-slate-100 flex items-center justify-center">
              <img
                src={receiptModalImage}
                alt="إشعار التحويل"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              يمكنك التحقق من رقم الحساب وتاريخ وتوقيت العملية لمطابقتها مع حساب InstaPay أو المحفظة.
            </p>
          </div>
        </div>
      )}

      {/* ---------------- PROFESSIONAL CONFIRM DELETE MODAL ---------------- */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === 'product'
            ? 'تأكيد حذف المنتج نهائياً'
            : deleteTarget?.type === 'category'
            ? 'تأكيد حذف القسم نهائياً'
            : deleteTarget?.type === 'order'
            ? 'تأكيد حذف الطلب نهائياً'
            : 'تأكيد إزالة الصورة'
        }
        message={
          deleteTarget?.type === 'product'
            ? 'هل أنت متأكد أنك تريد حذف هذا المنتج نهائياً من قاعدة بيانات المتجر؟'
            : deleteTarget?.type === 'category'
            ? 'هل أنت متأكد أنك تريد حذف هذا القسم نهائياً من المتجر؟'
            : deleteTarget?.type === 'order'
            ? 'هل أنت متأكد أنك تريد حذف هذا الطلب وسجل شحنته نهائياً؟'
            : 'هل أنت متأكد من إزالة هذه الصورة من المعرض؟'
        }
        itemName={deleteTarget?.name}
        confirmText="نعم، حذف نهائياً"
        cancelText="تراجع (إلغاء)"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
};
