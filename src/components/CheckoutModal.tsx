import React, { useState } from 'react';
import { X, CheckCircle, Truck, Store, MessageCircle, ArrowRight, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { CartItem, Language, DeliveryMethod, Order } from '../types';
import { translations } from '../translations';
import { formatTenge, generateWhatsAppOrderUrl } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  language: Language;
  whatsappNumber: string;
  defaultCity?: string;
  onSubmitOrder: (orderData: {
    clientName: string;
    phone: string;
    whatsapp?: string;
    city: string;
    address: string;
    comment?: string;
    deliveryMethod: DeliveryMethod;
  }) => Order;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  language,
  whatsappNumber,
  defaultCity = 'Атырау',
  onSubmitOrder,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [errorMsg, setErrorMsg] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Fast 1-Click WhatsApp without filling form
  const handleInstantWhatsApp = () => {
    const url = generateWhatsAppOrderUrl({
      whatsappNumber,
      items,
      totalAmount,
      language,
    });
    window.open(url, '_blank');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg(language === 'ru' ? 'Пожалуйста, введите ваше имя' : 'Атыңызды енгізіңіз');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(language === 'ru' ? 'Пожалуйста, введите номер телефона' : 'Телефон нөмірін енгізіңіз');
      return;
    }
    if (deliveryMethod === 'delivery' && !address.trim()) {
      setErrorMsg(language === 'ru' ? 'Пожалуйста, укажите адрес доставки' : 'Жеткізу мекенжайын көрсетіңіз');
      return;
    }

    setErrorMsg('');
    const fullAddress = deliveryMethod === 'pickup' 
      ? (language === 'ru' ? 'Самовывоз: г. Атырау, ТД «Байзар», 2 этаж, бутик №24' : 'Өздігінен алып кету: Атырау қ., «Байзар» СО, 2 қабат, №24 бутик') 
      : `${city.trim() || 'Атырау'}, ${address.trim()}`;

    const order = onSubmitOrder({
      clientName: clientName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      city: city.trim() || 'Атырау',
      address: fullAddress,
      comment: comment.trim() || undefined,
      deliveryMethod,
    });

    // Directly launch WhatsApp with structured order text
    const url = generateWhatsAppOrderUrl({
      whatsappNumber,
      items,
      totalAmount,
      clientName: clientName.trim(),
      phone: phone.trim(),
      address: fullAddress,
      deliveryMethod: deliveryMethod === 'pickup' ? t.pickup : t.delivery,
      orderNumber: order.orderNumber,
      language,
      comment: comment.trim() || undefined,
    });

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-gray-900">
                {t.checkoutTitle}
              </h2>
              <span className="text-xs text-emerald-700 font-bold block">
                WhatsApp: +7 778 175-42-41
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Miniature */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 font-medium">
            {items.length} {language === 'ru' ? 'наим. товара' : 'тауар түрі'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 font-medium">{t.total}:</span>
            <span className="font-extrabold text-amber-700 text-base sm:text-lg">
              {formatTenge(totalAmount)}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Direct 1-Click Button without typing */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-center space-y-2.5 shadow-xs">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-800">
              <MessageCircle className="w-4 h-4 fill-emerald-700" />
              <span>{language === 'ru' ? 'Мгновенный заказ в 1 клик' : '1 басумен жылдам тапсырыс'}</span>
            </div>
            <p className="text-xs text-gray-600 leading-snug">
              {language === 'ru' 
                ? 'Нажмите, чтобы сразу открыть WhatsApp с готовым списком товаров и отправить продавцу'
                : 'Дайын тауарлар тізімімен бірден WhatsApp-ты ашып, сатушыға жолдау үшін басыңыз'}
            </p>
            <button
              type="button"
              onClick={handleInstantWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{language === 'ru' ? 'Открыть WhatsApp сразу (+7 778 175-42-41)' : 'WhatsApp-ты бірден ашу (+7 778 175-42-41)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-gray-500 font-bold">
              {language === 'ru' ? 'или укажите данные для доставки' : 'немесе жеткізу деректерін жазыңыз'}
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs sm:text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer info */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                {t.clientName} *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={language === 'ru' ? 'Например: Айбек' : 'Мысалы: Айбек'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-amber-500 focus:bg-white text-sm sm:text-base text-gray-900 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                {t.phone} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (778) 000-00-00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-amber-500 focus:bg-white text-sm sm:text-base text-gray-900 outline-none transition-colors"
              />
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
                {t.deliveryMethod}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    deliveryMethod === 'delivery'
                      ? 'bg-amber-50 border-2 border-amber-500 shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Truck className={`w-4 h-4 mt-0.5 ${deliveryMethod === 'delivery' ? 'text-amber-700' : 'text-gray-500'}`} />
                  <div>
                    <div className={`text-xs sm:text-sm font-bold ${deliveryMethod === 'delivery' ? 'text-amber-900' : 'text-gray-800'}`}>
                      {t.delivery}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 font-medium">Атырау / РК</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'bg-amber-50 border-2 border-amber-500 shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Store className={`w-4 h-4 mt-0.5 ${deliveryMethod === 'pickup' ? 'text-amber-700' : 'text-gray-500'}`} />
                  <div>
                    <div className={`text-xs sm:text-sm font-bold ${deliveryMethod === 'pickup' ? 'text-amber-900' : 'text-gray-800'}`}>
                      {t.pickup}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 font-medium">пр. Бейбарыса, 45а/5</div>
                  </div>
                </button>
              </div>

              {/* Pickup info box */}
              {deliveryMethod === 'pickup' && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <div>
                      <div className="text-gray-900 font-bold text-xs sm:text-sm">
                        г. Атырау, пр. Султана Бейбарыса, 45а/5
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 font-medium">
                        {language === 'ru' ? 'Ежедневно с 10:00 до 21:00' : 'Күн сайын 10:00 - 21:00'}
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://2gis.kz/atyrau/geo/70000001094546376"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>2ГИС</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Address field (if delivery) */}
            {deliveryMethod === 'delivery' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                      {t.city}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-sm sm:text-base text-gray-900 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                      {t.address} *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={language === 'ru' ? 'Улица, дом, квартира' : 'Көше, үй, пәтер'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 focus:border-amber-500 focus:bg-white text-sm sm:text-base text-gray-900 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Comment */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                {t.orderComment}
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={language === 'ru' ? 'Пожелания к заказу...' : 'Тапсырысқа тілектер...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-sm sm:text-base text-gray-900 outline-none"
              />
            </div>

            {/* Reassurance notice */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2 text-xs text-gray-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                {language === 'ru'
                  ? 'Без онлайн-оплаты. Заказ подтверждается напрямую с продавцом в WhatsApp.'
                  : 'Онлайн төлемсіз. Тапсырыс тікелей WhatsApp арқылы сатушымен расталады.'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 px-4 rounded-xl font-bold text-base bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{t.submitOrder}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
