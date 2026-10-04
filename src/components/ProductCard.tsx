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
      className="group relative rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 bg-[#171717] border border-[#262626] hover:border-[#C5A059] hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
    >
      {/* Top Section: Large Clear Image */}
      <div className="flex flex-col">
        <div
          onClick={() => onOpenDetail(product)}
          className="relative aspect-square w-full bg-white p-3 sm:p-4 overflow-hidden cursor-pointer flex items-center justify-center border-b border-[#262626]"
        >
          <img
            src={product.images[0]}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Minimal Clean Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {discountPercent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-[#C5A059] text-black shadow-md">
                -{discountPercent}%
              </span>
            )}
            {product.isHit && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-black/85 text-[#C5A059] border border-[#C5A059]/50 shadow-md">
                ХИТ
              </span>
            )}
          </div>

          {/* Top-Right Quick Actions: Favorite & Share */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
            <button
              id={`fav-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isFavorite
                  ? 'bg-black/80 text-[#C5A059] border border-[#C5A059]'
                  : 'bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/20'
              }`}
              title={lang === 'kz' ? 'Таңдаулыға қосу' : 'В избранное'}
              aria-label="В избранное"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#C5A059] text-[#C5A059]' : ''}`} />
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
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/20"
              title={lang === 'kz' ? 'Бөлісу' : 'Поделиться'}
              aria-label="Поделиться"
            >
              {isShared ? (
                <Check className="w-4 h-4 text-[#C5A059]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Product Information Body: Clean, High Contrast, Large Text */}
        <div className="p-3.5 sm:p-4 pb-1 space-y-1.5">
          {/* Status & Volume info */}
          <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.inStock ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className={product.inStock ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {product.inStock
                  ? (lang === 'kz' ? 'Бутик №24 • Қолда бар' : 'В наличии в Бутике №24')
                  : (lang === 'kz' ? 'Тапсырыспен' : 'Под заказ')}
              </span>
            </span>

            {product.volumeOrWeight && (
              <span className="text-[#8E8E8E] font-medium truncate max-w-[100px]">
                {product.volumeOrWeight}
              </span>
            )}
          </div>

          {/* Product Title: Big, Bold, White, Easy to Read */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-bold text-white group-hover:text-[#C5A059] transition-colors cursor-pointer line-clamp-2 text-sm sm:text-base leading-snug min-h-[2.5rem] pt-0.5"
            title={title}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Pricing & Cart Action Area */}
      <div className="p-3.5 sm:p-4 pt-2">
        {/* Large Prominent Price Display */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl sm:text-2xl font-black text-[#C5A059] tracking-tight tabular-nums">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs sm:text-sm text-[#737373] line-through tabular-nums">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Action: Prominent "В корзину" Button or Quantity Stepper */}
        {isInCart && cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-[#222222] border border-[#C5A059]/60 rounded-xl p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, -1)}
              className="w-9 h-9 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] active:scale-95 text-white flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
              title="Уменьшить количество"
              aria-label="Уменьшить"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-sm sm:text-base text-white px-3 font-mono">
              {cartQuantity} шт
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, 1)}
              className="w-9 h-9 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] active:scale-95 text-black flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
              title="Увеличить количество"
              aria-label="Увеличить"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] active:bg-[#B38F46] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'kz' ? 'СЕБЕТКЕ' : 'В КОРЗИНУ'}</span>
          </button>
        )}

        {/* 1-Click Fast Order Link */}
        <button
          type="button"
          onClick={() => onQuickOrder(product)}
          className="w-full text-center text-xs font-semibold text-[#A3A3A3] hover:text-[#C5A059] hover:underline mt-2.5 pt-0.5 transition-colors cursor-pointer"
        >
          {lang === 'kz' ? '1 басумен алу' : 'Купить в 1 клик'}
        </button>
      </div>
    </article>
  );
};
