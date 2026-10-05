import React, { useState } from 'react';
import {
  BookOpen,
  Pill,
  HeartPulse,
  Shield,
  Flower2,
  Droplets,
  ArrowRight,
  RotateCcw,
  Layers,
  Settings2,
} from 'lucide-react';
import { Category, Language } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  lang: Language;
  productCounts: Record<string, number>;
  onOpenAdminCategories?: () => void;
}

// 6 Core Categories with elegant vector icons and bilingual titles
const MAIN_6_TILES = [
  {
    key: 'cat-muslim',
    titleRu: 'ИСЛАМСКИЕ ТОВАРЫ',
    titleKz: 'ИСЛАМ ТАУАРЛАРЫ',
    subRu: 'Тмин, кыст, сурьма, сивак, хиджама',
    subKz: 'Зере майы, қыст, мисуак, хиджама',
    icon: BookOpen,
  },
  {
    key: 'cat-iherb',
    titleRu: 'ВИТАМИНЫ',
    titleKz: 'ВИТАМИНДЕР',
    subRu: 'iHerb, D3, Омега-3, Магний, Цинк',
    subKz: 'iHerb, D3, Омега-3, Магний, Мырыш',
    icon: Pill,
  },
  {
    key: 'cat-health',
    titleRu: 'ЗДОРОВЬЕ',
    titleKz: 'ДЕНСАУЛЫҚ',
    subRu: 'Натуральные БАДы, мед, иммунитет',
    subKz: 'Табиғи ББҚ, бал, иммунитет',
    icon: HeartPulse,
  },
  {
    key: 'cat-men',
    titleRu: 'МУЖСКОЕ ЗДОРОВЬЕ',
    titleKz: 'ЕРЛЕР ДЕНСАУЛЫҒЫ',
    subRu: 'Эпимедиумные пасты, сила, тонус',
    subKz: 'Эпимедиум пасталары, қуат, күш',
    icon: Shield,
  },
  {
    key: 'cat-women',
    titleRu: 'ЖЕНСКОЕ ЗДОРОВЬЕ',
    titleKz: 'ӘЙЕЛДЕР ДЕНСАУЛЫҒЫ',
    subRu: 'Красота, уход, баланс, омоложение',
    subKz: 'Сұлулық, күтім, гормон балансы',
    icon: Flower2,
  },
  {
    key: 'cat-perfume',
    titleRu: 'ПАРФЮМЕРИЯ',
    titleKz: 'ПАРФЮМЕРИЯ',
    subRu: 'Арабские масляные духи, миски',
    subKz: 'Араб майлы әтірлері, мисктер',
    icon: Droplets,
  },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  lang,
  productCounts,
  onOpenAdminCategories,
}) => {
  const isKz = lang === 'kz';
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Helper to resolve actual category id for the 6 tiles
  const resolveCategoryId = (key: string): string => {
    if (key === 'cat-perfume') {
      const perfCat = categories.find(
        (c) =>
          c.id === 'cat-muslim' ||
          c.nameRu.toLowerCase().includes('аромат') ||
          c.nameRu.toLowerCase().includes('парфюм')
      );
      return perfCat?.id || 'cat-muslim';
    }
    const found = categories.find((c) => c.id === key);
    return found ? found.id : key;
  };

  const isMainTileActive = (key: string) => {
    const targetId = resolveCategoryId(key);
    return selectedCategoryId === targetId;
  };

  return (
    <section
      id="category-nav-bar"
      aria-label={isKz ? 'Санаттар каталогы' : 'Категории товаров'}
      className="w-full max-w-full overflow-x-hidden bg-[#0F0F0F] border-b border-[#242424] py-6 sm:py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#C5A059] rounded-full" />
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {isKz ? 'НЕГІЗГІ БӨЛІМДЕР' : 'ОСНОВНЫЕ КАТЕГОРИИ'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {selectedCategoryId !== 'cat-all' && (
              <button
                type="button"
                id="reset-category-filter-btn"
                onClick={() => onSelectCategory('cat-all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#C5A059] border border-[#C5A059]/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isKz ? 'Барлығын көрсету' : 'Сбросить фильтр'}</span>
              </button>
            )}

            {onOpenAdminCategories && (
              <button
                type="button"
                onClick={onOpenAdminCategories}
                title="Настроить"
                className="p-2 rounded-lg text-[#737373] hover:text-[#C5A059] hover:bg-[#1A1A1A] transition-colors"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2 × 3 Tiles Grid: Serious, Graphite, Thin Gold Border, Large Icon & Typography */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {MAIN_6_TILES.map((tile) => {
            const targetId = resolveCategoryId(tile.key);
            const isActive = isMainTileActive(tile.key);
            const Icon = tile.icon;
            const count = productCounts[targetId] ?? 0;

            return (
              <button
                key={tile.key}
                type="button"
                onClick={() => {
                  if (isActive) {
                    onSelectCategory('cat-all');
                  } else {
                    onSelectCategory(targetId);
                  }
                }}
                className={`group relative flex flex-col items-start justify-between p-5 sm:p-6 rounded-2xl cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#1E1E1E] border-2 border-[#C5A059] shadow-lg'
                    : 'bg-[#161616] border-2 border-[#2E2E2E] hover:border-[#C5A059] hover:bg-[#1D1D1D]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3.5">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${
                      isActive
                        ? 'bg-[#C5A059] text-black'
                        : 'bg-[#222222] text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-black'
                    }`}
                  >
                    <Icon className="w-7 h-7 stroke-[2]" />
                  </div>

                  {count > 0 && (
                    <span className="text-xs sm:text-sm font-black font-mono px-2.5 py-1 rounded-md bg-[#242424] text-[#D4AF37] border border-[#3A3A3A]">
                      {count}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 w-full">
                  <h3
                    className={`font-black tracking-wide text-sm sm:text-lg leading-tight ${
                      isActive
                        ? 'text-[#C5A059]'
                        : 'text-white group-hover:text-[#C5A059]'
                    }`}
                  >
                    {isKz ? tile.titleKz : tile.titleRu}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3A3A3] leading-normal line-clamp-1">
                    {isKz ? tile.subKz : tile.subRu}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* «ВСЕ КАТЕГОРИИ →» Button directly below the 6 tiles */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowAllCategories((prev) => !prev)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#C5A059]/40 hover:border-[#C5A059] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-sm group"
          >
            <Layers className="w-4 h-4 text-[#C5A059]" />
            <span>
              {showAllCategories
                ? isKz
                  ? 'САНАТТАРДЫ ЖАСЫРУ ↑'
                  : 'СКРЫТЬ КАТЕГОРИИ ↑'
                : isKz
                ? 'БАРЛЫҚ САНАТТАР →'
                : 'ВСЕ КАТЕГОРИИ →'}
            </span>
            <ArrowRight
              className={`w-4 h-4 text-[#C5A059] transition-transform ${
                showAllCategories ? '-rotate-90' : 'group-hover:translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Expanded All Categories List (when user clicks «ВСЕ КАТЕГОРИИ →») */}
        {showAllCategories && (
          <div className="mt-5 pt-5 border-t border-[#242424] animate-in fade-in duration-200">
            <p className="text-xs text-[#A3A3A3] mb-3 uppercase tracking-wider font-semibold">
              {isKz ? 'Барлық бөлімдер тізімі:' : 'Все разделы магазина:'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const count = productCounts[cat.id] ?? 0;
                const catName = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C5A059] text-black font-extrabold'
                        : 'bg-[#171717] hover:bg-[#222222] text-[#E5E5E5] border border-[#2D2D2D] hover:border-[#C5A059]'
                    }`}
                  >
                    <span>{catName}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isSelected
                            ? 'bg-black text-[#C5A059]'
                            : 'bg-[#262626] text-[#A3A3A3]'
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
        )}
      </div>
    </section>
  );
};
