import React from 'react';
import { ArrowDown, Sparkles, MapPin, Instagram, ExternalLink } from 'lucide-react';
import { Language, StoreSettings } from '../types';
import { translations } from '../translations';

interface HeroProps {
  language: Language;
  settings: StoreSettings;
  onScrollToCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({ language, settings, onScrollToCatalog }) => {
  const t = translations[language];
  const gis2Url = settings?.gis2Url || 'https://2gis.kz/atyrau/geo/70000001094546376';
  const instagramHandle = (settings?.instagram ? String(settings.instagram) : 'musliim_shop06').replace('@', '');
  const addressDisplay = language === 'ru'
    ? 'пр. Султана Бейбарыса, 45а/5'
    : 'Сұлтан Бейбарыс даңғылы, 45а/5';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 border-b border-gray-200 pt-8 pb-10 sm:py-16 px-4 sm:px-6">
      {/* Subtle luxury geometric radial background overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#B45309 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Boutique location badge with 2GIS and Instagram links */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <a
            href={gis2Url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-emerald-50 border border-gray-300 hover:border-emerald-500 text-gray-800 text-xs sm:text-sm font-semibold tracking-wide shadow-sm transition-all group"
            title={t.open2Gis}
          >
            <MapPin className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>{settings.city}: {addressDisplay}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-300">
              2ГИС <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-pink-50 border border-gray-300 hover:border-pink-400 text-pink-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm transition-all"
            title="Instagram @musliim_shop06"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>@{instagramHandle}</span>
          </a>
        </div>

        {/* Store Title */}
        <h1 className="font-brand text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.2em] text-gray-900 mb-3 uppercase">
          {settings.storeName || 'MUSLIM SHOP'}
        </h1>

        {/* Serif Tagline */}
        <div className="font-serif italic text-2xl sm:text-4xl md:text-5xl text-amber-800 tracking-tight font-medium mb-4 leading-tight">
          {language === 'ru' ? settings.taglineRu : settings.taglineKz}
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed mb-8 px-2 font-normal">
          {language === 'ru' ? settings.subtitleRu : settings.subtitleKz}
        </p>

        {/* Call to action button */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={onScrollToCatalog}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-base sm:text-lg tracking-wide shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>{t.viewCatalog}</span>
            <ArrowDown className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-gray-600 sm:hidden font-medium">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Натуральные сертифицированные товары</span>
          </div>
        </div>
      </div>
    </section>
  );
};
