import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, X, Trash2 } from 'lucide-react';
import { Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface CartNotificationToastProps {
  product: Product | null;
  cartCount: number;
  cartTotal: number;
  lang: Language;
  onOpenCart: () => void;
  onRemoveFromCart?: (productId: string) => void;
  onClose: () => void;
}

export const CartNotificationToast: React.FC<CartNotificationToastProps> = ({
  product,
  cartCount,
  cartTotal,
  lang,
  onOpenCart,
  onRemoveFromCart,
  onClose,
}) => {
  if (!product) return null;

  const isKz = lang === 'kz';
  const title = isKz && product.titleKz?.trim() ? product.titleKz : product.titleRu;

  return createPortal(
    <div
      id="rich-cart-notification"
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-3 left-3 sm:left-auto sm:right-6 z-[150] max-w-md mx-auto sm:mx-0 sm:w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-4">
        {/* Subtle top brand blue accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-amber-400" />

        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              {isKz ? 'Өнім себетке қосылды!' : 'Товар добавлен в корзину!'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onRemoveFromCart && (
              <button
                type="button"
                onClick={() => {
                  onRemoveFromCart(product.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                title={isKz ? 'Себеттен өшіру' : 'Удалить из корзины'}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{isKz ? 'Өшіру' : 'Удалить'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Закрыть уведомление"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Preview Row */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-13 h-16 rounded-lg object-contain border border-slate-200 shrink-0 bg-white"
            />
          ) : (
            <div className="w-13 h-16 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
              {title}
            </h4>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-slate-500 tabular-nums">
                {isKz
                  ? `Себетте: ${cartCount} дана`
                  : `В корзине: ${cartCount} шт.`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap text-center"
          >
            {isKz ? 'Жалғастыру' : 'Продолжить'}
          </button>

          <button
            type="button"
            id="toast-open-cart-btn"
            onClick={() => {
              onClose();
              onOpenCart();
            }}
            className="py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-white shrink-0" />
            <span>{isKz ? 'Себетке өту' : 'В корзину'}</span>
            <ArrowRight className="w-4 h-4 text-white shrink-0" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
