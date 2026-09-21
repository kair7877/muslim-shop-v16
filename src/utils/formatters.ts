import { CartItem, DeliveryMethod, Language, Product, StoreConfig } from '../types';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
}

export function parseWorkingHours(hoursStr?: string): {
  openMinutes: number;
  closeMinutes: number;
  openStr: string;
  closeStr: string;
} {
  const defaultOpen = '10:00';
  const defaultClose = '19:00';

  if (!hoursStr || typeof hoursStr !== 'string') {
    return {
      openMinutes: 10 * 60,
      closeMinutes: 19 * 60,
      openStr: defaultOpen,
      closeStr: defaultClose,
    };
  }

  // Regex to match times like 10:00, 19:00, 10.00, 19.00, 9:00, 21:00
  const timeRegex = /(\d{1,2})[:.](\d{2})/g;
  const matches = [...hoursStr.matchAll(timeRegex)];

  if (matches.length >= 2) {
    const openH = parseInt(matches[0][1], 10);
    const openM = parseInt(matches[0][2], 10);
    const closeH = parseInt(matches[1][1], 10);
    const closeM = parseInt(matches[1][2], 10);

    const openStr = `${openH.toString().padStart(2, '0')}:${openM.toString().padStart(2, '0')}`;
    const closeStr = `${closeH.toString().padStart(2, '0')}:${closeM.toString().padStart(2, '0')}`;

    return {
      openMinutes: openH * 60 + openM,
      closeMinutes: closeH * 60 + closeM,
      openStr,
      closeStr,
    };
  } else if (matches.length === 1) {
    const h = parseInt(matches[0][1], 10);
    const m = parseInt(matches[0][2], 10);
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    // If it mentions "до", assume it's closing time
    if (hoursStr.toLowerCase().includes('до')) {
      return {
        openMinutes: 10 * 60,
        closeMinutes: h * 60 + m,
        openStr: defaultOpen,
        closeStr: timeStr,
      };
    }
  }

  return {
    openMinutes: 10 * 60,
    closeMinutes: 19 * 60,
    openStr: defaultOpen,
    closeStr: defaultClose,
  };
}

export function isStoreOpen(config?: StoreConfig): {
  isOpen: boolean;
  textRu: string;
  textKz: string;
  openStr: string;
  closeStr: string;
} {
  const { openMinutes, closeMinutes, openStr, closeStr } = parseWorkingHours(
    config?.workingHoursRu || config?.workingHoursKz
  );

  // Atyrau / Kazakhstan unified timezone is UTC+5
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const atyrauDate = new Date(utc + 3600000 * 5);
  const currentMinutes = atyrauDate.getHours() * 60 + atyrauDate.getMinutes();

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    return {
      isOpen: true,
      textRu: `Открыто до ${closeStr}`,
      textKz: `${closeStr}-ге дейін ашық`,
      openStr,
      closeStr,
    };
  } else {
    return {
      isOpen: false,
      textRu: `Откроется в ${openStr}`,
      textKz: `${openStr}-де ашылады`,
      openStr,
      closeStr,
    };
  }
}

export function generateWhatsAppOrderUrl(
  config: StoreConfig,
  items: CartItem[],
  customer: {
    name: string;
    phone: string;
    address: string;
    deliveryMethod: DeliveryMethod;
    notes?: string;
  },
  lang: Language
): string {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const deliveryLabelsRu = {
    delivery: 'Курьерская доставка по г. Атырау',
    pickup: 'Самовывоз из Бутика №24 (пр. Султана Бейбарыса, 45а/5)',
    post: 'Доставка по Казахстану (Казпочта / СДЭК)',
  };

  const deliveryLabelsKz = {
    delivery: 'Атырау қаласы бойынша курьерлік жеткізу',
    pickup: '№24 Бутиктен алып кету (Сұлтан Бейбарыс даңғылы, 45а/5)',
    post: 'Қазақстан бойынша жеткізу (Қазпошта / СДЭК)',
  };

  let message = '';
  if (lang === 'kz') {
    message += `Сәлеметсіз бе, ${config.storeName}! Мен сайттан тапсырыс бергім келеді:\n\n`;
    items.forEach((item, index) => {
      const p = item.product;
      message += `${index + 1}. ${p.titleKz} (арт: ${p.sku}) — ${item.quantity} дана × ${formatPrice(p.price)} = ${formatPrice(p.price * item.quantity)}\n`;
    });
    message += `\nБарлығы: ${formatPrice(total)}\n`;
    message += `Тапсырыс беруші: ${customer.name}\n`;
    message += `Телефон: ${customer.phone}\n`;
    message += `Жеткізу түрі: ${deliveryLabelsKz[customer.deliveryMethod]}\n`;
    if (customer.address) {
      message += `Мекенжай: ${customer.address}\n`;
    }
    if (customer.notes) {
      message += `Ескертпе: ${customer.notes}\n`;
    }
    message += `\nТөлемді Kaspi арқылы жасауға болады ма? Рахмет!`;
  } else {
    message += `Здравствуйте, ${config.storeName}! Хочу оформить заказ с сайта:\n\n`;
    items.forEach((item, index) => {
      const p = item.product;
      message += `${index + 1}. ${p.titleRu} (арт: ${p.sku}) — ${item.quantity} шт × ${formatPrice(p.price)} = ${formatPrice(p.price * item.quantity)}\n`;
    });
    message += `\nИтого к оплате: ${formatPrice(total)}\n`;
    message += `Покупатель: ${customer.name}\n`;
    message += `Телефон: ${customer.phone}\n`;
    message += `Способ получения: ${deliveryLabelsRu[customer.deliveryMethod]}\n`;
    if (customer.address) {
      message += `Адрес: ${customer.address}\n`;
    }
    if (customer.notes) {
      message += `Комментарий: ${customer.notes}\n`;
    }
    message += `\nПодскажите реквизиты Kaspi для оплаты и время доставки. Спасибо!`;
  }

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${config.whatsappNumber}?text=${encoded}`;
}

export function generateQuickOrderUrl(
  config: StoreConfig,
  productTitle: string,
  sku: string,
  price: number,
  customerName: string,
  customerPhone: string,
  lang: Language
): string {
  let message = '';
  if (lang === 'kz') {
    message = `Сәлеметсіз бе, ${config.storeName}! Мен мына өнімді 1 басу арқылы сатып алғым келеді:\n\n` +
      `📦 Өнім: ${productTitle}\n` +
      `Артикул: ${sku}\n` +
      `Бағасы: ${formatPrice(price)}\n\n` +
      `Менің атым: ${customerName}\n` +
      `Телефон: ${customerPhone}\n\n` +
      `Тапсырысты растауыңызды күтемін!`;
  } else {
    message = `Здравствуйте, ${config.storeName}! Хочу быстро заказать товар:\n\n` +
      `📦 Товар: ${productTitle}\n` +
      `Артикул: ${sku}\n` +
      `Цена: ${formatPrice(price)}\n\n` +
      `Покупатель: ${customerName}\n` +
      `Телефон: ${customerPhone}\n\n` +
      `Свяжитесь со мной для уточнения доставки и оплаты через Kaspi!`;
  }

  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getProductDirectUrl(productId: string): string {
  if (typeof window === 'undefined') return `?p=${encodeURIComponent(productId)}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?p=${encodeURIComponent(productId)}`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback to execCommand below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

/**
 * Deduplicates products array by unique ID and identical SKU/Title to prevent duplicate listings
 */
export function deduplicateProducts(products: Product[]): Product[] {
  if (!Array.isArray(products)) return [];
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const result: Product[] = [];

  for (const p of products) {
    if (!p || !p.id) continue;
    // 1. Strict ID deduplication
    if (seenIds.has(p.id)) continue;

    // 2. Fuzzy duplicate signature check (same SKU or same Title + Price)
    const normalizedSku = (p.sku || '').trim().toUpperCase();
    const normalizedTitle = (p.titleRu || '').trim().toLowerCase();
    
    // If SKU is present and valid, match on SKU
    if (normalizedSku && normalizedSku !== 'MS-') {
      const skuKey = `sku:${normalizedSku}`;
      if (seenSignatures.has(skuKey)) {
        continue;
      }
      seenSignatures.add(skuKey);
    } else if (normalizedTitle) {
      const titleKey = `title:${normalizedTitle}_${p.price}`;
      if (seenSignatures.has(titleKey)) {
        continue;
      }
      seenSignatures.add(titleKey);
    }

    seenIds.add(p.id);
    result.push(p);
  }

  return result;
}
