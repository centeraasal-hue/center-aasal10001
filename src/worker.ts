import bcrypt from 'bcryptjs';
import { initialStoreData } from './data/seedData.ts';

export interface Env {
  ASSETS?: { fetch: typeof fetch };
  DATA_STORE?: any; // Cloudflare KV Namespace if configured
  ADMIN_PASSWORD?: string;
  ADMIN_PASS_HASH?: string;
  JWT_SECRET?: string;
  SESSION_SECRET?: string;
  GEMINI_API_KEY?: string;
}

// Secure salted bcrypt hash for default administrative access (12345666)
const DEFAULT_ADMIN_HASH = '$2b$10$IKgCQuAKRed7/gaY2sYMUuFSVaLVNWlaGWc6W8X2BpVdrz1ACAZMe';
const DEFAULT_SECRET = 'CENTER_ALASSAL_SALT_2026_PRODUCTION_KEY';
const TOKEN_PREFIX = 'caa_sec';

// CORS Headers for all responses
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-forwarded-uri, x-matched-path',
  'Access-Control-Max-Age': '86400',
};

// In-memory working database for the current isolate
let memoryDb: any = null;

function getDb(): any {
  if (!memoryDb) {
    memoryDb = JSON.parse(JSON.stringify(initialStoreData));
    if (!memoryDb.adminPassHash || !memoryDb.adminPassHash.startsWith('$2')) {
      memoryDb.adminPassHash = DEFAULT_ADMIN_HASH;
    }
    if (!Array.isArray(memoryDb.orders)) {
      memoryDb.orders = [];
    }
    if (!Array.isArray(memoryDb.sessions)) {
      memoryDb.sessions = [];
    }
  }
  return memoryDb;
}

async function syncDbToKv(env: Env) {
  if (env.DATA_STORE && memoryDb) {
    try {
      await env.DATA_STORE.put('store_data', JSON.stringify(memoryDb));
    } catch (err) {
      console.warn('Notice: KV put skipped:', err);
    }
  }
}

// In-memory rate limiting map per IP
const loginAttempts: Record<string, { count: number; lockedUntil: number }> = {};

function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

// ----------------- CRYPTOGRAPHIC TOKENS (Web Crypto API) -----------------
function getSecret(env: Env): string {
  return env.JWT_SECRET || env.SESSION_SECRET || DEFAULT_SECRET;
}

async function createSignedToken(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const jti = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  const payload = {
    u: 'admin',
    r: 'superadmin',
    iat: now,
    exp: now + (7 * 24 * 60 * 60), // 7 days
    jti
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(unescape(encodeURIComponent(payloadStr)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const sigBytes = new Uint8Array(sigBuffer);
  let binary = '';
  for (let i = 0; i < sigBytes.byteLength; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  const sigB64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${TOKEN_PREFIX}.${payloadB64}.${sigB64}`;
}

async function verifySignedToken(token: string | null | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const clean = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!clean.startsWith(TOKEN_PREFIX + '.')) return false;

  const parts = clean.split('.');
  if (parts.length !== 3) return false;
  const [, payloadB64, sigB64] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const b64 = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '==='.slice((b64.length + 3) % 4);
    const binarySig = atob(padded);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payloadB64));
    if (!isValid) return false;

    const payloadB64Padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((payloadB64.length + 3) % 4);
    const payloadStr = decodeURIComponent(escape(atob(payloadB64Padded)));
    const payload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    return Boolean(payload.exp && payload.exp > now && payload.u === 'admin');
  } catch (err) {
    console.error('Error verifying signed token:', err);
    return false;
  }
}

// ----------------- MAIN CLOUDFLARE WORKER ROUTER -----------------
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const rawPath = url.pathname;
    const path = (rawPath.length > 1 && rawPath.endsWith('/')) ? rawPath.slice(0, -1) : rawPath;
    const method = request.method.toUpperCase();

    // 1. Handle CORS Preflight for any route
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Intercept API routes and admin auth routes
    const isApiOrAuth = path.startsWith('/api') ||
      path.startsWith('/admin') ||
      path === '/login' ||
      path === '/verify';

    if (isApiOrAuth) {
      try {
        return await handleApiRequest(request, env, url, ctx, path);
      } catch (err: any) {
        console.error('API Error in Worker:', err);
        return jsonResponse({
          success: false,
          message: 'حدث خطأ في الخادم أثناء تنفيذ الطلب: ' + (err?.message || 'Server Error')
        }, 500);
      }
    }

    // 3. Static Assets Fallback (Vite React SPA)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  }
};

async function handleApiRequest(request: Request, env: Env, url: URL, ctx: any, path: string): Promise<Response> {
  const method = request.method.toUpperCase();
  const db = getDb();
  const secret = getSecret(env);

  // If DATA_STORE is configured, initialize from KV on first run
  if (env.DATA_STORE && !memoryDb._kvLoaded) {
    try {
      const kvData = await env.DATA_STORE.get('store_data', { type: 'json' });
      if (kvData) {
        memoryDb = { ...kvData, _kvLoaded: true };
      } else {
        memoryDb._kvLoaded = true;
      }
    } catch {
      memoryDb._kvLoaded = true;
    }
  }

  // ---------------- AUTH: LOGIN ----------------
  const isLoginPath =
    path === '/api/admin/login' ||
    path === '/admin/login' ||
    path === '/api/login' ||
    path === '/login' ||
    path === '/api';

  if (isLoginPath) {
    if (method === 'GET' && path !== '/api') {
      return jsonResponse({
        success: true,
        message: "CENTER AL ASSAL Admin Login Endpoint (POST required with { password })"
      });
    }

    if (method === 'POST') {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ success: false, message: 'صيغة بيانات غير صحيحة' }, 400);
      }

    // If POST /api without password, treat as health check
    if (path === '/api' && !body.password) {
      return jsonResponse({
        success: true,
        brand: "CENTER AL ASSAL | سنتر العسال لتجارة المفروشات",
        status: "online",
        environment: "cloudflare-workers"
      });
    }

    const { password } = body;
    if (!password || typeof password !== 'string') {
      return jsonResponse({ success: false, message: 'يرجى إدخال كلمة المرور' });
    }

    const clientIp = request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'edge-user';
    const now = Date.now();

    const attempt = loginAttempts[clientIp];
    if (attempt && attempt.lockedUntil > now) {
      const remainingSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
      return jsonResponse({
        success: false,
        message: `تم قفل محاولات تسجيل الدخول مؤقتاً لحماية الحساب. يرجى الانتظار ${remainingSeconds} ثانية ثم المحاولة مجدداً.`
      }, 429);
    }

    const targetHash = db.adminPassHash || DEFAULT_ADMIN_HASH;
    let isMatch = false;

    // 1. Compare with bcrypt
    try {
      isMatch = bcrypt.compareSync(password, targetHash);
    } catch {
      try {
        isMatch = bcrypt.compareSync(password, DEFAULT_ADMIN_HASH);
      } catch {}
    }

    // 2. Compare with Cloudflare Secret ADMIN_PASSWORD if configured
    if (!isMatch && env.ADMIN_PASSWORD) {
      isMatch = (password === env.ADMIN_PASSWORD);
    }

    if (isMatch) {
      delete loginAttempts[clientIp];
      const token = await createSignedToken(secret);

      const newSession = {
        token,
        createdAt: now,
        expiresAt: now + (7 * 24 * 60 * 60 * 1000)
      };
      db.sessions = (db.sessions || []).filter((s: any) => s && s.expiresAt > now);
      db.sessions.push(newSession);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);

      return jsonResponse({
        success: true,
        token,
        user: { username: 'admin', role: 'superadmin' }
      });
    } else {
      const cur = loginAttempts[clientIp] || { count: 0, lockedUntil: 0 };
      cur.count += 1;
      if (cur.count >= 8) {
        cur.lockedUntil = now + (5 * 60 * 1000);
        cur.count = 0;
      }
      loginAttempts[clientIp] = cur;

      return jsonResponse({ success: false, message: 'كلمة المرور غير صحيحة' }, 401);
    }
  }
}

  // ---------------- AUTH: VERIFY ----------------
  const isVerifyPath =
    path === '/api/admin/verify' ||
    path === '/admin/verify' ||
    path === '/api/verify' ||
    path === '/verify';

  if (isVerifyPath && method === 'GET') {
    const authHeader = request.headers.get('authorization');
    const isValid = await verifySignedToken(authHeader, secret);
    if (!isValid) {
      return jsonResponse({ success: false, message: 'انتهت صلاحية الجلسة أو غير مصرح' }, 401);
    }
    return jsonResponse({
      success: true,
      user: { username: 'admin', role: 'superadmin' }
    });
  }

  // ---------------- AUTH: LOGOUT ----------------
  const isLogoutPath =
    path === '/api/admin/logout' ||
    path === '/admin/logout' ||
    path === '/api/logout' ||
    path === '/logout';

  if (isLogoutPath && method === 'POST') {
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const clean = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
      db.sessions = (db.sessions || []).filter((s: any) => s && s.token !== clean);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
    }
    return jsonResponse({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  }

  // ---------------- AUTH: UPDATE PASSWORD ----------------
  if ((path === '/api/admin/password' || path === '/admin/password') && method === 'PUT') {
    const authHeader = request.headers.get('authorization');
    const isValid = await verifySignedToken(authHeader, secret);
    if (!isValid) {
      return jsonResponse({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' }, 401);
    }

    const { oldPassword, newPassword } = await request.json() as any;
    if (!oldPassword || !newPassword) {
      return jsonResponse({ success: false, message: 'يرجى إدخال كلمة المرور الحالية والجديدة' }, 400);
    }

    let isOldMatch = false;
    try {
      isOldMatch = bcrypt.compareSync(oldPassword, db.adminPassHash);
    } catch {}
    if (!isOldMatch && env.ADMIN_PASSWORD) {
      isOldMatch = (oldPassword === env.ADMIN_PASSWORD);
    }

    if (!isOldMatch) {
      return jsonResponse({ success: false, message: 'كلمة المرور الحالية غير صحيحة' }, 400);
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return jsonResponse({ success: false, message: 'يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل' }, 400);
    }

    db.adminPassHash = bcrypt.hashSync(newPassword, 10);
    ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
    return jsonResponse({ success: true, message: 'تم تغيير كلمة المرور وتشفيرها بنجاح' });
  }

  // ---------------- ADMIN: STATS ----------------
  if (path === '/api/admin/stats' && method === 'GET') {
    const authHeader = request.headers.get('authorization');
    const isValid = await verifySignedToken(authHeader, secret);
    if (!isValid) {
      return jsonResponse({ success: false, message: 'غير مصرح لك بالوصول' }, 401);
    }

    const totalOrders = db.orders.length;
    const totalSales = db.orders
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const pendingOrders = db.orders.filter((o: any) => o.status === 'pending').length;
    const lowStockProducts = db.products.filter((p: any) => (p.stock || 0) <= 5).length;

    return jsonResponse({
      success: true,
      stats: {
        totalOrders,
        totalSales,
        pendingOrders,
        lowStockProducts,
        totalProducts: db.products.length,
        totalCategories: db.categories.length
      }
    });
  }

  // ---------------- SETTINGS ----------------
  if (path === '/api/settings') {
    if (method === 'GET') {
      return jsonResponse({ success: true, settings: db.settings });
    }
    if (method === 'PUT') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) {
        return jsonResponse({ success: false, message: 'غير مصرح لك بتعديل الإعدادات' }, 401);
      }
      const newSettings = await request.json() as any;
      db.settings = { ...db.settings, ...newSettings };
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, settings: db.settings });
    }
  }

  // ---------------- CATEGORIES ----------------
  if (path === '/api/categories') {
    if (method === 'GET') {
      return jsonResponse({ success: true, categories: db.categories });
    }
    if (method === 'POST') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) {
        return jsonResponse({ success: false, message: 'غير مصرح' }, 401);
      }
      const catData = await request.json() as any;
      const newCat = {
        id: `cat-${Date.now()}`,
        slug: `cat-${Date.now()}`,
        name: catData.name || 'قسم جديد',
        nameEn: catData.nameEn || '',
        description: catData.description || '',
        image: catData.image || '',
        icon: catData.icon || 'Layers',
        ...catData
      };
      db.categories.push(newCat);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, category: newCat });
    }
  }

  const catMatch = path.match(/^\/api\/categories\/([^\/]+)$/);
  if (catMatch) {
    const catId = catMatch[1];
    if (method === 'PUT') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      const updates = await request.json() as any;
      const index = db.categories.findIndex((c: any) => c.id === catId);
      if (index === -1) return jsonResponse({ success: false, message: 'القسم غير موجود' }, 404);

      db.categories[index] = { ...db.categories[index], ...updates };
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, category: db.categories[index] });
    }
    if (method === 'DELETE') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      db.categories = db.categories.filter((c: any) => c.id !== catId);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, message: 'تم حذف القسم بنجاح' });
    }
  }

  // ---------------- PRODUCTS ----------------
  if (path === '/api/products') {
    if (method === 'GET') {
      let filtered = [...db.products];
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      const featured = url.searchParams.get('featured');
      const bestSeller = url.searchParams.get('bestSeller');
      const newArrival = url.searchParams.get('newArrival');
      const maxPrice = url.searchParams.get('maxPrice');
      const sort = url.searchParams.get('sort');

      if (category && category !== 'all') {
        filtered = filtered.filter((p: any) => p.categoryId === category || p.categoryName === category);
      }
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter((p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q)
        );
      }
      if (featured === 'true') {
        filtered = filtered.filter((p: any) => p.isFeatured);
      }
      if (bestSeller === 'true') {
        filtered = filtered.filter((p: any) => p.isBestSeller);
      }
      if (newArrival === 'true') {
        filtered = filtered.filter((p: any) => p.isNewArrival);
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (!isNaN(max)) {
          filtered = filtered.filter((p: any) => p.price <= max);
        }
      }

      if (sort === 'price-low') {
        filtered.sort((a: any, b: any) => a.price - b.price);
      } else if (sort === 'price-high') {
        filtered.sort((a: any, b: any) => b.price - a.price);
      } else if (sort === 'name') {
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name, 'ar'));
      }

      return jsonResponse({ success: true, products: filtered });
    }

    if (method === 'POST') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      const prodData = await request.json() as any;
      const newProd = {
        id: `prod-${Date.now()}`,
        name: prodData.name || 'منتج جديد',
        description: prodData.description || '',
        categoryId: prodData.categoryId || 'cat-sheets',
        categoryName: prodData.categoryName || '',
        price: Number(prodData.price) || 0,
        originalPrice: Number(prodData.originalPrice) || Number(prodData.price) || 0,
        images: Array.isArray(prodData.images) && prodData.images.length > 0 ? prodData.images : ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'],
        sizes: prodData.sizes || [],
        colors: prodData.colors || [],
        fabric: prodData.fabric || '',
        stock: Number(prodData.stock) || 10,
        isAvailable: prodData.isAvailable !== undefined ? prodData.isAvailable : true,
        isNewArrival: Boolean(prodData.isNewArrival),
        isBestSeller: Boolean(prodData.isBestSeller),
        isFeatured: Boolean(prodData.isFeatured),
        rating: 5.0,
        reviewCount: 0,
        ...prodData
      };
      db.products.push(newProd);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, product: newProd });
    }
  }

  const prodMatch = path.match(/^\/api\/products\/([^\/]+)$/);
  if (prodMatch) {
    const prodId = prodMatch[1];
    if (method === 'GET') {
      const product = db.products.find((p: any) => p.id === prodId);
      if (!product) return jsonResponse({ success: false, message: 'المنتج غير موجود' }, 404);
      return jsonResponse({ success: true, product });
    }
    if (method === 'PUT') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      const updates = await request.json() as any;
      const index = db.products.findIndex((p: any) => p.id === prodId);
      if (index === -1) return jsonResponse({ success: false, message: 'المنتج غير موجود' }, 404);

      db.products[index] = { ...db.products[index], ...updates };
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, product: db.products[index] });
    }
    if (method === 'DELETE') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      db.products = db.products.filter((p: any) => p.id !== prodId);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, message: 'تم حذف المنتج بنجاح' });
    }
  }

  // ---------------- ORDERS ----------------
  if (path === '/api/orders' && method === 'POST') {
    const orderData = await request.json() as any;
    if (!orderData.customerName || !orderData.customerPhone || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return jsonResponse({ success: false, message: 'بيانات الطلب غير مكتملة، يرجى كتابة الاسم ورقم الهاتف واختيار المنتجات' }, 400);
    }

    const counter = (db.orderCounter || 1) + 1;
    db.orderCounter = counter;
    const trackingCode = `CAA-2026-${String(counter).padStart(5, '0')}`;

    const newOrder = {
      id: `order-${Date.now()}`,
      trackingCode,
      customerName: orderData.customerName.trim(),
      customerPhone: orderData.customerPhone.trim(),
      customerGovernorate: orderData.customerGovernorate || 'الإسكندرية',
      customerAddress: orderData.customerAddress || '',
      customerNotes: orderData.customerNotes || '',
      items: orderData.items,
      subtotal: Number(orderData.subtotal) || 0,
      shippingCost: Number(orderData.shippingCost) || 0,
      total: Number(orderData.total) || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentReceipt: orderData.paymentReceipt || null,
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : (orderData.paymentReceipt ? 'review' : 'pending'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);

    return jsonResponse({
      success: true,
      order: newOrder,
      message: `تم تسجيل طلبك بنجاح! كود المتابعة الخاص بك: ${trackingCode}`
    });
  }

  if (path === '/api/orders/track' && method === 'GET') {
    const code = url.searchParams.get('code')?.trim().toUpperCase();
    const phone = url.searchParams.get('phone')?.trim();

    if (!code) {
      return jsonResponse({ success: false, message: 'يرجى إدخال كود الطلب' }, 400);
    }

    const order = db.orders.find((o: any) =>
      o.trackingCode?.toUpperCase() === code || o.id === code
    );

    if (!order) {
      return jsonResponse({ success: false, message: 'لم يتم العثور على طلب بهذا الكود، يرجى التأكد من الرقم' }, 404);
    }

    if (phone) {
      const cleanPhone = phone.replace(/\s+/g, '').replace(/^0+/, '');
      const orderPhone = (order.customerPhone || '').replace(/\s+/g, '').replace(/^0+/, '');
      if (!orderPhone.includes(cleanPhone) && !cleanPhone.includes(orderPhone)) {
        return jsonResponse({ success: false, message: 'رقم الهاتف غير متطابق مع كود الطلب المدخل' }, 403);
      }
    }

    return jsonResponse({ success: true, order });
  }

  if (path === '/api/orders' && method === 'GET') {
    const authHeader = request.headers.get('authorization');
    const isValid = await verifySignedToken(authHeader, secret);
    if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);
    return jsonResponse({ success: true, orders: db.orders });
  }

  const orderMatch = path.match(/^\/api\/orders\/([^\/]+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    if (method === 'PUT') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      const updates = await request.json() as any;
      const index = db.orders.findIndex((o: any) => o.id === orderId);
      if (index === -1) return jsonResponse({ success: false, message: 'الطلب غير موجود' }, 404);

      db.orders[index] = { ...db.orders[index], ...updates, updatedAt: new Date().toISOString() };
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, order: db.orders[index] });
    }
    if (method === 'DELETE') {
      const authHeader = request.headers.get('authorization');
      const isValid = await verifySignedToken(authHeader, secret);
      if (!isValid) return jsonResponse({ success: false, message: 'غير مصرح' }, 401);

      db.orders = db.orders.filter((o: any) => o.id !== orderId);
      ctx?.waitUntil ? ctx.waitUntil(syncDbToKv(env)) : syncDbToKv(env);
      return jsonResponse({ success: true, message: 'تم حذف الطلب نهائياً بنجاح' });
    }
  }

  // ---------------- AI CHAT ----------------
  if (path === '/api/ai/chat' && method === 'POST') {
    const { message } = await request.json() as any;
    if (!message) return jsonResponse({ success: false, message: 'يرجى كتابة رسالتك' }, 400);

    const lower = message.toLowerCase();
    const suggestedProducts = db.products.filter((p: any) =>
      lower.includes(p.name?.toLowerCase()) ||
      lower.includes(p.categoryName?.toLowerCase())
    ).slice(0, 3);

    return jsonResponse({
      success: true,
      reply: "أهلاً بك في سنتر العسال للمفروشات! 🛏️ يسعدنا دائماً خدمتك ومساعدتك في اختيار أفضل أطقم الملايات، البطاطين، ومستلزمات العرائس. للتواصل المباشر مع فريق المبيعات يرجى الاتصال على 01277714100.",
      suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : undefined
    });
  }

  // ---------------- HEALTH / STATUS ----------------
  if (path === '/api' || path === '/api/') {
    return jsonResponse({
      success: true,
      brand: "CENTER AL ASSAL | سنتر العسال لتجارة المفروشات",
      status: "online",
      environment: "cloudflare-workers",
      timestamp: new Date().toISOString()
    });
  }

  return jsonResponse({ success: false, message: `المسار ${path} غير موجود` }, 404);
}
