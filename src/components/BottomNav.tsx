import React from 'react';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Search,
  User,
} from 'lucide-react';
import { AccessibilitySettings, Language } from '../types';

export type BottomNavTab = 'home' | 'catalog' | 'search' | 'cart' | 'profile';

interface BottomNavProps {
  activeTab?: string;
  lang: Language;
  accessibility?: AccessibilitySettings;
  cartCount: number;
  favoritesCount?: number;
  onSelectHome: () => void;
  onOpenCatalog: () => void;
  onOpenSearch: () => void;
  onOpenFavorites?: () => void;
  onOpenCart: () => void;
  onOpenProfile?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  lang,
  cartCount,
  onSelectHome,
  onOpenCatalog,
  onOpenSearch,
  onOpenCart,
  onOpenProfile,
}) => {
  const isKz = lang === 'kz';

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label={isKz ? 'Төменгі навигация' : 'Нижняя навигация'}
      className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200/90 text-slate-600 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto px-2">
        <div className="grid grid-cols-5 items-center h-16">
          {/* 1. Главная */}
          <button
            id="bottom-nav-home"
            type="button"
            onClick={onSelectHome}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] px-1 transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-emerald-700 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5] text-emerald-700' : 'text-slate-700'}`} />
            <span className="text-[11px] font-bold mt-1 tracking-tight truncate max-w-full">
              {isKz ? 'Басты' : 'Главная'}
            </span>
          </button>

          {/* 2. Каталог */}
          <button
            id="bottom-nav-catalog"
            type="button"
            onClick={onOpenCatalog}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] px-1 transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-emerald-700 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <LayoutGrid className={`w-5 h-5 ${activeTab === 'catalog' ? 'stroke-[2.5] text-emerald-700' : 'text-slate-700'}`} />
            <span className="text-[11px] font-bold mt-1 tracking-tight truncate max-w-full">
              {isKz ? 'Каталог' : 'Каталог'}
            </span>
          </button>

          {/* 3. Поиск */}
          <button
            id="bottom-nav-search"
            type="button"
            onClick={onOpenSearch}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] px-1 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'text-emerald-700 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <Search className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5] text-emerald-700' : 'text-slate-700'}`} />
            <span className="text-[11px] font-bold mt-1 tracking-tight truncate max-w-full">
              {isKz ? 'Іздеу' : 'Поиск'}
            </span>
          </button>

          {/* 4. Корзина (with green badge like iHerb) */}
          <button
            id="bottom-nav-cart"
            type="button"
            onClick={onOpenCart}
            className={`relative flex flex-col items-center justify-center h-full min-h-[48px] px-1 transition-all cursor-pointer ${
              activeTab === 'cart'
                ? 'text-emerald-700 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 ${activeTab === 'cart' ? 'stroke-[2.5] text-emerald-700' : 'text-slate-700'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white font-mono font-black text-[10px] flex items-center justify-center shadow-xs border border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold mt-1 tracking-tight truncate max-w-full">
              {isKz ? 'Себет' : 'Корзина'}
            </span>
          </button>

          {/* 5. Профиль */}
          <button
            id="bottom-nav-profile"
            type="button"
            onClick={onOpenProfile || onOpenCatalog}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] px-1 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-emerald-700 font-black'
                : 'text-slate-600 hover:text-slate-900 font-semibold'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5] text-emerald-700' : 'text-slate-700'}`} />
            <span className="text-[11px] font-bold mt-1 tracking-tight truncate max-w-full">
              {isKz ? 'Профиль' : 'Профиль'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
