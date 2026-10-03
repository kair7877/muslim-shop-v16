import React from 'react';
import {
  X,
  Search,
  Layers,
  Flame,
  Sparkles,
  MessageCircle,
  PhoneCall,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Category, Language, Product, StoreConfig } from '../types';
import { isStoreOpen } from '../utils/formatters';
import { SmartSearchBar } from './SmartSearchBar';

interface CatalogDrawerProps {
  isOpen: boolean;
  mode: 'catalog' | 'contact';
  onClose: () => void;
  products?: Product[];
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onSelectSymptom?: (id: string) => void;
  onOpenProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  productCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  config: StoreConfig;
  lang: Language;
}

export const CatalogDrawer: React.FC<CatalogDrawerProps> = ({
  isOpen,
  mode,
  onClose,
  products = [],
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSelectSymptom,
  onOpenProduct,
  onAddToCart = () => {},
  productCounts,
  searchQuery,
  onSearchChange,
  config,
  lang,
}) => {
  if (!isOpen) return null;

  const isKz = lang === 'kz';
  const status = isStoreOpen(config);

  const handlePickCategory = (catId: string) => {
    onSelectCategory(catId);
    onClose();
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  return (
    <div
      id="bottom-sheet-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="bottom-sheet-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white text-slate-900 rounded-t-2xl border-t border-slate-200 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden mb-16 sm:mb-[68px]"
      >
        {/* Drag Handle & Header */}
        <div className="bg-white text-slate-900 px-4 sm:px-5 pt-3 pb-3.5 border-b border-slate-200 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
                title={isKz ? 'Артқа' : 'Назад'}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>{isKz ? 'Артқа' : 'Назад'}</span>
              </button>

              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-xl text-slate-900 leading-tight truncate">
                  {mode === 'catalog'
                    ? isKz
                      ? 'Тауарлар каталогы'
                      : 'Каталог товаров'
                    : isKz
                    ? 'Байланыс және мекенжай'
                    : 'Связь с Бутиком №24'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {mode === 'catalog'
                    ? isKz
                      ? 'Қажетті бөлімді таңдаңыз немесе іздеңіз'
                      : 'Выберите нужную категорию для быстрого перехода'
                    : `${config.city}, ${config.address} • ${config.boutiqueNumber}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={isKz ? 'Жабу' : 'Закрыть'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {mode === 'catalog' ? (
            <>
              {/* Quick Search inside Catalog Sheet with Autocomplete */}
              <SmartSearchBar
                inputId="catalog-drawer-search-input"
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                products={products}
                categories={categories}
                productCounts={productCounts}
                lang={lang}
                onSelectCategory={(catId) => {
                  handlePickCategory(catId);
                }}
                onSelectSymptom={(symId) => {
                  if (onSelectSymptom) onSelectSymptom(symId);
                  onClose();
                }}
                onOpenProduct={(prod) => {
                  onClose();
                  if (onOpenProduct) onOpenProduct(prod);
                }}
                onAddToCart={onAddToCart}
                onAfterSelect={() => onClose()}
              />

              {/* Special Quick Filters: Hits & New */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePickCategory('cat-hits')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCategoryId === 'cat-hits'
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 fill-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {isKz ? 'Хит тауарлар' : 'Хиты продаж'}
                      </div>
                      <div
                        className={`text-[11px] ${
                          selectedCategoryId === 'cat-hits' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {productCounts['cat-hits'] || 0} {isKz ? 'өнім' : 'товаров'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePickCategory('cat-new')}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCategoryId === 'cat-new'
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {isKz ? 'Жаңа өнімдер' : 'Новинки'}
                      </div>
                      <div
                        className={`text-[11px] ${
                          selectedCategoryId === 'cat-new' ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {productCounts['cat-new'] || 0} {isKz ? 'өнім' : 'товаров'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* All Store Categories Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider flex items-center justify-between">
                  <span>{isKz ? 'Барлық санаттар' : 'Все категории каталога'}</span>
                  <span className="tabular-nums font-mono">{categories.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const count = productCounts[cat.id] ?? 0;
                    const catName = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handlePickCategory(cat.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                              isSelected ? 'bg-white/20' : 'bg-slate-100'
                            }`}
                          >
                            {cat.icon || '✨'}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`text-xs sm:text-sm font-semibold truncate ${
                                isSelected ? 'text-white font-bold' : 'text-slate-900'
                              }`}
                            >
                              {catName}
                            </p>
                            <p
                              className={`text-[11px] tabular-nums ${
                                isSelected ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {count} {isKz ? 'өнім' : 'товаров'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                          <ChevronRight
                            className={`w-4 h-4 ${
                              isSelected ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Contact & Boutique Info Sheet */
            <div className="space-y-3">
              {/* Working Hours & Live Status Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {isKz ? config.workingHoursKz : config.workingHoursRu}
                    </div>
                    <div className="text-xs text-slate-500">
                      {config.city}, {config.address} ({config.boutiqueNumber})
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                    status.isOpen
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  {isKz ? status.textKz : status.textRu}
                </span>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                <a
                  href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                    isKz
                      ? 'Сәлеметсіз бе! Маған MUSLIM SHOP өнімдері бойынша кеңес керек еді.'
                      : 'Здравствуйте! Мне нужна консультация по товарам MUSLIM SHOP (Бутик №24).'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {isKz ? 'WhatsApp арқылы жазу' : 'Написать в WhatsApp'}
                      </div>
                      <div className="text-xs text-emerald-100">
                        {isKz
                          ? 'Менеджерден жылдам кеңес және тапсырыс'
                          : 'Быстрая консультация и заказ с доставкой'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-200" />
                </a>

                <a
                  href={`tel:+${config.whatsappNumber}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {isKz ? 'Бутикке қоңырау шалу' : 'Позвонить в Бутик №24'}
                      </div>
                      <div className="text-xs text-blue-100 font-mono">
                        +7 (778) 175-42-41
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-200" />
                </a>

                <a
                  href={config.gis2Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {isKz ? '2GIS картадан ашу' : 'Открыть маршрут в 2ГИС'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {config.city}, {config.address} • {config.boutiqueNumber}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Back & Close Bar */}
        <div className="p-3 sm:px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>{isKz ? 'Артқа оралу' : 'Назад'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>{isKz ? 'Терезені жабу' : 'Закрыть окно'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
