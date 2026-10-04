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
  isOpen?: boolean;
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
  isOpen = true,
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
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex justify-end overflow-hidden"
      onClick={onClose}
    >
      <div
        id="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#141414] text-white border-l border-[#2E2E2E] h-full flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header: Dark Graphite & Gold Accents */}
        <div
          id="cart-header"
          className="px-4 py-3.5 sm:py-4 bg-[#1C1C1C] text-white flex items-center justify-between gap-2 border-b border-[#2A2A2A] shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white font-bold text-xs transition-colors cursor-pointer border border-[#383838] shrink-0"
            title={lang === 'kz' ? 'Артқа' : 'Назад в каталог'}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'kz' ? 'Артқа' : 'Назад'}</span>
          </button>

          <div className="flex items-center justify-center gap-2 min-w-0">
            <ShoppingBag className="w-5 h-5 text-[#C5A059] shrink-0" />
            <h2 className="font-extrabold text-base sm:text-lg text-white whitespace-nowrap">
              {lang === 'kz' ? 'Себет' : 'Корзина'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#242424] text-[#C5A059] font-mono font-bold border border-[#C5A059]/40">
              {totalQty} {lang === 'kz' ? 'дана' : 'шт.'}
            </span>
          </div>

          <button
            type="button"
            id="cart-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Жабу' : 'Закрыть'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div id="cart-empty-state" className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#1F1F1F] border border-[#2E2E2E] flex items-center justify-center text-[#C5A059] mb-4 shrink-0">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'kz' ? 'Себет әзірге бос' : 'Ваша корзина пуста'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-xs mt-1.5 mb-6 leading-relaxed">
              {lang === 'kz'
                ? 'Каталогтан өнімдерді таңдап, себетке қосыңыз'
                : 'Выберите товары из каталога Бутика №24 и добавьте их в корзину'}
            </p>
            <button
              id="cart-empty-continue-btn"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer"
            >
              {lang === 'kz' ? 'Каталогқа оралу' : 'Перейти к покупкам'}
            </button>
          </div>
        ) : (
          <div id="cart-scroll-body" className="flex-1 overflow-y-auto overscroll-contain">
            {/* Top Bar inside Cart: Clear Cart button */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-[#242424] bg-[#171717]">
              <span className="text-xs font-semibold text-[#A3A3A3]">
                {lang === 'kz' ? 'Таңдалған өнімдер:' : 'Товары в заказе:'}
              </span>
              <button
                type="button"
                id="clear-cart-btn"
                onClick={onClearCart}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E8E8E] hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'kz' ? 'Тазалау' : 'Очистить корзину'}</span>
              </button>
            </div>

            {/* Discount Banner */}
            <div className="mx-4 mt-3 p-3 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E]">
              {hasBundleDiscount ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#C5A059]">
                    {lang === 'kz'
                      ? '✨ Жиынтыққа -10% жеңілдік қосылды!'
                      : '✨ Скидка -10% на заказ от 3 позиций применена!'}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-emerald-400 shrink-0">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#D4D4D4] font-medium">
                      {lang === 'kz'
                        ? `Тағы ${3 - totalQty} тауар қосып, -10% жеңілдік алыңыз`
                        : `Добавьте ещё ${3 - totalQty} шт. для скидки -10% на весь заказ`}
                    </span>
                    <span className="font-bold text-[#C5A059] font-mono shrink-0">
                      {totalQty}/3
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#2A2A2A] overflow-hidden">
                    <div
                      className="h-full bg-[#C5A059] transition-all duration-300"
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
                    className="rounded-xl bg-[#1A1A1A] p-3.5 border border-[#282828] shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={title}
                        className="w-16 h-18 rounded-lg object-contain border border-[#2E2E2E] bg-white p-1 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                            {title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1 rounded-md text-[#737373] hover:text-rose-400 hover:bg-[#262626] transition-colors cursor-pointer shrink-0"
                            title={lang === 'kz' ? 'Өшіру' : 'Удалить'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs text-[#A3A3A3] mt-1.5">
                          {formatPrice(item.product.price)} × {item.quantity} ={' '}
                          <strong className="text-[#C5A059] font-bold tabular-nums text-sm">
                            {formatPrice(item.product.price * item.quantity)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#262626]">
                      <div className="flex items-center bg-[#222222] rounded-lg p-0.5 border border-[#333333]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-8 h-8 rounded-md bg-[#2B2B2B] hover:bg-[#383838] text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs sm:text-sm font-extrabold text-white px-3 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-8 h-8 rounded-md bg-[#C5A059] hover:bg-[#D4AF37] text-black flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-xs text-[#8E8E8E] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        {lang === 'kz' ? 'Өшіру' : 'Удалить'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cross-Sell Recommendations */}
            {cartRecommendations && cartRecommendations.length > 0 && onAddToCart && (
              <div className="px-4 py-3 bg-[#171717] border-t border-[#262626]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{lang === 'kz' ? 'Тапсырысқа қосыңыз:' : 'Добавьте к заказу:'}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {cartRecommendations.slice(0, 3).map((rec) => {
                    const recTitle = lang === 'kz' && rec.titleKz?.trim() ? rec.titleKz : rec.titleRu;
                    return (
                      <div
                        key={rec.id}
                        className="bg-[#1C1C1C] rounded-lg p-2 border border-[#2A2A2A] flex flex-col justify-between"
                      >
                        <div
                          onClick={() => onOpenDetail && onOpenDetail(rec)}
                          className="cursor-pointer"
                        >
                          <img
                            src={rec.images[0]}
                            alt={recTitle}
                            className="w-full aspect-square object-contain rounded bg-white p-1 mb-1"
                          />
                          <h5 className="text-[11px] font-medium text-white line-clamp-2 leading-tight">
                            {recTitle}
                          </h5>
                        </div>
                        <div className="mt-1.5 pt-1 border-t border-[#2A2A2A] flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-[#C5A059] tabular-nums">
                            {formatPrice(rec.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(rec)}
                            className="p-1 rounded bg-[#C5A059] hover:bg-[#D4AF37] text-black transition-colors cursor-pointer shrink-0"
                            title="Добавить"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Checkout Form */}
            <form onSubmit={handleWhatsAppCheckout} className="p-4 bg-[#181818] border-t border-[#2A2A2A] space-y-3.5">
              {/* Delivery method selector */}
              <div>
                <label className="block text-xs font-bold text-[#D4D4D4] mb-1.5 uppercase tracking-wider">
                  {lang === 'kz' ? 'Жеткізу тәсілі:' : 'Способ доставки / получения:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-2 px-1 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'bg-[#C5A059] text-black border-[#C5A059]'
                        : 'bg-[#222222] text-[#D4D4D4] border-[#383838] hover:bg-[#2A2A2A]'
                    }`}
                  >
                    {lang === 'kz' ? 'Курьер' : 'Курьер Атырау'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-2 px-1 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#C5A059] text-black border-[#C5A059]'
                        : 'bg-[#222222] text-[#D4D4D4] border-[#383838] hover:bg-[#2A2A2A]'
                    }`}
                  >
                    {lang === 'kz' ? 'Бутик №24' : 'Самовывоз №24'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('post')}
                    className={`py-2 px-1 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                      deliveryMethod === 'post'
                        ? 'bg-[#C5A059] text-black border-[#C5A059]'
                        : 'bg-[#222222] text-[#D4D4D4] border-[#383838] hover:bg-[#2A2A2A]'
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
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#383838] bg-[#222222] text-white placeholder:text-[#737373] focus:outline-none focus:border-[#C5A059]"
                  required
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+7 (7__) ___-__-__"
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#383838] bg-[#222222] text-white placeholder:text-[#737373] focus:outline-none focus:border-[#C5A059]"
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
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#383838] bg-[#222222] text-white placeholder:text-[#737373] focus:outline-none focus:border-[#C5A059]"
                />
              )}

              {/* Total Calculation */}
              <div className="pt-2 border-t border-[#2A2A2A] space-y-1">
                {hasBundleDiscount && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>{lang === 'kz' ? 'Жеңілдік (-10%):' : 'Скидка на заказ (-10%):'}</span>
                    <span className="font-mono tabular-nums font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs sm:text-sm font-bold text-[#A3A3A3]">
                    {lang === 'kz' ? 'Төлеуге:' : 'Итого к оплате:'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    {hasBundleDiscount && (
                      <span className="text-xs font-mono tabular-nums text-[#737373] line-through">
                        {formatPrice(total)}
                      </span>
                    )}
                    <span className="text-xl sm:text-2xl font-black text-[#C5A059] tabular-nums">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <button
                id="cart-submit-whatsapp-btn"
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] active:bg-[#B38F46] text-black font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{lang === 'kz' ? 'WhatsApp арқылы тапсырыс беру' : 'Оформить заказ через WhatsApp'}</span>
              </button>

              <p className="text-[11px] text-[#8E8E8E] text-center">
                💳 Оплата через Kaspi QR / переводом при получении
              </p>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
