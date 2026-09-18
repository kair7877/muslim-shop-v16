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
        className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer w-full text-center select-none active:scale-[0.97] min-h-[92px] sm:min-h-[104px] border ${
          isSelected
            ? 'bg-gradient-to-b from-[#241F16] via-[#1A1710] to-[#12110D] border-[#D4AF37] shadow-[0_0_22px_rgba(212,175,55,0.22)] ring-1 ring-[#D4AF37]/60'
            : 'bg-gradient-to-b from-[#15151F] to-[#101016] border-[#252533] hover:border-[#D4AF37]/50 hover:bg-[#181824] shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
        }`}
        aria-pressed={isSelected}
      >
        {/* Subtle Luxury Corner Ambient Glow on Hover / Active */}
        <div 
          className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
            isSelected ? 'bg-[#D4AF37]/25 opacity-100' : 'bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100'
          }`} 
        />

        {/* Selected Checkmark Badge (top-right) */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B0B0E] flex items-center justify-center shadow-sm">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}

        {/* Optional decorative small pill badge (e.g. "Халяль", "Топ") */}
        {badge && !isSelected && (
          <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#1F1F2B] border border-[#2E2E3E] text-[#C5A059] tracking-wider uppercase">
            {badge}
          </span>
        )}

        {/* Icon Emblem */}
        <div 
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-2 transition-transform duration-300 group-hover:scale-110 shadow-inner ${
            isSelected
              ? 'bg-[#2E2818] border border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)] text-white'
              : 'bg-[#1C1C28] border border-[#2B2B3C] group-hover:border-[#D4AF37]/40 text-[#E8D49E]'
          }`}
        >
          <span>{cat.icon}</span>
        </div>

        {/* Category Label */}
        <span 
          className={`text-xs sm:text-sm font-semibold tracking-wide leading-tight line-clamp-2 transition-colors ${
            isSelected 
              ? 'text-[#F5E2AC]' 
              : 'text-[#E6E2D8] group-hover:text-[#F4F1EA]'
          }`}
        >
          {name}
        </span>
      </motion.button>
    );
  };

  return (
    <section className="w-full bg-[#0B0B0E] border-b border-[#1D1D26] pt-3 pb-5 sm:pt-6 sm:pb-7 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Block: Title with Gold Accent */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#E5C365] to-[#B38F39]" />
            <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold tracking-[0.18em] text-[#F4F1EA] uppercase">
              {titleText}
            </h2>
          </div>

          {selectedCategoryId ? (
            <button
              onClick={() => onSelectCategory(null)}
              className="text-[11px] sm:text-xs text-[#D4AF37] hover:text-[#F5E2AC] font-medium flex items-center gap-1 bg-[#1A1712] border border-[#D4AF37]/40 hover:border-[#D4AF37] px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-sm"
            >
              <span>✕</span>
              <span>{language === 'kz' ? 'Барлығын көрсету' : 'Сбросить фильтр'}</span>
            </button>
          ) : (
            <span className="text-[11px] sm:text-xs text-[#8C877D] tracking-wider hidden xs:inline">
              {subtitleText}
            </span>
          )}
        </div>

        {/* Primary 6 Tiles Grid: Exactly 2 in row × 3 rows on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-2.5 sm:pt-3">
                {EXPANDED_CATEGORIES.map((cat) => renderCategoryTile(cat, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* "ВСЕ КАТЕГОРИИ →" / "СКРЫТЬ КАТЕГОРИИ ↑" Luxury Toggle Button */}
        <div className="flex justify-center mt-3.5 sm:mt-5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-[#161622] via-[#1A1A28] to-[#161622] hover:from-[#1F1F30] hover:to-[#1F1F30] border border-[#C5A059]/60 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#F4E3B2] text-xs sm:text-sm font-bold tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_3px_16px_rgba(212,175,55,0.12)] hover:shadow-[0_4px_22px_rgba(212,175,55,0.28)] flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
            aria-expanded={isExpanded}
          >
            <span>{allCategoriesBtnText}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#D4AF37] group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
