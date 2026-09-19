import React from 'react';
import { Instagram, MessageCircle, MapPin, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { StoreSettings, Language } from '../types';
import { translations } from '../translations';

interface FooterProps {
  settings: StoreSettings;
  language: Language;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, language, onOpenAdmin }) => {
  const t = translations[language];
  const cleanPhone = (settings?.whatsappNumber || '77781754241').replace(/\D/g, '');
  const gis2Url = settings?.gis2Url || 'https://2gis.kz/atyrau/geo/70000001094546376';
  const instagramHandle = (settings?.instagram || 'musliim_shop06').replace('@', '');

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 pt-10 pb-24 sm:pb-12 px-4 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Store Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
              M
            </div>
            <span className="font-brand font-bold text-base tracking-[0.2em] text-gray-900">
              {settings.storeName || 'MUSLIM SHOP'}
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
            {t.footerAbout}
          </p>
          <div className="text-xs text-amber-800 font-bold tracking-wide">
            {settings.city} · {settings.boutiqueNumber}
          </div>
        </div>

        {/* Col 2: Location & Hours */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">
            {t.footerWorkingHoursTitle}
          </h4>
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{language === 'ru' ? settings.workingHoursRu : settings.workingHoursKz}</span>
            </div>
            <div className="pt-1">
              <a
                href={gis2Url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all group shadow-xs"
              >
                <span>{t.open2Gis}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* Col 3: Delivery & Pickup details */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">
            {t.deliveryMethod}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {language === 'ru' ? settings.deliveryInfoRu : settings.deliveryInfoKz}
          </p>
        </div>

        {/* Col 4: Contacts & Socials */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">
            {t.footerContacts}
          </h4>
          <div className="flex flex-col gap-2.5">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp: +{cleanPhone}</span>
            </a>

            {/* Instagram */}
            <a
              href={`https://instagram.com/${instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Instagram: @{instagramHandle}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500">
        <div>
          © {new Date().getFullYear()} {settings.storeName}. {t.footerAllRights}
        </div>

        <button
          onClick={onOpenAdmin}
          className="hover:text-amber-700 transition-colors flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer font-medium"
        >
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>{t.adminTitle}</span>
        </button>
      </div>
    </footer>
  );
};
