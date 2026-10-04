import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Instagram,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
} from 'lucide-react';
import { Language, StoreConfig } from '../types';

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

interface FooterProps {
  config: StoreConfig;
  lang: Language;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, lang, onOpenAdmin }) => {
  const isKz = lang === 'kz';

  const instagramUrl =
    config.instagramUrl ||
    'https://www.instagram.com/musliim_shop06?stkn=dnAzejJ2cm5nOXNi';
  const tiktokUrl =
    config.tiktokUrl ||
    'https://www.tiktok.com/@muslim_shop06?_r=1&_t=ZS-9AFgdLAOcZ2';

  return (
    <footer
      id="main-footer"
      className="w-full max-w-full overflow-x-hidden bg-[#0A0A0A] text-[#A3A3A3] pt-12 pb-24 md:pb-12 border-t border-[#222222] mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl text-white tracking-widest font-serif">
                MUSLIM <span className="text-[#C5A059]">SHOP</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1A1A1A] text-[#C5A059] border border-[#C5A059]/30">
                {config.boutiqueNumber || 'Бутик №24'}
              </span>
            </div>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              {isKz ? config.subtitleKz : config.subtitleRu}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E5E5E5] font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>100% Оригинальная продукция Halal & GMP</span>
            </div>
          </div>

          {/* Col 2: Contacts & Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white pb-1.5 border-b border-[#222222]">
              {isKz ? 'Мекенжай және байланыс' : 'Адрес и контакты'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#D4D4D4]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>
                  {config.address} ({config.city}, {config.boutiqueNumber || 'Бутик №24'})
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#737373] shrink-0" />
                <span>{isKz ? config.workingHoursKz : config.workingHoursRu}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#737373] shrink-0" />
                <a
                  href={`tel:+${config.whatsappNumber}`}
                  className="hover:text-[#C5A059] font-bold text-white transition-colors"
                >
                  +7 (778) 175-42-41
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${config.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 font-bold text-emerald-400 transition-colors"
                >
                  WhatsApp: +7 (778) 175-42-41
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery & Payment terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white pb-1.5 border-b border-[#222222]">
              {isKz ? 'Жеткізу және төлем' : 'Доставка и оплата'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#D4D4D4]">
              <li className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Быстрая курьерская доставка по г. Атырау в день заказа</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>Оплата: Kaspi Pay, Kaspi QR, наличными при получении</span>
              </li>
              {config.gis2Url && (
                <li className="pt-1">
                  <a
                    href={config.gis2Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#2F2F2F] text-white text-xs font-semibold transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Посмотреть на карте 2GIS</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Socials & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white pb-1.5 border-b border-[#222222]">
              {isKz ? 'Әлеуметтік желілер' : 'Мы в соцсетях'}
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#D4D4D4] hover:text-[#C5A059] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Instagram: @musliim_shop06</span>
              </a>

              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#D4D4D4] hover:text-[#C5A059] transition-colors"
              >
                <TikTokIcon className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>TikTok: @muslim_shop06</span>
              </a>

              {onOpenAdmin && (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-[#8E8E8E] hover:text-white border border-[#262626] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Панель управления</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737373]">
          <p>© {new Date().getFullYear()} MUSLIM SHOP · Бутик №24, г. Атырау. Все права защищены.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Халяль продукция</span>
            <span>•</span>
            <span>Только оригинал</span>
            <span>•</span>
            <span>Kaspi QR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
