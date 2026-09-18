import { Category, Product, Order, StoreSettings, OrderStatus } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { indexedDbService, IDB_STORES } from './indexedDbService';

const ADMIN_CREDENTIALS = {
  email: 'admin@muslimshop.kz',
  password: 'admin123456',
};

const STORAGE_KEYS = {
  PRODUCTS: 'muslim_shop_products_v1',
  CATEGORIES: 'muslim_shop_categories_v1',
  ORDERS: 'muslim_shop_orders_v1',
  SETTINGS: 'muslim_shop_settings_v1',
  LANG: 'muslim_shop_lang_v1',
  ADMIN_AUTH: 'muslim_shop_admin_session_v1',
};

// Initial Categories based directly on user specifications
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-hits', nameRu: 'Хиты', nameKz: 'Хиттер', icon: '🔥', order: 1 },
  { id: 'cat-health', nameRu: 'Здоровье', nameKz: 'Денсаулық', icon: '❤️', order: 2 },
  { id: 'cat-iherb', nameRu: 'iHerb Витамины', nameKz: 'iHerb Витаминдер', icon: '💊', order: 3 },
  { id: 'cat-beauty', nameRu: 'Красота', nameKz: 'Сұлулық', icon: '✨', order: 4 },
  { id: 'cat-men', nameRu: 'Мужское здоровье', nameKz: 'Ерлер денсаулығы', icon: '💪', order: 5 },
  { id: 'cat-women', nameRu: 'Женское здоровье', nameKz: 'Әйелдер денсаулығы', icon: '🌸', order: 6 },
  { id: 'cat-diet', nameRu: 'Похудение', nameKz: 'Арықтау', icon: '⚖️', order: 7 },
  { id: 'cat-muslim', nameRu: 'Для мусульман', nameKz: 'Мұсылмандарға', icon: '🕌', order: 8 },
  { id: 'cat-natural', nameRu: 'Натуральные продукты', nameKz: 'Табиғи өнімдер', icon: '🌿', order: 9 },
  { id: 'cat-new', nameRu: 'Новинки', nameKz: 'Жаңалықтар', icon: '🌟', order: 10 },
  { id: 'cat-misc', nameRu: 'Разное', nameKz: 'Басқа', icon: '📦', order: 11 },
];

// Initial realistic products with genuine details and prices in Kazakhstan Tenge
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    titleRu: 'Масло черного тмина «Королевское» холодный отжим',
    titleKz: '«Корольдік» қара зере майы, суық сығынды',
    price: 8500,
    oldPrice: 10000,
    categoryId: 'cat-health',
    descriptionRu: 'Натуральное нерафинированное масло черного тмина первого холодного отжима. Флакон из темного медицинского стекла с дозатором. Без консервантов и добавок.',
    descriptionKz: 'Табиғи бірінші суық сығынды қара зере майы. Күңгірт шыны құтыда. Қоспасыз және бояғышсыз.',
    specsRu: 'Объем: 500 мл\nСтрана производства: Египет\nСпособ отжима: Первый холодный отжим\nТара: Темное стекло',
    specsKz: 'Көлемі: 500 мл\nӨндіруші ел: Мысыр\nСығынды түрі: Суық сығынды\nЫдыс: Күңгірт шыны',
    inStock: true,
    sku: 'MS-101-OIL',
    isHit: true,
    isNew: false,
    isSale: true,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    titleRu: 'Морской гидролизованный коллаген с витамином C',
    titleKz: 'С дәрумені қосылған теңіз гидролизденген коллагені',
    price: 9800,
    oldPrice: 12500,
    categoryId: 'cat-beauty',
    descriptionRu: 'Пептиды рыбного гидролизованного морского коллагена с натуральным витамином C для естественного усвоения. Легко растворяется в воде.',
    descriptionKz: 'С дәрумені бар теңіз коллаген пептидтері. Суда оңай ериді, жағымсыз иіссіз.',
    specsRu: 'Форма выпуска: Порошок\nВес: 300 г\nПорций: 30\nБез сахара и глютена',
    specsKz: 'Шығарылу түрі: Ұнтақ\nСалмағы: 300 г\nҮлестер саны: 30\nҚантсыз және глютенсіз',
    inStock: true,
    sku: 'MS-202-COL',
    isHit: true,
    isNew: true,
    isSale: true,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    titleRu: 'Арабский концентрированный масляный миск Black Stone',
    titleKz: 'Black Stone концентрлі араб майлы мискі',
    price: 4500,
    oldPrice: 5500,
    categoryId: 'cat-muslim',
    descriptionRu: 'Бесспиртовой масляный концентрированный парфюм (миск). Стойкий восточный аромат с благородными нотами амбры, мускуса и удового дерева.',
    descriptionKz: 'Құрамында спирті жоқ концентрлі майлы парфюм. Амбра, мускус және уд ноталары бар төзімді шығыс хош иісі.',
    specsRu: 'Объем: 6 мл\nТип: Масляный роллер\nСтойкость: до 48 часов\nБез спирта (Halal)',
    specsKz: 'Көлемі: 6 мл\nТүрі: Майлы роллер\nТұрақтылығы: 48 сағатқа дейін\nСпиртсіз (Халал)',
    inStock: true,
    sku: 'MS-303-MSK',
    isHit: true,
    isNew: false,
    isSale: true,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    titleRu: 'Мужской натуральный комплекс «Эпимедиумная паста»',
    titleKz: 'Ерлерге арналған табиғи «Эпимедиум пастасы» кешені',
    price: 7500,
    oldPrice: 9000,
    categoryId: 'cat-men',
    descriptionRu: 'Традиционная паста на основе цветочного меда и отборных растительных экстрактов (экстракт эпимедиума, женьшень, мака перуанская).',
    descriptionKz: 'Гүл балы мен таңдаулы өсімдік сығындылары негізіндегі дәстүрлі паста (эпимедиум, женьшень, перу макасы).',
    specsRu: 'Масса нетто: 240 г\nОригинал с голограммой\n100% натуральный состав\nХранить в сухом прохладном месте',
    specsKz: 'Таза салмағы: 240 г\nГолограммасы бар түпнұсқа\n100% табиғи құрам\nҚұрғақ салқын жерде сақтау керек',
    inStock: true,
    sku: 'MS-404-EPI',
    isHit: true,
    isNew: false,
    isSale: true,
    images: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    titleRu: 'Электронные четки с LED-подсветкой (Digital Tasbih)',
    titleKz: 'LED-жарығы бар электронды тәспі (Digital Tasbih)',
    price: 2200,
    oldPrice: 3000,
    categoryId: 'cat-muslim',
    descriptionRu: 'Компактные электронные четки на палец с удобным ремешком, функцией сброса и ярким ночным LED-дисплеем.',
    descriptionKz: 'Ыңғайлы белдігі, нөлдеу батырмасы және жарық LED-экраны бар саусаққа тағылатын ықшам электронды тәспі.',
    specsRu: 'Дисплей: 5-значный цифровой LCD\nПитание: Батарейка AG10 (в комплекте)\nМатериал: Ударопрочный пластик',
    specsKz: 'Дисплей: 5 сандық сандық LCD\nҚуат көзі: AG10 батареясы (жиынтықта)\nМатериал: Соққыға төзімді пластик',
    inStock: true,
    sku: 'MS-505-TSB',
    isHit: false,
    isNew: true,
    isSale: true,
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    titleRu: 'Натуральный Мисвак (Сивак) в индивидуальной вакуумной упаковке',
    titleKz: 'Жеке вакуумдық қаптамадағы табиғи Мисуак (Сиуак)',
    price: 1200,
    categoryId: 'cat-muslim',
    descriptionRu: 'Традиционная палочка для гигиены полости рта из корней дерева Арак (Salvadora persica). Свежий срез, сохраняет естественную влажность.',
    descriptionKz: 'Арақ ағашының тамырынан жасалған ауыз қуысы тазалығына арналған дәстүрлі таяқша (Salvadora persica). Табиғи ылғалын сақтайды.',
    specsRu: 'Длина: ~15 см\nУпаковка: Вакуумная фольгированная\n100% натуральный продукт',
    specsKz: 'Ұзындығы: ~15 см\nҚаптамасы: Вакуумдық фольга\n100% табиғи өнім',
    inStock: true,
    sku: 'MS-606-MSW',
    isHit: true,
    isNew: false,
    isSale: false,
    images: [
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    titleRu: 'Семена черного тмина сирийские цельные отборные',
    titleKz: 'Сириялық іріктелген таза қара зере дәндері',
    price: 3200,
    categoryId: 'cat-natural',
    descriptionRu: 'Отборные цельные семена черного тмина высшего качества, очищенные от примесей. Подходят для заваривания чая, перемола и кулинарии.',
    descriptionKz: 'Қоспалардан тазартылған жоғары сапалы қара зере дәндері. Шай қайнатуға, ұнтақтауға және тағамға қосуға арналған.',
    specsRu: 'Масса: 250 г\nСорт: Высший\nСтрана: Сирия\nУпаковка: Zip-lock крафт-пакет',
    specsKz: 'Салмағы: 250 г\nСорты: Жоғары\nЕл: Сирия\nҚаптама: Zip-lock крафт пакеті',
    inStock: true,
    sku: 'MS-707-SD',
    isHit: false,
    isNew: false,
    isSale: false,
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    titleRu: 'Травяной сбор детокс для очищения и похудения',
    titleKz: 'Ағзаны тазартуға және арықтауға арналған шөп шайы (Детокс)',
    price: 4900,
    oldPrice: 6200,
    categoryId: 'cat-diet',
    descriptionRu: 'Натуральный фиточай из алтайских трав для мягкого очищения организма, нормализации обмена веществ и снижения аппетита.',
    descriptionKz: 'Ағзаны жұмсақ тазартуға, зат алмасуды қалпына келтіруге және тәбетті реттеуге арналған табиғи шөп шайы.',
    specsRu: 'Количество фильтр-пакетов: 30 шт\nСостав: Сбор целебных трав\nБез искусственных ароматизаторов',
    specsKz: 'Сүзгі-пакеттер саны: 30 дана\nҚұрамы: Емдік шөптер қоспасы\nЖасанды хош иістендіргішсіз',
    inStock: true,
    sku: 'MS-808-DET',
    isHit: false,
    isNew: true,
    isSale: true,
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
    ],
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'MUSLIM SHOP',
  taglineRu: 'Красота. Здоровье. Вера.',
  taglineKz: 'Сұлулық. Денсаулық. Сенім.',
  subtitleRu: 'Премиальные товары для здоровья, красоты и повседневной жизни.',
  subtitleKz: 'Денсаулық, сұлулық және күнделікті өмірге арналған премиум өнімдер.',
  city: 'Атырау',
  boutiqueNumber: 'Бутик №24',
  address: 'г. Атырау, проспект Султана Бейбарыса, 45а/5',
  whatsappNumber: '77781754241',
  instagram: 'musliim_shop06',
  gis2Url: 'https://2gis.kz/atyrau/geo/70000001094546376',
  workingHoursRu: 'Ежедневно с 10:00 до 21:00',
  workingHoursKz: 'Күн сайын сағат 10:00-ден 21:00-ге дейін',
  deliveryInfoRu: 'Быстрая доставка курьером по городу Атырау в день заказа. Доставка по Казахстану через Казпочту / СДЭК.',
  deliveryInfoKz: 'Атырау қаласы бойынша тапсырыс берілген күні жылдам жеткізу. Қазақстан бойынша Қазпошта / СДЭК арқылы жеткізу.',
  pickupInfoRu: 'г. Атырау, пр. Султана Бейбарыса, 45а/5. Выдача заказов ежедневно с 10:00 до 21:00.',
  pickupInfoKz: 'Атырау қ., Сұлтан Бейбарыс даңғылы, 45а/5. Тапсырыстарды күн сайын 10:00-ден 21:00-ге дейін алып кетуге болады.',
  currency: '₸',
  adminPin: '505534',
};

const INITIAL_ORDERS: Order[] = [];

// Helper to remove undefined properties before sending to Firestore
function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }
  if (typeof obj === 'object') {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        res[key] = cleanForFirestore(value);
      }
    }
    return res;
  }
  return obj;
}

class StorageService {
  private memoryProducts: Product[] | null = null;
  private memoryCategories: Category[] | null = null;
  private memoryOrders: Order[] | null = null;
  private memorySettings: StoreSettings | null = null;

  constructor() {
    if (this.isBrowser()) {
      // 1. Clean up any oversized cache that could trigger QuotaExceededError in localStorage
      this.sanitizeExistingLocalStorage();

      // 2. Hydrate high-capacity IndexedDB data in the background
      indexedDbService.getAll<Product>(IDB_STORES.PRODUCTS).then((idbProducts) => {
        if (idbProducts && idbProducts.length > 0) {
          if (!this.memoryProducts || this.memoryProducts.length === 0) {
            this.memoryProducts = idbProducts;
          } else {
            // Merge full-resolution images from IndexedDB
            const idbMap = new Map(idbProducts.map((p) => [p.id, p]));
            this.memoryProducts = this.memoryProducts.map((prod) => {
              const fromIdb = idbMap.get(prod.id);
              if (fromIdb && fromIdb.images && fromIdb.images.length > 0) {
                return {
                  ...prod,
                  images: fromIdb.images,
                };
              }
              return prod;
            });
          }
        }
      }).catch(() => {});
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Cleans up old oversized base64 strings in localStorage to guarantee
   * quota limits are never exceeded, while transferring full data to IndexedDB.
   */
  private sanitizeExistingLocalStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (raw && (raw.length > 500000 || raw.includes('data:image'))) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Preserve full images in IndexedDB and memory
          this.memoryProducts = parsed;
          indexedDbService.saveAll(IDB_STORES.PRODUCTS, parsed).catch(() => {});

          // Replace localStorage with lightweight copy (< 50KB)
          const lightweight = this.createLightweightProducts(parsed);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(lightweight));
        }
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      } catch {}
    }
  }

  /**
   * Strips heavy base64 data URLs from products for localStorage storage,
   * keeping only standard HTTP URLs and metadata so the 5MB browser quota is never exceeded.
   * (Full images are preserved in IndexedDB, in memory, and in Firestore).
   */
  private createLightweightProducts(products: Product[]): Product[] {
    return products.map((p) => {
      const lightweightImages = (p.images || []).map((img) => {
        if (typeof img === 'string' && img.startsWith('data:') && img.length > 1024) {
          return ''; // Strip heavy base64 from localStorage
        }
        return img;
      }).filter(Boolean);

      return {
        ...p,
        images: lightweightImages,
      };
    });
  }

  // --- Real Admin Authentication Helper ---
  public async ensureAdminAuth(): Promise<boolean> {
    if (auth.currentUser) return true;
    try {
      await signInWithEmailAndPassword(auth, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
      return true;
    } catch (err) {
      console.warn('Firebase admin auto-auth note:', err);
      return false;
    }
  }

  // --- Real-time Products Sync ---
  public subscribeProducts(callback: (products: Product[]) => void): () => void {
    if (!this.isBrowser()) {
      callback(INITIAL_PRODUCTS);
      return () => {};
    }

    try {
      const colRef = collection(db, 'products');
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              let createdAt = data.createdAt;
              if (!createdAt && docSnap.id && docSnap.id.startsWith('prod-')) {
                const ts = Number(String(docSnap.id).replace('prod-', ''));
                if (!isNaN(ts) && ts > 0) {
                  createdAt = new Date(ts).toISOString();
                }
              }
              list.push({
                ...data,
                id: data.id || docSnap.id,
                createdAt: createdAt || new Date().toISOString(),
                inStock: data.inStock ?? true,
                images: data.images || [],
              });
            });

            // CRITICAL: Protect newly/locally added products so they are never wiped by a cloud snapshot!
            const localProducts = this.getProducts();
            for (const localP of localProducts) {
              if (!list.some((p) => p.id === localP.id)) {
                list.unshift(localP);
                this.ensureAdminAuth().then(() => {
                  setDoc(doc(db, 'products', localP.id), cleanForFirestore(localP)).catch(() => {});
                });
              }
            }

            list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            this.saveProductsLocal(list);
            callback(list);
          } else {
            // Seed Firestore with initial products on first run
            this.seedInitialProducts();
            callback(this.getProducts());
          }
        },
        (error) => {
          console.warn('Firestore products sync error, falling back to local storage:', error);
          callback(this.getProducts());
        }
      );
    } catch (e) {
      console.warn('Failed to subscribe to products:', e);
      callback(this.getProducts());
      return () => {};
    }
  }

  public async seedInitialProducts(): Promise<void> {
    try {
      await this.ensureAdminAuth();
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), cleanForFirestore(prod), { merge: true });
      }
    } catch (e) {
      console.error('Error seeding initial products to Firestore:', e);
    }
  }

  public getProducts(): Product[] {
    if (!this.isBrowser()) return INITIAL_PRODUCTS;
    if (this.memoryProducts && this.memoryProducts.length > 0) {
      return this.memoryProducts;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        this.saveProductsLocal(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      this.memoryProducts = parsed;
      return parsed;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  private saveProductsLocal(products: Product[]): void {
    if (!this.isBrowser()) return;
    this.memoryProducts = products;

    // 1. High-capacity IndexedDB storage (unlimited quota, saves full base64 images safely)
    indexedDbService.saveAll(IDB_STORES.PRODUCTS, products).catch(() => {});

    // 2. Safe localStorage cache (uses lightweight metadata so 5MB quota is never exceeded)
    try {
      const lightweight = this.createLightweightProducts(products);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(lightweight));
    } catch (e: any) {
      console.warn('LocalStorage quota reached for products; full data safely preserved in IndexedDB & memory.');
      try {
        // Minimal emergency fallback with top 20 items and no images
        const minimal = products.slice(0, 20).map(({ id, titleRu, titleKz, price, oldPrice, categoryId, inStock, isHit, isNew, isSale, sku, createdAt }) => ({
          id, titleRu, titleKz, price, oldPrice, categoryId, inStock, isHit, isNew, isSale, sku, createdAt, images: []
        }));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(minimal));
      } catch {
        // Retained safely in memoryProducts and IndexedDB
      }
    }
  }

  public async saveProduct(product: Product): Promise<Product[]> {
    // 1. Ensure complete metadata and dates
    const productWithMeta: Product = {
      ...product,
      id: product.id || `prod-${Date.now()}`,
      createdAt: product.createdAt || new Date().toISOString(),
      inStock: product.inStock ?? true,
      images: product.images || [],
    };

    // 2. Instant local update
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productWithMeta.id);
    if (index >= 0) {
      products[index] = productWithMeta;
    } else {
      products.unshift(productWithMeta);
    }
    this.saveProductsLocal(products);

    // 3. Persist to Firestore in the cloud with authenticated admin session
    try {
      await this.ensureAdminAuth();
      const sanitized = cleanForFirestore(productWithMeta);
      await setDoc(doc(db, 'products', productWithMeta.id), sanitized);
      console.log('✅ Product successfully saved to Cloud Firestore:', productWithMeta.id);
    } catch (err) {
      console.error('❌ Error saving product to Firestore:', err);
    }

    return products;
  }

  public async deleteProduct(id: string): Promise<Product[]> {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.saveProductsLocal(products);

    try {
      await this.ensureAdminAuth();
      await deleteDoc(doc(db, 'products', id));
      console.log('✅ Product deleted from Cloud Firestore:', id);
    } catch (e) {
      console.error('Failed to delete product from Firestore:', e);
    }

    return products;
  }

  // --- Real-time Categories Sync ---
  public subscribeCategories(callback: (categories: Category[]) => void): () => void {
    if (!this.isBrowser()) {
      callback(INITIAL_CATEGORIES);
      return () => {};
    }

    try {
      const colRef = collection(db, 'categories');
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Category[] = [];
            let hasIherb = false;
            snapshot.forEach((docSnap) => {
              const cat = docSnap.data() as Category;
              list.push(cat);
              if (cat.id === 'cat-iherb') hasIherb = true;
            });
            // Automatically ensure iHerb Vitamins category exists
            if (!hasIherb) {
              const iherbCat = INITIAL_CATEGORIES.find((c) => c.id === 'cat-iherb')!;
              list.push(iherbCat);
              setDoc(doc(db, 'categories', iherbCat.id), iherbCat, { merge: true }).catch(() => {});
            }
            list.sort((a, b) => a.order - b.order);
            this.saveCategoriesLocal(list);
            callback(list);
          } else {
            this.seedInitialCategories();
            callback(this.getCategories());
          }
        },
        (error) => {
          console.warn('Firestore categories sync error:', error);
          callback(this.getCategories());
        }
      );
    } catch (e) {
      console.warn('Failed to subscribe to categories:', e);
      callback(this.getCategories());
      return () => {};
    }
  }

  public async seedInitialCategories(): Promise<void> {
    try {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
      }
    } catch (e) {
      console.error('Error seeding initial categories:', e);
    }
  }

  public getCategories(): Category[] {
    if (!this.isBrowser()) return INITIAL_CATEGORIES;
    if (this.memoryCategories && this.memoryCategories.length > 0) {
      return this.memoryCategories;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategoriesLocal(INITIAL_CATEGORIES);
        return INITIAL_CATEGORIES;
      }
      const parsed: Category[] = JSON.parse(data);
      if (!parsed.some((c) => c.id === 'cat-iherb')) {
        const iherb = INITIAL_CATEGORIES.find((c) => c.id === 'cat-iherb')!;
        parsed.push(iherb);
      }
      const sorted = parsed.sort((a: Category, b: Category) => a.order - b.order);
      this.memoryCategories = sorted;
      return sorted;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  private saveCategoriesLocal(categories: Category[]): void {
    if (!this.isBrowser()) return;
    this.memoryCategories = categories;
    indexedDbService.saveAll(IDB_STORES.CATEGORIES, categories).catch(() => {});
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('LocalStorage categories cache warning:', e);
    }
  }

  public async saveCategories(categories: Category[]): Promise<void> {
    this.saveCategoriesLocal(categories);
    try {
      await this.ensureAdminAuth();
      for (const cat of categories) {
        await setDoc(doc(db, 'categories', cat.id), cleanForFirestore(cat), { merge: true });
      }
    } catch (e) {
      console.error('Failed to sync categories to Firestore:', e);
    }
  }

  public async saveCategory(category: Category): Promise<Category[]> {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      cats[index] = category;
    } else {
      cats.push(category);
    }
    this.saveCategoriesLocal(cats);

    try {
      await this.ensureAdminAuth();
      await setDoc(doc(db, 'categories', category.id), cleanForFirestore(category));
    } catch (e) {
      console.error('Failed to save category to Firestore:', e);
    }

    return cats;
  }

  public async deleteCategory(id: string): Promise<Category[]> {
    const cats = this.getCategories().filter((c) => c.id !== id);
    this.saveCategoriesLocal(cats);

    try {
      await this.ensureAdminAuth();
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.error('Failed to delete category from Firestore:', e);
    }

    return cats;
  }

  // --- Real-time Orders Sync ---
  public subscribeOrders(callback: (orders: Order[]) => void): () => void {
    if (!this.isBrowser()) {
      callback([]);
      return () => {};
    }

    try {
      const colRef = collection(db, 'orders');
      return onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data() as any;
              // Clean out legacy demo or corrupted test documents
              if (
                !d ||
                d.id === 'ord-1001' ||
                docSnap.id === 'ord-1001' ||
                docSnap.id === 'test1' ||
                (!Array.isArray(d.items) && !d.orderNumber && !d.clientName)
              ) {
                this.ensureAdminAuth().then(() => {
                  deleteDoc(doc(db, 'orders', docSnap.id)).catch(() => {});
                });
                return;
              }

              const normalizedOrder: Order = {
                id: d.id || docSnap.id,
                orderNumber: d.orderNumber || `#${String(docSnap.id).replace(/\D/g, '').slice(-4) || '1001'}`,
                clientName: d.clientName || 'Покупатель',
                phone: d.phone || '',
                whatsapp: d.whatsapp || d.phone || '',
                city: d.city || 'Атырау',
                address: d.address || 'Самовывоз',
                deliveryMethod: d.deliveryMethod || 'delivery',
                paymentMethod: d.paymentMethod || 'whatsapp',
                items: Array.isArray(d.items) ? d.items : [],
                totalAmount: typeof d.totalAmount === 'number' && !isNaN(d.totalAmount) ? d.totalAmount : 0,
                status: d.status || 'new',
                createdAt: d.createdAt || new Date().toISOString(),
                comment: d.comment || '',
              };
              list.push(normalizedOrder);
            });

            list.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
            });

            this.saveOrdersLocal(list);
            callback(list);
          } else {
            callback(this.getOrders());
          }
        },
        (error) => {
          console.warn('Firestore orders sync notice:', error);
          callback(this.getOrders());
        }
      );
    } catch (e) {
      console.warn('Failed to subscribe to orders:', e);
      callback(this.getOrders());
      return () => {};
    }
  }

  public getOrders(): Order[] {
    if (!this.isBrowser()) return [];
    if (this.memoryOrders) {
      return this.memoryOrders;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        this.saveOrdersLocal([]);
        return [];
      }
      const parsed = JSON.parse(data);
      // Clean out legacy demo order ord-1001, test1, or broken items
      const cleaned: Order[] = Array.isArray(parsed)
        ? parsed
            .filter((o: any) => o && o.id !== 'ord-1001' && o.id !== 'test1' && (Array.isArray(o.items) || o.orderNumber))
            .map((o: any) => ({
              ...o,
              items: Array.isArray(o.items) ? o.items : [],
              totalAmount: typeof o.totalAmount === 'number' && !isNaN(o.totalAmount) ? o.totalAmount : 0,
              createdAt: o.createdAt || new Date().toISOString(),
              orderNumber: o.orderNumber || '#1001',
              clientName: o.clientName || 'Покупатель',
              phone: o.phone || '',
              status: o.status || 'new',
            }))
        : [];

      if (cleaned.length !== (parsed ? parsed.length : 0)) {
        this.saveOrdersLocal(cleaned);
      }
      this.memoryOrders = cleaned;
      return cleaned;
    } catch {
      return [];
    }
  }

  private saveOrdersLocal(orders: Order[]): void {
    if (!this.isBrowser()) return;
    this.memoryOrders = orders;
    indexedDbService.saveAll(IDB_STORES.ORDERS, orders).catch(() => {});
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage orders cache warning:', e);
    }
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Order {
    const orders = this.getOrders();
    const nextNum = orders.length > 0
      ? Math.max(...orders.map((o) => parseInt(String(o?.orderNumber || '').replace(/\D/g, '') || '1000', 10))) + 1
      : 1001;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `#${nextNum}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    orders.unshift(newOrder);
    this.saveOrdersLocal(orders);

    this.ensureAdminAuth().then(() => {
      setDoc(doc(db, 'orders', newOrder.id), cleanForFirestore(newOrder)).catch((err) => {
        console.error('Error saving order to Firestore:', err);
      });
    }).catch((e) => {
      console.error('Failed to authenticate for order saving:', e);
    });

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order[] {
    const orders = this.getOrders().map((o) => (o.id === orderId ? { ...o, status } : o));
    this.saveOrdersLocal(orders);

    this.ensureAdminAuth().then(() => {
      setDoc(doc(db, 'orders', orderId), { status }, { merge: true }).catch((err) => {
        console.error('Error updating order status in Firestore:', err);
      });
    }).catch((e) => {
      console.error('Failed to authenticate for order update:', e);
    });

    return orders;
  }

  public deleteOrder(orderId: string): Order[] {
    const orders = this.getOrders().filter((o) => o.id !== orderId);
    this.saveOrdersLocal(orders);

    this.ensureAdminAuth().then(() => {
      deleteDoc(doc(db, 'orders', orderId)).catch((err) => {
        console.error('Error deleting order from Firestore:', err);
      });
    }).catch((e) => {
      console.error('Failed to authenticate for order delete:', e);
    });

    return orders;
  }

  public clearAllOrders(): Order[] {
    const orders = this.getOrders();
    this.saveOrdersLocal([]);

    this.ensureAdminAuth().then(async () => {
      for (const o of orders) {
        deleteDoc(doc(db, 'orders', o.id)).catch(() => {});
      }
      try {
        const colRef = collection(db, 'orders');
        const snap = await getDocs(colRef);
        snap.forEach((d) => {
          deleteDoc(doc(db, 'orders', d.id)).catch(() => {});
        });
      } catch (err) {
        console.error('Error clearing orders collection:', err);
      }
    }).catch((e) => {
      console.error('Failed to authenticate for clearAllOrders:', e);
    });

    return [];
  }

  // --- Real-time Settings Sync ---
  public subscribeSettings(callback: (settings: StoreSettings) => void): () => void {
    if (!this.isBrowser()) {
      callback(INITIAL_SETTINGS);
      return () => {};
    }

    try {
      const docRef = doc(db, 'settings', 'general');
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = { ...INITIAL_SETTINGS, ...docSnap.data() } as StoreSettings;
            this.saveSettingsLocal(data);
            callback(data);
          } else {
            this.saveSettings(INITIAL_SETTINGS);
            callback(INITIAL_SETTINGS);
          }
        },
        (error) => {
          console.warn('Firestore settings sync error:', error);
          callback(this.getSettings());
        }
      );
    } catch (e) {
      console.warn('Failed to subscribe to settings:', e);
      callback(this.getSettings());
      return () => {};
    }
  }

  public getSettings(): StoreSettings {
    if (!this.isBrowser()) return INITIAL_SETTINGS;
    if (this.memorySettings) {
      return this.memorySettings;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettingsLocal(INITIAL_SETTINGS);
        return INITIAL_SETTINGS;
      }
      const parsed = JSON.parse(data);
      const merged: StoreSettings = { ...INITIAL_SETTINGS, ...parsed };
      // Auto-migrate to current 2GIS, Instagram, address, and adminPin
      if (!merged.gis2Url || merged.instagram === 'muslimshop_atyrau' || merged.address.includes('Байзар') || merged.adminPin === '1234') {
        merged.gis2Url = INITIAL_SETTINGS.gis2Url;
        merged.instagram = INITIAL_SETTINGS.instagram;
        merged.address = INITIAL_SETTINGS.address;
        if (merged.adminPin === '1234') {
          merged.adminPin = '505534';
        }
        this.saveSettingsLocal(merged);
      }
      this.memorySettings = merged;
      return merged;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  private saveSettingsLocal(settings: StoreSettings): void {
    if (!this.isBrowser()) return;
    this.memorySettings = settings;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage settings cache warning:', e);
    }
  }

  public async saveSettings(settings: StoreSettings): Promise<void> {
    this.saveSettingsLocal(settings);

    try {
      await this.ensureAdminAuth();
      await setDoc(doc(db, 'settings', 'general'), cleanForFirestore(settings), { merge: true });
    } catch (e) {
      console.error('Failed to save settings to Firestore:', e);
    }
  }

  // --- Language ---
  public getLanguage(): 'ru' | 'kz' {
    if (!this.isBrowser()) return 'ru';
    try {
      const lang = localStorage.getItem(STORAGE_KEYS.LANG);
      return lang === 'kz' ? 'kz' : 'ru';
    } catch {
      return 'ru';
    }
  }

  public setLanguage(lang: 'ru' | 'kz'): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {}
  }

  // Reset to factory defaults
  public resetToDefaults(): void {
    this.saveProductsLocal(INITIAL_PRODUCTS);
    this.saveCategoriesLocal(INITIAL_CATEGORIES);
    this.saveOrdersLocal(INITIAL_ORDERS);
    this.saveSettingsLocal(INITIAL_SETTINGS);
    this.seedInitialProducts();
    this.seedInitialCategories();
    this.saveSettings(INITIAL_SETTINGS);
  }
}

export const storageService = new StorageService();
