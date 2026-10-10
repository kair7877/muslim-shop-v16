import React from 'react';
import {
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
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

  const whatsappConsultationUrl = `https://wa.me/${config.whatsappNumber || '77781754241'}?text=${encodeURIComponent(
    isKz ? 'Сәлеметсіз бе! Өнімдер бойынша кеңес алғым келеді' : 'Здравствуйте! Хочу получить консультацию по товарам в Muslim Shop'
  )}`;

  return (
    <div id="hero-section" className="w-full bg-[#f8fafc] py-3 sm:py-5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-7 overflow-hidden shadow-sm">
          {/* Subtle soft glow accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] sm:text-xs font-bold tracking-wide text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-white">MUSLIM SHOP</span>
                <span className="text-white/60">•</span>
                <span>{config.city || 'Атырау'}, {config.boutiqueNumber || 'Бутик №24'}</span>
              </div>

              {/* Heading: Big, legible iHerb typography */}
              <h1
                id="hero-main-title"
                className="font-sans text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight"
              >
                {isKz ? (
                  <>Түпнұсқа iHerb дәрумендері, ББҚ және халал өнімдер</>
                ) : (
                  <>Оригинальные витамины iHerb, БАДы и халяль-товары</>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                {isKz
                  ? 'Қара зере майы, омега-3, коллаген, бал және дәрумендер. Барлық тауарлар сөреде бар.'
                  : 'Черный тмин, омега-3, коллаген, арабские масла, мед и витамины. В наличии с доставкой по Атырау.'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0 pt-1 md:pt-0">
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="min-h-[44px] px-5 sm:px-6 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-97"
              >
                <span>{isKz ? 'Каталогқа өту' : 'В каталог'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <a
                href={whatsappConsultationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 sm:px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-white/20 transition-colors cursor-pointer active:scale-97"
              >
                <MessageCircle className="w-4 h-4 text-emerald-300" />
                <span>{isKz ? 'WhatsApp' : 'Консультация'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
