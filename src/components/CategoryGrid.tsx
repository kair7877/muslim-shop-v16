import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronUp, Sparkles, Check } from 'lucide-react';
import { Language, Product } from '../types';

export interface CategoryGridItem {
  id: string;
  icon: string;
  nameRu: string;
  nameKz: string;
  badgeRu?: string;
  badgeKz?: string;
}

// 6 Primary Categories (2 in row × 3 rows on mobile)
export const PRIMARY_CATEGORIES: CategoryGridItem[] = [
  {
    id: 'cat-muslim',
    icon: '🕌',
    nameRu: 'Исламские товары',
    nameKz: 'Ислам тауарлары',
    badgeRu: 'Халяль',
    badgeKz: 'Халал',
  },
  {
    id: 'cat-beauty',
    icon: '🧴',
    nameRu: 'Миски и парфюмерия',
    nameKz: 'Мисктәр мен парфюмерия',
    badgeRu: 'Ароматы',
    badgeKz: 'Хош иістер',
  },
  {
    id: 'cat-iherb',
    icon: '💊',
    nameRu: 'Витамины',
    nameKz: 'Витаминдер',
    badgeRu: 'iHerb',
    badgeKz: 'iHerb',
  },
  {
    id: 'cat-health',
    icon: '❤️',
    nameRu: 'Здоровье',
    nameKz: 'Денсаулық',
    badgeRu: 'Иммунитет',
    badgeKz: 'Иммунитет',
  },
  {
    id: 'cat-men',
    icon: '👨',
    nameRu: 'Мужское здоровье',
    nameKz: 'Ерлер денсаулығы',
    badgeRu: 'Энергия',
    badgeKz: 'Қуат',
  },
  {
    id: 'cat-women',
    icon: '👩',
    nameRu: 'Женское здоровье',
    nameKz: 'Әйелдер денсаулығы',
    badgeRu: 'Красота',
    badgeKz: 'Сұлулық',
  },
];

// Remaining 6 Categories (revealed on "ВСЕ КАТЕГОРИИ →")
export const EXPANDED_CATEGORIES: CategoryGridItem[] = [
  {
    id: 'cat-natural',
    icon: '🍯',
    nameRu: 'Мёд и продукты',
    nameKz: 'Бал және өнімдер',
  },
  {
    id: 'cat-remedies',
    icon: '🌿',
    nameRu: 'Натуральные средства',
    nameKz: 'Табиғи құралдар',
  },
  {
    id: 'cat-weight',
    icon: '💪',
    nameRu: 'Для набора веса',
    nameKz: 'Салмақ қосу үшін',
  },
  {
    id: 'cat-zheynamaz',
    icon: '🧎',
    nameRu: 'Жейнамазы',
    nameKz: 'Жайнамаздар',
  },
  {
    id: 'cat-hits',
    icon: '🔥',
    nameRu: 'Хиты продаж',
    nameKz: 'Хит өнімдер',
    badgeRu: 'Топ',
    badgeKz: 'Топ',
  },
  {
    id: 'cat-new',
    icon: '✨',
    nameRu: 'Новинки',
    nameKz: 'Жаңалықтар',
    badgeRu: 'New',
    badgeKz: 'Жаңа',
  },
];

export const isProductMatchingCategory = (product: Product, catId: string): boolean => {
  if (product.categoryId === catId) return true;

  const title = (product.titleRu || '').toLowerCase() + ' ' + (product.titleKz || '').toLowerCase();
  const desc = (product.descriptionRu || '').toLowerCase() + ' ' + (product.descriptionKz || '').toLowerCase();
  const fullText = title + ' ' + desc;

  switch (catId) {
    case 'cat-muslim':
      return (
        product.categoryId === 'cat-muslim' ||
        /четки|сивак|мисвак|тасбих|мусульман|ислам|коран|намаз|жайнамаз|жейнамаз|миск|black stone|азан/i.test(fullText)
      );
    case 'cat-beauty':
      return (
        product.categoryId === 'cat-beauty' ||
        /миск|парфюм|духи|аромат|шампунь|chiccare|trioxidil|коллаген|сыворотка|волос|масло|beauty/i.test(fullText)
      );
    case 'cat-iherb':
      return (
        product.categoryId === 'cat-iherb' ||
        /now foods|california gold|swanson|21st century|natural factors|nature's bounty|life extension|life-flo|childlife|dinosaurs|kal|hema-plex|mason natural|solaray|vitamin|витамин|магний|кальций|цинк|селен|omega|омега|d3|железо|таурин|биотин|инозитол|лецитин|спирулина/i.test(fullText)
      );
    case 'cat-health':
      return (
        product.categoryId === 'cat-health' ||
        /здоровье|иммунитет|тмин|масло|семена|бальзам|капсул|сбор|очищение|immune/i.test(fullText)
      );
    case 'cat-men':
      return (
        product.categoryId === 'cat-men' ||
        /мужск|для мужчин|эпимедиум|maral|boss|олень|sidra|q7|maserati|простат|мужская сила|панты|super power|nasr|viagra/i.test(fullText)
      );
    case 'cat-women':
      return (
        product.categoryId === 'cat-women' ||
        /женск|для женщин|әйел|коллаген|collagen|youtheory|smart collagen|nutraxin|красота|beauty|ногти|кожа|altun deva/i.test(fullText)
      );
    case 'cat-natural':
      return (
        product.categoryId === 'cat-natural' ||
        /мед|мёд|бал|паста|macun|honey|royal king|bio honey|bio-herbs|тмин|семена|масло/i.test(fullText)
      );
    case 'cat-remedies':
    case 'cat-diet':
      return (
        product.categoryId === 'cat-diet' ||
        product.categoryId === 'cat-natural' ||
        /травян|детокс|detox|сбор|растительн|natural|herbal|чай|похудение|сжигатель|fatzorb|shafran|lipo rush|feridun|hhs/i.test(fullText)
      );
    case 'cat-weight':
      return (
        /набор веса|мака|перуанск|super teke|royal king|bio-herbs|samyun|самыюн|гейнер|протеин|сила|масса|macun/i.test(fullText) ||
        product.categoryId === 'cat-men'
      );
    case 'cat-zheynamaz':
      return (
        /жайнамаз|жейнамаз|намазник|коврик|ковер|четки|мисвак|тасбих/i.test(fullText) ||
        product.categoryId === 'cat-muslim'
      );
    case 'cat-hits':
      return Boolean(product.isHit || product.categoryId === 'cat-hits');
    case 'cat-new':
      return Boolean(product.isNew || product.categoryId === 'cat-new');
    default:
      return product.categoryId === catId;
  }
};

interface CategoryGridProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  language: Language;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategoryId,
  onSelectCategory,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const titleText = language === 'kz' ? 'КАТЕГОРИЯЛАР' : 'КАТЕГОРИИ';
  const subtitleText = language === 'kz' 
    ? 'Керекті бөлімді таңдаңыз' 
    : 'Выберите нужный раздел товаров';

  const allCategoriesBtnText = isExpanded
    ? language === 'kz' ? 'САНАТТАРДЫ ЖАСЫРУ ↑' : 'СКРЫТЬ КАТЕГОРИИ ↑'
    : language === 'kz' ? 'БАРЛЫҚ САНАТТАР →' : 'ВСЕ КАТЕГОРИИ →';

  const handleTileClick = (catId: string) => {
    // If already selected, clicking again toggles back to all
    if (selectedCategoryId === catId) {
      onSelectCategory(null);
    } else {
      onSelectCategory(catId);
    }
  };

  const renderCategoryTile = (cat: CategoryGridItem, isSecondary = false) => {
    const isSelected = selectedCategoryId === cat.id;
    const name = language === 'kz' ? cat.nameKz : cat.nameRu;
    const badge = language === 'kz' ? cat.badgeKz : cat.badgeRu;

    return (
      <motion.button
        key={cat.id}
        layout
        initial={isSecondary ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22 }}
        onClick={() => handleTileClick(cat.id)}
        className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer w-full text-center select-none active:scale-[0.97] min-h-[100px] sm:min-h-[114px] border-2 ${
          isSelected
            ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/40'
            : 'bg-white border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 shadow-sm hover:shadow'
        }`}
        aria-pressed={isSelected}
      >
        {/* Subtle Ambient Glow on Hover / Active */}
        <div 
          className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
            isSelected ? 'bg-amber-400/20 opacity-100' : 'bg-amber-300/10 opacity-0 group-hover:opacity-100'
          }`} 
        />

        {/* Selected Checkmark Badge (top-right) */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}

        {/* Optional decorative small pill badge (e.g. "Халяль", "Топ") */}
        {badge && !isSelected && (
          <span className="absolute top-2 right-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800 tracking-wide uppercase">
            {badge}
          </span>
        )}

        {/* Icon Emblem */}
        <div 
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-2 transition-transform duration-300 group-hover:scale-110 ${
            isSelected
              ? 'bg-amber-100 border border-amber-400 text-amber-800 shadow-sm'
              : 'bg-gray-50 border border-gray-200 group-hover:border-amber-300 text-gray-800'
          }`}
        >
          <span>{cat.icon}</span>
        </div>

        {/* Category Label */}
        <span 
          className={`text-xs sm:text-sm font-bold tracking-tight leading-snug line-clamp-2 transition-colors ${
            isSelected 
              ? 'text-amber-900 font-extrabold' 
              : 'text-gray-900 group-hover:text-amber-700'
          }`}
        >
          {name}
        </span>
      </motion.button>
    );
  };

  return (
    <section className="w-full bg-gray-50 border-b border-gray-200 pt-4 pb-6 sm:pt-6 sm:pb-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Block: Title with Amber Accent */}
        <div className="flex items-center justify-between mb-3 sm:mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-5 rounded-full bg-amber-600" />
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-gray-900 uppercase">
              {titleText}
            </h2>
          </div>

          {selectedCategoryId ? (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs sm:text-sm text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 border border-amber-300 hover:border-amber-500 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
            >
              <span>✕</span>
              <span>{language === 'kz' ? 'Барлығын көрсету' : 'Сбросить фильтр'}</span>
            </button>
          ) : (
            <span className="text-xs sm:text-sm text-gray-600 tracking-wide hidden xs:inline font-medium">
              {subtitleText}
            </span>
          )}
        </div>

        {/* Primary 6 Tiles Grid: Exactly 2 in row × 3 rows on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {PRIMARY_CATEGORIES.map((cat) => renderCategoryTile(cat, false))}
        </div>

        {/* Expanded Remaining Categories with Smooth Motion Animation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 pt-2.5 sm:pt-3.5">
                {EXPANDED_CATEGORIES.map((cat) => renderCategoryTile(cat, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "ВСЕ КАТЕГОРИИ →" / "СКРЫТЬ КАТЕГОРИИ ↑" Toggle Button */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto px-7 sm:px-9 py-3 rounded-xl sm:rounded-full bg-white hover:bg-amber-50/70 border-2 border-amber-400 hover:border-amber-500 text-amber-800 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
            aria-expanded={isExpanded}
          >
            <span>{allCategoriesBtnText}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-700 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
