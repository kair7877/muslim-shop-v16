import React from 'react';
import {
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Share2,
} from 'lucide-react';
import { AccessibilitySettings, Language, Product } from '../types';
import { formatPrice, shareOrCopyProduct } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  lang: Language;
  accessibility: AccessibilitySettings;
  isFavorite: boolean;
  isInCart?: boolean;
  cartQuantity?: number;
  isInCompare?: boolean;
  onToggleFavorite: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity?: (productId: string, delta: number) => void;
  onRemoveFromCart?: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
  onQuickOrder: (product: Product) => void;
  onShareFeedback?: (message: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  isFavorite,
  isInCart = false,
  cartQuantity = 0,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetail,
  onQuickOrder,
  onShareFeedback,
}) => {
  const [isShared, setIsShared] = React.useState(false);
  const title = lang === 'kz' && product.titleKz?.trim() ? product.titleKz : product.titleRu;

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <article
      id={`product-card-${product.id}`}
      className="group relative rounded-2xl overflow-hidden flex flex-col justify-between bg-[#161616] border-2 border-[#2C2C2C] hover:border-[#C5A059] shadow-lg transition-colors"
    >
      {/* Top Section: Extra Large Clear Image */}
      <div className="flex flex-col">
        <div
          onClick={() => onOpenDetail(product)}
          className="relative aspect-square w-full bg-white p-4 sm:p-6 overflow-hidden cursor-pointer flex items-center justify-center border-b-2 border-[#2C2C2C]"
        >
          <img
            src={product.images[0]}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />

          {/* High-Contrast Clear Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercent && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm font-black bg-[#C5A059] text-black shadow-md">
                -{discountPercent}%
              </span>
            )}
            {product.isHit && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-black text-[#D4AF37] border border-[#C5A059] shadow-md">
                ХИТ
              </span>
            )}
            {product.isNew && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#1F1F1F] text-white border border-[#444444] shadow-md">
                НОВИНКА
              </span>
            )}
          </div>

          {/* Top-Right Quick Actions: Large Touch Targets for Favorite & Share */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              id={`fav-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md border ${
                isFavorite
                  ? 'bg-black text-[#C5A059] border-[#C5A059]'
                  : 'bg-black/75 hover:bg-black text-white border-white/30'
              }`}
              title={lang === 'kz' ? 'Таңдаулыға қосу' : 'В избранное'}
              aria-label="В избранное"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#C5A059] text-[#C5A059]' : ''}`} />
            </button>

            <button
              id={`share-btn-${product.id}`}
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await shareOrCopyProduct(product, lang);
                if (res.success) {
                  setIsShared(true);
                  setTimeout(() => setIsShared(false), 2000);
                  if (onShareFeedback) {
                    onShareFeedback(
                      lang === 'kz'
                        ? 'Өнім сілтемесі көшірілді!'
                        : 'Ссылка на товар скопирована!'
                    );
                  }
                }
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer shadow-md bg-black/75 hover:bg-black text-white border border-white/30"
              title={lang === 'kz' ? 'Бөлісу' : 'Поделиться'}
              aria-label="Поделиться"
            >
              {isShared ? (
                <Check className="w-5 h-5 text-[#C5A059]" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Product Information Body: Large, High-Contrast Text for Visually Impaired */}
        <div className="p-4 sm:p-5 pb-2 space-y-2.5">
          {/* Status & Volume info — Extra Large and Clear */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold border ${
                product.inStock
                  ? 'bg-[#122E1F] text-[#4ADE80] border-[#22C55E]/40'
                  : 'bg-[#2E1F12] text-[#FBBF24] border-[#F59E0B]/40'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  product.inStock ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'
                }`}
              />
              <span>
                {product.inStock
                  ? (lang === 'kz' ? 'Бутик №24 • Қолда бар' : 'В наличии в Бутике №24')
                  : (lang === 'kz' ? 'Тапсырыспен' : 'Под заказ')}
              </span>
            </span>

            {product.volumeOrWeight && (
              <span className="text-xs sm:text-sm font-bold text-[#A3A3A3] bg-[#222222] border border-[#333333] px-2.5 py-1 rounded-lg">
                {product.volumeOrWeight}
              </span>
            )}
          </div>

          {/* Product Title: Big, Bold, White, Easy to Read without Straining Eyes */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-black text-white group-hover:text-[#D4AF37] cursor-pointer text-base sm:text-lg lg:text-xl leading-snug pt-1 min-h-[3rem]"
            title={title}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Pricing & Cart Action Area */}
      <div className="p-4 sm:p-5 pt-2">
        {/* Large Prominent Price Display */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#D4AF37] tracking-tight tabular-nums">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-sm sm:text-base text-[#7E7E7E] line-through tabular-nums font-semibold">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Action: Prominent "В КОРЗИНУ" Button or Quantity Stepper */}
        {isInCart && cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-[#222222] border-2 border-[#C5A059] rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, -1)}
              className="w-11 h-11 rounded-lg bg-[#2F2F2F] hover:bg-[#3D3D3D] text-white flex items-center justify-center font-black text-lg cursor-pointer"
              title="Уменьшить количество"
              aria-label="Уменьшить"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="font-black text-base sm:text-lg text-white px-3 font-mono">
              {cartQuantity} шт
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, 1)}
              className="w-11 h-11 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black flex items-center justify-center font-black text-lg cursor-pointer"
              title="Увеличить количество"
              aria-label="Увеличить"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full py-4 px-5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-sm sm:text-base tracking-wide shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <span>{lang === 'kz' ? 'СЕБЕТКЕ ҚОСУ' : 'В КОРЗИНУ'}</span>
          </button>
        )}

        {/* 1-Click Fast Order Button with Solid Touch Target */}
        <button
          type="button"
          onClick={() => onQuickOrder(product)}
          className="w-full py-2.5 px-3 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white hover:text-[#C5A059] border border-[#333333] hover:border-[#C5A059] text-xs sm:text-sm font-bold text-center mt-2.5 cursor-pointer"
        >
          {lang === 'kz' ? '1 басумен алу' : 'Купить в 1 клик'}
        </button>
      </div>
    </article>
  );
};
