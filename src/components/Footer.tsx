import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Instagram, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { Language, StoreConfig } from '../types';

interface FooterProps {
  config: StoreConfig;
  lang: Language;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, lang, onOpenAdmin }) => {
  const isKz = lang === 'kz';

  return (
    <footer id="main-footer" className="w-full max-w-full overflow-x-hidden bg-white text-slate-700 pt-10 pb-8 border-t border-slate-200/90 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl text-slate-900 tracking-tight">
                MUSLIM <span className="text-blue-600">SHOP</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {config.boutiqueNumber}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isKz ? config.subtitleKz : config.subtitleRu}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Оригинальная продукция Halal & GMP</span>
            </div>
          </div>

          {/* Col 2: Contacts & Address */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
              {isKz ? 'Мекенжай және байланыс' : 'Адрес и контакты'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {config.address} ({config.city}, {config.boutiqueNumber})
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{isKz ? config.workingHoursKz : config.workingHoursRu}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:+${config.whatsappNumber}`} className="hover:text-blue-600 font-semibold transition-colors">
                  +7 (778) 175-42-41
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/${config.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 font-semibold text-emerald-600 transition-colors"
                >
                  WhatsApp: +7 (778) 175-42-41
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery & Payment terms (Flip.kz style) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
              {isKz ? 'Жеткізу және төлем' : 'Доставка и оплата'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Курьерская доставка по г. Атырау в день заказа</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Оплата: Kaspi Pay, QR, наличными при получении</span>
              </li>
              <li>
                <a
                  href={config.gis2Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors mt-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Открыть точку в 2GIS</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Social & Admin */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
              {isKz ? 'Әлеуметтік желілер' : 'Мы в соцсетях'}
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              {config.instagram && (
                <a
                  href={`https://instagram.com/${config.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-700 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>Instagram: @{config.instagram.replace(/^@/, '')}</span>
                </a>
              )}

              {onOpenAdmin && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="text-xs text-slate-400 hover:text-slate-700 underline transition-colors cursor-pointer"
                  >
                    Вход для администратора (Бутик №24)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright in Flip.kz style */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {config.storeName} ({config.boutiqueNumber}). Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span>Атырау · ТД «Дина Байзар»</span>
            <span>10:00–20:30</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
