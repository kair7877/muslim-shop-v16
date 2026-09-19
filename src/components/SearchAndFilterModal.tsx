import React from 'react';
import { X, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Category, Language, SortOption } from '../types';
import { translations } from '../translations';

interface SearchAndFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  language: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onlyInStock: boolean;
  onToggleInStock: (v: boolean) => void;
  onlySale: boolean;
  onToggleSale: (v: boolean) => void;
  onReset: () => void;
}

export const SearchAndFilterModal: React.FC<SearchAndFilterModalProps> = ({
  isOpen,
  onClose,
  categories,
  language,
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onSelectCategory,
  sortBy,
  onSortChange,
  onlyInStock,
  onToggleInStock,
  onlySale,
  onToggleSale,
  onReset,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full sm:max-w-lg bg-white border-t sm:border border-gray-200 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
              {t.filters} & {t.search}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 flex-1 pr-1">
          {/* Search Input */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              {t.search}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoFocus
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-sm sm:text-base text-gray-900 placeholder-gray-400 outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-800"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
              {t.sortBy}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'popular', label: t.sortPopular },
                { id: 'newest', label: t.sortNewest },
                { id: 'price_asc', label: t.sortPriceAsc },
                { id: 'price_desc', label: t.sortPriceDesc },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSortChange(opt.id as SortOption)}
                  className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-amber-50 border-2 border-amber-500 text-amber-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
              {t.category}
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  selectedCategoryId === null
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {t.allProducts}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCategory(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    selectedCategoryId === c.id
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {c.icon} {language === 'ru' ? c.nameRu : (c.nameKz || c.nameRu)}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Discounts Switches */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs sm:text-sm text-gray-900 font-semibold">
                {t.filterOnlyInStock}
              </span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs sm:text-sm text-gray-900 font-semibold">
                {t.filterOnlySale}
              </span>
              <input
                type="checkbox"
                checked={onlySale}
                onChange={(e) => onToggleSale(e.target.checked)}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.resetFilters}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base cursor-pointer shadow-md transition-colors"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};
