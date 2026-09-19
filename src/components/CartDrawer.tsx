import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { CartItem, Language } from '../types';
import { translations } from '../translations';
import { formatTenge, generateWhatsAppOrderUrl } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  language: Language;
  whatsappNumber: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onOpenCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  language,
  whatsappNumber,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onOpenCatalog,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsAppOrder = () => {
    const url = generateWhatsAppOrderUrl({
      whatsappNumber,
      items,
      totalAmount,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                {t.cart} ({totalItemsCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ShoppingBag className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    {t.cartEmpty}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xs">
                    {t.cartEmptySubtitle}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCatalog();
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm cursor-pointer"
                >
                  {t.viewCatalog}
                </button>
              </div>
            ) : (
              items.map((item) => {
                const title = language === 'ru' ? item.product.titleRu : (item.product.titleKz || item.product.titleRu);
                const image = item.product.images?.[0];

                return (
                  <div
                    key={item.productId}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex gap-3 items-center transition-all hover:border-gray-300 shadow-xs"
                  >
                    {/* Item thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-serif text-xs text-amber-800 font-bold">
                          MS
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight">
                        {title}
                      </h4>
                      <div className="text-xs sm:text-sm text-amber-700 font-extrabold mt-1">
                        {formatTenge(item.product.price)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-l-lg transition-colors cursor-pointer"
                            aria-label="Decrease"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-r-lg transition-colors cursor-pointer"
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>

                        {/* Line total & remove */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {formatTenge(item.product.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(item.productId)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title={t.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with totals and action buttons */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-200 bg-white space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.total}:</span>
                <span className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
                  {formatTenge(totalAmount)}
                </span>
              </div>

              {/* Main Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-98 cursor-pointer"
              >
                <span>{t.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct WhatsApp button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.orderWhatsApp}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
