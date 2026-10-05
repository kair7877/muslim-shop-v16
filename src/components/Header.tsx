import React from 'react';
import {
  ShoppingBag,
  Heart,
  Layers,
  Search,
  Instagram,
  Phone,
  MapPin,
  Lock,
} from 'lucide-react';
import { Category, Language, Product, StoreConfig } from '../types';
import { SmartSearchBar } from './SmartSearchBar';

// Minimalist TikTok icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.33 0 .65.06.94.16v-3.56a6.38 6.38 0 0 0-.94-.07 6.34 6.34 0 0 0-6.34 6.35 6.34 6.34 0 0 0 6.34 6.35 6.34 6.34 0 0 0 6.33-6.35V8.87a8.28 8.28 0 0 0 4.83 1.55v-3.53a4.85 4.85 0 0 1-1.06-.2z" />
  </svg>
);

interface HeaderProps {
  config: StoreConfig;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
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
  onSelectCategory = () => {},
  onSelectSymptom,
  onOpenProduct = () => {},
  onAddToCart = () => {},
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenAdmin,
  onOpenCatalog,
}) => {
  const isKz = lang === 'kz';

  const instagramUrl =
    config.instagramUrl ||
    'https://www.instagram.com/musliim_shop06?stkn=dnAzejJ2cm5nOXNi';
  const tiktokUrl =
    config.tiktokUrl ||
    'https://www.tiktok.com/@muslim_shop06?_r=1&_t=ZS-9AFgdLAOcZ2';

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full bg-[#0F0F0F] border-b border-[#242424] text-white select-none transition-colors"
    >
      {/* 1. Subtle Utility Topbar: Boutique info + Contacts + Socials */}
      <div className="hidden sm:block border-b border-[#1C1C1C] py-2 px-4 sm:px-6 text-xs text-[#A3A3A3] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#E5E5E5] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Атырау · ТД «Дина Байзар», Бутик №24</span>
            </span>
            <span className="text-[#525252]">|</span>
            <a
              href={`tel:+${config.whatsappNumber}`}
              className="flex items-center gap-1 hover:text-[#C5A059] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#A3A3A3]" />
              <span>+7 (778) 175-42-41</span>
            </a>
            <span className="text-[#525252]">|</span>
            <span className="text-[#A3A3A3]">10:00 – 19:00</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Social media links */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @musliim_shop06"
              className="flex items-center gap-1.5 text-[#D4D4D4] hover:text-[#C5A059] transition-colors py-0.5 px-2 rounded hover:bg-[#1A1A1A]"
              title="Instagram @musliim_shop06"
            >
              <Instagram className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[11px] font-medium">@musliim_shop06</span>
            </a>

            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok @muslim_shop06"
              className="flex items-center gap-1.5 text-[#D4D4D4] hover:text-[#C5A059] transition-colors py-0.5 px-2 rounded hover:bg-[#1A1A1A]"
              title="TikTok @muslim_shop06"
            >
              <TikTokIcon className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-[11px] font-medium">@muslim_shop06</span>
            </a>

            <span className="text-[#525252]">|</span>

            {/* Language Switcher */}
            <div className="inline-flex items-center rounded bg-[#171717] border border-[#2A2A2A] p-0.5">
              <button
                type="button"
                onClick={() => onLanguageChange('ru')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  lang === 'ru'
                    ? 'bg-[#C5A059] text-black'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('kz')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  lang === 'kz'
                    ? 'bg-[#C5A059] text-black'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                KZ
              </button>
            </div>

            {/* Admin entry */}
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Администратор"
              className="p-1 rounded text-[#737373] hover:text-[#C5A059] transition-colors"
              title="Вход для администратора"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Premium Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold tracking-widest text-lg sm:text-2xl text-white font-serif whitespace-nowrap">
                MUSLIM <span className="text-[#C5A059]">SHOP</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] border border-[#2E2E2E] bg-[#171717] px-1.5 py-0.5 rounded inline-block whitespace-nowrap">
                Бутик №24
              </span>
              {/* Маленький замочек администратора */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAdmin();
                }}
                className="p-1 sm:p-1.5 rounded text-[#737373] hover:text-[#C5A059] hover:bg-[#1A1A1A] active:scale-90 transition-all cursor-pointer shrink-0 ml-0.5"
                title="Панель управления"
                aria-label="Панель управления"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#737373] hover:text-[#C5A059]" />
              </button>
            </div>
            <span className="text-[11px] text-[#A3A3A3] tracking-wide mt-0.5 hidden sm:block">
              {isKz ? 'Халал өнімдер мен витаминдер' : 'Халяль-товары и витамины в Атырау'}
            </span>
          </div>

          {/* Catalog Button */}
          {onOpenCatalog && (
            <button
              type="button"
              onClick={onOpenCatalog}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-[#2F2F2F] hover:border-[#C5A059] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm ml-2"
            >
              <Layers className="w-4 h-4 text-[#C5A059]" />
              <span>{isKz ? 'Каталог' : 'Каталог товаров'}</span>
            </button>
          )}
        </div>

        {/* Center: Large Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-2 relative">
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

        {/* Right: Actions (Mobile Language Switcher + Socials + Favorites + Cart) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Language Switcher */}
          <div className="sm:hidden inline-flex items-center rounded bg-[#171717] border border-[#2A2A2A] p-0.5">
            <button
              type="button"
              onClick={() => onLanguageChange('ru')}
              className={`px-2 py-1 rounded text-xs font-bold ${
                lang === 'ru'
                  ? 'bg-[#C5A059] text-black'
                  : 'text-[#A3A3A3]'
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('kz')}
              className={`px-2 py-1 rounded text-xs font-bold ${
                lang === 'kz'
                  ? 'bg-[#C5A059] text-black'
                  : 'text-[#A3A3A3]'
              }`}
            >
              KZ
            </button>
          </div>

          {/* Compact Socials on Mobile */}
          <div className="flex sm:hidden items-center gap-1.5">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-lg bg-[#171717] border border-[#262626] text-[#C5A059] hover:text-white"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="p-2 rounded-lg bg-[#171717] border border-[#262626] text-[#C5A059] hover:text-white"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Favorites Button */}
          <button
            type="button"
            onClick={onOpenFavorites}
            className="relative p-2.5 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#292929] hover:border-[#C5A059] text-white transition-colors cursor-pointer"
            title={isKz ? 'Таңдаулылар' : 'Избранное'}
            aria-label="Избранное"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                favoritesCount > 0 ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#D4D4D4]'
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C5A059] text-black font-extrabold text-[10px] flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            id="cart-drawer-btn"
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] active:bg-[#B38F46] text-black font-bold text-sm transition-all cursor-pointer shadow-md"
            aria-label="Корзина"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-[#C5A059] font-extrabold text-[10px] flex items-center justify-center border border-[#C5A059]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">
              {isKz ? 'Себет' : 'Корзина'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Mobile Search Input Row directly under Header */}
      <div className="md:hidden px-4 pb-3">
        <SmartSearchBar
          inputId="mobile-header-search-input"
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
    </header>
  );
};
