import React from 'react';
import {
  Sparkles,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  Award,
  ArrowRight,
  Clock,
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
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const isKz = lang === 'kz';

  const subtitleRu =
    config.subtitleRu && !config.subtitleRu.includes('Премиальные товары для здоровья, красоты и повседневной')
      ? config.subtitleRu
      : 'Витамины iHerb, БАДы, товары для мужского и женского здоровья, натуральный мед и мусульманские ароматы.';
  const subtitleKz =
    config.subtitleKz && !config.subtitleKz.includes('Атыраудағы денсаулық, сұлулық және күнделікті')
      ? config.subtitleKz
      : 'iHerb дәрумендері, ББҚ, ерлер мен әйелдер денсаулығы, табиғи бал және мұсылман хош иістері.';

  return (
    <div
      id="hero-section"
      className="w-full bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-200/80 py-6 sm:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Banner Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{isKz ? 'Атырау · Бутик №24 · ТД Дина Байзар' : 'Атырау · Бутик №24 · ТД «Дина Байзар»'}</span>
            </div>

            {/* Heading */}
            <h1
              id="hero-main-title"
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3"
            >
              {isKz ? (
                <>
                  <span>Атыраудағы сұлулық, денсаулық </span>
                  <span className="text-blue-600">және халал өнімдер</span>
                </>
              ) : (
                <>
                  <span>Красота, здоровье </span>
                  <span className="text-blue-600">и халяль-товары в Атырау</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              {isKz ? subtitleKz : subtitleRu}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                id="hero-view-catalog-btn"
                onClick={onScrollToCatalog}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
              >
                <span>{isKz ? 'Каталогқа өту' : 'Перейти в каталог'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                id="hero-whatsapp-btn"
                href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                  isKz
                    ? 'Сәлеметсіз бе! Дәрумендер мен халал өнімдер бойынша кеңес алғым келеді.'
                    : 'Здравствуйте! Хочу проконсультироваться по витаминам и продукции бутика.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm sm:text-base border border-emerald-200 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isKz ? 'WhatsApp кеңес' : 'Консультация в WhatsApp'}</span>
              </a>

              <a
                id="hero-gis-btn"
                href={config.gis2Url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>2GIS</span>
              </a>
            </div>
          </div>

          {/* Right Highlight Box in Flip.kz Style */}
          <div className="w-full lg:w-80 shrink-0 bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isKz ? 'Дүкен туралы' : 'Информация о доставке'}
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {isKz ? 'Атырау бойынша жеткізу' : 'Доставка курьером'}
                </div>
                <div className="text-xs text-slate-500">
                  {isKz ? 'Тапсырыс күні үйіңізге дейін' : 'В день заказа по г. Атырау'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {isKz ? 'Тегін алып кету' : 'Самовывоз бесплатно'}
                </div>
                <div className="text-xs text-slate-500">
                  {isKz ? 'ТД Дина Байзар, Бутик №24' : 'ТД «Дина Байзар», Бутик №24'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-slate-800">
                  {isKz ? '100% Түпнұсқа' : '100% Оригинал iHerb & Halal'}
                </div>
                <div className="text-xs text-slate-500">
                  {isKz ? 'Сапа кепілдігі' : 'Сертификаты и гарантия качества'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Trust Highlights Strip in Flip.kz Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {isKz ? 'Жылдам жеткізу' : 'Быстрая доставка'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isKz ? 'Атырауда сол күні' : 'По Атырау в день заказа'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {isKz ? 'Бутик №24' : 'Самовывоз 0 ₸'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isKz ? 'ТД Дина Байзар' : 'ТД «Дина Байзар»'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {isKz ? '100% Түпнұсқа' : '100% Оригинал'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isKz ? 'iHerb & Халал сапа' : 'Только проверенные бренды'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {isKz ? 'Кәсіби кеңес' : 'Подбор курса'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isKz ? 'WhatsApp арқылы' : 'Консультация эксперта'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
