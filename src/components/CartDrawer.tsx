import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { CartItem, Language, Product, StoreConfig } from '../types';
import { formatPrice, generateWhatsAppOrderUrl } from '../utils/formatters';
import { getCartRecommendations } from '../utils/recommendations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  allProducts: Product[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  config: StoreConfig;
  lang: Language;
  onAddToCart?: (product: Product) => void;
  onOpenDetail?: (product: Product) => void;
  recentlyViewed?: Product[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  allProducts,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  config,
  lang,
  onAddToCart,
  onOpenDetail,
  recentlyViewed = [],
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'post'>('delivery');
  const [orderNotes, setOrderNotes] = useState('');

  // Lock body scroll when open
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

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasBundleDiscount = totalQty >= 3;
  const discountAmount = hasBundleDiscount ? Math.round(total * 0.1) : 0;
  const finalTotal = total - discountAmount;

  const cartRecommendations = useMemo(
    () =>
      getCartRecommendations(
        items.map((i) => i.product),
        allProducts,
        3
      ),
    [items, allProducts]
  );

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const url = generateWhatsAppOrderUrl(
      config,
      items,
      {
        name: customerName.trim() || (lang === 'kz' ? 'Тұтынушы' : 'Покупатель'),
        phone: customerPhone.trim() || '',
        address: customerAddress.trim(),
        deliveryMethod,
        notes: orderNotes.trim(),
      },
      lang
    );

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex justify-end overflow-hidden"
      onClick={onClose}
    >
      <div
        id="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white text-slate-900 border-l border-slate-200 h-full flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header in Flip.kz Style */}
        <div
          id="cart-header"
          className="px-4 py-3 sm:py-3.5 bg-white text-slate-900 flex items-center justify-between gap-2 border-b border-slate-200 shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Артқа' : 'Назад в каталог'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'kz' ? 'Артқа' : 'Назад'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 min-w-0">
            <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 whitespace-nowrap">
              {lang === 'kz' ? 'Себет' : 'Корзина'}
            </h2>
            <span className="text-[11px] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold whitespace-nowrap border border-blue-200">
              {totalQty} {lang === 'kz' ? 'дана' : 'шт.'}
            </span>
          </div>

          <button
            type="button"
            id="cart-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Жабу' : 'Закрыть'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div id="cart-empty-state" className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shrink-0">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {lang === 'kz' ? 'Себет әзірге бос' : 'Ваша корзина пуста'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mt-1.5 mb-6 leading-relaxed">
              {lang === 'kz'
                ? 'Каталогтан өнімдерді таңдап, себетке қосыңыз'
                : 'Выберите товары из каталога Бутика №24 и добавьте их в корзину'}
            </p>
            <button
              id="cart-empty-continue-btn"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              {lang === 'kz' ? 'Каталогқа оралу' : 'Перейти к покупкам'}
            </button>
          </div>
        ) : (
          <div id="cart-scroll-body" className="flex-1 overflow-y-auto overscroll-contain">
            {/* Top Bar inside Cart: Clear Cart button */}
            <div className="px-4 py-2 flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70">
              <span className="text-xs font-semibold text-slate-600">
                {lang === 'kz' ? 'Таңдалған өнімдер:' : 'Товары в заказе:'}
              </span>
              <button
                type="button"
                id="clear-cart-btn"
                onClick={onClearCart}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'kz' ? 'Тазалау' : 'Очистить корзину'}</span>
              </button>
            </div>

            {/* Discount Banner (Flip.kz Style) */}
            <div className="mx-4 mt-3 p-3 rounded-lg bg-blue-50/80 border border-blue-200">
              {hasBundleDiscount ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-blue-900">
                    {lang === 'kz'
                      ? '✨ Жиынтыққа -10% жеңілдік қосылды!'
                      : '✨ Скидка -10% на заказ от 3 позиций применена!'}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-emerald-700 shrink-0">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-700 font-medium">
                      {lang === 'kz'
                        ? `Тағы ${3 - totalQty} тауар қосып, -10% жеңілдік алыңыз`
                        : `Добавьте ещё ${3 - totalQty} шт. для скидки -10% на весь заказ`}
                    </span>
                    <span className="font-bold text-blue-700 shrink-0">
                      {totalQty}/3
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-blue-200/60 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, (totalQty / 3) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* List of items */}
            <div id="cart-items-list" className="p-4 space-y-3">
              {items.map((item) => {
                const title = lang === 'kz' && item.product.titleKz?.trim() ? item.product.titleKz : item.product.titleRu;
                return (
                  <div
                    key={item.product.id}
                    className="rounded-xl bg-white p-3.5 border border-slate-200/90 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={title}
                        className="w-14 h-16 rounded-lg object-contain border border-slate-100 bg-white shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                            {title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title={lang === 'kz' ? 'Өшіру' : 'Удалить'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {formatPrice(item.product.price)} × {item.quantity} ={' '}
                          <strong className="text-slate-900 font-bold tabular-nums">
                            {formatPrice(item.product.price * item.quantity)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-md bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-sm shadow-2xs transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-2.5">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-md bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-sm shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        {lang === 'kz' ? 'Өшіру' : 'Удалить'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleWhatsAppCheckout} className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Delivery method selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'kz' ? 'Жеткізу тәсілі:' : 'Способ доставки / получения:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-2 px-1 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'kz' ? 'Курьер' : 'Курьер Атырау'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-2 px-1 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'kz' ? 'Бутик №24' : 'Самовывоз №24'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('post')}
                    className={`py-2 px-1 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                      deliveryMethod === 'post'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'kz' ? 'Қазақстан' : 'По Казахстану'}
                  </button>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === 'kz' ? 'Атыңыз' : 'Ваше имя'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  required
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={lang === 'kz' ? '+7 (___) ___-__-__' : '+7 (___) ___-__-__'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  required
                />
              </div>

              {deliveryMethod !== 'pickup' && (
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={
                    lang === 'kz'
                      ? 'Мекенжай: көше, үй, пәтер'
                      : 'Адрес доставки в г. Атырау'
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              )}

              {/* Total Calculation */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                {hasBundleDiscount && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                    <span>{lang === 'kz' ? 'Жеңілдік (-10%):' : 'Скидка на заказ (-10%):'}</span>
                    <span className="font-mono tabular-nums font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {lang === 'kz' ? 'Төлеуге:' : 'Итого к оплате:'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    {hasBundleDiscount && (
                      <span className="text-xs font-mono tabular-nums text-slate-400 line-through">
                        {formatPrice(total)}
                      </span>
                    )}
                    <span className="text-xl font-black text-slate-900 tabular-nums">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Checkout Button in Flip.kz Style */}
              <button
                id="cart-submit-whatsapp-btn"
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'kz' ? 'WhatsApp арқылы тапсырыс беру' : 'Оформить заказ через WhatsApp'}</span>
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                💳 Оплата через Kaspi QR / перевод при получении заказа
              </p>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
