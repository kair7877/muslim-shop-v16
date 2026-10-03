import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Sparkles,
  Layers,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Category, Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  POPULAR_SEARCH_KEYWORDS,
  scoreProductSearchMatch,
  getMatchingCategories,
  getMatchingSymptoms,
  getMatchingKeywordSuggestions,
} from '../utils/searchEngine';

interface SmartSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products: Product[];
  categories: Category[];
  productCounts: Record<string, number>;
  lang: Language;
  onSelectCategory: (categoryId: string) => void;
  onSelectSymptom?: (symptomId: string) => void;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  placeholder?: string;
  inputId?: string;
  autoFocus?: boolean;
  onAfterSelect?: () => void;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  products,
  categories,
  productCounts,
  lang,
  onSelectCategory,
  onSelectSymptom,
  onOpenProduct,
  onAddToCart,
  placeholder,
  inputId = 'smart-search-input',
  autoFocus = false,
  onAfterSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isKz = lang === 'kz';

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const cleanQuery = searchQuery.trim();

  // Fast mapping of categories
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Keyword autocomplete suggestions
  const keywordSuggestions = useMemo(() => {
    return getMatchingKeywordSuggestions(cleanQuery, products, lang, 6);
  }, [cleanQuery, products, lang]);

  // Matching categories
  const matchedCategories = useMemo(() => {
    return getMatchingCategories(cleanQuery, categories).slice(0, 4);
  }, [cleanQuery, categories]);

  // Matching symptoms
  const matchedSymptoms = useMemo(() => {
    return getMatchingSymptoms(cleanQuery).slice(0, 4);
  }, [cleanQuery]);

  // Top products match scored
  const { topProducts, totalMatchedCount } = useMemo(() => {
    if (!cleanQuery) {
      return { topProducts: [], totalMatchedCount: 0 };
    }
    const scored: { product: Product; score: number }[] = [];
    for (const p of products) {
      const s = scoreProductSearchMatch(p, cleanQuery, categoriesMap);
      if (s > 0) {
        scored.push({ product: p, score: s });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return {
      topProducts: scored.slice(0, 5).map((item) => item.product),
      totalMatchedCount: scored.length,
    };
  }, [cleanQuery, products, categoriesMap]);

  const scrollToCatalogSection = () => {
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      setIsOpen(false);
      scrollToCatalogSection();
      if (onAfterSelect) onAfterSelect();
    }
  };

  const handlePickKeyword = (kw: string) => {
    const mainTerm = kw.split('(')[0].trim();
    onSearchChange(mainTerm);
    setIsOpen(false);
    scrollToCatalogSection();
    if (onAfterSelect) onAfterSelect();
  };

  const handlePickCategory = (catId: string) => {
    onSelectCategory(catId);
    onSearchChange('');
    setIsOpen(false);
    scrollToCatalogSection();
    if (onAfterSelect) onAfterSelect();
  };

  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-blue-100 text-blue-900 font-bold rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Flip.kz Input Box */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={searchQuery}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (isKz
              ? '169 тауар бойынша іздеу (витаминдер, бал, ББҚ)...'
              : 'Поиск по 169 товарам, брендам или симптомам...')
          }
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm font-normal rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isKz ? 'Тазалау' : 'Очистить'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete & Suggestions Dropdown in Flip.kz Style */}
      {isOpen && (
        <div
          id={`${inputId}-dropdown`}
          className="absolute left-0 right-0 top-full mt-1.5 z-[120] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-[75vh] overflow-y-auto divide-y divide-slate-100 text-slate-800"
        >
          {!cleanQuery ? (
            /* Empty Query: Popular Search Terms */
            <div className="p-3.5 sm:p-4 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {isKz ? 'Жиі ізделетін сұраныстар:' : 'Часто ищут:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_KEYWORDS.slice(0, 8).map((item, idx) => {
                    const label = isKz ? item.termKz : item.termRu;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePickKeyword(label)}
                        className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {isKz ? 'Негізгі санаттар:' : 'Основные категории:'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories
                    .filter((c) => c.id !== 'cat-all')
                    .slice(0, 8)
                    .map((cat) => {
                      const catName = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;
                      const count = productCounts[cat.id] || 0;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handlePickCategory(cat.id)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm shrink-0">{cat.icon || '•'}</span>
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {catName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            /* Active Query: Autocomplete & Matches */
            <div className="divide-y divide-slate-100">
              {/* Keyword autocomplete */}
              {keywordSuggestions.length > 0 && (
                <div className="p-3 bg-slate-50/60">
                  <div className="flex flex-wrap gap-1.5">
                    {keywordSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePickKeyword(sug)}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Categories */}
              {matchedCategories.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {isKz ? 'Санаттар:' : 'Категории:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedCategories.map((cat) => {
                      const catName = isKz && cat.nameKz ? cat.nameKz : cat.nameRu;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handlePickCategory(cat.id)}
                          className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>{cat.icon || '•'}</span>
                          <span>{catName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products List Preview */}
              {topProducts.length > 0 ? (
                <div className="p-2 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isKz ? 'Өнімдер:' : 'Товары:'}
                  </div>
                  {topProducts.map((prod) => {
                    const prodTitle = isKz && prod.titleKz ? prod.titleKz : prod.titleRu;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onOpenProduct(prod);
                          setIsOpen(false);
                          if (onAfterSelect) onAfterSelect();
                        }}
                        className="p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.images[0]}
                            alt={prodTitle}
                            className="w-10 h-10 rounded-md object-contain border border-slate-100 bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                              {highlightText(prodTitle, cleanQuery)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              #{prod.sku} · {prod.inStock ? 'В наличии в Бутике №24' : 'Под заказ'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {formatPrice(prod.price)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(prod);
                            }}
                            className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                            title="В корзину"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  {isKz ? 'Бұл сұраныс бойынша өнім табылмады' : 'По вашему запросу товары не найдены'}
                </div>
              )}

              {/* Show All Results Button */}
              {totalMatchedCount > 0 && (
                <div className="p-2.5 bg-slate-50 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      scrollToCatalogSection();
                      if (onAfterSelect) onAfterSelect();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>
                      {isKz
                        ? `Барлық нәтижелерді көрсету (${totalMatchedCount})`
                        : `Показать все результаты (${totalMatchedCount})`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
