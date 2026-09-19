import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, ShoppingBag, Zap, Check, ChevronLeft, ChevronRight, 
  Maximize2, MessageCircle, Sparkles, HelpCircle, Share2, Copy, Link2, Send 
} from 'lucide-react';
import { Product, Language, Category } from '../types';
import { translations } from '../translations';
import { formatTenge, generateSingleProductWhatsAppUrl } from '../utils/formatters';
import { getProductDirectUrl, copyProductLinkToClipboard } from '../utils/productSlug';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  language: Language;
  whatsappNumber: string;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  language,
  whatsappNumber,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);

  // Prevent background body scroll while modal is active
  useEffect(() => {
    if (!product) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [product]);

  // Reset image index and error state whenever product changes
  useEffect(() => {
    setActiveImgIndex(0);
    setImgError(false);
    setQuantity(1);
    setIsLightboxOpen(false);
  }, [product?.id]);

  // Handle keyboard events (Escape to close lightbox or modal, Arrow keys for gallery)
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, isLightboxOpen, onClose]);

  if (!product) return null;

  const t = translations[language];
  const title = language === 'ru' ? product.titleRu : (product.titleKz || product.titleRu);
  const description = language === 'ru' ? product.descriptionRu : (product.descriptionKz || product.descriptionRu);
  const specs = language === 'ru' ? product.specsRu : (product.specsKz || product.specsRu);

  const category = categories.find((c) => c.id === product.categoryId);
  const categoryName = category
    ? language === 'ru' ? category.nameRu : (category.nameKz || category.nameRu)
    : '';

  // Extract all potential images safely
  const rawImages: string[] = [];
  if (Array.isArray(product.images)) {
    rawImages.push(...product.images.filter((img) => typeof img === 'string' && img.trim().length > 0));
  }
  if ((product as any).image && typeof (product as any).image === 'string') {
    rawImages.push((product as any).image);
  }
  if ((product as any).imageUrl && typeof (product as any).imageUrl === 'string') {
    rawImages.push((product as any).imageUrl);
  }
  const images = Array.from(new Set(rawImages));
  const currentImage = images[activeImgIndex] || images[0] || null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
  };

  const handleWhatsAppOrder = () => {
    const url = generateSingleProductWhatsAppUrl({
      whatsappNumber,
      product,
      quantity,
      language,
      isQuestion: false,
    });
    window.open(url, '_blank');
  };

  const handleWhatsAppQuestion = () => {
    const url = generateSingleProductWhatsAppUrl({
      whatsappNumber,
      product,
      quantity,
      language,
      isQuestion: true,
    });
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const url = getProductDirectUrl(product);
    const shareTitle = `${title} — MUSLIM SHOP`;
    const shareText = `${title} (${formatTenge(product.price)}) в MUSLIM SHOP Атырау:`;

    // 1. Standard Web Share API for mobile devices (iOS Safari, Android Chrome, etc.)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User dismissed or cancelled the native share dialog
          return;
        }
        console.warn('Web Share failed or cancelled, falling back to copy', err);
      }
    }

    // 2. Fallback: Copy link directly to clipboard
    await handleCopyLink();
  };

  const handleCopyLink = async () => {
    const success = await copyProductLinkToClipboard(product);
    if (success) {
      setIsCopied(true);
      setShareSuccessMessage(t.linkCopied || 'Ссылка скопирована ✓');
      setTimeout(() => {
        setIsCopied(false);
        setShareSuccessMessage(null);
      }, 2600);
    }
  };

  const handleShareWhatsApp = () => {
    const url = getProductDirectUrl(product);
    const text = `${title} (${formatTenge(product.price)})\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const url = getProductDirectUrl(product);
    const text = `${title} (${formatTenge(product.price)}) — MUSLIM SHOP`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      {/* Outer Backdrop Container - fixed and non-scrolling to prevent mobile page jumping */}
      <div 
        id="product-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        onClick={onClose}
      >
        {/* Main Product Card Modal */}
        <div 
          id="product-modal-card"
          className="relative w-full max-w-2xl lg:max-w-3xl bg-white border-t sm:border border-gray-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle Indicator */}
          <div className="sm:hidden pt-2.5 pb-1 bg-white flex justify-center shrink-0">
            <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Sticky Top Header Bar with "Назад" button and Close button */}
          <div className="sticky top-0 z-20 flex-shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button
                id="product-modal-back-btn"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold border border-gray-300 active:scale-95 transition-all shadow-xs group cursor-pointer"
                aria-label={language === 'ru' ? 'Назад к товарам' : 'Тауарларға қайту'}
              >
                <ArrowLeft className="w-4 h-4 text-amber-700 group-hover:-translate-x-0.5 transition-transform" />
                <span>{language === 'ru' ? 'Назад' : 'Артқа'}</span>
              </button>

              {categoryName && (
                <span className="hidden sm:inline-flex items-center text-xs text-amber-800 font-bold tracking-wide uppercase px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                  {category?.icon} {categoryName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {categoryName && (
                <span className="sm:hidden text-xs text-amber-800 font-bold truncate max-w-[110px]">
                  {categoryName}
                </span>
              )}
              <button
                id="product-modal-header-share-btn"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-xs"
                title={t.share}
                aria-label={t.share}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs text-emerald-700">{t.linkCopied}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden xs:inline sm:inline text-xs">{t.share}</span>
                  </>
                )}
              </button>
              <button
                id="product-modal-close-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Smooth Scrollable Body: Vertical scroll up & down smoothly */}
          <div 
            id="product-modal-scrollable"
            className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Photos & Gallery */}
              <div className="flex flex-col gap-3">
                {/* Main Photo with Fullscreen click handler */}
                <div 
                  id="product-photo-container"
                  onClick={() => currentImage && !imgError && setIsLightboxOpen(true)}
                  className="relative aspect-square w-full min-h-[260px] sm:min-h-[320px] rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center cursor-zoom-in group shrink-0 shadow-sm select-none"
                  title={language === 'ru' ? 'Нажмите на фото, чтобы открыть на весь экран' : 'Үлкейту үшін басыңыз'}
                >
                  {currentImage && !imgError ? (
                    <img
                      key={`${product.id}-${activeImgIndex}`}
                      src={currentImage}
                      alt={title}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      loading="eager"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-amber-50 to-gray-50">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-amber-300 flex items-center justify-center mb-3 text-amber-700 shadow-sm">
                        <Sparkles className="w-8 h-8 text-amber-600" />
                      </div>
                      <span className="font-serif text-sm font-bold text-amber-800 tracking-widest uppercase">
                        MUSLIM SHOP
                      </span>
                      <span className="text-xs text-gray-500 mt-1 font-semibold">АТЫРАУ · БУТИК №24</span>
                      <span className="text-xs text-gray-700 mt-2 px-3 py-1 rounded-full bg-white border border-gray-200 line-clamp-1 max-w-[85%] font-medium">
                        {title}
                      </span>
                    </div>
                  )}

                  {/* Prominent Fullscreen Click Hint Badge */}
                  {currentImage && !imgError && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1.5 rounded-xl bg-gray-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'ru' ? 'Нажмите для увеличения' : 'Үлкейту үшін басыңыз'}</span>
                      </span>
                      {images.length > 1 && (
                        <span className="px-2.5 py-1 rounded-lg bg-gray-900/80 backdrop-blur-md text-white text-xs font-mono font-bold shadow-md">
                          {activeImgIndex + 1} / {images.length}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Corner Fullscreen Button */}
                  {currentImage && (
                    <button
                      id="product-photo-expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-gray-700 hover:text-amber-700 hover:bg-white backdrop-blur-md border border-gray-200 shadow-sm transition-all active:scale-95 cursor-pointer"
                      title={language === 'ru' ? 'Открыть на весь экран' : 'Толық экранда ашу'}
                      aria-label="Полноэкранный просмотр"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    {product.isHit && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-500 text-gray-950 uppercase tracking-wider shadow-sm">
                        🔥 {t.hitBadge}
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                        ✨ {t.newBadge}
                      </span>
                    )}
                    {product.isSale && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-red-600 text-white uppercase tracking-wider shadow-sm">
                        {t.saleBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnails Gallery if multiple images exist */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                          activeImgIndex === idx
                            ? 'border-amber-500 scale-95 ring-2 ring-amber-400/40 shadow-sm'
                            : 'border-gray-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Product Information & Purchase options */}
              <div className="flex flex-col justify-between">
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {title}
                  </h1>

                  {/* SKU & In Stock Indicator */}
                  <div className="flex items-center gap-3 text-xs mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${
                      product.inStock
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-red-50 text-red-700 border border-red-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-600' : 'bg-red-500'}`} />
                      {product.inStock ? t.inStock : t.outOfStock}
                    </span>

                    {product.sku && (
                      <span className="text-gray-500 tracking-wider uppercase font-mono font-semibold">
                        {t.sku}: <span className="text-gray-900">{product.sku}</span>
                      </span>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 mb-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{t.price}:</span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
                          {formatTenge(product.price)}
                        </span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                            {formatTenge(product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 border border-red-300 text-xs font-extrabold">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Product Description */}
                  {description && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                        {t.description}
                      </h4>
                      <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
                        {description}
                      </div>
                    </div>
                  )}

                  {/* Characteristics / Specs */}
                  {specs && (
                    <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                        {t.specs}
                      </h4>
                      <div className="text-xs sm:text-sm text-gray-700 space-y-1 whitespace-pre-line leading-relaxed">
                        {specs}
                      </div>
                    </div>
                  )}
                </div>

                {/* Purchase Action Controls */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-300 rounded-xl bg-white p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-base font-bold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600">
                      {t.total}: <strong className="text-base text-gray-900 font-extrabold">{formatTenge(product.price * quantity)}</strong>
                    </div>
                  </div>

                  {/* Direct 1-Click WhatsApp Order Banner Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={!product.inStock}
                    className="w-full py-4 px-4 rounded-xl font-bold text-sm sm:text-base bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2.5 shadow-md transition-all transform active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{t.oneClickWhatsApp}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className={`py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 hover:border-gray-400'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                          <span>{language === 'kz' ? 'Қосылды!' : 'В корзине!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-amber-700" />
                          <span>{t.addToCart}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!product.inStock}
                      className="py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{t.buyNow}</span>
                    </button>
                  </div>

                  {/* Consultation / Question in WhatsApp */}
                  <button
                    onClick={handleWhatsAppQuestion}
                    className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 hover:text-gray-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>{t.askQuestionWhatsApp}</span>
                  </button>

                  {/* Dedicated Direct Share & Instagram Stories Panel */}
                  <div className="pt-3 mt-1 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t.share}</span>
                      </span>
                      {shareSuccessMessage && (
                        <span className="text-xs font-bold text-emerald-700 animate-fadeIn flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{shareSuccessMessage}</span>
                        </span>
                      )}
                    </div>

                    {/* Primary Web Share API button + Quick Copy button */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        id="product-modal-web-share-btn"
                        onClick={handleShare}
                        className="w-full py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 hover:border-gray-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs cursor-pointer"
                        title={language === 'ru' ? 'Поделиться в мессенджерах (WhatsApp, Telegram и др.)' : 'Мессенджерлерде бөлісу'}
                      >
                        <Share2 className="w-4 h-4 text-amber-700" />
                        <span>{t.share}</span>
                      </button>

                      <button
                        id="product-modal-copy-link-btn"
                        onClick={handleCopyLink}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 border cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                            : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900'
                        }`}
                        title={t.copyLink}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>{t.linkCopied}</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 text-amber-700" />
                            <span>{t.copyLink}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Direct Messengers & Instagram Stories Helper */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleShareWhatsApp}
                        className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title={t.shareInWhatsApp}
                      >
                        <MessageCircle className="w-4 h-4 fill-emerald-700" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={handleShareTelegram}
                        className="flex-1 py-2 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title={t.shareInTelegram}
                      >
                        <Send className="w-4 h-4 text-sky-700" />
                        <span>Telegram</span>
                      </button>
                    </div>

                    {/* Instagram Stories Tag/Hint */}
                    <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB]" />
                        <span className="text-gray-800 font-medium">{t.shareForStories}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-800">
                        {language === 'ru' ? 'Стикер «Ссылка»' : '«Сілтеме» стикері'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Image Gallery */}
      {isLightboxOpen && currentImage && (
        <div 
          id="product-photo-lightbox"
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Navigation Bar */}
          <div 
            className="flex items-center justify-between z-10 w-full max-w-4xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#D4AF37] font-medium">
                {title}
              </span>
              {images.length > 1 && (
                <span className="text-xs text-[#8C877D] font-mono px-2 py-0.5 rounded bg-[#1C1C28] border border-[#2A2A38]">
                  {activeImgIndex + 1} / {images.length}
                </span>
              )}
            </div>

            <button
              id="lightbox-close-btn"
              onClick={() => setIsLightboxOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1C28] hover:bg-[#2A2A3A] text-white text-xs font-semibold border border-[#3A3A4C] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
              <span>{language === 'ru' ? 'Закрыть' : 'Жабу'}</span>
            </button>
          </div>

          {/* Centered Large Image View */}
          <div 
            className="relative flex-1 flex items-center justify-center p-2 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={title}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
            />

            {/* Left / Right controls if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  id="lightbox-prev-btn"
                  onClick={() => setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-[#111116]/85 text-[#D4AF37] hover:bg-[#1C1C24] border border-[#2A2A38] transition-colors cursor-pointer shadow-lg active:scale-95"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  id="lightbox-next-btn"
                  onClick={() => setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-[#111116]/85 text-[#D4AF37] hover:bg-[#1C1C24] border border-[#2A2A38] transition-colors cursor-pointer shadow-lg active:scale-95"
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Hint */}
          <div className="text-center text-xs text-[#7A756C] z-10">
            {language === 'ru' ? 'Нажмите в любое место или кнопку «Закрыть» для выхода' : 'Шығу үшін кез келген жерді басыңыз'}
          </div>
        </div>
      )}
    </>
  );
};
