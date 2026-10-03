import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Clock,
  MapPin,
  PhoneCall,
  Lock,
  Layers,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { AccessibilitySettings, Category, Language, Product, StoreConfig } from '../types';
import { isStoreOpen } from '../utils/formatters';
import { SmartSearchBar } from './SmartSearchBar';

interface HeaderProps {
  config: StoreConfig;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  accessibility: AccessibilitySettings;
  onAccessibilityChange: (settings: AccessibilitySettings) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products?: Product[];
  categories?: Category[];
  productCounts?: Record<string, number>;
  onSelectCategory?: (categoryId: string) => void;
  onSelectSymptom?: (symptomId: string) => void;
  onOpenProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  cartCount: number;
  favoritesCount: number;
  compareCount?: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenCompare?: () => void;
  onOpenAdmin: () => void;
  onOpenCatalog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  lang,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  products = [],
  categories = [],
  productCounts = {},
  onSelectCategory = (_catId: string) => {},
  onSelectSymptom,
  onOpenProduct = () => {},
  onAddToCart = () => {},
  cartCount,
  favoritesCount,
  compareCount = 0,
  onOpenCart,
  onOpenFavorites,
  onOpenCompare,
  onOpenAdmin,
  onOpenCatalog,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const status = isStoreOpen(config);
  const isKz = lang === 'kz';

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full max-w-full overflow-visible bg-white border-b border-slate-200/90 shadow-sm transition-colors"
    >
      {/* 1. Flip.kz Style Top Service Microbar */}
      <div
        id="top-utility-bar"
        className="py-1.5 px-3 sm:px-6 text-xs bg-slate-50 text-slate-600 border-b border-slate-200/70 w-full overflow-hidden"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* City, Location & Store Status */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            <a
              id="top-address-link"
              href={config.gis2Url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
              title="Открыть в 2GIS: ТД «Дина Байзар», Бутик №24"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                г. {config.city} · {config.boutiqueNumber}
              </span>
              <span className="hidden md:inline text-slate-500 font-normal">
                (ТД «Дина Байзар»)
              </span>
            </a>

            <div id="top-hours-badge" className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
              <span className="hidden lg:inline">
                {isKz ? config.workingHoursKz : config.workingHoursRu}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                  status.isOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                {isKz ? status.textKz : status.textRu}
              </span>
            </div>
          </div>

          {/* Right Tools: Phone, Language Switcher, Admin Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Phone link */}
            <a
              id="top-call-phone-link"
              href={`tel:+${config.whatsappNumber}`}
              className="hidden md:flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>+7 (778) 175-42-41</span>
            </a>

            {/* Language Switcher */}
            <div
              id="language-switcher"
              className="flex items-center bg-slate-200/70 p-0.5 rounded-md text-[11px] font-bold"
            >
              <button
                id="lang-ru-btn"
                type="button"
                onClick={() => onLanguageChange('ru')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  lang === 'ru'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                RU
              </button>
              <button
                id="lang-kz-btn"
                type="button"
                onClick={() => onLanguageChange('kz')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  lang === 'kz'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KZ
              </button>
            </div>

            {/* Admin discrete entry */}
            <button
              id="top-admin-access-btn"
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-blue-700 hover:border-blue-400 transition-colors text-[11px] font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
              title="Панель управления Бутиком №24"
            >
              <Lock className="w-3 h-3 text-slate-500 shrink-0" />
              <span>Бутик №24</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar in Flip.kz Marketplace Architecture */}
      <div
        id="main-nav-container"
        className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-5 w-full"
      >
        {/* Brand Logo & Title */}
        <div id="boutique-brand" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            id="boutique-logo-icon"
            onClick={onOpenAdmin}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-sm cursor-pointer shrink-0 transition-transform active:scale-95"
            title="MUSLIM SHOP • Атырау"
          >
            <span>M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                id="brand-name-title"
                className="font-black tracking-tight text-xl sm:text-2xl text-slate-900 leading-none whitespace-nowrap block"
              >
                MUSLIM <span className="text-blue-600">SHOP</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {config.boutiqueNumber}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-none mt-1">
              {isKz ? 'Халал & iHerb маркетплейсі' : 'Халяль & iHerb маркетплейс'}
            </p>
          </div>
        </div>

        {/* Flip.kz Signature: Big Blue "Каталог" Button */}
        <button
          id="header-catalog-btn"
          type="button"
          onClick={onOpenCatalog}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Layers className="w-4 h-4" />
          <span>{isKz ? 'Каталог' : 'Каталог товаров'}</span>
        </button>

        {/* Centered Large Search Bar (Desktop) */}
        <div
          id="header-search-bar"
          className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4 relative"
        >
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
          />
        </div>

        {/* Action Buttons: Compare, Favorites, Cart */}
        <div id="header-actions" className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Compare Button */}
          {onOpenCompare && (
            <button
              id="compare-drawer-btn"
              type="button"
              onClick={onOpenCompare}
              className="relative p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors hidden lg:flex items-center justify-center cursor-pointer"
              title={isKz ? 'Салыстыру' : 'Сравнение товаров'}
            >
              <ArrowLeftRight className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          {/* Favorites Button */}
          <button
            id="favorites-drawer-btn"
            type="button"
            onClick={onOpenFavorites}
            className="relative p-2.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            title={isKz ? 'Таңдаулылар' : 'Избранное'}
          >
            <Heart
              className={`w-5 h-5 ${
                favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            {favoritesCount > 0 && (
              <span
                id="favorites-badge-count"
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs"
              >
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Flip.kz Signature Cart Button */}
          <button
            id="cart-drawer-btn"
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span
                  id="cart-badge-count"
                  className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs"
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">
              {isKz ? 'Себет' : 'Корзина'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Flip.kz Style Horizontal Category Quick Nav Bar (Sub-header) */}
      <nav
        id="sub-header-category-nav"
        className="hidden md:block bg-white border-t border-slate-100 border-b border-slate-200/80 px-3 sm:px-6 overflow-x-auto no-scrollbar"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5 text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => onSelectCategory('cat-all')}
            className="px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-slate-900 font-bold"
          >
            <span>🏷️</span>
            <span>{isKz ? 'Барлық өнімдер' : 'Все товары'}</span>
          </button>

          {categories.slice(0, 9).map((cat) => {
            const catName = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
              >
                <span>{cat.icon || '•'}</span>
                <span>{catName}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Search Bar & Mobile Catalog Trigger */}
      <div
        id="mobile-search-container"
        className="md:hidden px-3.5 pb-2.5 pt-1.5 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        {onOpenCatalog && (
          <button
            type="button"
            onClick={onOpenCatalog}
            className="p-2.5 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
            title={isKz ? 'Каталог' : 'Каталог'}
          >
            <Layers className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <SmartSearchBar
            inputId="mobile-search-input"
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
            autoFocus={isSearchOpen}
            onAfterSelect={() => setIsSearchOpen(false)}
          />
        </div>
      </div>
    </header>
  );
};
