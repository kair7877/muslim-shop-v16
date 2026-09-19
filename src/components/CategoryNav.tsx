import React, { useRef } from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  language: Language;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  language,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative py-3 sm:py-4 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-2 sm:mb-2.5">
          <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            {t.categories}
          </h2>

          {/* Desktop scroll buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-amber-700 border border-gray-300 transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-amber-700 border border-gray-300 transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scrollable categories container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {/* "All" button */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
              selectedCategoryId === null
                ? 'bg-amber-600 text-white font-extrabold border-amber-600 shadow-sm'
                : 'bg-white text-gray-800 hover:text-amber-700 border-gray-300 hover:border-amber-400'
            }`}
          >
            <span>💎</span>
            <span>{t.allProducts}</span>
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const name = language === 'ru' ? cat.nameRu : (cat.nameKz || cat.nameRu);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-xs ${
                  isSelected
                    ? 'bg-amber-600 text-white font-extrabold border-amber-600 shadow-sm'
                    : 'bg-white text-gray-800 hover:text-amber-700 border-gray-300 hover:border-amber-400'
                }`}
              >
                <span className="text-base">{cat.icon || '🌿'}</span>
                <span className="whitespace-nowrap">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
