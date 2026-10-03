import React from 'react';
import {
  Home,
  Layers,
  ShoppingBag,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { AccessibilitySettings, Language } from '../types';

export type BottomNavTab = 'home' | 'catalog' | 'cart' | 'favorites' | 'contact';

interface BottomNavProps {
  activeTab: BottomNavTab;
  lang: Language;
  accessibility: AccessibilitySettings;
  cartCount: number;
  favoritesCount: number;
  onSelectHome: () => void;
  onOpenCatalog: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenContact: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  lang,
  cartCount,
  favoritesCount,
  onSelectHome,
  onOpenCatalog,
  onOpenCart,
  onOpenFavorites,
  onOpenContact,
}) => {
  const isKz = lang === 'kz';

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label={isKz ? 'Төменгі навигация мәзірі' : 'Нижняя панель навигации'}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 text-slate-600 shadow-lg select-none pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto px-2">
        <div className="grid grid-cols-5 items-center h-14 sm:h-16">
          {/* 1. Главная */}
          <button
            id="bottom-nav-home"
            type="button"
            onClick={onSelectHome}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] leading-none">
              {isKz ? 'Басты' : 'Главная'}
            </span>
          </button>

          {/* 2. Каталог */}
          <button
            id="bottom-nav-catalog"
            type="button"
            onClick={onOpenCatalog}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'catalog' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] leading-none">
              {isKz ? 'Каталог' : 'Каталог'}
            </span>
          </button>

          {/* 3. Избранное */}
          <button
            id="bottom-nav-favorites"
            type="button"
            onClick={onOpenFavorites}
            className={`relative flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'favorites' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Heart
                className={`w-5 h-5 ${
                  favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">
              {isKz ? 'Таңдаулы' : 'Избранное'}
            </span>
          </button>

          {/* 4. Корзина */}
          <button
            id="bottom-nav-cart"
            type="button"
            onClick={onOpenCart}
            className={`relative flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'cart' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">
              {isKz ? 'Себет' : 'Корзина'}
            </span>
          </button>

          {/* 5. Бутик 24 / WhatsApp */}
          <button
            id="bottom-nav-contact"
            type="button"
            onClick={onOpenContact}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'contact' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] leading-none">
              {isKz ? 'Бутик №24' : 'Бутик №24'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
