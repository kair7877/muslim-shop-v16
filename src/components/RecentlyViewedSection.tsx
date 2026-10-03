import React from 'react';
import { Clock, ShoppingBag, Check, Trash2, Eye } from 'lucide-react';
import { Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface RecentlyViewedSectionProps {
  items: Product[];
  cartProductIds: Set<string>;
  lang: Language;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  items,
  cartProductIds,
  lang,
  onOpenProduct,
  onAddToCart,
  onRemoveItem,
  onClearAll,
}) => {
  const isKz = lang === 'kz';

  if (!items || items.length === 0) return null;

  return (
    <section
      id="recently-viewed-section"
      aria-label={isKz ? 'Жақында қаралған тауарлар' : 'Вы недавно смотрели'}
      className="w-full bg-slate-50 border-t border-slate-200/80 py-6 sm:py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2 leading-none">
                <span>{isKz ? 'Сіз жақында қарадыңыз' : 'Вы недавно смотрели'}</span>
                <span className="text-xs font-semibold text-slate-400">
                  ({items.length})
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="clear-recently-viewed-btn"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isKz ? 'Тазалау' : 'Очистить историю'}</span>
          </button>
        </div>

        {/* Horizontal Carousel in Flip.kz Style */}
        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-1">
          {items.map((prod) => {
            const inCart = cartProductIds.has(prod.id);
            const title = isKz && prod.titleKz?.trim() ? prod.titleKz : prod.titleRu;

            return (
              <div
                key={prod.id}
                className="group relative w-44 sm:w-52 shrink-0 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-3"
              >
                {/* Remove single item button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(prod.id);
                  }}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  title={isKz ? 'Тізімнен өшіру' : 'Удалить из истории'}
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div onClick={() => onOpenProduct(prod)} className="cursor-pointer">
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-white flex items-center justify-center mb-2">
                    <img
                      src={prod.images[0]}
                      alt={title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug h-8 sm:h-9">
                    {title}
                  </h4>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                    {formatPrice(prod.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onAddToCart(prod)}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      inCart
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title={inCart ? 'В корзине' : 'В корзину'}
                  >
                    {inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
