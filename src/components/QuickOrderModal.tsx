import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Zap, ShieldCheck, Clock, ArrowLeft } from 'lucide-react';
import { Language, Product, StoreConfig } from '../types';
import { formatPrice, generateQuickOrderUrl } from '../utils/formatters';

interface QuickOrderModalProps {
  product: Product;
  config: StoreConfig;
  lang: Language;
  onClose: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  product,
  config,
  lang,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
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
  }, [onClose]);

  const title = lang === 'kz' ? product.titleKz : product.titleRu;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateQuickOrderUrl(
      config,
      title,
      product.sku,
      product.price,
      name.trim() || (lang === 'kz' ? 'Тұтынушы' : 'Покупатель'),
      phone.trim() || '',
      lang,
      product.inStock
    );
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return createPortal(
    <div
      id="quick-order-backdrop"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        id="quick-order-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#141414] text-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#2E2E2E] my-auto"
      >
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2 text-white min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-white font-bold text-xs transition-colors cursor-pointer shrink-0 border border-[#383838]"
              title={lang === 'kz' ? 'Артқа' : 'Назад'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'kz' ? 'Артқа' : 'Назад'}</span>
            </button>
            <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
              {product.inStock
                ? (lang === 'kz' ? '1 басумен сатып алу' : 'Быстрый заказ в 1 клик')
                : (lang === 'kz' ? 'Алдын ала жазылу' : 'Предзаказ товара')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E8E] hover:text-white hover:bg-[#222] transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Жабу' : 'Закрыть'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Product info */}
        <div className="my-4 p-3.5 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={title}
            className="w-14 h-14 rounded-lg object-contain border border-[#333] bg-white p-1 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">{title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#A3A3A3] font-mono">#{product.sku}</span>
              {product.inStock ? (
                <span className="text-[11px] font-semibold text-emerald-400 bg-[#163828] px-1.5 py-0.2 rounded border border-[#25D366]/30">
                  {lang === 'kz' ? 'Қолда бар' : 'В наличии'}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-400 bg-[#262115] px-1.5 py-0.2 rounded border border-[#C5A059]/30">
                  {lang === 'kz' ? 'Қолда жоқ' : 'Под заказ'}
                </span>
              )}
            </div>
            <p className="text-base sm:text-lg font-black text-[#C5A059] tabular-nums mt-0.5">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#D4D4D4] mb-1 uppercase tracking-wider">
              {lang === 'kz' ? 'Сіздің атыңыз' : 'Ваше имя'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'kz' ? 'Мысалы: Айгүл / Данияр' : 'Например: Алина или Арман'}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-[#383838] bg-[#222222] text-white placeholder:text-[#737373] focus:outline-none focus:border-[#C5A059]"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D4D4D4] mb-1 uppercase tracking-wider">
              {lang === 'kz' ? 'Телефон нөміріңіз' : 'Номер телефона'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (7__) ___-__-__"
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-lg border border-[#383838] bg-[#222222] text-white placeholder:text-[#737373] focus:outline-none focus:border-[#C5A059]"
              required
            />
          </div>

          {/* Boutique Guarantee Info */}
          <div className="p-3 rounded-lg bg-[#181818] border border-[#282828] text-xs text-[#A3A3A3] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{config.city} · {config.boutiqueNumber}</span>
            </div>
            <p>📍 {config.address}</p>
            <p>⚡ Менеджер сразу напишет вам в WhatsApp для подтверждения</p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] active:bg-[#B38F46] text-black font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>
              {product.inStock
                ? (lang === 'kz' ? 'Тапсырысты WhatsApp арқылы жіберу' : 'Отправить заказ в WhatsApp')
                : (lang === 'kz' ? 'Алдын ала тапсырыс жіберу' : 'Оформить предзаказ')}
            </span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
