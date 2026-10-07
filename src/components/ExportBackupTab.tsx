import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Database,
  FileText,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Package,
  Layers,
  Settings,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Category, Product, StoreConfig } from '../types';
import {
  exportProductsToCsv,
  exportFullBackupJson,
  exportPriceListText,
  parseAndValidateBackup,
  StoreBackupData,
} from '../utils/exportService';

interface ExportBackupTabProps {
  products: Product[];
  categories: Category[];
  config: StoreConfig;
  onRestoreBackup?: (backup: StoreBackupData) => Promise<void>;
  onShowFeedback?: (message: string) => void;
}

export const ExportBackupTab: React.FC<ExportBackupTabProps> = ({
  products,
  categories,
  config,
  onRestoreBackup,
  onShowFeedback,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<StoreBackupData | null>(null);

  const handleExportCsv = () => {
    try {
      exportProductsToCsv(products, categories);
      if (onShowFeedback) {
        onShowFeedback(`Экспортировано ${products.length} товаров в файл Excel / CSV!`);
      }
    } catch (err: any) {
      alert('Ошибка при экспорте CSV: ' + err?.message);
    }
  };

  const handleExportJson = () => {
    try {
      exportFullBackupJson(products, categories, config);
      if (onShowFeedback) {
        onShowFeedback(`Полный бэкап сохранён! Скачан JSON-файл магазина.`);
      }
    } catch (err: any) {
      alert('Ошибка при экспорте JSON: ' + err?.message);
    }
  };

  const handleExportText = () => {
    try {
      exportPriceListText(products, categories, config);
      if (onShowFeedback) {
        onShowFeedback(`Прайс-лист сохранён в текстовом формате!`);
      }
    } catch (err: any) {
      alert('Ошибка при экспорте текста: ' + err?.message);
    }
  };

  const handleCopySummary = async () => {
    try {
      let summary = `MUSLIM SHOP · Сводка каталога (${new Date().toLocaleDateString('ru-RU')}):\n`;
      summary += `Всего товаров: ${products.length} шт.\n`;
      summary += `Категорий: ${categories.length} шт.\n\n`;
      products.slice(0, 50).forEach((p, idx) => {
        summary += `${idx + 1}. ${p.titleRu} — ${p.price.toLocaleString('ru-RU')} ₸ (${p.inStock ? 'В наличии' : 'Под заказ'})\n`;
      });
      if (products.length > 50) {
        summary += `\n...и ещё ${products.length - 50} товаров.`;
      }

      await navigator.clipboard.writeText(summary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
      if (onShowFeedback) {
        onShowFeedback('Список товаров скопирован в буфер обмена!');
      }
    } catch {
      alert('Не удалось скопировать. Разрешите доступ к буферу обмена.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    setRestoreSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parseAndValidateBackup(content);
      if (!result.isValid || !result.data) {
        setRestoreError(result.error || 'Неверный формат файла бэкапа');
        setPendingBackup(null);
      } else {
        setPendingBackup(result.data);
      }
    };
    reader.onerror = () => {
      setRestoreError('Не удалось прочитать выбранный файл.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmRestore = async () => {
    if (!pendingBackup || !onRestoreBackup) return;
    setIsRestoring(true);
    setRestoreError(null);
    try {
      await onRestoreBackup(pendingBackup);
      setRestoreSuccess(
        `Успешно восстановлено ${pendingBackup.products.length} товаров и ${pendingBackup.categories.length} категорий!`
      );
      setPendingBackup(null);
      if (onShowFeedback) {
        onShowFeedback('База магазина успешно восстановлена из бэкапа!');
      }
    } catch (err: any) {
      setRestoreError('Ошибка восстановления: ' + (err?.message || 'Сбой записи'));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-[#171717] border-2 border-[#2D2D2D] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Экспорт всех данных и Бэкап
            </h3>
          </div>
          <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
            Выгружайте товары для Excel, создавайте полные резервные копии и восстанавливайте базу магазина в один клик.
          </p>
        </div>

        {/* Quick Stats Counter */}
        <div className="flex items-center gap-3 shrink-0 bg-[#202020] border border-[#333333] px-4 py-2.5 rounded-xl">
          <div className="text-center pr-3 border-r border-[#333333]">
            <div className="text-lg font-black text-white font-mono">{products.length}</div>
            <div className="text-[11px] font-bold text-[#A3A3A3] uppercase">Товаров</div>
          </div>
          <div className="text-center pr-3 border-r border-[#333333]">
            <div className="text-lg font-black text-white font-mono">
              {categories.filter((c) => c.id !== 'cat-all').length}
            </div>
            <div className="text-[11px] font-bold text-[#A3A3A3] uppercase">Категорий</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-[#4ADE80] font-mono">100%</div>
            <div className="text-[11px] font-bold text-[#A3A3A3] uppercase">Готов к экспорту</div>
          </div>
        </div>
      </div>

      {/* Grid of Main Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* 1. Full JSON Backup */}
        <div className="p-6 rounded-2xl bg-[#161616] border-2 border-[#C5A059]/60 hover:border-[#C5A059] flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#3A3A3A] flex items-center justify-center text-[#D4AF37]">
                <Database className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-[#C5A059] text-black">
                Рекомендуется
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white">
              Полный бэкап всего магазина (JSON)
            </h4>

            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
              Сохраняет абсолютно всё в один файл: {products.length} товаров с описаниями и фото, {categories.length} категорий, настройки бутика (адрес, WhatsApp, Instagram, режим работы).
            </p>

            <ul className="text-xs text-[#A3A3A3] space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Все товары и категории с точными ценами</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Настройки бутика в ТД «Дина Байзар»</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Возможность восстановить базу в любой момент</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            className="mt-6 w-full py-4 px-6 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-colors"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>Скачать полный бэкап (.json)</span>
          </button>
        </div>

        {/* 2. Excel / CSV Export */}
        <div className="p-6 rounded-2xl bg-[#161616] border-2 border-[#2E2E2E] hover:border-[#22C55E]/60 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#3A3A3A] flex items-center justify-center text-[#22C55E]">
                <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-[#183322] text-[#4ADE80] border border-[#22C55E]/40">
                Excel / 1С / Таблицы
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white">
              Экспорт товаров в Excel (CSV)
            </h4>

            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
              Таблица со всеми товарами: артикул, наименование на русском и казахском, категория, цена, старая цена, наличие, вес и фото.
            </p>

            <ul className="text-xs text-[#A3A3A3] space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Кодировка UTF-8 BOM — кириллица открывается без ошибок</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Разделитель «точка с запятой» для Microsoft Excel</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Удобно для печати ценников и учета остатков</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="mt-6 w-full py-4 px-6 rounded-xl bg-[#1E3B2B] hover:bg-[#254C37] text-white border border-[#22C55E]/50 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-colors"
          >
            <Download className="w-5 h-5 text-[#4ADE80] stroke-[2.5]" />
            <span>Скачать таблицу Excel (.csv)</span>
          </button>
        </div>

        {/* 3. Text Price-list for WhatsApp */}
        <div className="p-6 rounded-2xl bg-[#161616] border-2 border-[#2E2E2E] hover:border-[#383838] flex flex-col justify-between shadow-lg">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#3A3A3A] flex items-center justify-center text-[#60A5FA]">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white">
              Текстовый прайс-лист для WhatsApp
            </h4>

            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
              Готовый структурированный текст с разбивкой по рубрикам (Витамины, Исламские товары, Здоровье, Парфюмерия), ценами и статусом наличия.
            </p>

            <p className="text-xs text-[#8E8E8E]">
              Идеально для быстрой отправки клиентам в личные сообщения или группы.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleExportText}
              className="flex-1 py-3 px-4 rounded-xl bg-[#242424] hover:bg-[#2F2F2F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#3E3E3E] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C5A059]" />
              <span>Скачать файл (.txt)</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="py-3 px-4 rounded-xl bg-[#202020] hover:bg-[#2B2B2B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#3A3A3A] cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-[#4ADE80]" />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#A3A3A3]" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Restore / Import Section */}
        <div className="p-6 rounded-2xl bg-[#161616] border-2 border-[#2E2E2E] hover:border-[#383838] flex flex-col justify-between shadow-lg">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#3A3A3A] flex items-center justify-center text-[#F59E0B]">
              <Upload className="w-6 h-6 stroke-[2]" />
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white">
              Восстановление из бэкапа (Импорт)
            </h4>

            <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
              Загрузите сохранённый ранее файл <code className="text-[#C5A059] font-mono">.json</code>, чтобы быстро восстановить весь каталог товаров и настройки.
            </p>

            {restoreError && (
              <div className="p-3 rounded-xl bg-[#2A1616] border border-[#EF4444]/40 text-[#FCA5A5] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
                <span>{restoreError}</span>
              </div>
            )}

            {restoreSuccess && (
              <div className="p-3 rounded-xl bg-[#162A1D] border border-[#22C55E]/40 text-[#86EFAC] text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span>{restoreSuccess}</span>
              </div>
            )}

            {pendingBackup && (
              <div className="p-3.5 rounded-xl bg-[#1F1F1F] border border-[#C5A059]/50 space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Файл проверен и готов к загрузке:</span>
                  <span className="text-[#C5A059] font-mono">{pendingBackup.totalProducts} тов.</span>
                </div>
                <div className="text-[11px] text-[#A3A3A3] space-y-0.5">
                  <p>Категорий: {pendingBackup.totalCategories}</p>
                  <p>Дата бэкапа: {new Date(pendingBackup.exportDate).toLocaleString('ru-RU')}</p>
                </div>
                <button
                  type="button"
                  onClick={confirmRestore}
                  disabled={isRestoring}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>{isRestoring ? 'Восстановление...' : 'Применить этот бэкап'}</span>
                </button>
              </div>
            )}
          </div>

          <label className="mt-6 w-full py-3.5 px-4 rounded-xl bg-[#242424] hover:bg-[#2F2F2F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#3E3E3E] cursor-pointer text-center">
            <Upload className="w-4 h-4 text-[#C5A059]" />
            <span>Выбрать файл бэкапа (.json)...</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
