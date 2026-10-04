import React from 'react';
import {
  X,
  Flame,
  Sparkles,
  MessageCircle,
  PhoneCall,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Lock,
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
  onOpenAdmin?: () => void;
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
  onOpenAdmin,
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="bottom-sheet-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#141414] text-white rounded-t-2xl border-t border-[#2E2E2E] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden mb-16 sm:mb-[68px]"
      >
        {/* Drag Handle & Header */}
        <div className="bg-[#1A1A1A] text-white px-4 sm:px-5 pt-3 pb-3.5 border-b border-[#2A2A2A] shrink-0">
          <div className="w-12 h-1.5 bg-[#333333] rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-[#383838] shrink-0"
                title={isKz ? 'Артқа' : 'Назад'}
              >
                <ArrowLeft className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{isKz ? 'Артқа' : 'Назад'}</span>
              </button>

              <div className="min-w-0">
                <h3 className="font-extrabold text-base sm:text-xl text-white leading-tight truncate">
                  {mode === 'catalog'
                    ? isKz
                      ? 'Тауарлар каталогы'
                      : 'Каталог товаров'
                    : isKz
                    ? 'Байланыс және мекенжай'
                    : 'Связь с Бутиком №24'}
                </h3>
                <p className="text-xs text-[#A3A3A3] mt-0.5 truncate">
                  {mode === 'catalog'
                    ? isKz
                      ? 'Қажетті бөлімді таңдаңыз немесе іздеңіз'
                      : 'Выберите нужную категорию для перехода'
                    : `${config.city}, ${config.address} • ${config.boutiqueNumber}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#8E8E8E] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer shrink-0"
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
              {/* Quick Search inside Catalog Sheet */}
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
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCategoryId === 'cat-hits'
                      ? 'bg-[#C5A059] text-black border-[#C5A059] font-black'
                      : 'bg-[#1C1C1C] hover:bg-[#222222] text-white border-[#2E2E2E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black/60 text-[#C5A059] flex items-center justify-center shrink-0 border border-[#C5A059]/30">
                      <Flame className="w-4 h-4 fill-[#C5A059]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {isKz ? 'Хит тауарлар' : 'Хиты продаж'}
                      </div>
                      <div className="text-[11px] text-[#A3A3A3]">
                        {productCounts['cat-hits'] || 0} {isKz ? 'өнім' : 'товаров'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8E8E8E] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePickCategory('cat-new')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCategoryId === 'cat-new'
                      ? 'bg-[#C5A059] text-black border-[#C5A059] font-black'
                      : 'bg-[#1C1C1C] hover:bg-[#222222] text-white border-[#2E2E2E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black/60 text-[#C5A059] flex items-center justify-center shrink-0 border border-[#C5A059]/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {isKz ? 'Жаңа өнімдер' : 'Новинки'}
                      </div>
                      <div className="text-[11px] text-[#A3A3A3]">
                        {productCounts['cat-new'] || 0} {isKz ? 'өнім' : 'товаров'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8E8E8E] shrink-0" />
                </button>
              </div>

              {/* All Store Categories Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#A3A3A3] px-1 uppercase tracking-wider flex items-center justify-between">
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
                            ? 'bg-[#1F1F1F] border-2 border-[#C5A059] text-[#C5A059] font-bold shadow-md'
                            : 'bg-[#1C1C1C] hover:bg-[#242424] text-white border-[#2A2A2A]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                              isSelected ? 'bg-[#C5A059] text-black' : 'bg-[#262626] text-white'
                            }`}
                          >
                            {cat.icon || '•'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate">
                              {catName}
                            </p>
                            <p className="text-[11px] tabular-nums text-[#A3A3A3]">
                              {count} {isKz ? 'өнім' : 'товаров'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                          )}
                          <ChevronRight className="w-4 h-4 text-[#8E8E8E]" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Admin entry button */}
                {onOpenAdmin && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#C5A059] text-left transition-colors cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-black/60 border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">
                            Панель администратора
                          </div>
                          <div className="text-[11px] text-[#A3A3A3]">
                            Добавление товаров, редактирование цен (PIN: 505534)
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8E8E8E]" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Contact & Boutique Info Sheet */
            <div className="space-y-3">
              {/* Working Hours & Live Status Banner */}
              <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#262626] border border-[#333] text-[#C5A059] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {isKz ? config.workingHoursKz : config.workingHoursRu}
                    </div>
                    <div className="text-xs text-[#A3A3A3]">
                      {config.city}, {config.address} ({config.boutiqueNumber})
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                    status.isOpen
                      ? 'bg-[#163828] text-emerald-400 border border-[#25D366]/30'
                      : 'bg-[#2E1818] text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
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
                  className="flex items-center justify-between p-4 rounded-xl bg-[#163828] hover:bg-[#1E4A35] text-white border border-[#25D366]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/40 text-[#25D366] flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">
                        {isKz ? 'WhatsApp арқылы жазу' : 'Написать в WhatsApp'}
                      </div>
                      <div className="text-xs text-emerald-300">
                        {isKz
                          ? 'Менеджерден жылдам кеңес және тапсырыс'
                          : 'Быстрая консультация и заказ с доставкой'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-300" />
                </a>

                <a
                  href={`tel:+${config.whatsappNumber}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-white border border-[#333] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/40 text-[#C5A059] flex items-center justify-center shrink-0">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">
                        {isKz ? 'Бутикке қоңырау шалу' : 'Позвонить в Бутик №24'}
                      </div>
                      <div className="text-xs text-[#A3A3A3] font-mono">
                        +7 (778) 175-42-41
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8E8E8E]" />
                </a>

                <a
                  href={config.gis2Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-white border border-[#333] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black/40 text-[#C5A059] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">
                        {isKz ? '2GIS картадан ашу' : 'Открыть маршрут в 2ГИС'}
                      </div>
                      <div className="text-xs text-[#A3A3A3]">
                        {config.city}, {config.address} • {config.boutiqueNumber}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8E8E8E]" />
                </a>

                {/* Admin Entry in Contact Mode */}
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-[#2E2E2E] hover:border-[#C5A059] text-white transition-colors cursor-pointer text-left shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/50 text-[#C5A059] flex items-center justify-center shrink-0 border border-[#C5A059]/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          Панель администратора
                        </div>
                        <div className="text-xs text-[#A3A3A3]">
                          Добавление новых товаров, цен и остатков (PIN: 505534)
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#8E8E8E]" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Close Bar */}
        <div className="p-3.5 sm:px-5 bg-[#181818] border-t border-[#2A2A2A] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] text-white border border-[#383838] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <span>{isKz ? 'Жабу' : 'Закрыть окно'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
