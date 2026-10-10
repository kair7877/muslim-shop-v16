import React from 'react';
import {
  Heart,
  ShoppingBag,
  Clock,
  Share2,
  Check,
  CheckCircle2,
  MessageCircle,
  Truck,
  Star,
} from 'lucide-react';
import { AccessibilitySettings, Language, Product } from '../types';
import { formatPrice, shareOrCopyProduct } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  lang: Language;
  accessibility: AccessibilitySettings;
  isFavorite: boolean;
  isInCart?: boolean;
  isInCompare?: boolean;
  isLargeView?: boolean;
  onToggleFavorite: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
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
  isLargeView = false,
  onToggleFavorite,
  onAddToCart,
  onOpenDetail,
  onQuickOrder,
  onShareFeedback,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isJustAdded, setIsJustAdded] = React.useState(false);
  const isKz = lang === 'kz';

  const title = isKz && product.titleKz?.trim() ? product.titleKz : product.titleRu;
  const description =
    isKz && product.descriptionKz?.trim() ? product.descriptionKz : product.descriptionRu;

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await shareOrCopyProduct(product, lang);
    if (res.success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      if (onShareFeedback) {
        onShareFeedback(
          isKz ? 'Өнім сілтемесі көшірілді!' : 'Прямая ссылка на товар скопирована!'
        );
      }
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1600);
  };

  return (
    <article
      id={`product-card-${product.id}`}
      onClick={() => onOpenDetail(product)}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between bg-white border border-slate-200 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all duration-200 w-full cursor-pointer p-3 sm:p-4 select-none"
    >
      <div>
        {/* Photo Container */}
        <div className="relative w-full aspect-square bg-[#fbfbfb] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-2 sm:p-3 mb-2.5">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'}
            alt={`${title} — MUSLIM SHOP`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain object-center drop-shadow-2xs group-hover:scale-105 transition-transform duration-200"
          />

          {/* Badges: Hit, New, Discount */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {discountPercent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-black bg-rose-600 text-white shadow-xs">
                -{discountPercent}%
              </span>
            )}
            {product.isHit && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                ХИТ
              </span>
            )}
            {product.isNew && !product.isHit && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
                {isKz ? 'ЖАҢА' : 'NEW'}
              </span>
            )}
          </div>

          {/* Favorite button top right */}
          <button
            type="button"
            id={`fav-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product);
            }}
            className={`absolute top-2 right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shadow-2xs cursor-pointer z-10 border ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 border-slate-200/80'
            }`}
            title={isKz ? 'Таңдаулыға қосу' : 'В избранное'}
          >
            <Heart className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        </div>

        {/* Rating stars & status */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1.5">
          <div className="flex text-amber-400">{'★★★★★'}</div>
          <span className="text-slate-600 font-semibold font-sans text-xs">5.0</span>
          {product.inStock ? (
            <span className="text-emerald-700 text-[11px] font-bold ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
              {isKz ? 'Бар' : 'В наличии'}
            </span>
          ) : (
            <span className="text-slate-500 text-[11px] font-bold ml-auto">
              {isKz ? 'Тапсырыспен' : 'Под заказ'}
            </span>
          )}
        </div>

        {/* Title: Big & bold iHerb style */}
        <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug text-sm sm:text-base min-h-[38px] sm:min-h-[44px]">
          {title}
        </h3>

        {/* Large legible price */}
        <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
          <span className="font-black text-slate-950 font-sans text-lg sm:text-xl lg:text-2xl tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold font-sans">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Cart Button: Comfortable touch target >= 44px */}
      <div className="mt-3 pt-2">
        {product.inStock ? (
          <button
            type="button"
            id={`add-to-cart-${product.id}`}
            onClick={handleQuickAdd}
            className={`w-full min-h-[44px] h-11 sm:h-12 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-97 ${
              isJustAdded
                ? 'bg-emerald-600 text-white'
                : isInCart
                ? 'bg-emerald-900 hover:bg-emerald-950 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isJustAdded ? (
              <>
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-200 stroke-[2.5]" />
                <span>{isKz ? 'Қосылды!' : 'Добавлено!'}</span>
              </>
            ) : isInCart ? (
              <>
                <ShoppingBag className="w-4.5 h-4.5 text-emerald-200" />
                <span>{isKz ? 'Себетте (+1)' : 'В корзине (+1)'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>{isKz ? 'Себетке салу' : 'В корзину'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            id={`preorder-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickOrder(product);
            }}
            className="w-full min-h-[44px] h-11 sm:h-12 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{isKz ? 'Тапсырыс беру' : 'Под заказ'}</span>
          </button>
        )}
      </div>
    </article>
  );
};
