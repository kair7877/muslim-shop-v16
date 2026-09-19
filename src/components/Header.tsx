import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Clock, MapPin, Instagram, ExternalLink } from 'lucide-react';
import { Language, StoreSettings } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  language: Language;
  settings?: StoreSettings;
  onLanguageChange: (lang: Language) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenPrayerTimes: () => void;
  onLogoClick: () => void;
  storeName: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  settings,
  onLanguageChange,
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenAdmin,
  onOpenPrayerTimes,
  onLogoClick,
  storeName,
}) => {
  const t = translations[language];
  const gis2Url = settings?.gis2Url || 'https://2gis.kz/atyrau/geo/70000001094546376';
  const instagramHandle = (settings?.instagram ? String(settings.instagram) : 'musliim_shop06').replace('@', '');
  const instagramUrl = `https://instagram.com/${instagramHandle}`;
  const addressDisplay = language === 'ru' 
    ? 'пр. Султана Бейбарыса, 45а/5' 
    : 'Сұлтан Бейбарыс даңғылы, 45а/5';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      {/* Top Luxury Prestige Micro-Bar: 2GIS, Address, Instagram, Prayer times */}
      <div className="bg-gray-100 text-gray-700 text-xs py-1.5 px-3 sm:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-3">
          
          {/* Left: Address + 2GIS Interactive Link */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <a
              href={gis2Url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-gray-800 hover:text-amber-700 font-medium transition-colors"
              title={language === 'ru' ? 'Посмотреть адрес в 2ГИС' : 'Мекенжайды 2ГИС-тен көру'}
            >
              <MapPin className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="hidden sm:inline text-gray-500 font-normal">{language === 'ru' ? 'Атырау:' : 'Атырау:'}</span>
              <span className="font-semibold underline decoration-gray-400 underline-offset-2 group-hover:decoration-amber-600">
                {addressDisplay}
              </span>
            </a>

            {/* Direct 2GIS Gold-Emerald Badge Button */}
            <a
              href={gis2Url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              title={t.open2Gis}
            >
              <span>2ГИС</span>
              <ExternalLink className="w-3 h-3 text-emerald-700" />
            </a>
          </div>

          {/* Right: Instagram + Prayer Times + Admin */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Direct Instagram Badge */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-700 text-[11px] sm:text-xs font-semibold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              title="Instagram @musliim_shop06"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
              <span className="font-semibold tracking-wide">@{instagramHandle}</span>
            </a>

            {/* Prayer Times Shortcut */}
            <button
              onClick={onOpenPrayerTimes}
              className="hidden xs:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title={t.prayerTimes}
            >
              <span>🕌</span>
              <span className="hidden sm:inline">{t.prayerTimes}</span>
            </button>

            {/* Admin trigger */}
            <button
              onClick={onOpenAdmin}
              className="text-gray-500 hover:text-amber-700 transition-colors flex items-center gap-1 text-xs p-1"
              title={t.navProfile}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Left: Store Logo & Subtitle */}
        <button
          onClick={onLogoClick}
          className="text-left group flex items-center gap-3 focus:outline-none cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-200 to-amber-600 p-[2px] flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-700 font-bold text-base sm:text-xl font-serif">
              M
            </div>
          </div>
          <div>
            <span className="font-brand font-bold text-lg sm:text-2xl tracking-[0.16em] text-gray-900 group-hover:text-amber-700 transition-colors block leading-tight">
              {storeName || 'MUSLIM SHOP'}
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-600 font-semibold block leading-none mt-1">
              АТЫРАУ · БУТИК №24
            </span>
          </div>
        </button>

        {/* Center: Quick navigation links for Desktop (2GIS & Instagram showcase) */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={gis2Url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-emerald-500 text-xs font-semibold text-gray-800 transition-all shadow-sm"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-500">2ГИС:</span>
            <span className="text-gray-900">{addressDisplay}</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-50/60 hover:bg-pink-100 border border-pink-200 hover:border-pink-400 text-xs font-semibold text-pink-700 transition-all shadow-sm"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>@{instagramHandle}</span>
          </a>
        </div>

        {/* Right action controls: Prayer, Language Switch, Search, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prayer Times Button (Visible on md+) */}
          <button
            onClick={onOpenPrayerTimes}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>{t.prayerTimes}</span>
          </button>

          {/* RU / KZ Language Toggle */}
          <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full p-0.5 text-xs font-bold">
            <button
              onClick={() => onLanguageChange('ru')}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all text-xs cursor-pointer ${
                language === 'ru'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => onLanguageChange('kz')}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all text-xs cursor-pointer ${
                language === 'kz'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              KZ
            </button>
          </div>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:px-3 sm:py-2 rounded-full text-gray-700 hover:text-amber-700 hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            aria-label={t.search}
          >
            <Search className="w-5 h-5" />
            <span className="hidden md:inline">{t.search}</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2 sm:px-4 sm:py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-gray-900 border border-amber-300 hover:border-amber-400 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            aria-label={t.cart}
          >
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <span className="hidden sm:inline text-xs sm:text-sm font-bold">{t.cart}</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-xs font-extrabold text-white bg-amber-600 rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
