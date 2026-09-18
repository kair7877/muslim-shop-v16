import React, { useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Product, Language } from '../types';
import { translations } from '../translations';
import { ProductCard } from './ProductCard';

interface RecentlyViewedProps {
  products: Product[];
  language: Language;
  whatsappNumber: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onClear: () => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  products,
  language,
  whatsappNumber,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onClear,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  if (products.length === 0) {
    return null;
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const distance = 320;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 border-t border-[#1C1C26]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#181824] border border-[#2B2B3E] flex items-center justify-center text-[#D4AF37]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F4F1EA]">
                {t.recentlyViewed}
              </h2>
              <span className="text-xs text-[#8C877D] font-mono">
                ({products.length})
              </span>
            </div>
            <p className="text-[11px] text-[#8C877D] hidden sm:block">
              {t.recentlyViewedSubtitle}
            </p>
          </div>
        </div>

        {/* Controls: Scroll arrows & Clear button */}
        <div className="flex items-center gap-2">
          {products.length > 2 && (
            <div className="hidden sm:flex items-center gap-1 bg-[#13131A] border border-[#242432] rounded-xl p-0.5">
              <button
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A6A29A] hover:text-[#F4F1EA] hover:bg-[#1C1C28] transition-colors cursor-pointer"
                title={language === 'kz' ? 'Солға' : 'Назад'}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A6A29A] hover:text-[#F4F1EA] hover:bg-[#1C1C28] transition-colors cursor-pointer"
                title={language === 'kz' ? 'Оңға' : 'Вперед'}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#14141C] border border-[#262634] text-[11px] text-[#8C877D] hover:text-[#F87171] hover:border-[#F87171]/40 transition-colors cursor-pointer"
            title={t.clearRecentlyViewed}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.clearRecentlyViewed}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[175px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
          >
            <ProductCard
              product={product}
              language={language}
              whatsappNumber={whatsappNumber}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
