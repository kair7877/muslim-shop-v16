import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Language, Product, Category, CartItem, Order, StoreSettings, 
  SortOption, DeliveryMethod, PaymentMethod, OrderStatus 
} from './types';
import { storageService } from './services/storageService';
import { translations } from './translations';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryGrid, PRIMARY_CATEGORIES, EXPANDED_CATEGORIES, isProductMatchingCategory } from './components/CategoryGrid';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { SearchAndFilterModal } from './components/SearchAndFilterModal';
import { BottomNav } from './components/BottomNav';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { PrayerTimesWidget } from './components/PrayerTimesWidget';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { 
  parseProductSlugFromUrl, findProductBySlug, getProductSlug, updateProductSeo, getAppBasePath 
} from './utils/productSlug';
import { Search, SlidersHorizontal, ShoppingBag, X, Clock, Sparkles, Flame, ArrowRight } from 'lucide-react';

const CART_STORAGE_KEY = 'muslim_shop_cart_v1';
const RECENTLY_VIEWED_STORAGE_KEY = 'muslim_shop_recently_viewed_v1';

export default function App() {
  // Persistence & Core Domain State
  const [language, setLanguageState] = useState<Language>(() => storageService.getLanguage());
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [settings, setSettings] = useState<StoreSettings>(() => storageService.getSettings());

  // Cart State with LocalStorage sync
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart]);

  // Session-based Recently Viewed Products State
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time Cloud Sync with Firebase Firestore
  useEffect(() => {
    const unsubProducts = storageService.subscribeProducts((prods) => {
      setProducts(prods);
    });
    const unsubCategories = storageService.subscribeCategories((cats) => {
      setCategories(cats);
    });
    const unsubOrders = storageService.subscribeOrders((ords) => {
      setOrders(ords);
    });
    const unsubSettings = storageService.subscribeSettings((sett) => {
      setSettings(sett);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubSettings();
    };
  }, []);

  // Modals & Navigation Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [showPrayerOnHomepage, setShowPrayerOnHomepage] = useState(true);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Scroll preservation and history tracking for product modal
  const savedScrollPositionRef = useRef<number>(0);
  const lastOpenedProductIdRef = useRef<string | null>(null);
  const modalHistoryPushedRef = useRef<boolean>(false);

  // Sync state refs for popstate handler
  const selectedProductRef = useRef<Product | null>(null);
  const productsRef = useRef<Product[]>(products);
  const languageRef = useRef<Language>(language);
  const settingsRef = useRef<StoreSettings>(settings);
  const isCartOpenRef = useRef(false);
  const isCheckoutOpenRef = useRef(false);
  const isSearchFilterOpenRef = useRef(false);
  const isAdminOpenRef = useRef(false);
  const isPrayerModalOpenRef = useRef(false);

  useEffect(() => {
    selectedProductRef.current = selectedProduct;
  }, [selectedProduct]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    isCartOpenRef.current = isCartOpen;
  }, [isCartOpen]);

  useEffect(() => {
    isCheckoutOpenRef.current = isCheckoutOpen;
  }, [isCheckoutOpen]);

  useEffect(() => {
    isSearchFilterOpenRef.current = isSearchFilterOpen;
  }, [isSearchFilterOpen]);

  useEffect(() => {
    isAdminOpenRef.current = isAdminOpen;
  }, [isAdminOpen]);

  useEffect(() => {
    isPrayerModalOpenRef.current = isPrayerModalOpen;
  }, [isPrayerModalOpen]);

  // Initial check on mount & whenever products load to see if a direct product URL was requested
  const hasHandledInitialUrlRef = useRef(false);
  useEffect(() => {
    if (!products || products.length === 0) return;

    const slug = parseProductSlugFromUrl();
    if (slug) {
      const found = findProductBySlug(products, slug);
      if (found) {
        setSelectedProduct(found);
        lastOpenedProductIdRef.current = found.id;
        updateProductSeo(found, language, settings);
        hasHandledInitialUrlRef.current = true;
        return;
      }
    }

    if (!hasHandledInitialUrlRef.current) {
      updateProductSeo(null, language, settings);
      hasHandledInitialUrlRef.current = true;
    }
  }, [products, language, settings]);

  // Back button interception & Exit Confirmation Dialog
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const allowExitRef = useRef(false);

  const restoreCatalogScroll = (savedY: number, prodId: string | null) => {
    // Restore exact scroll position
    window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    });
    setTimeout(() => {
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
      if (savedY <= 0 && prodId) {
        const el = document.getElementById(`product-card-${prodId}`);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
        }
      }
    }, 40);
  };

  const handleOpenProduct = (product: Product, updateUrl = true) => {
    // Save exact scroll position before opening modal
    const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    savedScrollPositionRef.current = currentScroll;
    lastOpenedProductIdRef.current = product.id;

    setSelectedProduct(product);
    updateProductSeo(product, language, settings);

    // Track recently viewed product in current session (up to 12 items, newest first)
    setRecentlyViewedIds((prev) => {
      const updated = [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 12);
      try {
        sessionStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recently viewed to sessionStorage', e);
      }
      return updated;
    });

    // Update URL to clean product URL and push to history without breaking subpath
    if (updateUrl && typeof window !== 'undefined') {
      const slug = getProductSlug(product);
      try {
        const basePath = getAppBasePath();
        const targetUrl = basePath !== '/' ? `${basePath}?product=${slug}` : `/product/${slug}`;
        window.history.pushState({ modal: 'product', id: product.id, slug }, '', targetUrl);
        modalHistoryPushedRef.current = true;
      } catch (e) {
        console.error('History pushState failed', e);
      }
    }
  };

  const handleCloseProduct = (fromPopState = false) => {
    const savedY = savedScrollPositionRef.current;
    const prodId = lastOpenedProductIdRef.current;

    setSelectedProduct(null);
    updateProductSeo(null, language, settings);

    const basePath = getAppBasePath();

    // If closed via on-screen button ("Назад", "X", outside click), reset URL to root
    if (!fromPopState) {
      if (modalHistoryPushedRef.current) {
        modalHistoryPushedRef.current = false;
        try {
          window.history.back();
        } catch (e) {
          window.history.replaceState({ guard: 'muslim_shop' }, '', basePath);
        }
      } else {
        try {
          window.history.replaceState({ guard: 'muslim_shop' }, '', basePath);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      modalHistoryPushedRef.current = false;
      const slug = parseProductSlugFromUrl();
      if (slug) {
        try {
          window.history.replaceState({ guard: 'muslim_shop' }, '', basePath);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Restore scroll position so user returns to the exact same browsing spot
    restoreCatalogScroll(savedY, prodId);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Push initial guard state to history
    try {
      window.history.pushState({ guard: 'muslim_shop' }, '', window.location.href);
    } catch (e) {
      console.error('History pushState failed', e);
    }

    const handlePopState = () => {
      // Check if current URL after popstate points to a specific product
      const currentSlug = parseProductSlugFromUrl();
      if (currentSlug) {
        const matched = findProductBySlug(productsRef.current, currentSlug);
        if (matched) {
          setSelectedProduct(matched);
          updateProductSeo(matched, languageRef.current, settingsRef.current);
          return;
        }
      }

      // If user clicked "Да, выйти", allow standard back navigation
      if (allowExitRef.current) {
        return;
      }

      // Priority 1: If product modal is open, close product and preserve scroll!
      if (selectedProductRef.current) {
        handleCloseProduct(true);
        return;
      }

      // Priority 2: If any other modal/drawer is open, close it
      if (isCartOpenRef.current) {
        setIsCartOpen(false);
        return;
      }
      if (isCheckoutOpenRef.current) {
        setIsCheckoutOpen(false);
        return;
      }
      if (isSearchFilterOpenRef.current) {
        setIsSearchFilterOpen(false);
        return;
      }
      if (isAdminOpenRef.current) {
        setIsAdminOpen(false);
        return;
      }
      if (isPrayerModalOpenRef.current) {
        setIsPrayerModalOpen(false);
        return;
      }

      // Priority 3: Only when user is on the base catalog page with no modals open,
      // intercept exit and show the confirmation modal
      try {
        window.history.pushState({ guard: 'muslim_shop' }, '', window.location.href);
      } catch (e) {
        console.error('History pushState failed', e);
      }

      // Show exit confirmation modal
      setShowExitConfirm(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleStayInStore = () => {
    setShowExitConfirm(false);
  };

  const handleConfirmExit = () => {
    allowExitRef.current = true;
    setShowExitConfirm(false);

    // Unwind the guard entries so the browser actually goes back
    try {
      window.history.go(-2);
    } catch {
      window.history.back();
    }

    // Fallback if window opened directly and cannot go back
    setTimeout(() => {
      try {
        window.close();
      } catch {
        // Safe fallback
      }
    }, 300);
  };

  // Search, Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(false);

  // Bottom Mobile Nav Tab
  const [mobileTab, setMobileTab] = useState<'home' | 'search' | 'catalog' | 'prayer' | 'cart' | 'admin'>('home');

  const catalogRef = useRef<HTMLDivElement>(null);
  const prayerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const handleLanguageChange = (newLang: Language) => {
    setLanguageState(newLang);
    storageService.setLanguage(newLang);
  };

  const handleScrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToPrayer = () => {
    if (prayerRef.current) {
      prayerRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsPrayerModalOpen(true);
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order Submission Handler (1-click WhatsApp flow)
  const handleSubmitOrder = (orderData: {
    clientName: string;
    phone: string;
    whatsapp?: string;
    city: string;
    address: string;
    comment?: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod?: PaymentMethod;
  }) => {
    const totalAmount = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      title: language === 'ru' ? item.product.titleRu : (item.product.titleKz || item.product.titleRu),
      price: item.product.price,
      quantity: item.quantity,
      sku: item.product.sku,
    }));

    const newOrder = storageService.createOrder({
      ...orderData,
      paymentMethod: orderData.paymentMethod || 'whatsapp',
      items: orderItems,
      totalAmount,
    });

    setOrders(storageService.getOrders());
    setCart([]);
    setIsCheckoutOpen(false);
    setCompletedOrder(newOrder);

    return newOrder;
  };

  // Admin Handlers
  const handleSaveProduct = async (prod: Product) => {
    const updated = await storageService.saveProduct(prod);
    setProducts([...updated]);
  };

  const handleDeleteProduct = async (id: string) => {
    const updated = await storageService.deleteProduct(id);
    setProducts([...updated]);
    if (selectedProduct?.id === id) {
      handleCloseProduct();
    }
  };

  const handleSaveCategory = async (cat: Category) => {
    const updated = await storageService.saveCategory(cat);
    setCategories([...updated]);
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = await storageService.deleteCategory(id);
    setCategories([...updated]);
  };

  const handleReorderCategories = async (newCats: Category[]) => {
    await storageService.saveCategories(newCats);
    setCategories([...newCats]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = storageService.updateOrderStatus(orderId, status);
    setOrders([...updated]);
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = storageService.deleteOrder(orderId);
    setOrders([...updated]);
  };

  const handleClearAllOrders = () => {
    const updated = storageService.clearAllOrders();
    setOrders([...updated]);
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    await storageService.saveSettings(newSettings);
    setSettings({ ...newSettings });
  };

  const handleResetDefaults = () => {
    storageService.resetToDefaults();
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
    setOrders(storageService.getOrders());
    setSettings(storageService.getSettings());
  };

  // Filter & Search Engine
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.isHidden) return false;

      // Category matching
      if (selectedCategoryId) {
        if (!isProductMatchingCategory(product, selectedCategoryId)) {
          return false;
        }
      }

      // In-stock filter
      if (onlyInStock && !product.inStock) return false;

      // Sale filter
      if (onlySale && !product.isSale) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const category = categories.find((c) => c.id === product.categoryId);
        const matchTitle = (product.titleRu || '').toLowerCase().includes(q) || (product.titleKz?.toLowerCase().includes(q) ?? false);
        const matchDesc = (product.descriptionRu || '').toLowerCase().includes(q) || (product.descriptionKz?.toLowerCase().includes(q) ?? false);
        const matchSpecs = product.specsRu?.toLowerCase().includes(q) || (product.specsKz?.toLowerCase().includes(q) ?? false);
        const matchSku = product.sku?.toLowerCase().includes(q) ?? false;
        const matchCat = (category?.nameRu || '').toLowerCase().includes(q) || (category?.nameKz?.toLowerCase().includes(q) ?? false);

        if (!matchTitle && !matchDesc && !matchSpecs && !matchSku && !matchCat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        if (a.isHit && !b.isHit) return -1;
        if (!a.isHit && b.isHit) return 1;
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'newest') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      return 0;
    });
  }, [products, selectedCategoryId, onlyInStock, onlySale, searchQuery, sortBy, categories]);

  // Curated Hit Products for Homepage
  const hitProducts = useMemo(() => {
    return products
      .filter((p) => !p.isHidden && (p.isHit || p.categoryId === 'cat-hits'))
      .slice(0, 8);
  }, [products]);

  // Curated New Arrivals for Homepage
  const newProducts = useMemo(() => {
    return products
      .filter((p) => !p.isHidden && (p.isNew || p.categoryId === 'cat-new'))
      .slice(0, 8);
  }, [products]);

  // Selected Category Object & Title
  const currentCategoryTitle = useMemo(() => {
    if (!selectedCategoryId) return t.allProducts;
    const allGridCats = [...PRIMARY_CATEGORIES, ...EXPANDED_CATEGORIES];
    const gridMatch = allGridCats.find((c) => c.id === selectedCategoryId);
    if (gridMatch) {
      return `${gridMatch.icon} ${language === 'kz' ? gridMatch.nameKz : gridMatch.nameRu}`;
    }
    const currentCategory = categories.find((c) => c.id === selectedCategoryId);
    if (currentCategory) {
      return `${currentCategory.icon || '📦'} ${language === 'ru' ? currentCategory.nameRu : (currentCategory.nameKz || currentCategory.nameRu)}`;
    }
    return t.allProducts;
  }, [selectedCategoryId, language, categories, t.allProducts]);

  // Mobile Bottom Navigation Tab Switcher
  const handleMobileNavTab = (tab: 'home' | 'search' | 'catalog' | 'prayer' | 'cart' | 'admin') => {
    setMobileTab(tab);
    if (tab === 'home') {
      setSelectedCategoryId(null);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'prayer') {
      setIsPrayerModalOpen(true);
    } else if (tab === 'search') {
      setIsSearchFilterOpen(true);
    } else if (tab === 'catalog') {
      handleScrollToCatalog();
    } else if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'admin') {
      setIsAdminOpen(true);
    }
  };

  // Recently Viewed Products memo and clear handler
  const recentlyViewedProducts = useMemo(() => {
    if (recentlyViewedIds.length === 0) return [];
    const productMap = new Map(products.map((p) => [p.id, p]));
    return recentlyViewedIds
      .map((id) => productMap.get(id))
      .filter((p): p is Product => Boolean(p && !p.isHidden));
  }, [recentlyViewedIds, products]);

  const handleClearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      sessionStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear recently viewed from sessionStorage', e);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Header with Language RU/KZ, 2GIS, Instagram, Prayer Times, Search, Cart */}
      <Header
        language={language}
        settings={settings}
        onLanguageChange={handleLanguageChange}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchFilterOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPrayerTimes={() => setIsPrayerModalOpen(true)}
        onLogoClick={() => {
          setSelectedCategoryId(null);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        storeName={settings.storeName}
      />

      <main className="flex-grow">
        {/* 2. Desktop Hero Banner (hidden on mobile for instant categories focus) */}
        <div className="hidden md:block">
          <Hero
            language={language}
            settings={settings}
            onScrollToCatalog={handleScrollToCatalog}
          />
        </div>

        {/* 3. Modern Category Grid (2 columns x 3 rows on mobile, expandable) */}
        <CategoryGrid
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            handleScrollToCatalog();
          }}
          language={language}
        />

        {/* 4. Product Catalog Blocks */}
        {!selectedCategoryId && !searchQuery.trim() && !onlyInStock && !onlySale ? (
          <>
            {/* Block 1: 🔥 Хиты продаж */}
            {hitProducts.length > 0 && (
              <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <div>
                      <h3 className="font-serif text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>{language === 'kz' ? 'Хит өнімдер' : 'Хиты продаж'}</span>
                        <span className="text-xs font-mono font-bold text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                          {hitProducts.length}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        {language === 'kz' ? 'Ең көп сұранысқа ие тауарлар' : 'Самые популярные позиции каталога'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId('cat-hits');
                      handleScrollToCatalog();
                    }}
                    className="text-xs sm:text-sm text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 group cursor-pointer"
                  >
                    <span>{language === 'kz' ? 'Барлығын көру' : 'Смотреть все'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                  {hitProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={`hit-${product.id}`}
                      product={product}
                      language={language}
                      whatsappNumber={settings.whatsappNumber}
                      onSelectProduct={(p) => handleOpenProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={(p) => handleBuyNow(p, 1)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Block 2: ✨ Новинки */}
            {newProducts.length > 0 && (
              <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <div>
                      <h3 className="font-serif text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>{language === 'kz' ? 'Жаңа өнімдер' : 'Новинки'}</span>
                        <span className="text-xs font-mono font-bold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                          {newProducts.length}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        {language === 'kz' ? 'Жаңадан түскен тауарлар' : 'Свежие поступления в магазин'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId('cat-new');
                      handleScrollToCatalog();
                    }}
                    className="text-xs sm:text-sm text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 group cursor-pointer"
                  >
                    <span>{language === 'kz' ? 'Барлығын көру' : 'Смотреть все'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                  {newProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={`new-${product.id}`}
                      product={product}
                      language={language}
                      whatsappNumber={settings.whatsappNumber}
                      onSelectProduct={(p) => handleOpenProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={(p) => handleBuyNow(p, 1)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Block 3: Рекомендуемые товары / Каталог с поиском и фильтром */}
            <section ref={catalogRef} className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                      {language === 'kz' ? 'Ұсынылатын тауарлар' : 'Рекомендуемые товары'}
                    </h2>
                    <span className="text-xs text-gray-500 font-mono">
                      ({filteredProducts.length})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {language === 'kz' ? 'Ассортименттегі барлық тауарлар' : 'Все товары из ассортимента магазина'}
                  </p>
                </div>

                {/* Quick search input and filter button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-amber-600 outline-none transition-colors shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setIsSearchFilterOpen(true)}
                    className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs ${
                      onlyInStock || onlySale || sortBy !== 'popular'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    title={t.filters}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    <span className="hidden sm:inline">{t.filters}</span>
                  </button>
                </div>
              </div>

              {/* Product Grid: 2 columns on mobile, 4 columns on desktop */}
              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-700">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">
                    {t.noProductsFound}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-5">
                    {language === 'kz' 
                      ? 'Іздеу сұрауын өзгертіп көріңіз немесе сүзгілерді тазартыңыз' 
                      : 'Попробуйте изменить поисковый запрос или сбросить фильтры'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId(null);
                      setOnlyInStock(false);
                      setOnlySale(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      language={language}
                      whatsappNumber={settings.whatsappNumber}
                      onSelectProduct={(p) => handleOpenProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={(p) => handleBuyNow(p, 1)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Filtered or Searched Catalog Section */
          <section ref={catalogRef} className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                    {currentCategoryTitle}
                  </h2>
                  <span className="text-xs text-gray-500 font-mono">
                    ({filteredProducts.length})
                  </span>
                </div>
                {selectedCategoryId && (
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        setSelectedCategoryId(null);
                        setSearchQuery('');
                      }}
                      className="text-xs sm:text-sm text-amber-700 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>✕ {language === 'kz' ? 'Сүзгіні тазарту' : 'Показать все товары'}</span>
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="text-xs sm:text-sm text-amber-800 font-medium mt-0.5">
                    {language === 'kz' ? 'Сұраныс бойынша іздеу:' : 'Поиск по запросу:'} «{searchQuery}»
                  </div>
                )}
              </div>

              {/* Quick search input and filter button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-amber-600 outline-none transition-colors shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsSearchFilterOpen(true)}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs ${
                    onlyInStock || onlySale || sortBy !== 'popular'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={t.filters}
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">{t.filters}</span>
                </button>
              </div>
            </div>

            {/* Product Grid: 2 columns on mobile, 4 columns on desktop */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-700">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">
                  {t.noProductsFound}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-5">
                  {language === 'kz' 
                    ? 'Іздеу сұрауын өзгертіп көріңіз немесе сүзгілерді тазартыңыз' 
                    : 'Попробуйте изменить поисковый запрос или сбросить фильтры'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                    setOnlyInStock(false);
                    setOnlySale(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
                >
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    language={language}
                    whatsappNumber={settings.whatsappNumber}
                    onSelectProduct={(p) => handleOpenProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 6. Recently Viewed Products (Current Session) */}
        {recentlyViewedProducts.length > 0 && (
          <RecentlyViewed
            products={recentlyViewedProducts}
            language={language}
            whatsappNumber={settings.whatsappNumber}
            onSelectProduct={(p) => handleOpenProduct(p)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onBuyNow={(p) => handleBuyNow(p, 1)}
            onClear={handleClearRecentlyViewed}
          />
        )}

        {/* 7. Trust & Quality Banner with 1-click WhatsApp messaging */}
        <section className="bg-white border-y border-gray-200 py-8 px-4 my-6 shadow-2xs">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-2 font-serif font-bold text-base shadow-2xs">
                100%
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                {language === 'kz' ? 'Табиғи Halal өнімдер' : 'Оригинальная Halal продукция'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                {language === 'kz' 
                  ? 'Сертификатталған, тікелей сенімді өндірушілерден' 
                  : 'Сертифицированные бренды, натуральные компоненты'}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-2 text-lg shadow-2xs">
                📦
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                {language === 'kz' ? 'Қазақстан бойынша жеткізу' : 'Доставка по всему Казахстану'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                {language === 'kz' 
                  ? 'Атырау қаласында сол күні, басқа қалаларға Қазпошта / СДЭК' 
                  : 'Курьером по Атырау в день заказа, по регионам через Казпочту'}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-2 text-lg shadow-2xs">
                💬
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                {language === 'kz' ? 'WhatsApp-та 1 басумен тапсырыс' : 'Быстрый заказ через WhatsApp'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                {language === 'kz' 
                  ? '+7 778 175-42-41 нөміріне бір басумен хабарлама жіберу' 
                  : 'Прямая связь с консультантом бутика в один клик: +7 778 175-42-41'}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <Footer
        settings={settings}
        language={language}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 8. Mobile Bottom Fixed Navigation with Prayer tab */}
      <BottomNav
        currentTab={mobileTab}
        onChangeTab={handleMobileNavTab}
        cartCount={totalCartCount}
        language={language}
      />

      {/* 9. Dedicated Prayer Times Modal */}
      {isPrayerModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsPrayerModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕌</span>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900">
                    {t.prayerTimes}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'kz' ? 'Қазақстан қалалары үшін ресми есеп' : 'Точное расписание для городов Казахстана'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrayerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto">
              <PrayerTimesWidget language={language} />
            </div>
          </div>
        </div>
      )}

      {/* 10. Full Product Modal Details Page */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          language={language}
          whatsappNumber={settings.whatsappNumber}
          onClose={() => handleCloseProduct(false)}
          onAddToCart={(p, qty) => handleAddToCart(p, qty)}
          onBuyNow={(p, qty) => handleBuyNow(p, qty)}
        />
      )}

      {/* 11. Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        language={language}
        whatsappNumber={settings.whatsappNumber}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onOpenCatalog={() => {
          setIsCartOpen(false);
          handleScrollToCatalog();
        }}
      />

      {/* 12. Checkout Modal with 1-click WhatsApp order */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        language={language}
        defaultCity={settings.city}
        whatsappNumber={settings.whatsappNumber}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* 13. Order Success Screen */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          language={language}
          whatsappNumber={settings.whatsappNumber}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* 14. Search & Filter Sheet Modal */}
      {isSearchFilterOpen && (
        <SearchAndFilterModal
          isOpen={isSearchFilterOpen}
          onClose={() => setIsSearchFilterOpen(false)}
          categories={categories}
          language={language}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onlyInStock={onlyInStock}
          onToggleInStock={setOnlyInStock}
          onlySale={onlySale}
          onToggleSale={setOnlySale}
          onReset={() => {
            setSearchQuery('');
            setSelectedCategoryId(null);
            setSortBy('popular');
            setOnlyInStock(false);
            setOnlySale(false);
          }}
        />
      )}

      {/* 15. Admin Suite */}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          categories={categories}
          orders={orders}
          settings={settings}
          language={language}
          onClose={() => setIsAdminOpen(false)}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onClearAllOrders={handleClearAllOrders}
          onSaveSettings={handleSaveSettings}
          onResetDefaults={handleResetDefaults}
        />
      )}

      {/* 16. Exit Confirmation Dialog for Browser/Mobile Back Button */}
      <ExitConfirmModal
        isOpen={showExitConfirm}
        onStay={handleStayInStore}
        onExit={handleConfirmExit}
        language={language}
      />
    </div>
  );
}
