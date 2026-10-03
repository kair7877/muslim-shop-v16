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
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        id="quick-order-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto"
      >
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shrink-0"
              title={lang === 'kz' ? 'Артқа' : 'Назад'}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'kz' ? 'Артқа' : 'Назад'}</span>
            </button>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
              {product.inStock
                ? (lang === 'kz' ? '1 басу арқылы сатып алу' : 'Быстрый заказ в 1 клик')
                : (lang === 'kz' ? 'Алдын ала жазылу' : 'Предзаказ товара')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Жабу' : 'Закрыть'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Product info */}
        <div className="my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={title}
            className="w-14 h-14 rounded-lg object-contain border border-slate-200 bg-white shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 font-mono">#{product.sku}</span>
              {product.inStock ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {lang === 'kz' ? 'Қолда бар' : 'В наличии'}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                  {lang === 'kz' ? 'Қолда жоқ' : 'Под заказ'}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-black text-slate-900 tabular-nums mt-0.5">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'kz' ? 'Сіздің атыңыз' : 'Ваше имя'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'kz' ? 'Мысалы: Айгүл / Данияр' : 'Например: Алина или Арман'}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'kz' ? 'Телефон нөміріңіз' : 'Номер телефона'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              required
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              id="submit-quick-order-btn"
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>
                {product.inStock
                  ? (lang === 'kz' ? 'WhatsApp арқылы растау' : 'Подтвердить заказ в WhatsApp')
                  : (lang === 'kz' ? 'WhatsApp арқылы өтінім жіберу' : 'Отправить заявку в WhatsApp')}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>{lang === 'kz' ? 'Артқа' : 'Назад в магазин'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {product.inStock
                ? (lang === 'kz' ? 'Менеджер 5 минут ішінде жауап береді' : 'Менеджер Бутика №24 сразу ответит вам')
                : (lang === 'kz' ? 'Тауар түскенде Бутик №24 сізге бірден хабарлайды!' : 'Бутик №24 сразу сообщит вам, когда товар поступит!')}
            </span>
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
};
