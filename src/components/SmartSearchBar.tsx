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
          className="bg-[#3D2E14] text-[#F3CF7A] font-bold rounded px-0.5"
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
      {/* Search Input Box */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              ? 'Тауарларды іздеу... 🔍'
              : 'Поиск товара... 🔍')
          }
          autoComplete="off"
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm font-medium rounded-xl border border-[#2E2E2E] bg-[#171717] text-white placeholder:text-[#8E8E8E] focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059] transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#A3A3A3] hover:text-white hover:bg-[#262626] transition-colors cursor-pointer"
            title={isKz ? 'Тазалау' : 'Очистить'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete & Suggestions Dropdown */}
      {isOpen && (
        <div
          id={`${inputId}-dropdown`}
          className="absolute left-0 right-0 top-full mt-2 z-[120] bg-[#141414] rounded-xl border border-[#2C2C2C] shadow-2xl overflow-hidden max-h-[75vh] overflow-y-auto divide-y divide-[#222222] text-[#E5E5E5]"
        >
          {!cleanQuery ? (
            /* Empty Query: Popular Search Terms */
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A3A3A3] mb-2.5 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>
                    {isKz ? 'Жиі ізделетін сұраныстар:' : 'Часто ищут:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_KEYWORDS.slice(0, 8).map((item, idx) => {
                    const label = isKz ? item.termKz : item.termRu;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePickKeyword(label)}
                        className="px-3 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#262626] text-[#E5E5E5] hover:text-[#C5A059] border border-[#2F2F2F] hover:border-[#C5A059] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-[#A3A3A3]" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div className="pt-3 border-t border-[#222222]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A3A3A3] mb-2 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>
                    {isKz ? 'Негізгі санаттар:' : 'Основные категории:'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                          className="p-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] hover:border-[#C5A059] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold text-white truncate">
                              {catName}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#A3A3A3] font-mono shrink-0">
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
            <div className="divide-y divide-[#222222]">
              {/* Keyword autocomplete */}
              {keywordSuggestions.length > 0 && (
                <div className="p-3 bg-[#1A1A1A]/80">
                  <div className="flex flex-wrap gap-1.5">
                    {keywordSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePickKeyword(sug)}
                        className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-white hover:text-[#C5A059] border border-[#333333] hover:border-[#C5A059] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Search className="w-3 h-3 text-[#A3A3A3]" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Categories */}
              {matchedCategories.length > 0 && (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">
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
                          className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#292929] text-white hover:text-[#C5A059] border border-[#333333] hover:border-[#C5A059] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
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
                  <div className="px-2 py-1 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
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
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#202020] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.images[0]}
                            alt={prodTitle}
                            className="w-12 h-12 rounded-lg object-contain bg-[#171717] border border-[#2E2E2E] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white group-hover:text-[#C5A059] truncate">
                              {highlightText(prodTitle, cleanQuery)}
                            </h4>
                            <div className="text-xs text-[#A3A3A3]">
                              {prod.volumeOrWeight}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-extrabold text-sm sm:text-base text-[#C5A059] tabular-nums">
                            {formatPrice(prod.price)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(prod);
                            }}
                            className="p-2 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
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
                <div className="p-6 text-center text-sm text-[#A3A3A3]">
                  {isKz ? 'Өнім табылмады' : 'Ничего не найдено по вашему запросу'}
                </div>
              )}

              {/* Show All Results Button */}
              {totalMatchedCount > 0 && (
                <div className="p-3 bg-[#171717] border-t border-[#262626] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      scrollToCatalogSection();
                      if (onAfterSelect) onAfterSelect();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>
                      {isKz
                        ? `Барлық нәтижелерді көрсету (${totalMatchedCount})`
                        : `Показать все результаты (${totalMatchedCount})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
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
