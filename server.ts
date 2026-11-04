import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) return __dirname;
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return process.cwd();
};
const __dirnameSafe = getDirname();

const app = express();
// AI Studio dev server must run on port 3000 (Cloud Run sets PORT=8080 for nginx proxy)
const PORT = 3000;

// Body parser with 15MB limit for uploaded images/receipts
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database initialization with Vercel Serverless & Production read-only support
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp/center_alassal_data' : path.resolve(__dirnameSafe, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

const findBundledDbFile = (): string | null => {
  const candidates = [
    path.resolve(process.cwd(), 'data', 'store.json'),
    path.resolve(__dirnameSafe, 'data', 'store.json'),
    path.resolve(__dirnameSafe, '..', 'data', 'store.json'),
    '/tmp/center_alassal_data/store.json'
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {}
  }
  return null;
};

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const bundledSource = findBundledDbFile();
  if (isVercel && !fs.existsSync(DB_FILE) && bundledSource && bundledSource !== DB_FILE) {
    fs.copyFileSync(bundledSource, DB_FILE);
  }
} catch (e) {
  console.warn('Filesystem init notice (using in-memory store if needed):', e);
}

// Initial seed data
const initialCategories = [
  {
    id: "cat-sheets",
    name: "أطقم الملايات",
    nameEn: "Bed Sheet Sets",
    slug: "bed-sheets",
    description: "أطقم ملايات قطن مصري 100% ناعمة ومريحة وتدوم طويلاً",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    icon: "BedDouble"
  },
  {
    id: "cat-blankets",
    name: "البطاطين",
    nameEn: "Blankets",
    slug: "blankets",
    description: "بطاطين مورا وإسباني وكوري فائقة النعومة والدفء لجميع الفصول",
    image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=800&q=80",
    icon: "CloudSnow"
  },
  {
    id: "cat-duvets",
    name: "اللحاف",
    nameEn: "Duvets & Comforters",
    slug: "duvets",
    description: "ألحفة فايبر ميكرو وسوفت بأحدث نقوش المودرن والكلاسيك",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    icon: "Layers"
  },
  {
    id: "cat-bedspreads",
    name: "المفارش",
    nameEn: "Bedspreads",
    slug: "bedspreads",
    description: "مفارش سرير للعرائس والمناسبات بتطريزات فاخرة وخامات جاكار راقية",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    icon: "Sparkles"
  },
  {
    id: "cat-towels",
    name: "الفوط والبشاكير",
    nameEn: "Towels & Bath Sheets",
    slug: "towels",
    description: "فوط قطنية 100% عالية الامتصاص ونعومة تدوم مع كل غسلة",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
    icon: "Bath"
  },
  {
    id: "cat-pillows",
    name: "المخدات",
    nameEn: "Pillows & Cushions",
    slug: "pillows",
    description: "مخدات طبية وفايبر ريش نعام توفر أقصى درجات الراحة للرقبة والعمود الفقري",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    icon: "Smile"
  },
  {
    id: "cat-rugs",
    name: "السجاد",
    nameEn: "Rugs & Carpets",
    slug: "rugs",
    description: "مشايات وسجاد غرف نوم وصالونات بتصاميم عصرية وألوان متناسقة",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
    icon: "Grid"
  },
  {
    id: "cat-curtains",
    name: "الستائر",
    nameEn: "Curtains",
    slug: "curtains",
    description: "ستائر شيفون وقطيفة وبلاك أوت جاهزة للتركيب تضفي لمسة ساحرة على غرفتك",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    icon: "Maximize"
  },
  {
    id: "cat-bridal",
    name: "أطقم العرائس",
    nameEn: "Bridal Sets",
    slug: "bridal-sets",
    description: "تشكيلات حصرية ومتكاملة لجهاز العروسة بتخفيضات خاصة وهدايا قيمة",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    icon: "Crown"
  }
];

const initialProducts: any[] = [
  {
    id: "prod-1",
    name: "طقم ملاية رويال قطن مصري 100% تطريز ناعم - 6 قطع",
    description: "طقم ملاية سرير كبير فاخر مصنوع من أنقى خيوط القطن المصري طويل التيلة المعالج ضد الانكماش. يتضمن الملاية الكبيرة، 2 كيس مخدة كبير، 2 كيس خدادية بتطريز أنيق، وخدادية ديكور.",
    categoryId: "cat-sheets",
    categoryName: "أطقم الملايات",
    price: 890,
    originalPrice: 1150,
    discountPercent: 22,
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"
    ],
    sizes: ["سرير كبير (240x260 سم)", "سرير كينج (260x280 سم)"],
    colors: [
      { name: "أبيض عاجي", hex: "#FAF9F5" },
      { name: "بيج كريمي", hex: "#EADCC9" },
      { name: "أزرق ثلجي", hex: "#D4EAF7" },
      { name: "مريمي هادئ", hex: "#D2DCB6" }
    ],
    fabric: "قطن مصري 100% - كثافة 300 غرزة",
    stock: 24,
    isAvailable: true,
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 38,
    specifications: [
      { label: "محتويات الطقم", value: "ملاية فلات + 2 كيس مخدة + 2 كيس خدادية + خدادية مربعة" },
      { label: "المقاس الرئيسي", value: "240 × 260 سم" },
      { label: "بلد الصنع", value: "صنع في مصر بأعلى معايير التصدير" }
    ],
    careInstructions: "غسيل آلي بماء فاتر وتجنب المبيضات للحفاظ على نعومة القطن ونضارة الألوان"
  },
  {
    id: "prod-2",
    name: "لحاف مايكروفايبر سوفت وجهين كابوتونيه عصري",
    description: "لحاف مودرن دافئ جداً ومريح وخفيف على الجسم، محشو بفايبر سوفت مستورد عالي الكثافة لا يتكتل عند الغسيل. يتميز بتصميم وجهين بلونين متناسقين لتجديد ديكور الغرفة بسهولة.",
    categoryId: "cat-duvets",
    categoryName: "اللحاف",
    price: 1350,
    originalPrice: 1650,
    discountPercent: 18,
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=1000&q=80"
    ],
    sizes: ["كينج (240x260 سم)", "مفرد دايس (180x240 سم)"],
    colors: [
      { name: "أزرق سماوي مع بيج", hex: "#7EC8E3" },
      { name: "عاجي لؤلؤي", hex: "#FDFBF7" },
      { name: "رمادي ثلجي", hex: "#E2E8F0" }
    ],
    fabric: "مايكروفايبر حريري مستورد فائق النعومة",
    stock: 18,
    isAvailable: true,
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 42,
    specifications: [
      { label: "الحشوة الداخلية", value: "فايبر هولوكون معالج مضاد للبكتيريا 450 جرام/م²" },
      { label: "التطريز", value: "حياكة كابوتونيه حرارية هندسية متينة" }
    ]
  },
  {
    id: "prod-3",
    name: "بطانية حفر ليزر فاخرة طبقتين مورا جولد دافئة",
    description: "بطانية طبقتين وزن 6.5 كجم، نسيج مخملي ناعم الملمس مع حفر ليزر ثلاثي الأبعاد يعكس لمسات الفخامة الملكية. تدفئة ممتازة في ليالي الشتاء الباردة.",
    categoryId: "cat-blankets",
    categoryName: "البطاطين",
    price: 1850,
    originalPrice: 2200,
    discountPercent: 16,
    images: [
      "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1000&q=80"
    ],
    sizes: ["كبير (220x240 سم)"],
    colors: [
      { name: "شامبين ذهبي", hex: "#E5C378" },
      { name: "بيج كابتشينو", hex: "#D6C7B2" },
      { name: "أزرق بترولي فاتح", hex: "#6BA8C6" }
    ],
    fabric: "أكريليك ومخمل حراري مضغوط مستورد",
    stock: 12,
    isAvailable: true,
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 29
  },
  {
    id: "prod-4",
    name: "مفرش سرير عروسة تركي جاكار مطرز 8 قطع",
    description: "مفرش سرير فاخر جداً مخصص لأفخم غرف النوم والعرائس، خامة جاكار تركي منسوجة ببريق خفيف مع خداديات تطريز يدوي متقن وشال سرير إضافي.",
    categoryId: "cat-bedspreads",
    categoryName: "المفارش",
    price: 2450,
    originalPrice: 3100,
    discountPercent: 21,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"
    ],
    sizes: ["جامبو (260x280 سم)"],
    colors: [
      { name: "أوف وايت عاجي", hex: "#FDFCF7" },
      { name: "شامبين ناعم", hex: "#EADCC9" }
    ],
    fabric: "جاكار حريري تركي + بطانة قطنية مريحة",
    stock: 8,
    isAvailable: true,
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 19
  },
  {
    id: "prod-5",
    name: "طقم فوط وبشاكير قطن مصري فاخر 6 قطع قطيفة وتطريز",
    description: "طقم حمام متكامل يشمل 2 بشكير حمام كبير (90x160 سم) و2 فوطة يد (50x90 سم) و2 فوطة وجه، مصنوع من قطن مصري 100% عالي الكثافة وفائق الامتصاص.",
    categoryId: "cat-towels",
    categoryName: "الفوط والبشاكير",
    price: 680,
    originalPrice: 850,
    discountPercent: 20,
    images: [
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80"
    ],
    sizes: ["طقم متكامل 6 قطع"],
    colors: [
      { name: "أبيض وسماوي", hex: "#E0F2FE" },
      { name: "بيج عسلي", hex: "#EDE0D4" },
      { name: "أخضر مريمي", hex: "#D4DEC8" }
    ],
    fabric: "قطن مصري 100% هيدروفيليك 600 GSM",
    stock: 35,
    isAvailable: true,
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 54
  },
  {
    id: "prod-6",
    name: "مخدة طبية ميموري فوم مع جل تبريد مريح",
    description: "مخدة طبية بتصميم مريح يحمي فقرات الرقبة والكتفين ويوفر تدفق هواء مستمر، مزودة بطبقة جل تبريد لتنظيم حرارة النوم وضمان نوم عميق ومريح.",
    categoryId: "cat-pillows",
    categoryName: "المخدات",
    price: 490,
    originalPrice: 650,
    discountPercent: 25,
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80"
    ],
    sizes: ["قياسي (50x70 سم)"],
    colors: [
      { name: "أبيض ثلجي", hex: "#FFFFFF" }
    ],
    fabric: "غطاء بامبو مضاد للبكتيريا + ميموري فوم علاجي",
    stock: 40,
    isAvailable: true,
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 22
  }
];

const initialSettings = {
  brandName: "CENTER AL ASSAL | سنتر العسال لتجارة المفروشات",
  brandNameAr: "سنتر العسال لتجارة المفروشات",
  brandNameEn: "CENTER AL ASSAL",
  logoUrl: "",
  heroBadge: "كولكشن 2026 الحصري – فخامة وأناقة تدوم",
  heroTitle: "فخامة المفروشات العصرية لمنزل الأحلام",
  heroSubtitle: "ننتقي لكم أرقى خامات القطن المصري والمفروشات الفاخرة التي تمنح غرفتكم الدفء والأناقة والراحة المطلقة بأعلى معايير الجودة.",
  heroImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80",
  announcementText: "✨ شحن مجاني للطلبات بقيمة 1500 ج.م أو أكثر لجميع المحافظات | خصومات خاصة على تشكيلة العرائس 2026",
  showAnnouncement: true,
  contactPhones: ["01277714100", "01279207793"],
  whatsappNumber: "01277714100",
  email: "centeraasal@gmail.com",
  branches: [
    {
      id: "branch-1",
      name: "الفرع الأول – المعرض الرئيسي",
      address: "8 شارع أنور السادات",
      phone: "01277714100",
      whatsapp: "01277714100",
      workingHours: "يومياً من الساعة 10:00 صباحاً حتى 11:00 مساءً",
      mapsUrl: "https://maps.google.com/?q=8+شارع+أنور+السادات"
    },
    {
      id: "branch-2",
      name: "الفرع الثاني – عمود السواري",
      address: "95 عمود السواري – كرموز",
      phone: "01279207793",
      whatsapp: "01279207793",
      workingHours: "يومياً من الساعة 11:00 صباحاً حتى 11:00 مساءً",
      mapsUrl: "https://maps.google.com/?q=95+عمود+السواري+كرموز"
    }
  ],
  paymentSettings: {
    codEnabled: true,
    instaPayEnabled: true,
    instaPayHandle: "alassal.center@instapay",
    instaPayAccountName: "سنتر العسال للمفروشات",
    instaPayPhone: "01277714100",
    walletEnabled: true,
    walletNumber: "01277714100",
    walletAccountName: "سنتر العسال",
    walletProvider: "فودافون كاش / إنستاباي / أورنج كاش / اتصالات كاش",
    paymentInstructions: "يرجى تحويل إجمالي المبلغ إلى المعرّف أو الرقم الموضح، ثم إرفاق صورة إشعار التحويل لتأكيد الطلب فوراً من قبل الإدارة."
  },
  shippingSettings: {
    defaultShippingCost: 45,
    freeShippingThreshold: 1500,
    governorates: [
      { name: "الإسكندرية", cost: 35, deliveryDays: "24 ساعة" },
      { name: "القاهرة", cost: 45, deliveryDays: "1 - 2 يوم" },
      { name: "الجيزة", cost: 45, deliveryDays: "1 - 2 يوم" },
      { name: "البحيرة", cost: 45, deliveryDays: "1 - 2 يوم" },
      { name: "الغربية", cost: 50, deliveryDays: "2 يوم" },
      { name: "الدقهلية", cost: 50, deliveryDays: "2 يوم" },
      { name: "الشرقية", cost: 50, deliveryDays: "2 يوم" },
      { name: "القليوبية", cost: 45, deliveryDays: "1 - 2 يوم" },
      { name: "كفر الشيخ", cost: 50, deliveryDays: "2 يوم" },
      { name: "المنوفية", cost: 50, deliveryDays: "2 يوم" },
      { name: "دمياط", cost: 50, deliveryDays: "2 يوم" },
      { name: "بورسعيد", cost: 55, deliveryDays: "2 يوم" },
      { name: "الإسماعيلية", cost: 55, deliveryDays: "2 يوم" },
      { name: "السويس", cost: 55, deliveryDays: "2 يوم" },
      { name: "بني سويف", cost: 60, deliveryDays: "2 - 3 أيام" },
      { name: "الفيوم", cost: 60, deliveryDays: "2 - 3 أيام" },
      { name: "المنيا", cost: 65, deliveryDays: "3 أيام" },
      { name: "أسيوط", cost: 65, deliveryDays: "3 أيام" },
      { name: "سوهاج", cost: 70, deliveryDays: "3 أيام" },
      { name: "قنا", cost: 70, deliveryDays: "3 أيام" },
      { name: "الأقصر", cost: 75, deliveryDays: "3 - 4 أيام" },
      { name: "أسوان", cost: 75, deliveryDays: "3 - 4 أيام" },
      { name: "مطروح", cost: 65, deliveryDays: "2 - 3 أيام" },
      { name: "البحر الأحمر", cost: 80, deliveryDays: "3 - 4 أيام" }
    ]
  },
  aiAssistantEnabled: true,
  aiWelcomeMessage: "أهلاً بك في سنتر العسال للمفروشات! 🛏️ أنا ASSAL AI، مساعدك الذكي. يمكنني ترشيح أطقم الملايات والبطاطين، وشرح الخامات والمقاسات، ومساعدتك في تتبع أي طلب.",
  policies: {
    returnPolicy: "نحن نضمن رضاك التام عن كل قطعة. يحق للعميل استبدال أو استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون بحالته الأصلية وداخل تغليفه ولم يُستعمل أو يُغسل.",
    privacyPolicy: "نلتزم بحماية خصوصية بياناتك ومعلوماتك الشخصية. لا نستخدم أرقام الهواتف أو العناوين إلا لغرض إتمام وتوصيل طلبك عبر مندوبي الشحن المعتمدين لدينا.",
    shippingPolicy: "تصل شحنتك خلال 24 - 48 ساعة في الإسكندرية والقاهرة الكبرى، وخلال 2 - 3 أيام لباقي المحافظات. يتاح للعميل معاينة المنتجات وفحصها عند الاستلام قبل الدفع."
  }
};

interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
}

interface DbSchema {
  settings: typeof initialSettings;
  categories: typeof initialCategories;
  products: any[];
  orders: any[];
  orderCounter: number;
  adminPassHash: string;
  sessions?: AdminSession[];
}

// Secure default salted bcrypt hash for administrative access (cost factor: 10)
const DEFAULT_ADMIN_HASH = '$2b$10$IKgCQuAKRed7/gaY2sYMUuFSVaLVNWlaGWc6W8X2BpVdrz1ACAZMe';

// In-memory cache to guarantee zero-crash execution on read-only serverless environments
let memoryDbCache: DbSchema | null = null;

// Stateless cryptographically signed tokens for zero-failure serverless & multi-instance auth
const TOKEN_PREFIX = 'caa_sec';
const JWT_SECRET = process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  process.env.ADMIN_SECRET ||
  crypto.createHash('sha256').update(process.env.GEMINI_API_KEY || 'CENTER_ALASSAL_SALT_2026_PRODUCTION_KEY').digest('hex');

interface TokenPayload {
  u: string;
  r: string;
  iat: number;
  exp: number;
  jti: string;
}

function createSignedAdminToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    u: 'admin',
    r: 'superadmin',
    iat: now,
    exp: now + (7 * 24 * 60 * 60), // Valid for 7 days
    jti: crypto.randomBytes(16).toString('hex')
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${TOKEN_PREFIX}.${payloadB64}.${signature}`;
}

function loadDb(): DbSchema {
  if (memoryDbCache) {
    return memoryDbCache;
  }

  const candidateFiles = [
    DB_FILE,
    findBundledDbFile(),
    path.resolve(process.cwd(), 'data', 'store.json'),
    path.resolve(__dirnameSafe, 'data', 'store.json'),
    path.resolve(__dirnameSafe, '..', 'data', 'store.json')
  ].filter(Boolean) as string[];

  for (const fileToRead of candidateFiles) {
    try {
      if (fs.existsSync(fileToRead)) {
        const content = fs.readFileSync(fileToRead, 'utf-8');
        const data = JSON.parse(content);
        
        // Upgrade plain text or missing password to bcrypt hash
        let adminPassHash = data.adminPassHash;
        if (!adminPassHash || !adminPassHash.startsWith('$2')) {
          adminPassHash = DEFAULT_ADMIN_HASH;
        }

        memoryDbCache = {
          settings: { ...initialSettings, ...data.settings },
          categories: data.categories || initialCategories,
          products: data.products || initialProducts,
          orders: data.orders || [],
          orderCounter: data.orderCounter || 1,
          adminPassHash,
          sessions: data.sessions || []
        };
        return memoryDbCache;
      }
    } catch (err) {
      console.warn(`Could not read candidate db file ${fileToRead}:`, err);
    }
  }

  const initialData: DbSchema = {
    settings: initialSettings,
    categories: initialCategories,
    products: initialProducts,
    orders: [],
    orderCounter: 1,
    adminPassHash: DEFAULT_ADMIN_HASH,
    sessions: []
  };
  memoryDbCache = initialData;
  saveDb(initialData);
  return initialData;
}

function saveDb(data: DbSchema) {
  memoryDbCache = data;
  try {
    const targetDir = path.dirname(DB_FILE);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal on read-only serverless filesystems
    console.warn('Notice: Disk write skipped (in-memory state preserved):', err);
  }
}

// Verify admin session token (stateless signed token + legacy session fallback)
function verifyAdminSession(token?: string): boolean {
  if (!token) return false;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!cleanToken) return false;

  // 1. Verify stateless signed token
  if (cleanToken.startsWith(TOKEN_PREFIX + '.')) {
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      const [, payloadB64, signature] = parts;
      const hmac = crypto.createHmac('sha256', JWT_SECRET);
      hmac.update(payloadB64);
      const expectedSig = hmac.digest('base64url');

      if (signature.length === expectedSig.length) {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSig);
        if (crypto.timingSafeEqual(sigBuf, expBuf)) {
          try {
            const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp > now && payload.u === 'admin') {
              return true;
            }
          } catch {
            return false;
          }
        }
      }
    }
    return false;
  }

  // 2. Legacy fallback for existing sessions
  try {
    const db = loadDb();
    const sessions = db.sessions || [];
    const now = Date.now();
    const session = sessions.find(s => s.token === cleanToken);
    return Boolean(session && session.expiresAt > now);
  } catch {
    return false;
  }
}

// ---------------- API ROUTES ----------------

// GET store settings
app.get('/api/settings', (req, res) => {
  const db = loadDb();
  res.json({ success: true, settings: db.settings });
});

// UPDATE store settings (Admin)
app.put('/api/settings', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  db.settings = { ...db.settings, ...req.body };
  saveDb(db);
  res.json({ success: true, settings: db.settings });
});

// GET categories
app.get('/api/categories', (req, res) => {
  const db = loadDb();
  res.json({ success: true, categories: db.categories });
});

// CREATE category
app.post('/api/categories', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const newCat = {
    id: `cat-${Date.now()}`,
    name: req.body.name,
    nameEn: req.body.nameEn || '',
    slug: req.body.slug || `cat-${Date.now()}`,
    description: req.body.description || '',
    image: req.body.image || '',
    icon: req.body.icon || 'Layers'
  };

  db.categories.push(newCat);
  saveDb(db);
  res.json({ success: true, category: newCat });
});

// UPDATE category
app.put('/api/categories/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'القسم غير موجود' });
  }

  db.categories[index] = { ...db.categories[index], ...req.body };
  saveDb(db);
  res.json({ success: true, category: db.categories[index] });
});

// DELETE category
app.delete('/api/categories/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  db.categories = db.categories.filter(c => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: 'تم حذف القسم بنجاح' });
});

// GET products (with filters & search)
app.get('/api/products', (req, res) => {
  const db = loadDb();
  let list = [...db.products];

  const { category, search, featured, bestSeller, newArrival, maxPrice, sort } = req.query;

  if (category && category !== 'all') {
    list = list.filter(p => p.categoryId === category);
  }

  if (search) {
    const s = String(search).toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      (p.fabric && p.fabric.toLowerCase().includes(s))
    );
  }

  if (featured === 'true') {
    list = list.filter(p => p.isFeatured);
  }

  if (bestSeller === 'true') {
    list = list.filter(p => p.isBestSeller);
  }

  if (newArrival === 'true') {
    list = list.filter(p => p.isNewArrival);
  }

  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) {
      list = list.filter(p => p.price <= max);
    }
  }

  if (sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  res.json({ success: true, products: list });
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  const db = loadDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  }
  res.json({ success: true, product });
});

// CREATE product
app.post('/api/products', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const category = db.categories.find(c => c.id === req.body.categoryId);

  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.body.name,
    description: req.body.description || '',
    categoryId: req.body.categoryId || 'cat-sheets',
    categoryName: category ? category.name : 'أخرى',
    price: parseFloat(req.body.price) || 0,
    originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
    discountPercent: req.body.originalPrice && req.body.price
      ? Math.round(((req.body.originalPrice - req.body.price) / req.body.originalPrice) * 100)
      : undefined,
    images: Array.isArray(req.body.images) && req.body.images.length > 0
      ? req.body.images
      : ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"],
    sizes: Array.isArray(req.body.sizes) && req.body.sizes.length > 0 ? req.body.sizes : ["مقاس قياسي"],
    colors: Array.isArray(req.body.colors) && req.body.colors.length > 0 ? req.body.colors : [{ name: "عاجي", hex: "#FAF9F5" }],
    fabric: req.body.fabric || "قطن مصري عالي الجودة",
    stock: parseInt(req.body.stock) || 10,
    isAvailable: req.body.isAvailable !== false,
    isNewArrival: Boolean(req.body.isNewArrival),
    isBestSeller: Boolean(req.body.isBestSeller),
    isFeatured: Boolean(req.body.isFeatured),
    rating: 5.0,
    reviewCount: 0,
    specifications: req.body.specifications || [],
    careInstructions: req.body.careInstructions || '',
    createdAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDb(db);
  res.json({ success: true, product: newProduct });
});

// UPDATE product
app.put('/api/products/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  }

  const category = db.categories.find(c => c.id === req.body.categoryId);
  const updated = {
    ...db.products[index],
    ...req.body,
    categoryName: category ? category.name : db.products[index].categoryName
  };

  if (updated.originalPrice && updated.price) {
    updated.discountPercent = Math.round(((updated.originalPrice - updated.price) / updated.originalPrice) * 100);
  }

  db.products[index] = updated;
  saveDb(db);
  res.json({ success: true, product: updated });
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

// ---------------- ORDERS & TRACKING ----------------

// Helper to generate formatted order code e.g. CAA-2026-00001
function generateOrderCode(counter: number): string {
  const currentYear = new Date().getFullYear();
  const paddedNumber = String(counter).padStart(5, '0');
  return `CAA-${currentYear}-${paddedNumber}`;
}

// CREATE ORDER (Atomic code generation)
app.post('/api/orders', (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      governorate,
      area,
      detailedAddress,
      notes,
      items,
      subtotal,
      shippingCost,
      total,
      paymentMethod,
      paymentReceiptImage
    } = req.body;

    if (!customerName || !customerPhone || !governorate || !detailedAddress || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'يرجى استكمال جميع بيانات العميل والطلب المطلوبة' });
    }

    const db = loadDb();
    const orderCounter = db.orderCounter || 1;
    const orderCode = generateOrderCode(orderCounter);

    const paymentStatus = paymentMethod === 'cod'
      ? 'cod_pending'
      : (paymentReceiptImage ? 'pending_review' : 'pending_review');

    const newOrder = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderCode,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      governorate,
      area: area || '',
      detailedAddress,
      notes: notes || '',
      items,
      subtotal: parseFloat(subtotal) || 0,
      shippingCost: parseFloat(shippingCost) || 0,
      total: parseFloat(total) || 0,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus,
      paymentReceiptImage: paymentReceiptImage || '',
      status: 'pending',
      internalNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Increment counter atomically
    db.orderCounter = orderCounter + 1;
    db.orders.unshift(newOrder);

    // Update inventory stock for purchased products
    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod && typeof prod.stock === 'number') {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    saveDb(db);

    res.json({
      success: true,
      message: 'تم تسجيل طلبك بنجاح!',
      order: newOrder
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ الطلب' });
  }
});

// TRACK ORDER (by orderCode and customerPhone verification)
app.get('/api/orders/track', (req, res) => {
  const { code, phone } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال كود الطلب' });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const db = loadDb();
  const order = db.orders.find(o => o.orderCode.toUpperCase() === cleanCode);

  if (!order) {
    return res.status(404).json({ success: false, message: 'لم يتم العثور على طلب بهذا الكود. يرجى التأكد من كتابة الكود بشكل صحيح مثل CAA-2026-00001' });
  }

  // If phone provided, verify match
  if (phone) {
    const cleanPhone = String(phone).replace(/\s+/g, '').replace(/^0+/, '');
    const orderPhone = order.customerPhone.replace(/\s+/g, '').replace(/^0+/, '');
    if (!orderPhone.includes(cleanPhone) && !cleanPhone.includes(orderPhone)) {
      return res.status(403).json({ success: false, message: 'رقم الهاتف غير متطابق مع كود الطلب المدخل' });
    }
  }

  res.json({ success: true, order });
});

// GET all orders (Admin)
app.get('/api/orders', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  res.json({ success: true, orders: db.orders });
});

// UPDATE order status / payment review (Admin)
app.put('/api/orders/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const index = db.orders.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  }

  db.orders[index] = {
    ...db.orders[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveDb(db);
  res.json({ success: true, order: db.orders[index] });
});

// DELETE order (Admin)
app.delete('/api/orders/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const orderExists = db.orders.some(o => o.id === req.params.id);
  if (!orderExists) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود أو تم حذفه مسبقاً' });
  }

  db.orders = db.orders.filter(o => o.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: 'تم حذف الطلب نهائياً بنجاح' });
});

// Rate limiting map for admin login (in memory)
const loginAttempts: Record<string, { count: number; lockedUntil: number }> = {};

// Root / health / fallback endpoint
const handleApiRoot = (req: express.Request, res: express.Response) => {
  if (req.method === 'POST' && req.body && req.body.password) {
    return handleAdminLogin(req, res);
  }
  return res.json({
    success: true,
    brand: "CENTER AL ASSAL | سنتر العسال لتجارة المفروشات",
    status: "online",
    timestamp: new Date().toISOString()
  });
};

app.get('/api', handleApiRoot);
app.post('/api', handleApiRoot);

// ADMIN AUTH: LOGIN HANDLER
const handleAdminLogin = (req: express.Request, res: express.Response) => {
  try {
    const forwarded = req.headers ? (req.headers['x-forwarded-for'] as string) : undefined;
    const ip = forwarded?.split(',')[0]?.trim() || req.socket?.remoteAddress || (req as any).ip || 'unknown';
    const now = Date.now();

    const attemptInfo = loginAttempts[ip];
    if (attemptInfo && attemptInfo.lockedUntil > now) {
      const remainingSeconds = Math.ceil((attemptInfo.lockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `تم قفل محاولات تسجيل الدخول مؤقتاً لحماية الحساب. يرجى الانتظار ${remainingSeconds} ثانية ثم المحاولة مجدداً.`
      });
    }

    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور' });
    }

    const db = loadDb();
    const targetHash = (db && db.adminPassHash) ? db.adminPassHash : DEFAULT_ADMIN_HASH;

    let isMatch = false;
    try {
      isMatch = bcrypt.compareSync(password, targetHash);
    } catch {
      try {
        isMatch = bcrypt.compareSync(password, DEFAULT_ADMIN_HASH);
      } catch {}
    }

    // Optional environment variable override support
    if (!isMatch && process.env.ADMIN_PASSWORD) {
      isMatch = (password === process.env.ADMIN_PASSWORD);
    }

    if (isMatch) {
      delete loginAttempts[ip];

      // Generate stateless cryptographically signed session token
      const token = createSignedAdminToken();
      const newSession: AdminSession = {
        token,
        createdAt: now,
        expiresAt: now + (7 * 24 * 60 * 60 * 1000) // 7-day expiration
      };

      try {
        db.sessions = (db.sessions || []).filter(s => s && s.expiresAt > now);
        db.sessions.push(newSession);
        saveDb(db);
      } catch (saveErr) {
        console.warn('Notice: Session save skipped (in-memory token valid):', saveErr);
      }

      return res.json({
        success: true,
        token,
        user: { username: 'admin', role: 'superadmin' }
      });
    } else {
      const current = loginAttempts[ip] || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 8) {
        current.lockedUntil = now + 5 * 60 * 1000; // 5 minutes lock
        current.count = 0;
      }
      loginAttempts[ip] = current;

      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
  } catch (error: any) {
    console.error('Fatal error in admin login:', error);
    return res.status(500).json({
      success: false,
      message: 'تعذر الاتصال بالخادم أو معالجة تسجيل الدخول. يرجى المحاولة مرة أخرى.'
    });
  }
};

app.post('/api/admin/login', handleAdminLogin);
app.post('/admin/login', handleAdminLogin);

// ADMIN AUTH: VERIFY SESSION
const handleAdminVerify = (req: express.Request, res: express.Response) => {
  try {
    const token = req.headers.authorization;
    if (!verifyAdminSession(token)) {
      return res.status(401).json({ success: false, message: 'انتهت صلاحية الجلسة أو غير مصرح' });
    }
    return res.json({
      success: true,
      user: { username: 'admin', role: 'superadmin' }
    });
  } catch (err: any) {
    console.error('Error verifying admin session:', err);
    return res.status(401).json({ success: false, message: 'غير مصرح' });
  }
};

app.get('/api/admin/verify', handleAdminVerify);
app.get('/admin/verify', handleAdminVerify);

// ADMIN AUTH: LOGOUT
const handleAdminLogout = (req: express.Request, res: express.Response) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
      const db = loadDb();
      if (db && db.sessions) {
        db.sessions = db.sessions.filter(s => s && s.token !== cleanToken);
        saveDb(db);
      }
    }
  } catch (err) {
    console.warn('Logout save notice:', err);
  }
  return res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
};

app.post('/api/admin/logout', handleAdminLogout);
app.post('/admin/logout', handleAdminLogout);

// UPDATE ADMIN PASSWORD (Secure bcrypt hashing)
app.put('/api/admin/password', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
  }

  const db = loadDb();
  if (!bcrypt.compareSync(oldPassword, db.adminPassHash)) {
    return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل' });
  }

  // Hash new password using bcrypt
  db.adminPassHash = bcrypt.hashSync(newPassword, 10);
  saveDb(db);
  res.json({ success: true, message: 'تم تغيير كلمة المرور وتشفيرها بنجاح' });
});

// DASHBOARD STATS (Admin)
app.get('/api/admin/stats', (req, res) => {
  const token = req.headers.authorization;
  if (!verifyAdminSession(token)) {
    return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
  }

  const db = loadDb();
  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = db.orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const deliveredOrders = db.orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = db.orders.filter(o => o.status === 'cancelled').length;

  const totalSales = db.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingPayments = db.orders.filter(o => o.paymentStatus === 'pending_review').length;

  res.json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
      pendingPayments,
      productCount: db.products.length,
      categoryCount: db.categories.length
    }
  });
});

// ---------------- AI ASSISTANT (ASSAL AI) ----------------
const getAi = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'يرجى كتابة رسالتك' });
    }

    const db = loadDb();
    if (!db.settings.aiAssistantEnabled) {
      return res.json({
        success: true,
        reply: "مساعد الذكاء الاصطناعي متوقف حالياً للصيانة من قبل الإدارة. نسعد بتواصلك المباشر معنا عبر الواتساب على 01277714100."
      });
    }

    const ai = getAi();
    if (!ai) {
      return res.json({
        success: true,
        reply: "أهلاً بك في سنتر العسال للمفروشات! 🛏️✨ يسعدنا الرد على استفساراتكم وترشيح أفضل الملايات والبطاطين واللحاف الفاخر. للتواصل المباشر مع فريق المبيعات يرجى الاتصال أو المراسلة عبر الواتساب على 01277714100 أو 01279207793، أو تشريفنا في فروع الإسكندرية."
      });
    }

    // Build context with current real catalog and store data
    const catalogSummary = db.products.slice(0, 25).map(p => ({
      id: p.id,
      name: p.name,
      category: p.categoryName,
      price: p.price,
      originalPrice: p.originalPrice,
      fabric: p.fabric,
      sizes: p.sizes,
      stock: p.stock,
      available: p.isAvailable
    }));

    const categoriesList = db.categories.map(c => c.name).join('، ');
    const branchesInfo = db.settings.branches.map(b => `${b.name}: ${b.address} - تليفون: ${b.phone} (${b.workingHours})`).join(' | ');

    const systemInstruction = `
أنت ASSAL AI – المساعد الذكي الحصري لمتجر "سنتر العسال لتجارة المفروشات" (CENTER AL ASSAL).
أنت خبير محترف في المفروشات المنزلية وأطقم الملايات والبطاطين واللحاف ومستلزمات العرائس.
تتحدث باللغة العربية بأسلوب راقٍ، مهذب، مرحب، وودود للغاية. تفهم اللهجة المصرية العامية والمصطلحات الدارجة (مثل: ملاية سرير كبير، قطن مصري، قطيفة، كينج، لحاف فايبر، تطريز عرايس، مورا، خامة سوفت، فوط وبشاكير).

بيانات المتجر الرسمية:
- اسم البراند: سنتر العسال لتجارة المفروشات (CENTER AL ASSAL)
- أرقام الهاتف والواتساب: 01277714100 و 01279207793
- الفروع الرسمية:
  1. الفرع الأول (المعرض الرئيسي): 8 شارع أنور السادات.
  2. الفرع الثاني: 95 عمود السواري – كرموز.
- طرق الدفع:
  1. الدفع عند الاستلام (معاينة وفحص المنتج قبل السداد).
  2. InstaPay على معرف "${db.settings.paymentSettings.instaPayHandle}" باسم "${db.settings.paymentSettings.instaPayAccountName}".
  3. المحافظ الإلكترونية (فودافون كاش ومحافظ أخرى) على الرقم ${db.settings.paymentSettings.walletNumber}.
- الشحن: شحن لجميع محافظات مصر (الإسكندرية 35 ج خلال 24 ساعة، القاهرة والجيزة 45 ج، وباقي المحافظات خلال 48-72 ساعة). شحن مجاني للطلبات فوق ${db.settings.shippingSettings.freeShippingThreshold} ج.م.
- سياسة الاستبدال: استبدال واسترجاع خلال 14 يوماً بشرط بقاء المنتج بحالته الأصلية وغلافه.
- الأقسام المتاحة: ${categoriesList}.

كتالوج المنتجات الحالي في المتجر:
${JSON.stringify(catalogSummary, null, 2)}

قواعد هامة:
1. اقترح منتجات حقيقية من الكتالوج أعلاه بأسعارها الحقيقية، واذكر اسم المنتج وسعره وخامته.
2. إذا سأل العميل عن ترشيح لعرسان، رشح أطقم الملايات الرويال القطن المصري، مفرش العروسة الجاكار، واللحاف المودرن.
3. إذا طلب العميل البحث بميزانية معينة (مثلاً أقل من 1000 جنيه أو في حدود 1500)، ابحث عن المنتجات المناسبة من الكتالوج.
4. إذا سأل العميل عن كود طلب، وضّح له أن أكواد الطلبات تبدأ بـ CAA-2026-xxxxx ويمكنه تتبعها من صفحة "تتبع الطلب" في الموقع أو إعطائك الكود.
5. لا تخترع أسعاراً أو منتجات غير موجودة في الكتالوج.
6. اختم رسائلك دائماً بلمسة ترحيبية راقية تعرض المساعدة في الإضافة للسلة أو إتمام الشراء.
`;

    // Format chat history for Gemini
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      }
    });

    const reply = response.text || "أهلاً بك! نسعد دائماً بخدمتك في سنتر العسال للمفروشات. كيف يمكنني مساعدتك اليوم؟";

    // Detect if model mentioned specific products to highlight them in the UI
    const lowerReply = reply.toLowerCase();
    const suggestedProducts = db.products.filter(p =>
      lowerReply.includes(p.name.toLowerCase()) ||
      lowerReply.includes(p.id.toLowerCase())
    ).slice(0, 3);

    res.json({
      success: true,
      reply,
      suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : undefined
    });
  } catch (error: any) {
    console.error('Error in ASSAL AI chat:', error);
    res.status(500).json({
      success: false,
      reply: "أهلاً بك! سنتر العسال يرحب بك دائماً. يمكنك التواصل معنا مباشرة هاتفياً أو عبر واتساب على الرقم 01277714100 لأي استفسار فوري أو طلب خاص."
    });
  }
});

// Global JSON error handler to ensure all API errors return application/json
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global API Error caught:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({
    success: false,
    message: err?.message || 'حدث خطأ في الخادم أثناء تنفيذ الطلب'
  });
});

// Export app for Vercel Serverless Functions and Node runners
export default app;
export { app };

// ---------------- SERVER INITIALIZATION ----------------
async function startDevOrProdServer() {
  if (process.env.NODE_ENV !== 'production') {
    const viteModuleName = 'vite';
    const { createServer: createViteServer } = await import(/* @vite-ignore */ viteModuleName);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirnameSafe, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirnameSafe, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ سنتر العسال - السيرفر يعمل بنجاح على http://0.0.0.0:${PORT}`);
  });
}

const isMainModule = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))
);

if (isMainModule && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startDevOrProdServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
