import { Category, Product, StoreConfig } from '../types';

/**
 * Clean and escape string for CSV format (RFC 4180)
 */
function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ').replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Trigger browser file download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Format current date for filenames (e.g. 2026-10-05)
 */
function getFilenameDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 1. Export all products to Excel/CSV with UTF-8 BOM
 */
export function exportProductsToCsv(products: Product[], categories: Category[]): void {
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => {
    categoryMap.set(c.id, c.nameRu);
  });

  const headers = [
    'Артикул (SKU)',
    'Название товара (RU)',
    'Тауар атауы (KZ)',
    'Категория',
    'Цена (₸)',
    'Старая цена (₸)',
    'В наличии',
    'Объем / Вес',
    'Страна',
    'Хит',
    'Новинка',
    'Фото (URL)',
    'Описание (RU)',
    'Описание (KZ)',
  ];

  const rows = products.map((p) => {
    const categoryName = categoryMap.get(p.categoryId) || p.categoryId || 'Без категории';
    return [
      escapeCsvCell(p.sku || p.id),
      escapeCsvCell(p.titleRu),
      escapeCsvCell(p.titleKz || ''),
      escapeCsvCell(categoryName),
      escapeCsvCell(p.price),
      escapeCsvCell(p.oldPrice || ''),
      escapeCsvCell(p.inStock ? 'Да' : 'Нет'),
      escapeCsvCell(p.volumeOrWeight || ''),
      escapeCsvCell(p.country || ''),
      escapeCsvCell(p.isHit ? 'Да' : 'Нет'),
      escapeCsvCell(p.isNew ? 'Да' : 'Нет'),
      escapeCsvCell((p.images && p.images[0]) || ''),
      escapeCsvCell(p.descriptionRu || ''),
      escapeCsvCell(p.descriptionKz || ''),
    ].join(';');
  });

  // UTF-8 BOM for Excel compatibility with Cyrillic
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `muslim-shop-products-${getFilenameDate()}.csv`);
}

/**
 * 2. Export full store backup (products, categories, settings) as JSON
 */
export interface StoreBackupData {
  version: string;
  shopName: string;
  exportDate: string;
  totalProducts: number;
  totalCategories: number;
  products: Product[];
  categories: Category[];
  config: StoreConfig;
}

export function exportFullBackupJson(
  products: Product[],
  categories: Category[],
  config: StoreConfig
): void {
  const backup: StoreBackupData = {
    version: '1.0',
    shopName: 'MUSLIM SHOP · Бутик №24, г. Атырау',
    exportDate: new Date().toISOString(),
    totalProducts: products.length,
    totalCategories: categories.length,
    products,
    categories,
    config,
  };

  const jsonContent = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `muslim-shop-full-backup-${getFilenameDate()}.json`);
}

/**
 * 3. Export clean text price-list (for messengers / WhatsApp / Notes)
 */
export function exportPriceListText(products: Product[], categories: Category[], config: StoreConfig): void {
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => {
    categoryMap.set(c.id, c.nameRu);
  });

  // Group by category
  const groups = new Map<string, Product[]>();
  products.forEach((p) => {
    const catName = categoryMap.get(p.categoryId) || 'Другие товары';
    if (!groups.has(catName)) {
      groups.set(catName, []);
    }
    groups.get(catName)!.push(p);
  });

  let text = `🛍 MUSLIM SHOP · ПРАЙС-ЛИСТ\n`;
  text += `📍 г. Атырау, ТД «Дина Байзар», Бутик №24\n`;
  text += `📞 Телефон / WhatsApp: +${config.whatsappNumber}\n`;
  text += `📅 Дата: ${new Date().toLocaleDateString('ru-RU')}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  for (const [catName, prods] of groups.entries()) {
    text += `🔹 ${catName.toUpperCase()} (${prods.length} тов.):\n`;
    prods.forEach((p, idx) => {
      const stock = p.inStock ? '✅ В наличии' : '⏳ Под заказ';
      const weight = p.volumeOrWeight ? ` (${p.volumeOrWeight})` : '';
      text += `${idx + 1}. ${p.titleRu}${weight} — ${p.price.toLocaleString('ru-RU')} ₸ [${stock}]\n`;
    });
    text += `\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Всего товаров в каталоге: ${products.length} шт.\n`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, `muslim-shop-pricelist-${getFilenameDate()}.txt`);
}

/**
 * 4. Parse & validate imported backup JSON
 */
export function parseAndValidateBackup(jsonText: string): {
  isValid: boolean;
  error?: string;
  data?: StoreBackupData;
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Файл не содержит корректных данных JSON.' };
    }
    if (!Array.isArray(parsed.products)) {
      return { isValid: false, error: 'В файле отсутствует список товаров (поле products).' };
    }
    return {
      isValid: true,
      data: parsed as StoreBackupData,
    };
  } catch (err: any) {
    return { isValid: false, error: 'Ошибка разбора JSON: ' + (err?.message || 'неверный формат') };
  }
}
