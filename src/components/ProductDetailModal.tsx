import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Heart,
  MessageCircle,
  Zap,
  MapPin,
  Clock,
  Eye,
  Share2,
  Check,
  Globe,
  Loader2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { AccessibilitySettings, Language, Product, StoreConfig } from '../types';
import { formatPrice, getProductDirectUrl, copyTextToClipboard, shareOrCopyProduct } from '../utils/formatters';
import { applyProductSeoMeta } from '../utils/seoMeta';
import { getFrequentlyBoughtTogether } from '../utils/recommendations';
import {
  getProductKazakhTranslation,
  hasExplicitKazakhTranslation,
  isGenuinelyKazakh,
  TranslatedProductData,
} from '../services/translationService';

interface ProductDetailModalProps {
  product: Product;
  allProducts?: Product[];
  config: StoreConfig;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  accessibility: AccessibilitySettings;
  isFavorite: boolean;
  cartQuantity?: number;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart?: (productId: string) => void;
  onQuickOrder: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onOpenCart?: () => void;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  config,
  lang,
  onLanguageChange,
  accessibility,
  isFavorite,
  cartQuantity = 0,
  onToggleFavorite,
  onAddToCart,
  onRemoveFromCart,
  onQuickOrder,
  onSelectProduct,
  onOpenCart,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(
    accessibility.scale === 'extra' ? 150 : accessibility.scale === 'large' ? 125 : 100
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'benefits' | 'howTo' | 'specs'>('desc');
  const [isHighContrastReader, setIsHighContrastReader] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isAddedToCartFeedback, setIsAddedToCartFeedback] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [previousProducts, setPreviousProducts] = useState<Product[]>([]);

  const handleAnimatedClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 170);
  }, [onClose]);

  const handleBackAction = useCallback(() => {
    if (previousProducts.length > 0 && onSelectProduct) {
      const prevProd = previousProducts[previousProducts.length - 1];
      setPreviousProducts((stack) => stack.slice(0, -1));
      setSelectedImageIndex(0);
      setActiveTab('desc');
      onSelectProduct(prevProd);
      if (scrollBodyRef.current) {
        scrollBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      handleAnimatedClose();
    }
  }, [previousProducts, onSelectProduct, handleAnimatedClose]);

  // Active language inside modal (synchronized with store language)
  const [currentLang, setCurrentLang] = useState<Language>(lang);
  const [translatedKzData, setTranslatedKzData] = useState<TranslatedProductData | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  // Translation runner with support for force refresh
  const runKazakhTranslation = useCallback(
    async (forceRefresh: boolean = false) => {
      // If the product in DB already has genuine Kazakh description, use it directly
      if (!forceRefresh && hasExplicitKazakhTranslation(product)) {
        setTranslatedKzData({
          titleKz: product.titleKz || product.titleRu,
          descriptionKz: product.descriptionKz!,
          specsKz: product.specsKz || product.specsRu || '',
          benefitsKz:
            product.benefitsKz && product.benefitsKz.length > 0 ? product.benefitsKz : product.benefitsRu,
          howToUseKz: product.howToUseKz || product.howToUseRu || '',
        });
        return;
      }

      setIsTranslating(true);
      try {
        const data = await getProductKazakhTranslation(product, forceRefresh);
        if (data && data.descriptionKz) {
          setTranslatedKzData(data);
        }
      } catch (err) {
        console.warn('Translation execution failed:', err);
      } finally {
        setIsTranslating(false);
      }
    },
    [product]
  );

  // Automatic high-quality translation to Kazakh when viewing in Kazakh
  useEffect(() => {
    if (currentLang === 'kz') {
      runKazakhTranslation(false);
    }
  }, [product.id, currentLang, runKazakhTranslation]);

  const handleLangSwitch = (newLang: Language) => {
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    if (newLang === 'kz') {
      runKazakhTranslation(false);
    }
  };

  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);

  // Lock background scroll & handle Escape key
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Ensure modal scroll starts from the top
    if (backdropRef.current) backdropRef.current.scrollTop = 0;
    if (scrollBodyRef.current) scrollBodyRef.current.scrollTop = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAnimatedClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleAnimatedClose]);

  const handleAddToCartClick = () => {
    onAddToCart(product);
    setIsAddedToCartFeedback(true);
    setTimeout(() => {
      setIsAddedToCartFeedback(false);
    }, 4000);
  };

  const isKz = currentLang === 'kz';

  // Title: prioritize genuine Kazakh translation
  const title = isKz
    ? (translatedKzData?.titleKz || (hasExplicitKazakhTranslation(product) ? product.titleKz : null) || product.titleRu)
    : product.titleRu;

  // Description: prioritize genuine Kazakh translation
  const description = isKz
    ? (translatedKzData?.descriptionKz || (hasExplicitKazakhTranslation(product) ? product.descriptionKz : null) || product.descriptionRu)
    : product.descriptionRu;

  const specs = isKz
    ? (translatedKzData?.specsKz || product.specsKz || product.specsRu || '')
    : (product.specsRu || '');

  const benefits = isKz
    ? (translatedKzData?.benefitsKz || (product.benefitsKz && product.benefitsKz.length > 0 ? product.benefitsKz : product.benefitsRu))
    : product.benefitsRu;

  const howToUse = isKz
    ? (translatedKzData?.howToUseKz || product.howToUseKz || product.howToUseRu)
    : product.howToUseRu;

  // Dynamically generate SEO meta tags, OpenGraph, Twitter Card & Schema.org Product JSON-LD for this product
  useEffect(() => {
    applyProductSeoMeta(product, config, currentLang, title, description);
  }, [product, config, currentLang, title, description]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 225));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 100));
  const handleResetZoom = () =>
    setZoomLevel(accessibility.scale === 'extra' ? 150 : accessibility.scale === 'large' ? 125 : 100);

  // Dynamic font size and line height based on zoomLevel (larger base for mobile readability)
  const dynamicFontSize = `${(zoomLevel / 100) * 1.12}rem`;
  const dynamicLineHeight = `${(zoomLevel / 100) * 1.88}rem`;

  const recommendedProducts = React.useMemo(
    () => getFrequentlyBoughtTogether(product, allProducts, [], 4),
    [product, allProducts]
  );

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const waDirectMessage = encodeURIComponent(
    !product.inStock
      ? (isKz
          ? `Сәлеметсіз бе, ${config.storeName}! Мына өнім қашан сатылымға шығады? Келуін күтіп жатырмын:\n${title} (арт: ${product.sku}, бағасы: ${formatPrice(product.price)}). Келгенде хабарласыңызшы!`
          : `Здравствуйте, ${config.storeName}! Подскажите, когда появится в наличии товар:\n${title} (арт: ${product.sku}, цена: ${formatPrice(product.price)}). Хочу забронировать / оформить предзаказ!`)
      : (isKz
          ? `Сәлеметсіз бе, ${config.storeName}! Маған мына өнім бойынша толық ақпарат беріңізші:\n${title} (арт: ${product.sku}, бағасы: ${formatPrice(product.price)})`
          : `Здравствуйте, ${config.storeName}! Меня интересует товар:\n${title} (арт: ${product.sku}, цена: ${formatPrice(product.price)}). Хочу заказать!`)
  );

  const modalElement = (
    <motion.div
      ref={backdropRef}
      id="product-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={handleAnimatedClose}
    >
      <motion.div
        id="product-modal-container"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{
          opacity: isClosing ? 0 : 1,
          scale: isClosing ? 0.96 : 1,
          y: isClosing ? 10 : 0,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#141414] text-white border border-[#2E2E2E] overflow-hidden flex flex-col will-change-transform ${
          isFullscreen
            ? 'fixed inset-0 w-full h-full rounded-none z-[110]'
            : 'w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl my-0 sm:my-auto'
        }`}
      >
        {/* Top Control Bar: Dark Graphite & Gold Accents */}
        <div
          id="modal-control-bar"
          className="bg-[#1C1C1C] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-[#2A2A2A] shrink-0"
        >
          {/* Left: Back Button & Zoom Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              id="modal-back-btn"
              onClick={handleBackAction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white border border-[#383838] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              title={
                previousProducts.length > 0
                  ? isKz
                    ? 'Алдыңғы тауарға оралу'
                    : 'Назад к предыдущему товару'
                  : isKz
                  ? 'Каталогқа оралу'
                  : 'Назад в каталог'
              }
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span>{isKz ? 'Артқа' : 'Назад'}</span>
            </button>

            <span className="hidden md:inline text-xs text-[#A3A3A3] font-semibold ml-1 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
              {lang === 'kz' ? 'Масштаб:' : 'Масштаб:'}
            </span>

            <button
              id="zoom-out-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 100}
              className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] disabled:opacity-40 text-white border border-[#383838] transition-colors cursor-pointer"
              title="Уменьшить шрифт"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span
              id="zoom-percentage-badge"
              className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#242424] border border-[#3A3A3A] text-[#C5A059] font-bold text-xs"
            >
              {zoomLevel}%
            </span>

            <button
              id="zoom-in-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 225}
              className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] disabled:opacity-40 text-white border border-[#383838] transition-colors cursor-pointer"
              title="Увеличить шрифт"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {zoomLevel !== 100 && (
              <button
                id="zoom-reset-btn"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-[#A3A3A3] border border-[#383838] transition-colors cursor-pointer"
                title="Сбросить масштаб"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right controls: Language Switcher, Share/Copy Link, Fullscreen toggle & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Language Toggle [ ҚАЗ | РУС ] */}
            <div className="flex items-center rounded-lg bg-[#242424] p-0.5 text-xs font-bold border border-[#333333]">
              <button
                type="button"
                id="modal-lang-kz"
                onClick={() => handleLangSwitch('kz')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isKz
                    ? 'bg-[#C5A059] text-black shadow-xs'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
                title="Қазақ тіліне аудару және оқу"
              >
                ҚАЗ
              </button>
              <button
                type="button"
                id="modal-lang-ru"
                onClick={() => handleLangSwitch('ru')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  !isKz
                    ? 'bg-[#C5A059] text-black shadow-xs'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
                title="Читать описание на русском языке"
              >
                РУС
              </button>
            </div>

            <button
              id="copy-product-link-btn"
              onClick={async () => {
                const res = await shareOrCopyProduct(product, currentLang);
                if (res.success) {
                  setIsLinkCopied(true);
                  setTimeout(() => setIsLinkCopied(false), 2500);
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer border ${
                isLinkCopied
                  ? 'bg-[#1E3A2B] text-[#25D366] border-[#25D366]/40'
                  : 'bg-[#242424] hover:bg-[#2E2E2E] text-white border-[#383838]'
              }`}
              title="Скопировать прямую ссылку на товар"
            >
              {isLinkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isKz ? 'Көшірілді!' : 'Скопировано!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{isKz ? 'Сілтеме' : 'Ссылка'}</span>
                </>
              )}
            </button>

            <button
              id="toggle-fullscreen-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white border border-[#383838] font-medium text-xs transition-colors cursor-pointer"
              title={isFullscreen ? 'Свернуть окно' : 'На весь экран смартфона'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              id="close-modal-btn"
              onClick={handleAnimatedClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-[#383838]"
              title={isKz ? 'Жабу' : 'Закрыть карточку'}
            >
              <X className="w-4 h-4" />
              <span>{isKz ? 'Жабу' : 'Закрыть'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          ref={scrollBodyRef}
          id="modal-scroll-body"
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 space-y-6 bg-[#141414]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column: Images & Badges (aspect ratio) */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-square sm:aspect-[4/5] max-h-[460px] mx-auto rounded-2xl bg-white overflow-hidden border border-[#2A2A2A] p-4 shadow-md flex items-center justify-center">
                <img
                  id="modal-main-image"
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={`${title} — купить в Атырау, Бутик №24`}
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${zoomLevel > 150 ? 1.15 : 1})`, transition: 'transform 0.2s ease' }}
                />

                {/* Minimal Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {discountPercent && (
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-[#C5A059] text-black shadow-md">
                      -{discountPercent}%
                    </span>
                  )}
                  {product.isHit && (
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-black/85 text-[#C5A059] border border-[#C5A059]/50 shadow-md">
                      ХИТ
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-[#1C1C1C] text-white border border-[#444] shadow-md">
                      НОВИНКА
                    </span>
                  )}
                </div>

                {/* Favorite toggle */}
                <button
                  id="modal-favorite-btn"
                  onClick={() => onToggleFavorite(product)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md transition-colors cursor-pointer border ${
                    isFavorite
                      ? 'bg-black/85 text-[#C5A059] border-[#C5A059]'
                      : 'bg-black/60 hover:bg-black text-white/80 hover:text-white border-white/20'
                  }`}
                  aria-label="В избранное"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#C5A059] text-[#C5A059]' : ''}`} />
                </button>

                {product.country && (
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/75 text-[#D4D4D4] border border-white/10 text-xs font-semibold backdrop-blur-xs">
                    {product.country}
                  </div>
                )}
              </div>

              {/* Multi-image gallery if available */}
              {product.images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-white p-1 ${
                        selectedImageIndex === idx
                          ? 'border-[#C5A059] shadow-md'
                          : 'border-[#2A2A2A] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${title} (фото ${idx + 1})`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Boutique Assurance Box */}
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-xs sm:text-sm text-[#D4D4D4] space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>{config.city} · {config.boutiqueNumber} (ТД «Дина Байзар»)</span>
                </div>
                <div className="text-xs text-[#A3A3A3] space-y-1">
                  <p>📍 {config.address}</p>
                  <p>🕙 Режим работы: {lang === 'kz' ? config.workingHoursKz : config.workingHoursRu}</p>
                  <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Самовывоз из Бутика №24 — бесплатно
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Price, Description, Tabs, Actions */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                {/* SKU & Category */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-[#A3A3A3] mb-2">
                  <span>Артикул: <strong className="text-white font-mono">#{product.sku}</strong></span>
                  {product.volumeOrWeight && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#222222] border border-[#333333] text-[#D4D4D4] font-semibold text-xs">
                      {product.volumeOrWeight}
                    </span>
                  )}
                </div>

                {/* Title (Scaled) */}
                <h1
                  id="modal-product-title"
                  className="font-bold text-white leading-snug"
                  style={{ fontSize: `calc(${dynamicFontSize} * 1.35)` }}
                >
                  {title}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                  <span
                    id="modal-product-price"
                    className="font-black text-[#C5A059] tracking-tight tabular-nums"
                    style={{ fontSize: `calc(${dynamicFontSize} * 1.5)` }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-[#737373] line-through tabular-nums">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  {product.inStock ? (
                    <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-[#1E3A2B] text-emerald-400 border border-[#25D366]/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {isKz ? 'Бутик №24 • Қолда бар' : 'Бутик №24 • В наличии'}
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-[#242424] text-[#A3A3A3] border border-[#3A3A3A] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {isKz ? 'Қолда жоқ • Жақында болады' : 'Нет в наличии • Скоро будет'}
                    </span>
                  )}
                </div>

                {/* In-Card Language Switcher Bar directly for reading description */}
                <div className="mt-4 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D4D4D4]">
                    <Globe className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>{isKz ? 'Тілі:' : 'Язык описания:'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="card-lang-kz"
                      onClick={() => handleLangSwitch('kz')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isKz
                          ? 'bg-[#C5A059] text-black'
                          : 'bg-[#242424] text-[#D4D4D4] hover:text-white border border-[#333333]'
                      }`}
                      title="Қазақ тілінде оқу"
                    >
                      <span>🇰🇿 Қазақша</span>
                    </button>
                    <button
                      type="button"
                      id="card-lang-ru"
                      onClick={() => handleLangSwitch('ru')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        !isKz
                          ? 'bg-[#C5A059] text-black'
                          : 'bg-[#242424] text-[#D4D4D4] hover:text-white border border-[#333333]'
                      }`}
                      title="Читать на русском"
                    >
                      <span>🇷🇺 Русский</span>
                    </button>

                    {isKz && (
                      <button
                        type="button"
                        id="card-retranslate-btn"
                        onClick={() => runKazakhTranslation(true)}
                        disabled={isTranslating}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#242424] hover:bg-[#2E2E2E] text-white border border-[#383838] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        title="Қазақ тіліне қайта аудару"
                      >
                        <RotateCw className={`w-3.5 h-3.5 text-[#C5A059] ${isTranslating ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isTranslating ? 'Аударылуда...' : 'Қайта аудару'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Translation in-progress status pill */}
                {isKz && isTranslating && (
                  <div className="mt-2.5 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#C5A059]/40 text-[#C5A059] text-xs font-medium flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A059] shrink-0" />
                    <span>Қазақ тіліне аударылуда... (Сипаттамасы аударылып жатыр)</span>
                  </div>
                )}

                {/* Tabs Navigation */}
                <div id="modal-tabs-nav" className="mt-5 flex border-b border-[#2A2A2A] overflow-x-auto gap-2">
                  <button
                    id="tab-btn-desc"
                    onClick={() => setActiveTab('desc')}
                    className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'desc'
                        ? 'border-[#C5A059] text-[#C5A059]'
                        : 'border-transparent text-[#8E8E8E] hover:text-white'
                    }`}
                  >
                    {isKz ? 'Сипаттама' : 'Описание'}
                  </button>

                  {benefits && benefits.length > 0 && (
                    <button
                      id="tab-btn-benefits"
                      onClick={() => setActiveTab('benefits')}
                      className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        activeTab === 'benefits'
                          ? 'border-[#C5A059] text-[#C5A059]'
                          : 'border-transparent text-[#8E8E8E] hover:text-white'
                      }`}
                    >
                      {isKz ? 'Пайдасы' : 'Польза и свойства'}
                    </button>
                  )}

                  {howToUse && (
                    <button
                      id="tab-btn-howto"
                      onClick={() => setActiveTab('howTo')}
                      className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        activeTab === 'howTo'
                          ? 'border-[#C5A059] text-[#C5A059]'
                          : 'border-transparent text-[#8E8E8E] hover:text-white'
                      }`}
                    >
                      {isKz ? 'Қолдану тәсілі' : 'Как применять'}
                    </button>
                  )}

                  {specs && (
                    <button
                      id="tab-btn-specs"
                      onClick={() => setActiveTab('specs')}
                      className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                        activeTab === 'specs'
                          ? 'border-[#C5A059] text-[#C5A059]'
                          : 'border-transparent text-[#8E8E8E] hover:text-white'
                      }`}
                    >
                      {isKz ? 'Сипаттамалары' : 'Характеристики'}
                    </button>
                  )}
                </div>

                {/* Tab Content Box with DYNAMIC ZOOM SCALING for easy reading */}
                <div
                  id="modal-tab-content-area"
                  className="mt-4 p-4 sm:p-5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]"
                  style={{
                    fontSize: dynamicFontSize,
                    lineHeight: dynamicLineHeight,
                  }}
                >
                  {activeTab === 'desc' && (
                    <div className="space-y-3">
                      {isKz && isTranslating && (
                        <div className="p-3 rounded-lg bg-[#222222] border border-[#333333] text-[#C5A059] text-xs font-semibold flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#C5A059] shrink-0" />
                          <span>Қазақ тіліне аударылуда... Бірнеше секунд күте тұрыңыз</span>
                        </div>
                      )}
                      <p className="text-[#E5E5E5] font-normal leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  )}

                  {activeTab === 'benefits' && benefits && (
                    <ul className="space-y-2.5">
                      {benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                          <span className="text-[#E5E5E5]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {activeTab === 'howTo' && howToUse && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                        <Clock className="w-4 h-4 text-[#C5A059]" />
                        <span>{isKz ? 'Нұсқаулық:' : 'Рекомендации по приему:'}</span>
                      </div>
                      <p className="text-[#E5E5E5] leading-relaxed whitespace-pre-line">
                        {howToUse}
                      </p>
                    </div>
                  )}

                  {activeTab === 'specs' && specs && (
                    <div className="space-y-2">
                      <pre className="font-sans text-[#E5E5E5] whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                        {specs}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: WhatsApp direct order, 1-Click order, Add to cart */}
              <div id="modal-actions-box" className="pt-4 border-t border-[#2A2A2A] space-y-3">
                {/* Visual Feedback Banner: Товар отправлен в корзину */}
                {isAddedToCartFeedback && (
                  <div
                    id="modal-cart-success-banner"
                    className="p-3.5 bg-[#1E3A2B] border border-[#25D366]/40 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-md animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#25D366] text-black flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs sm:text-sm">
                          {isKz ? 'Өнім себетке қосылды!' : 'Товар добавлен в корзину!'}
                        </p>
                        <p className="text-xs text-[#A3A3A3] font-normal">
                          {isKz ? 'Тапсырысты себеттен рәсімдеуге болады' : 'Перейдите к оформлению или продолжите покупки'}
                        </p>
                      </div>
                    </div>
                    {onOpenCart && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenCart();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs sm:text-sm font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <span>{isKz ? 'Себетке' : 'В корзину'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* WhatsApp Order Button */}
                  <a
                    id="modal-whatsapp-order-btn"
                    href={`https://wa.me/${config.whatsappNumber}?text=${waDirectMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors text-[#25D366] bg-[#163828] hover:bg-[#1E4A35] border border-[#25D366]/40"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>
                      {product.inStock
                        ? (isKz ? 'WhatsApp арқылы тапсырыс' : 'Заказать в WhatsApp')
                        : (isKz ? 'Келуін WhatsApp-тан сұрау' : 'Узнать о поступлении')}
                    </span>
                  </a>

                  {/* 1-Click Fast Order / Pre-order */}
                  <button
                    id="modal-quick-order-btn"
                    type="button"
                    onClick={() => onQuickOrder(product)}
                    className="px-4 py-3 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] text-white border border-[#383838] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                    <span>
                      {product.inStock
                        ? (isKz ? '1 басу арқылы сатып алу' : 'Купить в 1 клик')
                        : (isKz ? 'Алдын ала тапсырыс беру' : 'Оформить предзаказ')}
                    </span>
                  </button>
                </div>

                {/* Add to Cart button */}
                {product.inStock ? (
                  <div className="space-y-2">
                    <button
                      id="modal-add-cart-btn"
                      type="button"
                      onClick={handleAddToCartClick}
                      className={`w-full px-5 py-3.5 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm ${
                        isAddedToCartFeedback
                          ? 'bg-[#1E3A2B] text-white'
                          : 'bg-[#C5A059] hover:bg-[#D4AF37] active:bg-[#B38F46] text-black font-extrabold'
                      }`}
                    >
                      {isAddedToCartFeedback ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
                          <span>{isKz ? '✓ Өнім себетке жіберілді!' : '✓ Товар добавлен в корзину!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          <span>
                            {cartQuantity > 0
                              ? isKz
                                ? `Себетте: ${cartQuantity} дана (+1 қосу)`
                                : `В корзине: ${cartQuantity} шт. (+1 добавить)`
                              : isKz
                              ? 'Себетке қосу'
                              : 'Добавить в корзину'}
                          </span>
                        </>
                      )}
                    </button>

                    {cartQuantity > 0 && onRemoveFromCart && (
                      <button
                        type="button"
                        id="modal-remove-cart-btn"
                        onClick={() => onRemoveFromCart(product.id)}
                        className="w-full py-2.5 px-4 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>
                          {isKz
                            ? 'Тауарды себеттен өшіру'
                            : 'Удалить товар из корзины'}
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-xl bg-[#222222] border border-[#333333] text-center">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-[#C5A059]" />
                      <span>{isKz ? 'Өнім уақытша бітті • Жақында түседі' : 'Товар временно закончился • Скоро будет'}</span>
                    </p>
                    <p className="text-xs text-[#A3A3A3] mt-1">
                      {isKz ? 'Бутик №24-тен алдын ала брондау үшін түймелерді басыңыз' : 'Нажмите кнопку «Оформить предзаказ», чтобы забронировать к новому завозу'}
                    </p>
                  </div>
                )}

                {/* Direct Share Link block for Stories & WhatsApp */}
                <div className="pt-1">
                  <button
                    id="modal-share-product-btn"
                    onClick={async () => {
                      const res = await shareOrCopyProduct(product, currentLang);
                      if (res.success) {
                        setIsLinkCopied(true);
                        setTimeout(() => setIsLinkCopied(false), 3000);
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isLinkCopied
                        ? 'bg-[#1E3A2B] border-[#25D366]/40 text-[#25D366]'
                        : 'bg-[#222222] hover:bg-[#2A2A2A] border-[#383838] text-white'
                    }`}
                    title="Скопировать ссылку"
                  >
                    {isLinkCopied ? (
                      <>
                        <Check className="w-4 h-4 text-[#25D366]" />
                        <span className="font-bold text-[#25D366]">
                          {isKz ? '✓ Сілтеме көшірілді!' : '✓ Ссылка скопирована!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-[#C5A059]" />
                        <span>
                          {isKz ? 'Өнім сілтемесін көшіру (Сторис / WhatsApp)' : 'Скопировать ссылку на товар'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Frequently Bought Together Section inside Product Detail Modal */}
          {recommendedProducts.length > 0 && (
            <div
              id="modal-frequently-bought-section"
              className="pt-6 border-t border-[#2A2A2A]"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5A059] shrink-0" />
                    <span>
                      {isKz ? 'Осы тауармен бірге жиі алады' : 'С этим товаром часто берут'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    {isKz
                      ? 'Кешенді нәтиже үшін сатып алушылар қосымша таңдайтын өнімдер'
                      : 'Рекомендуемые товары для комплексного приёма'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recommendedProducts.map((rec) => {
                  const recTitle = isKz && rec.titleKz?.trim() ? rec.titleKz : rec.titleRu;
                  return (
                    <div
                      key={rec.id}
                      className="group rounded-xl border border-[#282828] bg-[#1A1A1A] hover:border-[#C5A059] p-3 flex flex-col justify-between transition-all"
                    >
                      <div
                        onClick={() => {
                          if (onSelectProduct) {
                            setPreviousProducts((stack) => [...stack, product]);
                            setSelectedImageIndex(0);
                            setActiveTab('desc');
                            onSelectProduct(rec);
                            if (scrollBodyRef.current) {
                              scrollBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-white border border-[#2E2E2E] p-2 mb-2 flex items-center justify-center">
                          <img
                            src={rec.images[0]}
                            alt={recTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#C5A059]">
                          {recTitle}
                        </h4>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#2A2A2A] flex items-center justify-between gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-[#C5A059] tabular-nums">
                          {formatPrice(rec.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAddToCart(rec)}
                          className="px-2.5 py-1 rounded-md bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          title={isKz ? 'Себетке қосу' : 'Добавить в корзину'}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isKz ? 'Қосу' : 'В корзину'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Back & Close Navigation Row inside Product Detail Modal */}
          <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackAction}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-white border border-[#333333] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>
                {previousProducts.length > 0
                  ? isKz
                    ? 'Алдыңғы тауарға оралу'
                    : 'Назад к предыдущему товару'
                  : isKz
                  ? 'Каталогқа оралу'
                  : 'Назад в каталог'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleAnimatedClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-white border border-[#333333] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 shrink-0" />
              <span>{isKz ? 'Жабу' : 'Закрыть карточку'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalElement, document.body);
};
