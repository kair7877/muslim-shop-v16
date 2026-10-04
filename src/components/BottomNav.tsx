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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] text-[#A3A3A3] select-none pb-[env(safe-area-inset-bottom)] shadow-2xl"
    >
      <div className="max-w-md mx-auto px-1">
        <div className="grid grid-cols-5 items-center h-16">
          {/* 1. Главная */}
          <button
            id="bottom-nav-home"
            type="button"
            onClick={onSelectHome}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'home'
                ? 'text-[#C5A059] font-bold'
                : 'text-[#8E8E8E] hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-none">
              {isKz ? 'Басты' : 'Главная'}
            </span>
          </button>

          {/* 2. Каталог */}
          <button
            id="bottom-nav-catalog"
            type="button"
            onClick={onOpenCatalog}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'catalog'
                ? 'text-[#C5A059] font-bold'
                : 'text-[#8E8E8E] hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-none">
              {isKz ? 'Каталог' : 'Каталог'}
            </span>
          </button>

          {/* 3. Избранное */}
          <button
            id="bottom-nav-favorites"
            type="button"
            onClick={onOpenFavorites}
            className={`relative flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'favorites'
                ? 'text-[#C5A059] font-bold'
                : 'text-[#8E8E8E] hover:text-white'
            }`}
          >
            <div className="relative">
              <Heart
                className={`w-5 h-5 ${
                  favoritesCount > 0 ? 'fill-[#C5A059] text-[#C5A059]' : ''
                }`}
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#C5A059] text-black text-[10px] font-black flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium leading-none">
              {isKz ? 'Таңдаулы' : 'Избранное'}
            </span>
          </button>

          {/* 4. Корзина */}
          <button
            id="bottom-nav-cart"
            type="button"
            onClick={onOpenCart}
            className={`relative flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'cart'
                ? 'text-[#C5A059] font-bold'
                : 'text-[#8E8E8E] hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C5A059] text-black text-[10px] font-black flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium leading-none">
              {isKz ? 'Себет' : 'Корзина'}
            </span>
          </button>

          {/* 5. Бутик 24 / WhatsApp */}
          <button
            id="bottom-nav-contact"
            type="button"
            onClick={onOpenContact}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full cursor-pointer transition-colors ${
              activeTab === 'contact'
                ? 'text-[#C5A059] font-bold'
                : 'text-[#8E8E8E] hover:text-white'
            }`}
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-medium leading-none">
              {isKz ? 'Бутик №24' : 'Бутик №24'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
