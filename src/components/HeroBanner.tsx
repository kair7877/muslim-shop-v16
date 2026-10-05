import React from 'react';
import {
  MapPin,
  ShieldCheck,
  Truck,
  ArrowRight,
  Clock,
  Phone,
} from 'lucide-react';
import { Category, Language, StoreConfig } from '../types';

interface HeroBannerProps {
  config: StoreConfig;
  lang: Language;
  onScrollToCatalog: () => void;
  categories?: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config,
  lang,
  onScrollToCatalog,
}) => {
  const isKz = lang === 'kz';

  return (
    <section
      id="hero-section"
      className="w-full bg-[#0F0F0F] border-b-2 border-[#242424] py-6 sm:py-10 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Large Static Showcase Banner — No Slider, No Carousel, No Freezing */}
        <div className="relative rounded-3xl bg-[#161616] border-2 border-[#2F2F2F] p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden flex flex-col justify-between gap-8">
          {/* Subtle static luxury accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Headline Area */}
          <div className="space-y-4 max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#202020] border border-[#3A3A3A] text-xs sm:text-sm font-black text-[#D4AF37] uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#C5A059]" />
              <span>{isKz ? 'Атырау · «Дина Байзар» СҮ, №24 Бутик' : 'Атырау · ТД «Дина Байзар», Бутик №24'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              {isKz ? (
                <>
                  MUSLIM SHOP — <span className="text-[#C5A059]">Атыраудағы халал өнімдер</span> мен дәрумендер дүкені
                </>
              ) : (
                <>
                  MUSLIM SHOP — <span className="text-[#C5A059]">Оригинальные витамины</span> и халяль-товары в Атырау
                </>
              )}
            </h1>

            <p className="text-base sm:text-xl text-[#D4D4D4] font-medium leading-relaxed">
              {isKz
                ? 'Now Foods, California Gold, Solgar түпнұсқа дәрумендері, қара зере майы, эпимедиум пасталары және сүннет тауарлары Бутик №24-те қолда бар.'
                : 'Сертифицированная продукция Now Foods, California Gold, Solgar, масло чёрного тмина, мужские пасты и товары для здоровья в наличии в Бутике №24.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="py-4 px-8 rounded-2xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-base sm:text-lg tracking-wide shadow-xl flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{isKz ? 'КАТАЛОГҚА ӨТУ' : 'СМОТРЕТЬ КАТАЛОГ ТОВАРОВ'}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <a
                href={`tel:+${config.whatsappNumber}`}
                className="py-4 px-6 rounded-2xl bg-[#222222] hover:bg-[#2C2C2C] text-white border border-[#3C3C3C] font-bold text-sm sm:text-base flex items-center justify-center gap-2.5"
              >
                <Phone className="w-5 h-5 text-[#C5A059]" />
                <span>+7 (778) 175-42-41</span>
              </a>
            </div>
          </div>

          {/* 3 Large High-Contrast Benefit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-[#242424] relative z-10">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1B1B1B] border border-[#2E2E2E] flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#252525] border border-[#3A3A3A] flex items-center justify-center text-[#C5A059] shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-white text-base sm:text-lg">
                  {isKz ? '100% Түпнұсқа сапа' : '100% Оригинал'}
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-normal">
                  {isKz ? 'АҚШ және БӘӘ-ден тікелей жеткізілім' : 'Прямые поставки из США и ОАЭ'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#1B1B1B] border border-[#2E2E2E] flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#252525] border border-[#3A3A3A] flex items-center justify-center text-[#C5A059] shrink-0">
                <Clock className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-white text-base sm:text-lg">
                  {isKz ? 'Күн сайын 10:00–19:00' : 'Бутик №24 в Атырау'}
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-normal">
                  {isKz ? 'ТД «Дина Байзар», демалыссыз' : 'ТД «Дина Байзар», работаем без выходных'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#1B1B1B] border border-[#2E2E2E] flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#252525] border border-[#3A3A3A] flex items-center justify-center text-[#C5A059] shrink-0">
                <Truck className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-white text-base sm:text-lg">
                  {isKz ? 'Жылдам жеткізу' : 'Быстрая доставка'}
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-normal">
                  {isKz ? 'Атырау мен бүкіл ҚР бойынша' : 'Курьер по Атырау и почта по всему Казахстану'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
