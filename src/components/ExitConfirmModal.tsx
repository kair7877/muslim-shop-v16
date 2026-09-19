import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, ShoppingBag } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onStay: () => void;
  onExit: () => void;
  language: Language;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onStay,
  onExit,
  language,
}) => {
  const t = translations[language];

  // Close with Escape key (treated as staying)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onStay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="exit-confirm-modal-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onStay}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden p-6 text-center"
          >
            {/* Subtle Amber Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Close 'X' button (stays in store) */}
            <button
              id="exit-modal-close-btn"
              onClick={onStay}
              aria-label={t.close}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Header */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center mb-4 text-amber-700 shadow-xs">
              <LogOut className="w-7 h-7 -translate-x-0.5" />
            </div>

            {/* Title */}
            <h3
              id="exit-modal-title"
              className="font-serif text-xl font-bold text-gray-900 tracking-wide mb-2"
            >
              {t.exitConfirmTitle}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 px-1">
              {t.exitConfirmMessage}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              {/* "Да, выйти" (Exit) */}
              <button
                id="exit-modal-btn-exit"
                type="button"
                onClick={onExit}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:text-red-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.exitConfirmYes}</span>
              </button>

              {/* "Нет, остаться" (Stay - Primary CTA) */}
              <button
                id="exit-modal-btn-stay"
                type="button"
                onClick={onStay}
                autoFocus
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold tracking-wider shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.exitConfirmNo}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
