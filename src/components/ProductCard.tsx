import React, { useState } from 'react';
import { ShoppingBag, Zap, Check, Sparkles, MessageCircle, Link2 } from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../translations';
import { formatTenge, generateSingleProductWhatsAppUrl } from '../utils/formatters';
import { copyProductLinkToClipboard } from '../utils/productSlug';

interface ProductCardProps {
  product: Product;
  language: Language;
  whatsappNumber?: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  whatsappNumber = '77781754241',
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const t = translations[language];

  const title = language === 'ru' ? product.titleRu : (product.titleKz || product.titleRu);
  const description = language === 'ru' ? product.descriptionRu : (product.descriptionKz || product.descriptionRu);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyProductLinkToClipboard(product);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product);
  };

  const handleWhatsApp1Click = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateSingleProductWhatsAppUrl({
      whatsappNumber,
      product,
      quantity: 1,
      language,
    });
    window.open(url, '_blank');
  };

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-amber-400 transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Photo Container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center border-b border-gray-100">
        {mainImage && !imgError ? (
          <img
            src={mainImage}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-50 to-gray-50">
            <div className="w-12 h-12 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 mb-2 bg-white shadow-sm">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-brand text-xs font-bold text-amber-800 tracking-widest uppercase">
              MUSLIM SHOP
            </span>
            <span className="text-[11px] font-semibold text-gray-500 mt-0.5 tracking-wider">
              АТЫРАУ
            </span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isHit && (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-500 text-gray-950 tracking-wide uppercase shadow-sm">
              🔥 {t.hitBadge}
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-600 text-white tracking-wide uppercase shadow-sm">
              ✨ {t.newBadge}
            </span>
          )}
          {product.isSale && product.oldPrice && (
            <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-red-600 text-white tracking-wide uppercase shadow-sm">
              {t.saleBadge}
            </span>
          )}
        </div>

        {/* Fast Actions top-right: WhatsApp + Copy direct Link */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all active:scale-95 cursor-pointer ${
              isCopied
                ? 'bg-emerald-50 border border-emerald-400 text-emerald-700'
                : 'bg-white/95 hover:bg-white border border-gray-300 text-gray-700 hover:text-amber-700'
            }`}
            title={isCopied ? t.linkCopied : t.copyLink}
            aria-label={t.copyLink}
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleWhatsApp1Click}
            className="p-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm transition-all hover:scale-110 cursor-pointer"
            title={language === 'ru' ? 'Заказать в 1 клик в WhatsApp' : '1 басумен WhatsApp-та тапсырыс беру'}
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </button>
        </div>

        {/* Copy toast feedback on card */}
        {isCopied && (
          <div className="absolute top-12 right-2 z-20 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-md animate-fadeIn flex items-center gap-1 pointer-events-none">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.linkCopied}</span>
          </div>
        )}

        {/* Stock status indicator */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 bg-gray-900 text-white text-xs sm:text-sm rounded-full font-bold shadow-md">
              {t.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Product Title */}
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 min-h-[38px] sm:min-h-[44px] leading-snug">
            {title}
          </h3>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-3.5 pt-3 border-t border-gray-100">
          {/* Price block */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-extrabold text-base sm:text-xl text-amber-700 tracking-tight">
                {formatTenge(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs sm:text-sm text-gray-400 line-through decoration-red-500 font-medium">
                  {formatTenge(product.oldPrice)}
                </span>
              )}
            </div>
            {product.sku && (
              <span className="text-[11px] text-gray-500 font-medium tracking-wider uppercase block mt-0.5 font-mono">
                {t.sku}: {product.sku}
              </span>
            )}
          </div>

          {/* Action Buttons: "В корзину" + "Купить сейчас" */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`py-2.5 px-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 hover:border-gray-400'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={t.addToCart}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{language === 'kz' ? 'Қосылды' : 'В корзине'}</span>
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
              className="py-2.5 px-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={t.buyNow}
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span className="truncate">{t.buyNow}</span>
            </button>
          </div>

          {/* 1-Click WhatsApp direct link bar */}
          <button
            onClick={handleWhatsApp1Click}
            disabled={!product.inStock}
            className="w-full mt-2 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-700 text-emerald-700" />
            <span>{language === 'kz' ? '1 басумен WhatsApp' : '1 клик в WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
