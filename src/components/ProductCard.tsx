import React from 'react';
import {
  Heart,
  ShoppingBag,
  Zap,
  Sparkles,
  Flame,
  Clock,
  Share2,
  Check,
  ArrowLeftRight,
  Plus,
  Minus,
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
  isInCompare = false,
  onToggleFavorite,
  onToggleCompare,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onOpenDetail,
  onQuickOrder,
  onShareFeedback,
}) => {
  const [isShared, setIsShared] = React.useState(false);
  const title = lang === 'kz' && product.titleKz?.trim() ? product.titleKz : product.titleRu;
  const description =
    lang === 'kz' && product.descriptionKz?.trim()
      ? product.descriptionKz
      : product.descriptionRu;

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <article
      id={`product-card-${product.id}`}
      className="group relative rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-lg"
    >
      {/* Top Image Container */}
      <div className="flex flex-col">
        <div
          onClick={() => onOpenDetail(product)}
          className="relative aspect-[4/5] sm:aspect-square w-full bg-white p-3 overflow-hidden cursor-pointer flex items-center justify-center border-b border-slate-100"
        >
          <img
            src={product.images[0]}
            alt={`${title} — Flip.kz стиль, MUSLIM SHOP Бутик №24`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges in Flip.kz Style (Top-Left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {discountPercent && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-black bg-rose-500 text-white shadow-2xs">
                -{discountPercent}%
              </span>
            )}
            {product.isHit && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-amber-500 text-white shadow-2xs">
                <Flame className="w-3 h-3 fill-white" />
                <span>ХИТ</span>
              </span>
            )}
            {product.isNew && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-600 text-white shadow-2xs">
                <Sparkles className="w-3 h-3" />
                <span>НОВИНКА</span>
              </span>
            )}
            {!product.inStock && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-extrabold bg-slate-600 text-white">
                <Clock className="w-3 h-3" />
                <span>{lang === 'kz' ? 'Жақында' : 'Под заказ'}</span>
              </span>
            )}
          </div>

          {/* Top-Right Action Buttons: Favorite, Share, Compare */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
            <button
              id={`fav-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isFavorite
                  ? 'bg-rose-50 border border-rose-200 text-rose-600'
                  : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200'
              }`}
              title={lang === 'kz' ? 'Таңдаулыға қосу' : 'В избранное'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            {onToggleCompare && (
              <button
                id={`compare-btn-${product.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isInCompare
                    ? 'bg-blue-50 border border-blue-200 text-blue-600'
                    : 'bg-white/90 hover:bg-white text-slate-400 hover:text-blue-600 border border-slate-200'
                }`}
                title={lang === 'kz' ? 'Салыстыру' : 'Сравнить'}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              id={`share-btn-${product.id}`}
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const res = await shareOrCopyProduct(product, lang);
                if (res.success) {
                  setIsShared(true);
                  setTimeout(() => setIsShared(false), 2200);
                  if (
                    (res.method === 'copied' || (res.method as string) === 'copy') &&
                    onShareFeedback
                  ) {
                    onShareFeedback(
                      lang === 'kz'
                        ? 'Өнім сілтемесі көшірілді!'
                        : 'Прямая ссылка на товар скопирована!'
                    );
                  }
                }
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isShared
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-600'
                  : 'bg-white/90 hover:bg-white text-slate-400 hover:text-blue-600 border border-slate-200'
              }`}
              title={lang === 'kz' ? 'Бөлісу' : 'Поделиться ссылкой'}
            >
              {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Product Information Body */}
        <div className="p-3 sm:p-4 pb-1">
          {/* Flip.kz Delivery & In-Stock Status Badge */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {product.inStock ? 'В наличии в Бутике №24' : 'Под заказ'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              #{product.sku}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-snug text-sm sm:text-base h-10 sm:h-11"
            title={title}
          >
            {title}
          </h3>

          {/* Volume & Country Details */}
          {(product.volumeOrWeight || product.country) && (
            <p className="text-xs text-slate-500 truncate mt-1">
              {product.volumeOrWeight}
              {product.volumeOrWeight && product.country && ' · '}
              {product.country}
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Flip.kz Buy Actions */}
      <div className="p-3 sm:p-4 pt-2">
        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-slate-400 line-through tabular-nums">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Flip.kz Add to Cart or Stepper */}
        {isInCart && cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, -1)}
              className="w-8 h-8 rounded-md bg-white text-blue-700 hover:bg-blue-100 flex items-center justify-center font-bold text-base shadow-2xs transition-colors cursor-pointer"
              title="Уменьшить количество"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-xs sm:text-sm text-blue-900 px-2">
              {cartQuantity} шт
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity && onUpdateQuantity(product.id, 1)}
              className="w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center font-bold text-base shadow-2xs transition-colors cursor-pointer"
              title="Увеличить количество"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'kz' ? 'Себетке' : 'В корзину'}</span>
          </button>
        )}

        {/* 1-Click Quick Order Link */}
        <button
          type="button"
          onClick={() => onQuickOrder(product)}
          className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-2 pt-1 transition-colors cursor-pointer"
        >
          {lang === 'kz' ? '1 кликпен жылдам алу' : 'Купить в 1 клик'}
        </button>
      </div>
    </article>
  );
};
