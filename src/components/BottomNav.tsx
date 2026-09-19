import React from 'react';
import { Home, Search, Grid, ShoppingBag, Clock } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface BottomNavProps {
  currentTab: 'home' | 'search' | 'catalog' | 'prayer' | 'cart' | 'admin';
  onChangeTab: (tab: 'home' | 'search' | 'catalog' | 'prayer' | 'cart' | 'admin') => void;
  cartCount: number;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  cartCount,
  language,
}) => {
  const t = translations[language];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-1.5 pb-safe shadow-lg">
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-amber-700 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {t.navHome}
          </span>
        </button>

        {/* Catalog */}
        <button
          onClick={() => onChangeTab('catalog')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'catalog'
              ? 'text-amber-700 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {t.navCatalog}
          </span>
        </button>

        {/* Prayer Times - prominent center tab */}
        <button
          onClick={() => onChangeTab('prayer')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'prayer'
              ? 'text-emerald-700 font-bold'
              : 'text-gray-500 hover:text-emerald-700'
          }`}
        >
          <Clock className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-emerald-700">
            {t.navPrayer}
          </span>
        </button>

        {/* Search */}
        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'search'
              ? 'text-amber-700 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {t.navSearch}
          </span>
        </button>

        {/* Cart */}
        <button
          onClick={() => onChangeTab('cart')}
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'cart'
              ? 'text-amber-700 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-white font-bold text-[9px] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {t.navCart}
          </span>
        </button>
      </div>
    </nav>
  );
};
