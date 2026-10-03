import React from 'react';
import { Layers, RotateCcw, Settings2 } from 'lucide-react';
import { Category, Language } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  lang: Language;
  productCounts: Record<string, number>;
  onOpenAdminCategories?: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  lang,
  productCounts,
  onOpenAdminCategories,
}) => {
  const isKz = lang === 'kz';

  return (
    <section
      id="category-nav-bar"
      aria-label={isKz ? 'Санаттар каталогы' : 'Каталог категорий'}
      className="w-full max-w-full overflow-x-hidden bg-white border-b border-slate-200/80 py-4 sm:py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header toolbar for Categories */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{isKz ? 'Каталог бөлімдері' : 'Каталог товаров'}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {categories.length} {isKz ? 'санат' : 'категорий'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCategoryId !== 'cat-all' && (
              <button
                type="button"
                id="reset-category-filter-btn"
                onClick={() => onSelectCategory('cat-all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isKz ? 'Барлығын көрсету' : 'Сбросить фильтр'}</span>
              </button>
            )}

            {onOpenAdminCategories && (
              <button
                type="button"
                id="manage-categories-btn"
                onClick={onOpenAdminCategories}
                title={isKz ? 'Каталогтарды баптау' : 'Управление каталогами'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">
                  {isKz ? 'Баптау' : 'Настроить'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid / Chips in Flip.kz Style */}
        <div
          id="category-grid-chips"
          className="flex flex-wrap items-center gap-2 sm:gap-2.5"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = productCounts[cat.id] ?? 0;
            const catName = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;

            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none active:scale-98 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-200'
                }`}
              >
                <span className="text-base leading-none">
                  {cat.icon || '•'}
                </span>

                <span className="whitespace-nowrap">
                  {catName}
                </span>

                {count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
