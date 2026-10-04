import React from 'react';
import { Clock, ShoppingBag, Check, Trash2 } from 'lucide-react';
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
      className="w-full bg-[#121212] border-t border-[#222222] py-8 sm:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#C5A059] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-xl text-white flex items-center gap-2 leading-none">
                <span>{isKz ? 'Сіз жақында қарадыңыз' : 'Вы недавно смотрели'}</span>
                <span className="text-xs font-mono font-bold text-[#C5A059]">
                  ({items.length})
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            id="clear-recently-viewed-btn"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8E8E8E] hover:text-white bg-[#1A1A1A] hover:bg-[#242424] border border-[#2A2A2A] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isKz ? 'Тазалау' : 'Очистить историю'}</span>
          </button>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex items-stretch gap-3.5 overflow-x-auto no-scrollbar py-1">
          {items.map((prod) => {
            const inCart = cartProductIds.has(prod.id);
            const title = isKz && prod.titleKz?.trim() ? prod.titleKz : prod.titleRu;

            return (
              <div
                key={prod.id}
                className="group relative w-48 sm:w-56 shrink-0 bg-[#171717] rounded-xl border border-[#262626] hover:border-[#C5A059] transition-all flex flex-col justify-between overflow-hidden p-3.5 shadow-md"
              >
                {/* Remove single item button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(prod.id);
                  }}
                  className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/70 text-[#8E8E8E] hover:text-rose-400 border border-[#333333] flex items-center justify-center transition-colors cursor-pointer"
                  title={isKz ? 'Тізімнен өшіру' : 'Удалить из истории'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div onClick={() => onOpenProduct(prod)} className="cursor-pointer">
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-white p-2 flex items-center justify-center mb-3">
                    <img
                      src={prod.images[0]}
                      alt={title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#C5A059] line-clamp-2 leading-snug h-9">
                    {title}
                  </h4>
                </div>

                <div className="pt-2.5 mt-2 border-t border-[#262626] flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#C5A059] tabular-nums">
                    {formatPrice(prod.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onAddToCart(prod)}
                    className={`p-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${
                      inCart
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                        : 'bg-[#C5A059] hover:bg-[#D4AF37] text-black shadow-xs'
                    }`}
                    title={inCart ? 'В корзине' : 'В корзину'}
                  >
                    {inCart ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
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
