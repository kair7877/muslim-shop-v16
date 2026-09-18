import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, ShoppingBag, Zap, Check, ChevronLeft, ChevronRight, 
  Maximize2, MessageCircle, Sparkles, HelpCircle 
} from 'lucide-react';
import { Product, Language, Category } from '../types';
import { translations } from '../translations';
import { formatTenge, generateSingleProductWhatsAppUrl } from '../utils/formatters';

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
          className="relative w-full max-w-2xl lg:max-w-3xl bg-[#111116] border-t sm:border border-[#2A2A36] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle Indicator */}
          <div className="sm:hidden pt-2.5 pb-1 bg-[#111116] flex justify-center shrink-0">
            <div className="w-10 h-1 bg-[#3A3A4A] rounded-full" />
          </div>

          {/* Sticky Top Header Bar with "Назад" button and Close button */}
          <div className="sticky top-0 z-20 flex-shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-[#111116]/95 backdrop-blur-md border-b border-[#22222E]">
            <div className="flex items-center gap-2">
              <button
                id="product-modal-back-btn"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C28] hover:bg-[#262638] text-[#F4F1EA] text-xs font-semibold border border-[#2D2D3E] hover:border-[#D4AF37]/50 active:scale-95 transition-all shadow-sm group cursor-pointer"
                aria-label={language === 'ru' ? 'Назад к товарам' : 'Тауарларға қайту'}
              >
                <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
                <span>{language === 'ru' ? 'Назад' : 'Артқа'}</span>
              </button>

              {categoryName && (
                <span className="hidden sm:inline-flex items-center text-xs text-[#C5A059] font-medium tracking-wide uppercase px-2.5 py-1 rounded-lg bg-[#181824] border border-[#252535]">
                  {category?.icon} {categoryName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {categoryName && (
                <span className="sm:hidden text-[11px] text-[#C5A059] font-medium truncate max-w-[140px]">
                  {categoryName}
                </span>
              )}
              <button
                id="product-modal-close-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-[#1A1A24] hover:bg-[#252533] text-[#A8A49A] hover:text-[#F4F1EA] transition-colors cursor-pointer"
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
                  className="relative aspect-square w-full min-h-[260px] sm:min-h-[320px] rounded-2xl bg-[#161622] border border-[#262634] overflow-hidden flex items-center justify-center cursor-zoom-in group shrink-0 shadow-lg select-none"
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
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-[#1A1A26] to-[#111118]">
                      <div className="w-16 h-16 rounded-2xl bg-[#161622] border border-[#C5A059]/40 flex items-center justify-center mb-3 text-[#D4AF37] shadow-inner">
                        <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <span className="font-serif text-sm font-semibold text-[#D4AF37] tracking-widest uppercase">
                        MUSLIM SHOP
                      </span>
                      <span className="text-xs text-[#8A857C] mt-1">АТЫРАУ · БУТИК №24</span>
                      <span className="text-[11px] text-[#A6A29A] mt-2 px-3 py-1 rounded-full bg-[#1A1A24] border border-[#262636] line-clamp-1 max-w-[85%]">
                        {title}
                      </span>
                    </div>
                  )}

                  {/* Prominent Fullscreen Click Hint Badge */}
                  {currentImage && !imgError && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[#F4F1EA] text-[11px] font-medium border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{language === 'ru' ? 'Нажмите для увеличения' : 'Үлкейту үшін басыңыз'}</span>
                      </span>
                      {images.length > 1 && (
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-mono border border-white/10 shadow-lg">
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
                      className="absolute top-3 right-3 p-2 rounded-xl bg-[#0B0B0E]/80 text-[#D4AF37] hover:text-white hover:bg-[#0B0B0E] backdrop-blur-md border border-[#2A2A38] opacity-90 group-hover:opacity-100 transition-all shadow-md active:scale-95 cursor-pointer"
                      title={language === 'ru' ? 'Открыть на весь экран' : 'Толық экранда ашу'}
                      aria-label="Полноэкранный просмотр"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                    {product.isHit && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#D4AF37] text-[#0B0B0E] uppercase tracking-wider shadow">
                        🔥 {t.hitBadge}
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#38A169] text-white uppercase tracking-wider shadow">
                        ✨ {t.newBadge}
                      </span>
                    )}
                    {product.isSale && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#E53E3E] text-white uppercase tracking-wider shadow">
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
                            ? 'border-[#D4AF37] scale-95 shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                            : 'border-[#262634] opacity-70 hover:opacity-100'
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
                  <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#F4F1EA] leading-tight mb-2">
                    {title}
                  </h1>

                  {/* SKU & In Stock Indicator */}
                  <div className="flex items-center gap-3 text-xs mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                      product.inStock
                        ? 'bg-[#1C3322] text-[#68D391] border border-[#276749]'
                        : 'bg-[#331C1C] text-[#FC8181] border border-[#742A2A]'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#68D391] animate-pulse' : 'bg-[#FC8181]'}`} />
                      {product.inStock ? t.inStock : t.outOfStock}
                    </span>

                    {product.sku && (
                      <span className="text-[#8C877D] tracking-wider uppercase font-mono">
                        {t.sku}: <span className="text-[#D6D2C9]">{product.sku}</span>
                      </span>
                    )}
                  </div>

                  {/* Pricing Display */}
                  <div className="p-4 rounded-2xl bg-[#171722] border border-[#262634] mb-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#8C877D] block mb-0.5">{t.price}:</span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-2xl sm:text-3xl font-bold text-[#D4AF37] tracking-tight">
                          {formatTenge(product.price)}
                        </span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-sm sm:text-base text-[#7E796F] line-through">
                            {formatTenge(product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#E53E3E]/20 text-[#FC8181] border border-[#E53E3E]/40 text-xs font-bold">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Product Description */}
                  {description && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2">
                        {t.description}
                      </h4>
                      <div className="text-sm text-[#B8B4AA] leading-relaxed whitespace-pre-line bg-[#14141D] p-3.5 rounded-xl border border-[#22222E]">
                        {description}
                      </div>
                    </div>
                  )}

                  {/* Characteristics / Specs */}
                  {specs && (
                    <div className="mb-5 p-3.5 rounded-xl bg-[#14141D] border border-[#22222E]">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-2">
                        {t.specs}
                      </h4>
                      <div className="text-xs text-[#A8A49A] space-y-1 whitespace-pre-line leading-relaxed">
                        {specs}
                      </div>
                    </div>
                  )}
                </div>

                {/* Purchase Action Controls */}
                <div className="mt-4 pt-4 border-t border-[#22222E] space-y-3">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#2E2E3C] rounded-xl bg-[#171722] p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-base text-[#C5A059] hover:bg-[#222230] rounded-lg transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-[#F4F1EA]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-base text-[#C5A059] hover:bg-[#222230] rounded-lg transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs text-[#8C877D]">
                      {t.total}: <strong className="text-sm text-[#F4F1EA] font-semibold">{formatTenge(product.price * quantity)}</strong>
                    </div>
                  </div>

                  {/* Direct 1-Click WhatsApp Order Banner Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={!product.inStock}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#2bf075] hover:to-[#17a594] text-white flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)] transition-all transform active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{t.oneClickWhatsApp}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className={`py-3 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                        isAdded
                          ? 'bg-[#2E5E3A] border-[#38A169] text-white'
                          : 'bg-[#181824] hover:bg-[#232333] text-[#F4F1EA] border-[#2E2E3F] hover:border-[#C5A059]'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>{language === 'kz' ? 'Қосылды!' : 'Добавлено!'}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                          <span>{t.addToCart}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!product.inStock}
                      className="py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] to-[#B68E33] hover:from-[#DFBF58] hover:to-[#A37B22] text-[#0B0B0E] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Zap className="w-4 h-4 fill-[#0B0B0E]" />
                      <span>{t.buyNow}</span>
                    </button>
                  </div>

                  {/* Consultation / Question in WhatsApp */}
                  <button
                    onClick={handleWhatsAppQuestion}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#171722] hover:bg-[#20202E] border border-[#2E2E3E] text-[#A6A29A] hover:text-[#F4F1EA] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[#C5A059]" />
                    <span>{t.askQuestionWhatsApp}</span>
                  </button>
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
