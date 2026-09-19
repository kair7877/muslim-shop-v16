import React, { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronDown, Sparkles, Moon, Sun, Sunrise, Sunset, Compass, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import {
  calculatePrayerTimes,
  KAZAKHSTAN_CITIES,
  CityLocation,
  DailyPrayerInfo,
} from '../utils/prayerTimes';

interface PrayerTimesWidgetProps {
  language: Language;
  onClose?: () => void;
  isModal?: boolean;
}

export const PrayerTimesWidget: React.FC<PrayerTimesWidgetProps> = ({
  language,
  onClose,
  isModal = false,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return localStorage.getItem('muslim_shop_prayer_city') || 'atyrau';
  });
  const [now, setNow] = useState<Date>(new Date());
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const t = translations[language];

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCity = KAZAKHSTAN_CITIES.find((c) => c.id === selectedCityId) || KAZAKHSTAN_CITIES[0];

  const handleSelectCity = (city: CityLocation) => {
    setSelectedCityId(city.id);
    localStorage.setItem('muslim_shop_prayer_city', city.id);
    setIsCityDropdownOpen(false);
  };

  const prayerData: DailyPrayerInfo = calculatePrayerTimes(currentCity, now);

  const getPrayerIcon = (id: string) => {
    switch (id) {
      case 'fajr':
        return <Moon className="w-4 h-4 text-sky-600" />;
      case 'sunrise':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'dhuhr':
        return <Sun className="w-4 h-4 text-amber-600" />;
      case 'asr':
        return <Sun className="w-4 h-4 text-amber-700" />;
      case 'maghrib':
        return <Sunset className="w-4 h-4 text-orange-600" />;
      case 'isha':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-700" />;
    }
  };

  const cityName = language === 'ru' ? currentCity.nameRu : currentCity.nameKz;

  const content = (
    <div className="relative w-full rounded-2xl bg-white border border-amber-200/80 p-4 sm:p-5 shadow-sm">
      {/* Top Bar: City selection + Hijri Date + Close button */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-200 mb-3">
        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
          >
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>{cityName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl z-30 py-1.5">
              <div className="px-3.5 py-1 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                {t.citySelector} ({language === 'ru' ? 'Казахстан' : 'Қазақстан'})
              </div>
              {KAZAKHSTAN_CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCity(c)}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-amber-50 transition-colors ${
                    c.id === selectedCityId ? 'text-amber-900 font-bold bg-amber-50/60' : 'text-gray-700'
                  }`}
                >
                  <span>{language === 'ru' ? c.nameRu : c.nameKz}</span>
                  {c.id === selectedCityId && <span className="text-xs text-amber-700 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hijri & Gregorian Dates */}
        <div className="text-right flex-1 min-w-0 pr-1">
          <div className="text-xs sm:text-sm font-serif font-bold text-gray-900 truncate">
            {language === 'ru' ? prayerData.hijriStrRu : prayerData.hijriStrKz}
          </div>
          <div className="text-xs text-gray-500 truncate font-medium">
            {language === 'ru' ? prayerData.dateStrRu : prayerData.dateStrKz}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Countdown Card */}
      {prayerData.nextPrayer && (
        <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
              <Clock className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-emerald-800 font-bold">
                {t.nextPrayerLabel}
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {language === 'ru' ? prayerData.nextPrayer.nameRu : prayerData.nextPrayer.nameKz} ·{' '}
                <span className="text-amber-700 font-extrabold">{prayerData.nextPrayer.timeStr}</span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-[11px] text-gray-600 uppercase tracking-wider font-semibold">
              {t.timeLeftLabel}
            </div>
            <div className="font-mono text-xs sm:text-sm font-extrabold text-emerald-700 tracking-wider">
              {prayerData.timeRemainingStr}
            </div>
          </div>
        </div>
      )}

      {/* 6 Prayers Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {prayerData.prayers.map((prayer) => {
          const prayerName = language === 'ru' ? prayer.nameRu : prayer.nameKz;

          return (
            <div
              key={prayer.id}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                prayer.isCurrent
                  ? 'bg-amber-50/80 border-2 border-amber-500 shadow-sm'
                  : prayer.isNext
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-center">
                {getPrayerIcon(prayer.id)}
              </div>
              <div className="text-[11px] font-bold text-gray-600 truncate w-full mb-0.5">
                {prayerName.split(' ')[0]}
              </div>
              <div
                className={`font-mono text-xs sm:text-sm font-extrabold tracking-tight ${
                  prayer.isCurrent ? 'text-amber-800' : 'text-gray-900'
                }`}
              >
                {prayer.timeStr}
              </div>
              {prayer.isCurrent && (
                <span className="mt-1 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-amber-600 text-white font-bold">
                  {t.currentPrayerLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info: Qibla & Calculation note */}
      <div className="mt-3 pt-2.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-1.5 font-medium">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Compass className="w-3.5 h-3.5 text-amber-700" />
          <span>{t.qiblaNotice}</span>
        </div>
        <div className="text-center sm:text-right">
          {t.prayerCalculationNote}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};
