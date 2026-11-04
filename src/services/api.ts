import { Product, ProductCategory, StoreSettings, Order, AdminUser } from '../types';

export const api = {
  // Store Settings
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(settings: Partial<StoreSettings>, token: string): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل تحديث الإعدادات');
    return data.settings;
  },

  // Categories
  async getCategories(): Promise<ProductCategory[]> {
    const res = await fetch('/api/categories');
    const data = await res.json();
    return data.categories || [];
  },

  async createCategory(category: Partial<ProductCategory>, token: string): Promise<ProductCategory> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(category),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل إنشاء القسم');
    return data.category;
  },

  async updateCategory(id: string, category: Partial<ProductCategory>, token: string): Promise<ProductCategory> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(category),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل تحديث القسم');
    return data.category;
  },

  async deleteCategory(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل حذف القسم');
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    maxPrice?: number;
    sort?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.bestSeller) query.append('bestSeller', 'true');
    if (params?.newArrival) query.append('newArrival', 'true');
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`/api/products?${query.toString()}`);
    const data = await res.json();
    return data.products || [];
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    if (!data.success || !data.product) throw new Error('المنتج غير موجود');
    return data.product;
  },

  async createProduct(product: Partial<Product>, token: string): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل إنشاء المنتج');
    return data.product;
  },

  async updateProduct(id: string, product: Partial<Product>, token: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل تحديث المنتج');
    return data.product;
  },

  async deleteProduct(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل حذف المنتج');
  },

  // Orders
  async createOrder(orderData: any): Promise<{ order: Order; message: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل تسجيل الطلب');
    return { order: data.order, message: data.message };
  },

  async trackOrder(code: string, phone?: string): Promise<Order> {
    const query = new URLSearchParams({ code });
    if (phone) query.append('phone', phone);
    const res = await fetch(`/api/orders/track?${query.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'لم يتم العثور على الطلب');
    return data.order;
  },

  async getOrders(token: string): Promise<Order[]> {
    const res = await fetch('/api/orders', {
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل جلب الطلبات');
    return data.orders || [];
  },

  async updateOrder(id: string, updates: Partial<Order>, token: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل تحديث الطلب');
    return data.order;
  },

  async deleteOrder(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل حذف الطلب');
  },

  // Admin Auth & Stats
  async adminLogin(password: string): Promise<AdminUser> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'كلمة المرور غير صحيحة');
    return {
      username: data.user.username,
      role: data.user.role,
      token: data.token,
    };
  },

  async adminVerify(token: string): Promise<AdminUser> {
    const res = await fetch('/api/admin/verify', {
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'انتهت صلاحية الجلسة');
    return {
      username: data.user.username,
      role: data.user.role,
      token,
    };
  },

  async adminLogout(token: string): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: token },
      });
    } catch (err) {
      console.warn('Logout request failed:', err);
    }
  },

  async getAdminStats(token: string): Promise<any> {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: token },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل جلب الإحصائيات');
    return data.stats;
  },

  async updateAdminPassword(oldPassword: string, newPassword: string, token: string): Promise<void> {
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'فشل تغيير كلمة المرور');
  },

  // AI Assistant Chat
  async sendAiMessage(message: string, history: any[]): Promise<{ reply: string; suggestedProducts?: Product[] }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    return {
      reply: data.reply || 'أهلاً بك في سنتر العسال! كيف أستطيع خدمتك اليوم؟',
      suggestedProducts: data.suggestedProducts,
    };
  },
};
