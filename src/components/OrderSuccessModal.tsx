import React from 'react';
import { CheckCircle2, MessageCircle, X } from 'lucide-react';
import { Order, Language } from '../types';
import { translations } from '../translations';
import { formatTenge, generateWhatsAppOrderUrl } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  language: Language;
  whatsappNumber: string;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  language,
  whatsappNumber,
  onClose,
}) => {
  if (!order) return null;

  const t = translations[language];

  const handleSendWhatsApp = () => {
    const url = generateWhatsAppOrderUrl({
      whatsappNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      clientName: order.clientName,
      phone: order.phone,
      address: order.address,
      deliveryMethod: order.deliveryMethod === 'pickup' ? t.pickup : t.delivery,
      orderNumber: order.orderNumber,
      language,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">
          {t.orderSuccessTitle}
        </h2>
        
        <div className="inline-block px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-mono text-sm font-bold my-2">
          {t.orderNumber}: {order.orderNumber}
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {t.orderSuccessDesc}
        </p>

        {/* Itemized Order Breakdown */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left mb-6 text-sm space-y-2">
          <div className="font-bold text-gray-800 uppercase tracking-wider text-xs pb-1.5 border-b border-gray-200">
            {language === 'kz' ? 'Тапсырыс құрамы:' : 'Состав заказа:'}
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-gray-700">
              <span className="truncate pr-2 font-medium">
                {item.title} × {item.quantity}
              </span>
              <span className="font-bold whitespace-nowrap text-gray-900">
                {formatTenge(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-bold text-sm">
            <span className="text-gray-600 uppercase text-xs">{t.total}:</span>
            <span className="text-amber-700 font-serif text-lg font-extrabold">
              {formatTenge(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>{t.sendViaWhatsAppDirect} (+7 778 175-42-41)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {t.back} {language === 'kz' ? 'дүкенге' : 'в магазин'}
          </button>
        </div>
      </div>
    </div>
  );
};
