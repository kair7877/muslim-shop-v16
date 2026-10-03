import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Eye, X, Check, RotateCcw, Sparkles } from 'lucide-react';
import { AccessibilitySettings, Language, TextScale } from '../types';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessibility: AccessibilitySettings;
  onAccessibilityChange: (settings: AccessibilitySettings) => void;
  lang: Language;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  accessibility,
  onAccessibilityChange,
  lang,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isKz = lang === 'kz';

  const handleScaleSelect = (scale: TextScale) => {
    onAccessibilityChange({
      ...accessibility,
      scale,
    });
  };

  const handleToggleContrast = () => {
    onAccessibilityChange({
      ...accessibility,
      highContrast: !accessibility.highContrast,
    });
  };

  const handleReset = () => {
    onAccessibilityChange({
      scale: 'normal',
      highContrast: false,
    });
  };

  return createPortal(
    <div
      id="accessibility-modal-backdrop"
      className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        id="accessibility-modal-dialog"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-modal-title"
      >
        {/* Header */}
        <div className="bg-white text-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0A78D6] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="accessibility-modal-title"
                className="font-bold text-lg text-slate-900 leading-tight"
              >
                {isKz
                  ? 'Нашар көретіндер мен қарт кісілерге'
                  : 'Для слабовидящих и пожилых'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isKz
                  ? 'Көзілдіріксіз ыңғайлы оқу үшін шрифт пен контрастты баптаңыз'
                  : 'Настройка крупного шрифта и контрастности для лёгкого чтения'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Закрыть окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Font Size */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm sm:text-base font-bold text-slate-900">
                {isKz ? '1. Мәтін өлшемі (Шрифт):' : '1. Размер шрифта текста:'}
              </label>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {accessibility.scale === 'normal'
                  ? '100% Стандарт'
                  : accessibility.scale === 'large'
                  ? '125% Крупный'
                  : '150% Максимальный'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Normal */}
              <button
                type="button"
                onClick={() => handleScaleSelect('normal')}
                className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  accessibility.scale === 'normal'
                    ? 'border-[#0A78D6] bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold">A</span>
                  {accessibility.scale === 'normal' && (
                    <span className="w-5 h-5 rounded-full bg-[#0A78D6] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {isKz ? 'Орташа' : 'Обычный'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">100%</div>
                </div>
              </button>

              {/* Large - Recommended */}
              <button
                type="button"
                onClick={() => handleScaleSelect('large')}
                className={`relative p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  accessibility.scale === 'large'
                    ? 'border-[#0A78D6] bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20'
                    : 'border-amber-300 hover:border-amber-400 bg-amber-50/30 text-slate-800'
                }`}
              >
                <span className="absolute -top-2.5 left-3 bg-[#FFBD00] text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {isKz ? 'Ұсынылады' : 'Рекомендуется'}
                </span>
                <div className="flex items-center justify-between mb-2 mt-1">
                  <span className="text-2xl font-black text-[#0A78D6]">A+</span>
                  {accessibility.scale === 'large' && (
                    <span className="w-5 h-5 rounded-full bg-[#0A78D6] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base">
                    {isKz ? 'Үлкен' : 'Крупный'}
                  </div>
                  <div className="text-xs text-[#0A78D6] font-medium mt-0.5">125% (+25%)</div>
                </div>
              </button>

              {/* Extra Large */}
              <button
                type="button"
                onClick={() => handleScaleSelect('extra')}
                className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  accessibility.scale === 'extra'
                    ? 'border-[#0A78D6] bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-black text-slate-900">A++</span>
                  {accessibility.scale === 'extra' && (
                    <span className="w-5 h-5 rounded-full bg-[#0A78D6] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base">
                    {isKz ? 'Ең үлкен' : 'Огромный'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">150% (+50%)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: High Contrast Toggle */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-900 mb-3">
              {isKz ? '2. Контрастность экраны:' : '2. Режим повышенной контрастности:'}
            </label>

            <div
              onClick={handleToggleContrast}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                accessibility.highContrast
                  ? 'border-slate-900 bg-slate-950 text-white shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base">
                    {accessibility.highContrast
                      ? (isKz ? '✓ Жоғары контраст қосулы' : '✓ Высокий контраст ВКЛЮЧЁН')
                      : (isKz ? 'Стандартты түстер (Контраст өшірулі)' : 'Стандартные мягкие цвета')}
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    accessibility.highContrast ? 'text-amber-300' : 'text-slate-600'
                  }`}
                >
                  {isKz
                    ? 'Терең қара мәтін, қалың сызықтар және айқын батырмалар'
                    : 'Глубокий чёрный цвет букв, чёткие границы карточек и яркие кнопки'}
                </p>
              </div>

              {/* Big Switch Button */}
              <div
                className={`relative w-16 h-9 rounded-full transition-colors p-1 shrink-0 ${
                  accessibility.highContrast ? 'bg-[#0A78D6]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full bg-white shadow-md transform transition-transform ${
                    accessibility.highContrast ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Live Preview */}
          <div className="rounded-xl p-4 border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold uppercase tracking-wider">
              <span>{isKz ? 'Тікелей үлгі' : 'Живой образец текста'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div
              className={`p-4 rounded-lg transition-all ${
                accessibility.highContrast
                  ? 'bg-white text-black border-2 border-black font-semibold'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <div
                className={`font-bold text-slate-900 mb-1 ${
                  accessibility.scale === 'extra'
                    ? 'text-xl'
                    : accessibility.scale === 'large'
                    ? 'text-lg'
                    : 'text-base'
                }`}
              >
                {isKz ? 'Масло черного тмина • Саудия' : 'Масло черного тмина • Саудия'}
              </div>
              <p
                className={`leading-relaxed ${
                  accessibility.scale === 'extra'
                    ? 'text-base'
                    : accessibility.scale === 'large'
                    ? 'text-sm'
                    : 'text-xs'
                }`}
              >
                {isKz
                  ? 'Бутик №24 — Атырау қаласындағы табиғи халал өнімдер дүкені.'
                  : 'Бутик №24 — натуральная халяль продукция и арабские масляные духи в Атырау.'}
              </p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                <span
                  className={`font-bold text-slate-900 ${
                    accessibility.scale === 'extra' ? 'text-lg' : 'text-base'
                  }`}
                >
                  6 500 ₸
                </span>
                <span className="px-3 py-1 bg-[#0A78D6] text-white rounded-lg text-xs font-bold">
                  {isKz ? 'Себетке' : 'В корзину'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isKz ? 'Қалпына келтіру (100%)' : 'Сбросить к исходным (100%)'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0A78D6] hover:bg-[#0866b8] text-white font-bold text-sm transition-all shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{isKz ? 'Қолдану және жабу' : 'Применить и закрыть'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
