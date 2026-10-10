import React from 'react';
import {
  MapPin,
  Lock,
  ChevronDown,
  Bell,
  MessageCircle,
} from 'lucide-react';
import {
  AccessibilitySettings,
  Category,
  Language,
  Product,
  StoreConfig,
} from '../types';
import { SmartSearchBar } from './SmartSearchBar';

interface HeaderProps {
  config: StoreConfig;
  cartCount: number;
  favoritesCount?: number;
  products: Product[];
  categories: Category[];
  selectedCategoryId?: string;
  productCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  accessibility?: AccessibilitySettings;
  onAccessibilityChange?: (settings: AccessibilitySettings) => void;
  onOpenCart: () => void;
  onOpenFavorites?: () => void;
  onOpenAdmin: () => void;
  onOpenCatalog?: () => void;
  onSelectCategory?: (id: string) => void;
  onSelectSymptom?: (symptomId: string) => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  products,
  categories,
  selectedCategoryId = 'cat-all',
  productCounts,
  searchQuery,
  onSearchChange,
  lang,
  onLanguageChange,
  onOpenAdmin,
  onSelectCategory,
  onSelectSymptom,
  onOpenProduct,
  onAddToCart,
}) => {
  const isKz = lang === 'kz';

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 w-full bg-[#15803d] text-white shadow-md select-none transition-all pt-[env(safe-area-inset-top,0px)]"
    >
      {/* 1. Top Bar (iHerb style): Delivery Location + Quick Icons */}
      <div className="px-3.5 sm:px-6 pt-2.5 pb-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Location selector */}
          <div className="flex items-center gap-1.5 text-white/95 font-bold text-xs sm:text-sm truncate cursor-pointer hover:text-white transition-opacity">
            <MapPin className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">
              {config.city || 'Атырау'}, {config.boutiqueNumber || 'Бутик №24'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/70 shrink-0" />
          </div>

          {/* Right Actions: WhatsApp, Bell, Language switch, Admin Lock */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* WhatsApp direct contact */}
            <a
              href={`https://wa.me/${config.whatsappNumber || '77781754241'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors"
              title="Написать в WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-100" />
            </a>

            {/* Notification / Promo Bell */}
            <div
              className="relative p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
              title="Акции и скидки"
            >
              <Bell className="w-4 h-4 text-emerald-100" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            </div>

            {/* Language Switcher RU/KZ */}
            <div className="flex items-center bg-black/20 rounded-full p-0.5 border border-white/20 text-[11px] font-black">
              <button
                type="button"
                onClick={() => onLanguageChange('ru')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  !isKz
                    ? 'bg-white text-emerald-950 font-black shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('kz')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  isKz
                    ? 'bg-white text-emerald-950 font-black shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                KZ
              </button>
            </div>

            {/* Discreet Admin Lock Button */}
            <button
              type="button"
              id="header-admin-lock-btn"
              onClick={onOpenAdmin}
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Вход"
              aria-label="Вход"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Large Search Bar (iHerb style) */}
        <div className="max-w-7xl mx-auto mt-2">
          <SmartSearchBar
            inputId="header-search-input"
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            products={products}
            categories={categories}
            productCounts={productCounts}
            lang={lang}
            onSelectCategory={onSelectCategory}
            onSelectSymptom={onSelectSymptom}
            onOpenProduct={onOpenProduct}
            onAddToCart={onAddToCart}
            placeholder={
              isKz
                ? 'muslimshop.kz-тен іздеу (витаминдер, тмин, ББҚ)...'
                : 'Поиск на muslimshop.kz (витамины, тмин, БАДы)...'
            }
          />
        </div>
      </div>

      {/* 3. Horizontal Categories Navigation with Green Underline (iHerb reference) */}
      <nav
        aria-label="Категории товаров"
        className="w-full bg-white text-slate-800 border-b border-slate-200/90 shadow-2xs overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap gap-5 sm:gap-7 py-2.5 px-2">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const name = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;

              return (
                <button
                  key={cat.id}
                  id={`header-cat-${cat.id}`}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.id);
                    }
                  }}
                  className={`group relative text-sm sm:text-[15px] pb-1.5 transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'text-emerald-700 font-black'
                      : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
                    <span>{name}</span>
                  </span>

                  {/* Active green underline bar (like in iHerb) */}
                  {isSelected && (
                    <span className="absolute bottom-0 inset-x-0 h-[3px] bg-emerald-600 rounded-full animate-in fade-in duration-200" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
